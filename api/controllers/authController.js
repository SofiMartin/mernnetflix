const authService = require('../services/AuthService');

/**
 * Controlador para autenticación y gestión de usuarios
 */
exports.register = async (req, res, next) => {
  try {
    const userData = req.body;
    const result = await authService.register(userData);
    
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const credentials = req.body;
    const result = await authService.login(credentials);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Incorrect password') {
      return res.status(401).json({
        status: 'error',
        message: 'Wrong email or password'
      });
    }
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is required'
      });
    }
    
    const result = await authService.refreshToken(token);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
    next(error);
  }
};