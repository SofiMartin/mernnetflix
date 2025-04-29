const userRepository = require('../repositories/userRepository');
const profileRepository = require('../repositories/profileRepository');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

class AuthService {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario (email, username, password)
   * @returns {Promise<Object>} - Información del usuario registrado con token
   */
  async register(userData) {
    try {
      // Verificar si el email ya existe
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      // Crear el usuario
      const newUser = await userRepository.create(userData);
      
      // Crear un perfil por defecto para el usuario
      const defaultProfile = await profileRepository.create({
        name: 'Principal',
        user: newUser._id,
        type: 'adult',
        maxContentRating: 'NC-17',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username}`
      });
      
      // Generar token JWT
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.SECRET_KEY,
        { expiresIn: "5d" }
      );
      
      return {
        ...newUser,
        token,
        defaultProfile
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Inicia sesión de un usuario
   * @param {Object} credentials - Credenciales (email, password)
   * @returns {Promise<Object>} - Información del usuario con token
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      // Buscar usuario por email
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verificar contraseña
      const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
      const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
      
      if (originalPassword !== password) {
        throw new Error('Incorrect password');
      }
      
      // Generar token JWT
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.SECRET_KEY,
        { expiresIn: "5d" }
      );
      
      // Obtener perfiles del usuario
      const profiles = await profileRepository.findByUserId(user._id);
      
      // Evitar enviar la contraseña en la respuesta
      const { password: _, ...userWithoutPassword } = user._doc;
      
      return {
        ...userWithoutPassword,
        token,
        profiles
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica un token JWT
   * @param {string} token - Token JWT
   * @returns {Promise<Object>} - Payload del token decodificado
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      return decoded;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresca un token JWT
   * @param {string} refreshToken - Token de refresco
   * @returns {Promise<Object>} - Nuevo token
   */
  async refreshToken(refreshToken) {
    try {
      // Verificar el token actual
      const decoded = this.verifyToken(refreshToken);
      
      // Verificar que el usuario sigue existiendo
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generar nuevo token
      const newToken = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.SECRET_KEY,
        { expiresIn: "5d" }
      );
      
      return { token: newToken };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();