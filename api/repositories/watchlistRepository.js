const Watchlist = require('../models/Watchlist');

class WatchlistRepository {
  /**
   * Añade un anime a la watchlist de un perfil
   * @param {Object} watchlistData - Datos de la entrada (profileId, animeId, etc)
   * @returns {Promise<Object>} - Entrada creada
   */
  async add(watchlistData) {
    try {
      const watchlistEntry = new Watchlist(watchlistData);
      return await watchlistEntry.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todos los animes en la watchlist de un perfil
   * @param {string} profileId - ID del perfil
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Array>} - Lista de entradas de watchlist
   */
  async findByProfileId(profileId, options = {}) {
    try {
      const { 
        status,
        sort = { updatedAt: -1 }, 
        skip = 0, 
        limit = 20
      } = options;
      
      let query = { profile: profileId };
      
      // Filtrar por estado si se proporciona
      if (status) {
        query.status = status;
      }
      
      // Ejecutar consulta con paginación
      const watchlistItems = await Watchlist.find(query)
        .populate('anime')
        .sort(sort)
        .skip(parseInt(skip))
        .limit(parseInt(limit));
      
      // Obtener total para metadatos de paginación
      const total = await Watchlist.countDocuments(query);
      
      return {
        data: watchlistItems,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pageSize: limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una entrada específica de la watchlist
   * @param {string} id - ID de la entrada
   * @returns {Promise<Object>} - Entrada encontrada
   */
  async findById(id) {
    try {
      return await Watchlist.findById(id).populate('anime');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Encuentra una entrada de watchlist por perfil y anime
   * @param {string} profileId - ID del perfil
   * @param {string} animeId - ID del anime
   * @returns {Promise<Object>} - Entrada encontrada o null
   */
  async findByProfileAndAnime(profileId, animeId) {
    try {
      return await Watchlist.findOne({
        profile: profileId,
        anime: animeId
      }).populate('anime');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una entrada de la watchlist
   * @param {string} id - ID de la entrada
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Entrada actualizada
   */
  async update(id, updateData) {
    try {
      return await Watchlist.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('anime');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una entrada de la watchlist
   * @param {string} id - ID de la entrada
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async delete(id) {
    try {
      const result = await Watchlist.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una entrada de watchlist por perfil y anime
   * @param {string} profileId - ID del perfil
   * @param {string} animeId - ID del anime
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async removeFromWatchlist(profileId, animeId) {
    try {
      const result = await Watchlist.findOneAndDelete({
        profile: profileId,
        anime: animeId
      });
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene los favoritos de un perfil
   * @param {string} profileId - ID del perfil
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} - Lista de favoritos con paginación
   */
  async getFavorites(profileId, options = {}) {
    try {
      return await this.findByProfileId(
        profileId,
        { 
          ...options,
          isFavorite: true 
        }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WatchlistRepository();