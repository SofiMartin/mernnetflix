const animeService = require('../services/animeService');

/**
 * Controlador para gestión de animes
 */
exports.createAnime = async (req, res, next) => {
  try {
    const animeData = req.body;
    const result = await animeService.createAnime(animeData);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAnimes = async (req, res, next) => {
  try {
    // Extraer parámetros de consulta para filtrado y paginación
    const { 
      genre, 
      status, 
      contentRating,
      search,
      sort = 'rating',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;
    
    // Construir filtros
    const filters = {};
    
    if (genre) filters.genres = genre;
    if (status) filters.status = status;
    if (contentRating) filters.contentRating = contentRating;
    
    // Construir opciones
    const options = {
      sort: { [sort]: order === 'desc' ? -1 : 1 },
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit)
    };
    
    if (search) options.search = search;
    
    const result = await animeService.getAnimes(filters, options);
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnimeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await animeService.getAnimeById(id);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.message === 'Anime not found') {
      return res.status(404).json({
        status: 'error',
        message: 'Anime not found'
      });
    }
    next(error);
  }
};

exports.updateAnime = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await animeService.updateAnime(id, updateData);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.message === 'Anime not found') {
      return res.status(404).json({
        status: 'error',
        message: 'Anime not found'
      });
    }
    next(error);
  }
};

exports.deleteAnime = async (req, res, next) => {
  try {
    const { id } = req.params;
    await animeService.deleteAnime(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Anime deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Anime not found') {
      return res.status(404).json({
        status: 'error',
        message: 'Anime not found'
      });
    }
    next(error);
  }
};

exports.searchAnimes = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }
    
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit)
    };
    
    const result = await animeService.searchAnimes(q, options);
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

exports.getRandomAnimes = async (req, res, next) => {
  try {
    const { genre, contentRating, count = 5 } = req.query;
    
    const filters = {};
    if (genre) filters.genres = genre;
    if (contentRating) filters.contentRating = contentRating;
    
    // Para perfiles infantiles, restringir contenido
    if (req.headers.profileid) {
      const profileService = require('../services/ProfileService');
      const profile = await profileService.getProfileById(
        req.headers.profileid,
        req.user.id
      );
      
      if (profile) {
        // Obtener clasificaciones permitidas para este perfil
        const ratingHierarchy = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
        const profileMaxRatingIndex = ratingHierarchy.indexOf(profile.maxContentRating);
        
        // Filtrar solo clasificaciones permitidas
        filters.contentRating = { 
          $in: ratingHierarchy.slice(0, profileMaxRatingIndex + 1) 
        };
      }
    }
    
    const result = await animeService.getRandomAnimes(filters, parseInt(count));
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getGenres = async (req, res, next) => {
  try {
    const genres = await animeService.getGenres();
    
    res.status(200).json({
      status: 'success',
      data: genres
    });
  } catch (error) {
    next(error);
  }
};

exports.searchExternalAPI = async (req, res, next) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({
        status: 'error',
        message: 'Anime title is required'
      });
    }
    
    const results = await animeService.searchFromExternalAPI(title);
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching from external API'
    });
  }
};

exports.importFromExternalAPI = async (req, res, next) => {
  try {
    const { externalId } = req.body;
    
    if (!externalId) {
      return res.status(400).json({
        status: 'error',
        message: 'External ID is required'
      });
    }
    
    const result = await animeService.importFromExternalAPI(externalId);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};