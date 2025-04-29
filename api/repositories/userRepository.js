const User = require('../models/User');
const CryptoJS = require("crypto-js");

class UserRepository {
  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado (sin la contraseña)
   */
  async create(userData) {
    try {
      const user = new User(userData);
      await user.save();
      
      // Evitar enviar la contraseña en la respuesta
      const { password, ...userWithoutPassword } = user._doc;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Encuentra un usuario por su email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} - Usuario encontrado
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Encuentra un usuario por su ID
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} - Usuario encontrado (sin la contraseña)
   */
  async findById(id) {
    try {
      const user = await User.findById(id);
      if (!user) return null;
      
      // Evitar enviar la contraseña en la respuesta
      const { password, ...userWithoutPassword } = user._doc;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza un usuario
   * @param {string} id - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Usuario actualizado (sin la contraseña)
   */
  async update(id, updateData) {
    try {
      // Si se intenta actualizar la contraseña, encriptarla
      if (updateData.password) {
        updateData.password = CryptoJS.AES.encrypt(
          updateData.password,
          process.env.SECRET_KEY
        ).toString();
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      // Evitar enviar la contraseña en la respuesta
      const { password, ...userWithoutPassword } = updatedUser._doc;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  async delete(id) {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de usuarios (para admin)
   * @returns {Promise<Object>} - Estadísticas de usuarios
   */
  async getStats() {
    try {
      // Ejemplo: obtener usuarios por mes
      const today = new Date();
      const lastYear = new Date(today.setFullYear(today.getFullYear() - 1));
      
      const stats = await User.aggregate([
        {
          $match: { createdAt: { $gte: lastYear } }
        },
        {
          $project: {
            month: { $month: "$createdAt" },
          }
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 }
          }
        }
      ]);
      
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();