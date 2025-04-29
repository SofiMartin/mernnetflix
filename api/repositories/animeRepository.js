const Anime = require('../models/Anime');

/**
 * Repositorio para operaciones CRUD relacionadas con animes
 */
class AnimeRepository {
  /**
   * Crea un nuevo anime en la base de datos
   * @param {Object} animeData - Datos del anime a crear
   * @returns {Promise<Object>} - El anime creado
   */
  async create(animeData) {
    try {
      const anime = new Anime(animeData);
      return await anime.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todos los animes con opciones de filtrado y paginación
   * @param {Object} filter - Filtros (género, estado, contentRating, etc)
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise<Array>} - Lista de animes
   */
  async findAll(filter = {}, options = {}) {
    try {
      const { 
        sort = { createdAt: -1 }, 
        skip = 0, 
        limit = 20,
        search = ''
      } = options;
      
      // Construir el filtro de búsqueda
      let query = {...filter};
      
      // Búsqueda por texto
      if (search) {
        query.$text = { $search: search };
      }
      
      // Ejecutar consulta con paginación
      const animes = await Anime.find(query)
        .sort(sort)
        .skip(parseInt(skip))
        .limit(parseInt(limit));
      
      // Obtener total para metadatos de paginación
      const total = await Anime.countDocuments(query);
      
      return {
        data: animes,
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
   * Obtiene un anime por su ID
   * @param {string} id - ID del anime
   * @returns {Promise<Object>} - Anime encontrado
   */
  async findById(id) {
    try {
      return await Anime.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un anime
   * @param {string} id - ID del anime a actualizar
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Anime actualizado
   */
  async update(id, updateData) {
    try {
      const updatedAnime = await Anime.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return updatedAnime;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un anime
   * @param {string} id - ID del anime a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async delete(id) {
    try {
      const result = await Anime.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca animes por término de búsqueda en título y sinopsis
   * @param {string} term - Término de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} - Resultados y metadatos de paginación
   */
  async search(term, options = {}) {
    try {
      return await this.findAll(
        {}, 
        { ...options, search: term }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene animes aleatorios según criterios
   * @param {Object} filter - Filtros a aplicar
   * @param {number} count - Cantidad de animes a retornar
   * @returns {Promise<Array>} - Lista de animes aleatorios
   */
  async getRandom(filter = {}, count = 5) {
    try {
      return await Anime.aggregate([
        { $match: filter },
        { $sample: { size: count } }
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene animes por género
   * @param {string} genre - Género a filtrar
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} - Resultados y metadatos de paginación
   */
  async findByGenre(genre, options = {}) {
    try {
      return await this.findAll(
        { genres: genre },
        options
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene animes por clasificación de contenido (para filtrado por edad)
   * @param {string} contentRating - Clasificación (G, PG, PG-13, etc)
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} - Resultados y metadatos de paginación
   */
  async findByContentRating(contentRating, options = {}) {
    try {
      return await this.findAll(
        { contentRating },
        options
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AnimeRepository();