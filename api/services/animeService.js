const animeRepository = require('../repositories/animeRepository');
const axios = require('axios');

class AnimeService {
  /**
   * Crea un nuevo anime
   * @param {Object} animeData - Datos del anime
   * @returns {Promise<Object>} - Anime creado
   */
  async createAnime(animeData) {
    try {
      return await animeRepository.create(animeData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todos los animes con opciones de filtrado
   * @param {Object} filters - Filtros a aplicar
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise<Object>} - Lista de animes con metadatos de paginación
   */
  async getAnimes(filters, options) {
    try {
      return await animeRepository.findAll(filters, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene un anime por su ID
   * @param {string} id - ID del anime
   * @returns {Promise<Object>} - Anime encontrado
   */
  async getAnimeById(id) {
    try {
      const anime = await animeRepository.findById(id);
      if (!anime) {
        throw new Error('Anime not found');
      }
      return anime;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un anime
   * @param {string} id - ID del anime
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Anime actualizado
   */
  async updateAnime(id, updateData) {
    try {
      const anime = await animeRepository.update(id, updateData);
      if (!anime) {
        throw new Error('Anime not found');
      }
      return anime;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un anime
   * @param {string} id - ID del anime
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteAnime(id) {
    try {
      const result = await animeRepository.delete(id);
      if (!result) {
        throw new Error('Anime not found');
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca animes por término
   * @param {string} term - Término de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} - Resultados de búsqueda
   */
  async searchAnimes(term, options) {
    try {
      return await animeRepository.search(term, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene animes por género
   * @param {string} genre - Género a filtrar
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} - Lista de animes filtrados
   */
  async getAnimesByGenre(genre, options) {
    try {
      return await animeRepository.findByGenre(genre, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene animes aleatorios según filtros
   * @param {Object} filters - Filtros a aplicar
   * @param {number} count - Número de animes a retornar
   * @returns {Promise<Array>} - Animes aleatorios
   */
  async getRandomAnimes(filters, count) {
    try {
      return await animeRepository.getRandom(filters, count);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene animes por clasificación de contenido
   * @param {string} contentRating - Clasificación (G, PG, etc)
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} - Animes filtrados
   */
  async getAnimesByContentRating(contentRating, options) {
    try {
      return await animeRepository.findByContentRating(contentRating, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca información de un anime en una API externa (Jikan/MyAnimeList)
   * @param {string} title - Título del anime a buscar
   * @returns {Promise<Object>} - Información del anime
   */
  async searchFromExternalAPI(title) {
    try {
      // Ejemplo usando Jikan API (API no oficial de MyAnimeList)
      const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=5`);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data.map(item => ({
          externalId: item.mal_id.toString(),
          title: item.title,
          imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url,
          synopsis: item.synopsis || '',
          genres: item.genres ? item.genres.map(g => g.name) : [],
          rating: item.score || 0,
          seasonCount: item.seasons || 1,
          episodeCount: item.episodes || 1,
          status: this.mapStatus(item.status),
          releaseYear: item.aired && item.aired.from ? new Date(item.aired.from).getFullYear() : 0,
          studio: item.studios && item.studios.length ? item.studios[0].name : 'Unknown',
          contentRating: this.mapContentRating(item.rating)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching from external API:', error);
      throw new Error('Failed to fetch data from external API');
    }
  }
  
  /**
   * Obtiene los géneros disponibles
   * @returns {Promise<Array>} - Lista de géneros únicos
   */
  async getGenres() {
    try {
      const result = await animeRepository.findAll();
      const allGenres = result.data.flatMap(anime => anime.genres);
      const uniqueGenres = [...new Set(allGenres)].sort();
      return uniqueGenres;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mapea el estado del anime desde la API externa
   * @param {string} externalStatus - Estado en la API externa
   * @returns {string} - Estado mapeado
   */
  mapStatus(externalStatus) {
    if (!externalStatus) return 'Finalizado';
    
    const statusMap = {
      'Airing': 'En emisión',
      'Currently Airing': 'En emisión',
      'Finished Airing': 'Finalizado',
      'Complete': 'Finalizado',
      'Not yet aired': 'Anunciado',
      'Upcoming': 'Anunciado',
      'On Hiatus': 'Pausado'
    };
    
    return statusMap[externalStatus] || 'Finalizado';
  }

  /**
   * Mapea la clasificación de contenido desde la API externa
   * @param {string} externalRating - Clasificación en la API externa
   * @returns {string} - Clasificación mapeada
   */
  mapContentRating(externalRating) {
    if (!externalRating) return 'PG-13';
    
    const ratingMap = {
      'G - All Ages': 'G',
      'PG - Children': 'PG',
      'PG-13 - Teens 13 or older': 'PG-13',
      'R - 17+ (violence & profanity)': 'R',
      'R+ - Mild Nudity': 'R',
      'Rx - Hentai': 'NC-17'
    };
    
    return ratingMap[externalRating] || 'PG-13';
  }

  /**
   * Importa un anime desde la API externa
   * @param {string} externalId - ID en la API externa
   * @returns {Promise<Object>} - Anime importado
   */
  async importFromExternalAPI(externalId) {
    try {
      // Ejemplo usando Jikan API
      const response = await axios.get(`https://api.jikan.moe/v4/anime/${externalId}`);
      
      if (response.data && response.data.data) {
        const item = response.data.data;
        const animeData = {
          externalId: item.mal_id.toString(),
          title: item.title,
          imageUrl: item.images.jpg.large_image_url || item.images.jpg.image_url,
          synopsis: item.synopsis || '',
          genres: item.genres ? item.genres.map(g => g.name) : [],
          rating: item.score || 0,
          seasonCount: item.seasons || 1,
          episodeCount: item.episodes || 1,
          status: this.mapStatus(item.status),
          releaseYear: item.aired && item.aired.from ? new Date(item.aired.from).getFullYear() : 0,
          studio: item.studios && item.studios.length ? item.studios[0].name : 'Unknown',
          contentRating: this.mapContentRating(item.rating)
        };
        
        // Verificar si ya existe
        const existingAnime = await animeRepository.findAll({ externalId: externalId });
        if (existingAnime.data && existingAnime.data.length > 0) {
          return existingAnime.data[0];
        }
        
        // Crear nuevo anime
        return await animeRepository.create(animeData);
      }
      
      throw new Error('Anime not found in external API');
    } catch (error) {
      console.error('Error importing from external API:', error);
      throw new Error('Failed to import anime from external API');
    }
  }
}

module.exports = new AnimeService();