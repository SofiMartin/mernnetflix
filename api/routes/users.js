const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyToken, verifyAdmin } = require("../middlewares/verifyToken");

// Obtener datos del usuario actual
router.get("/me", verifyToken, userController.getCurrentUser);

// Actualizar usuario
router.put("/:id", verifyToken, userController.updateUser);

// Eliminar usuario
router.delete("/:id", verifyToken, userController.deleteUser);

// Obtener todos los usuarios (solo admin)
router.get("/", verifyToken, verifyAdmin, userController.getAllUsers);

// Obtener estadísticas de usuarios (solo admin)
router.get("/stats", verifyToken, verifyAdmin, userController.getUserStats);

module.exports = router;