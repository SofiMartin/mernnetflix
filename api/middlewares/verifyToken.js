const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

/**
 * Middleware para verificar el token JWT
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.token || req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'No estás autenticado. Se requiere token.'
      });
    }
    
    // Verificar formato del token (Bearer token)
    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader;
    }
    
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token no válido o usuario no encontrado'
      });
    }
    
    // Si el token es válido, añade el usuario a la solicitud
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Error en la autenticación'
    });
  }
};

/**
 * Middleware para verificar si el usuario es administrador
 */
exports.verifyAdmin = (req, res, next) => {
  // Debe ejecutarse después de verifyToken
  if (!req.user) {
    return res.status(403).json({
      status: 'error',
      message: 'No autorizado'
    });
  }
  
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'No tienes permiso de administrador'
    });
  }
};

/**
 * Middleware para verificar que el perfil pertenece al usuario
 */
exports.verifyProfileOwner = async (req, res, next) => {
  try {
    const profileId = req.params.id;
    const userId = req.user._id;
    
    const profile = await Profile.findById(profileId);
    
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Perfil no encontrado'
      });
    }
    
    // Verificar que el perfil pertenece al usuario
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Solo puedes acceder a tus propios perfiles'
      });
    }
    
    // Añadir el perfil a la solicitud para uso posterior
    req.profile = profile;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar acceso al contenido según clasificación del perfil
 */
exports.verifyContentAccess = async (req, res, next) => {
  try {
    // Este middleware debe ejecutarse después de verifyToken
    if (!req.user) {
      return res.status(403).json({
        status: 'error',
        message: 'No autorizado'
      });
    }
    
    // Verificar si existe un ID de perfil en los headers
    const profileId = req.headers.profileid;
    if (!profileId) {
      // Si no hay perfil, permitir acceso (el cliente debe manejar restricciones)
      return next();
    }
    
    // Buscar el perfil
    const profile = await Profile.findOne({
      _id: profileId,
      user: req.user._id
    });
    
    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Perfil no encontrado'
      });
    }
    
    // Almacenar el perfil en la solicitud para uso posterior
    req.profile = profile;
    
    // Si es un perfil infantil, verificar la clasificación del contenido
    if (profile.type === 'kid') {
      // Obtener la clasificación del anime solicitado
      const Anime = require('../models/Anime');
      const animeId = req.params.id;
      const anime = await Anime.findById(animeId);
      
      if (!anime) {
        return res.status(404).json({
          status: 'error',
          message: 'Anime no encontrado'
        });
      }
      
      // Jerarquía de clasificaciones
      const ratingHierarchy = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
      const profileMaxRatingIndex = ratingHierarchy.indexOf(profile.maxContentRating || 'PG');
      const animeRatingIndex = ratingHierarchy.indexOf(anime.contentRating);
      
      // Si la clasificación del anime es mayor que la permitida para el perfil
      if (animeRatingIndex > profileMaxRatingIndex) {
        return res.status(403).json({
          status: 'error',
          message: 'Este contenido no está disponible para este perfil'
        });
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};