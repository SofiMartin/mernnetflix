// controllers/watchlistController.js
const watchlistService = require('../services/watchlistService');

/**
 * Controlador para gestionar las operaciones relacionadas con las watchlists
 */
class WatchlistController {
  /**
   * Añade un anime a la watchlist de un perfil
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async addToWatchlist(req, res) {
    try {
      const { profileId, animeId, status, notes } = req.body;
      
      if (!profileId || !animeId) {
        return res.status(400).json({ message: 'Profile ID and Anime ID are required' });
      }
      
      const options = { status, notes };
      const result = await watchlistService.addToWatchlist(profileId, animeId, options);
      
      res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Profile not found' || error.message === 'Anime not found') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message === 'Anime already in watchlist') {
        return res.status(409).json({ message: error.message });
      }
      
      if (error.message.includes('age restrictions')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message || 'An error occurred while adding to watchlist' });
    }
  }

  /**
   * Obtiene la watchlist de un perfil
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async getWatchlist(req, res) {
    try {
      const { profileId } = req.params;
      const { status, page = 1, limit = 20, sort } = req.query;
      
      // Calcular skip para paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Opciones de consulta
      const options = {
        status,
        skip,
        limit,
        sort: sort ? JSON.parse(sort) : { updatedAt: -1 }
      };
      
      const result = await watchlistService.getWatchlist(profileId, options);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Profile not found') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message || 'An error occurred while fetching watchlist' });
    }
  }

  /**
   * Actualiza una entrada de la watchlist
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async updateWatchlistEntry(req, res) {
    try {
      const { id } = req.params;
      const { profileId, status, notes } = req.body;
      
      if (!profileId) {
        return res.status(400).json({ message: 'Profile ID is required' });
      }
      
      // Solo permitir campos válidos para actualizar
      const updateData = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }
      
      const result = await watchlistService.updateWatchlistEntry(id, profileId, updateData);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Watchlist entry not found') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('own watchlist entries')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message || 'An error occurred while updating watchlist entry' });
    }
  }

  /**
   * Elimina una entrada de la watchlist
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async removeFromWatchlist(req, res) {
    try {
      const { id } = req.params;
      const { profileId } = req.body;
      
      if (!profileId) {
        return res.status(400).json({ message: 'Profile ID is required' });
      }
      
      const result = await watchlistService.removeFromWatchlist(id, profileId);
      
      if (result) {
        res.status(200).json({ message: 'Entry removed from watchlist' });
      } else {
        res.status(404).json({ message: 'Watchlist entry not found' });
      }
    } catch (error) {
      if (error.message === 'Watchlist entry not found') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('own watchlist')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message || 'An error occurred while removing from watchlist' });
    }
  }

  /**
   * Elimina un anime de la watchlist usando IDs de perfil y anime
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async removeAnimeFromWatchlist(req, res) {
    try {
      const { profileId, animeId } = req.params;
      
      const result = await watchlistService.removeAnimeFromWatchlist(profileId, animeId);
      
      if (result) {
        res.status(200).json({ message: 'Anime removed from watchlist' });
      } else {
        res.status(404).json({ message: 'Anime not found in this profile\'s watchlist' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message || 'An error occurred while removing anime from watchlist' });
    }
  }

  /**
   * Marca/desmarca un anime como favorito
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async toggleFavorite(req, res) {
    try {
      const { id } = req.params;
      const { profileId, isFavorite } = req.body;
      
      if (!profileId || isFavorite === undefined) {
        return res.status(400).json({ message: 'Profile ID and favorite status are required' });
      }
      
      const result = await watchlistService.toggleFavorite(id, profileId, isFavorite);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Watchlist entry not found') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('own watchlist entries')) {
        return res.status(403).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message || 'An error occurred while updating favorite status' });
    }
  }

  /**
   * Obtiene los favoritos de un perfil
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async getFavorites(req, res) {
    try {
      const { profileId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      // Calcular skip para paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const options = { skip, limit };
      const result = await watchlistService.getFavorites(profileId, options);
      
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Profile not found') {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: error.message || 'An error occurred while fetching favorites' });
    }
  }

  /**
   * Verifica si un anime está en la watchlist de un perfil
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async isInWatchlist(req, res) {
    try {
      const { profileId, animeId } = req.params;
      
      const result = await watchlistService.isInWatchlist(profileId, animeId);
      
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: 'Anime not found in this profile\'s watchlist' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message || 'An error occurred while checking watchlist' });
    }
  }

  /**
   * Obtiene estadísticas de la watchlist de un perfil
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Promise<void>}
   */
  async getWatchlistStats(req, res) {
    try {
      const { profileId } = req.params;
      
      const stats = await watchlistService.getWatchlistStats(profileId);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message || 'An error occurred while fetching watchlist statistics' });
    }
  }
}

module.exports = new WatchlistController();