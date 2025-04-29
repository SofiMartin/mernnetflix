const userRepository = require('../repositories/userRepository');

/**
 * Controlador para gestión de usuarios
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userRepository.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Solo permitir actualizar el propio usuario o ser admin
    if (id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own account'
      });
    }
    
    const updateData = req.body;
    
    // No permitir cambiar el rol a admin (solo un admin existente puede hacerlo)
    if (updateData.isAdmin !== undefined && !req.user.isAdmin) {
      delete updateData.isAdmin;
    }
    
    const updatedUser = await userRepository.update(id, updateData);
    
    res.status(200).json({
      status: 'success',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Solo permitir eliminar el propio usuario o ser admin
    if (id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own account'
      });
    }
    
    await userRepository.delete(id);
    
    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    // Esta ruta ya está protegida por el middleware verifyAdmin
    const users = await userRepository.findAll();
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    // Esta ruta ya está protegida por el middleware verifyAdmin
    const stats = await userRepository.getStats();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};