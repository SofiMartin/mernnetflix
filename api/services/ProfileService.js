const profileRepository = require('../repositories/profileRepository');
const userRepository = require('../repositories/userRepository');
const watchlistRepository = require('../repositories/watchlistRepository');
const mongoose = require('mongoose');

class ProfileService {
  /**
   * Crea un nuevo perfil para un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} profileData - Datos del perfil
   * @returns {Promise<Object>} - Perfil creado
   */
  async createProfile(userId, profileData) {
    try {
      // Verificar si el usuario existe
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verificar límite de perfiles (máximo 5 por usuario)
      const existingProfiles = await profileRepository.findByUserId(userId);
      if (existingProfiles.length >= 5) {
        throw new Error('Maximum number of profiles reached (5)');
      }
      
      // Crear perfil
      const newProfileData = {
        ...profileData,
        user: userId
      };
      
      // Si no se proporciona avatar, generar uno aleatorio
      if (!newProfileData.avatar) {
        newProfileData.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfileData.name}`;
      }
      
      return await profileRepository.create(newProfileData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todos los perfiles de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} - Lista de perfiles
   */
  async getProfiles(userId) {
    try {
      return await profileRepository.findByUserId(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene un perfil por su ID
   * @param {string} profileId - ID del perfil
   * @param {string} userId - ID del usuario (para verificación)
   * @returns {Promise<Object>} - Perfil encontrado
   */
  async getProfileById(profileId, userId) {
    try {
      // Validar que el ID del perfil sea válido
      if (!mongoose.Types.ObjectId.isValid(profileId)) {
        throw new Error('Invalid profile ID');
      }
      
      const profile = await profileRepository.findById(profileId);
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      // Convertir ambos valores a string para comparación segura
      const profileUserId = profile.user.toString();
      const userIdStr = userId.toString();
      
      // Verificar que el perfil pertenece al usuario
      if (profileUserId !== userIdStr) {
        throw new Error('You can only access your own profiles');
      }
      
      return profile;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un perfil
   * @param {string} profileId - ID del perfil
   * @param {string} userId - ID del usuario (para verificación)
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Perfil actualizado
   */
  async updateProfile(profileId, userId, updateData) {
    try {
      // Verificar que el perfil existe y pertenece al usuario
      const profile = await this.getProfileById(profileId, userId);
      
      // No permitir cambiar el usuario propietario
      delete updateData.user;
      
      return await profileRepository.update(profileId, updateData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un perfil
   * @param {string} profileId - ID del perfil
   * @param {string} userId - ID del usuario (para verificación)
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async deleteProfile(profileId, userId) {
    try {
      // Verificar que el perfil existe y pertenece al usuario
      const profile = await this.getProfileById(profileId, userId);
      
      // Verificar que no es el último perfil
      const profiles = await profileRepository.findByUserId(userId);
      if (profiles.length <= 1) {
        throw new Error('Cannot delete the last profile');
      }
      
      // Eliminar el perfil
      await profileRepository.delete(profileId);
      
      // Eliminar también todas las entradas de watchlist asociadas al perfil
      // (Aquí se podría usar un enfoque de transacción para garantizar la integridad)
      if (watchlistRepository) {
        try {
          const watchlist = await watchlistRepository.findByProfileId(profileId);
          if (watchlist && watchlist.data && watchlist.data.length > 0) {
            const deletePromises = watchlist.data.map(item => 
              watchlistRepository.delete(item._id)
            );
            
            await Promise.all(deletePromises);
          }
        } catch (error) {
          console.error('Error al eliminar watchlist del perfil:', error);
          // No lanzamos error aquí para permitir eliminar el perfil aunque falle la limpieza
        }
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambia el tipo de un perfil (adulto, adolescente, niño)
   * @param {string} profileId - ID del perfil
   * @param {string} userId - ID del usuario (para verificación)
   * @param {string} newType - Nuevo tipo
   * @returns {Promise<Object>} - Perfil actualizado
   */
  async changeProfileType(profileId, userId, newType) {
    try {
      // Verificar tipo válido
      const validTypes = ['adult', 'teen', 'kid'];
      if (!validTypes.includes(newType)) {
        throw new Error('Invalid profile type');
      }
      
      // Mapeo de tipo a clasificación máxima
      const contentRatingMap = {
        'adult': 'NC-17',
        'teen': 'PG-13',
        'kid': 'PG'
      };
      
      return await this.updateProfile(profileId, userId, {
        type: newType,
        maxContentRating: contentRatingMap[newType]
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProfileService();