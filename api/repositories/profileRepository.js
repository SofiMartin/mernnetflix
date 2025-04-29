const Profile = require('../models/Profile');

class ProfileRepository {
  /**
   * Crea un nuevo perfil
   * @param {Object} profileData - Datos del perfil
   * @returns {Promise<Object>} - Perfil creado
   */
  async create(profileData) {
    try {
      const profile = new Profile(profileData);
      return await profile.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todos los perfiles de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} - Lista de perfiles
   */
  async findByUserId(userId) {
    try {
      return await Profile.find({ user: userId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene un perfil por su ID
   * @param {string} id - ID del perfil
   * @returns {Promise<Object>} - Perfil encontrado
   */
  async findById(id) {
    try {
      return await Profile.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un perfil
   * @param {string} id - ID del perfil
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Perfil actualizado
   */
  async update(id, updateData) {
    try {
      return await Profile.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un perfil
   * @param {string} id - ID del perfil
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async delete(id) {
    try {
      const result = await Profile.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProfileRepository();