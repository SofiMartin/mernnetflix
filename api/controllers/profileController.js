const profileService = require('../services/ProfileService');

/**
 * Controlador para gestión de perfiles
 */
exports.createProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;
    
    const result = await profileService.createProfile(userId, profileData);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.message === 'Maximum number of profiles reached (5)') {
      return res.status(400).json({
        status: 'error',
        message: 'Has alcanzado el límite máximo de perfiles (5)'
      });
    }
    
    next(error);
  }
};

exports.getProfiles = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const profiles = await profileService.getProfiles(userId);
    
    res.status(200).json({
      status: 'success',
      results: profiles.length,
      data: profiles
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const profile = await profileService.getProfileById(id, userId);
    
    res.status(200).json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    if (error.message === 'Profile not found') {
      return res.status(404).json({
        status: 'error',
        message: 'Perfil no encontrado'
      });
    }
    
    if (error.message === 'You can only access your own profiles') {
      return res.status(403).json({
        status: 'error',
        message: 'Solo puedes acceder a tus propios perfiles'
      });
    }
    
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;
    
    const updatedProfile = await profileService.updateProfile(id, userId, updateData);
    
    res.status(200).json({
      status: 'success',
      data: updatedProfile
    });
  } catch (error) {
    if (error.message === 'Profile not found') {
      return res.status(404).json({
        status: 'error',
        message: 'Perfil no encontrado'
      });
    }
    
    if (error.message === 'You can only access your own profiles') {
      return res.status(403).json({
        status: 'error',
        message: 'Solo puedes acceder a tus propios perfiles'
      });
    }
    
    next(error);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    await profileService.deleteProfile(id, userId);
    
    res.status(200).json({
      status: 'success',
      message: 'Perfil eliminado correctamente'
    });
  } catch (error) {
    if (error.message === 'Profile not found') {
      return res.status(404).json({
        status: 'error',
        message: 'Perfil no encontrado'
      });
    }
    
    if (error.message === 'You can only access your own profiles') {
      return res.status(403).json({
        status: 'error',
        message: 'Solo puedes acceder a tus propios perfiles'
      });
    }
    
    if (error.message === 'Cannot delete the last profile') {
      return res.status(400).json({
        status: 'error',
        message: 'No puedes eliminar el último perfil'
      });
    }
    
    next(error);
  }
};

exports.changeProfileType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { type } = req.body;
    
    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Se requiere especificar el tipo de perfil'
      });
    }
    
    const updatedProfile = await profileService.changeProfileType(id, userId, type);
    
    res.status(200).json({
      status: 'success',
      data: updatedProfile
    });
  } catch (error) {
    if (error.message === 'Invalid profile type') {
      return res.status(400).json({
        status: 'error',
        message: 'Tipo de perfil inválido. Debe ser: adult, teen o kid'
      });
    }
    
    next(error);
  }
};