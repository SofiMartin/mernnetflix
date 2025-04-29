const watchlistRepository = require('../repositories/watchlistRepository');
const animeRepository = require('../repositories/animeRepository');
const profileRepository = require('../repositories/profileRepository');

class WatchlistService {
  /**
   * Añade un anime a la watchlist de un perfil
   * @param {string} profileId - ID del perfil
   * @param {string} animeId - ID del anime
   * @param {Object} options - Opciones adicionales (status, notes)
   * @returns {Promise<Object>} - Entrada creada
   */
  async addToWatchlist(profileId, animeId, options = {}) {
    try {
      // Verificar si el perfil existe
      const profile = await profileRepository.findById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      // Verificar si el anime existe
      const anime = await animeRepository.findById(animeId);
      if (!anime) {
        throw new Error('Anime not found');
      }
      
      // Verificar restricciones de edad
      const ratingHierarchy = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
      const profileMaxRatingIndex = ratingHierarchy.indexOf(profile.maxContentRating);
      const animeRatingIndex = ratingHierarchy.indexOf(anime.contentRating);
      
      if (animeRatingIndex > profileMaxRatingIndex) {
        throw new Error('This content is not available for this profile due to age restrictions');
      }
      
      // Verificar si ya está en la watchlist
      const existing = await watchlistRepository.findByProfileAndAnime(profileId, animeId);
      if (existing) {
        throw new Error('Anime already in watchlist');
      }
      
      // Crear entrada
      const watchlistData = {
        profile: profileId,
        anime: animeId,
        ...options
      };
      
      return await watchlistRepository.add(watchlistData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene la watchlist de un perfil
   * @param {string} profileId - ID del perfil
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} - Lista de entradas con metadatos de paginación
   */
  async getWatchlist(profileId, options) {
    try {
      // Verificar si el perfil existe
      const profile = await profileRepository.findById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return await watchlistRepository.findByProfileId(profileId, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una entrada de la watchlist
   * @param {string} entryId - ID de la entrada
   * @param {string} profileId - ID del perfil (para verificación)
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Entrada actualizada
   */
  async updateWatchlistEntry(entryId, profileId, updateData) {
    try {
      // Verificar si la entrada existe y pertenece al perfil
      const entry = await watchlistRepository.findById(entryId);
      if (!entry) {
        throw new Error('Watchlist entry not found');
      }
      
      if (entry.profile.toString() !== profileId) {
        throw new Error('You can only update your own watchlist entries');
      }
      
      return await watchlistRepository.update(entryId, updateData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una entrada de la watchlist
   * @param {string} entryId - ID de la entrada
   * @param {string} profileId - ID del perfil (para verificación)
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async removeFromWatchlist(entryId, profileId) {
    try {
      // Verificar si la entrada existe y pertenece al perfil
      const entry = await watchlistRepository.findById(entryId);
      if (!entry) {
        throw new Error('Watchlist entry not found');
      }
      
      if (entry.profile.toString() !== profileId) {
        throw new Error('You can only remove entries from your own watchlist');
      }
      
      return await watchlistRepository.delete(entryId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Alternativa para eliminar usando IDs de perfil y anime
   * @param {string} profileId - ID del perfil
   * @param {string} animeId - ID del anime
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async removeAnimeFromWatchlist(profileId, animeId) {
    try {
      return await watchlistRepository.removeFromWatchlist(profileId, animeId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marca un anime como favorito
   * @param {string} entryId - ID de la entrada
   * @param {string} profileId - ID del perfil (para verificación)
   * @param {boolean} isFavorite - Estado de favorito
   * @returns {Promise<Object>} - Entrada actualizada
   */
  async toggleFavorite(entryId, profileId, isFavorite) {
    try {
      return await this.updateWatchlistEntry(entryId, profileId, { isFavorite });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene los favoritos de un perfil
   * @param {string} profileId - ID del perfil
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} - Lista de favoritos
   */
  async getFavorites(profileId, options) {
    try {
      // Verificar si el perfil existe
      const profile = await profileRepository.findById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return await watchlistRepository.getFavorites(profileId, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica si un anime está en la watchlist de un perfil
   * @param {string} profileId - ID del perfil
   * @param {string} animeId - ID del anime
   * @returns {Promise<Object|null>} - Entrada o null si no existe
   */
  async isInWatchlist(profileId, animeId) {
    try {
      return await watchlistRepository.findByProfileAndAnime(profileId, animeId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de la watchlist de un perfil
   * @param {string} profileId - ID del perfil
   * @returns {Promise<Object>} - Estadísticas
   */
  async getWatchlistStats(profileId) {
    try {
      const watchlist = await watchlistRepository.findByProfileId(profileId);
      
      // Contar por estado
      const statusCounts = {
        plan_to_watch: 0,
        watching: 0,
        completed: 0,
        dropped: 0,
        total: watchlist.data.length,
        favorites: 0
      };
      
      watchlist.data.forEach(item => {
        if (statusCounts[item.status] !== undefined) {
          statusCounts[item.status]++;
        }
        
        if (item.isFavorite) {
          statusCounts.favorites++;
        }
      });
      
      return statusCounts;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WatchlistService();