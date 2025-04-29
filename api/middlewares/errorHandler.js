/**
 * Middleware para manejo centralizado de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {Function} next - Función next de Express
 */
exports.errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Definir código de estado basado en el tipo de error
    let statusCode = err.statusCode || 500;
    
    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
      statusCode = 400;
      return res.status(statusCode).json({
        status: 'error',
        message: 'Error de validación',
        errors: Object.values(err.errors).map(error => error.message)
      });
    }
    
    // Error de duplicado (clave única)
    if (err.code === 11000) {
      statusCode = 409;
      return res.status(statusCode).json({
        status: 'error',
        message: 'Ya existe un registro con estos datos'
      });
    }
    
    // Error de ID inválido de MongoDB
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      statusCode = 400;
      return res.status(statusCode).json({
        status: 'error',
        message: 'ID inválido'
      });
    }
    
    // Para errores de JWT en middleware de autenticación
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      return res.status(statusCode).json({
        status: 'error',
        message: 'Token inválido'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      return res.status(statusCode).json({
        status: 'error',
        message: 'Token expirado'
      });
    }
    
    // Por defecto, enviar mensaje de error genérico
    res.status(statusCode).json({
      status: 'error',
      message: err.message || 'Error interno del servidor'
    });
  };