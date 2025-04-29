const router = require("express").Router();
const authController = require("../controllers/authController");

// Registro de usuario
router.post("/register", authController.register);

// Login de usuario
router.post("/login", authController.login);

// Refrescar token
router.post("/refresh", authController.refreshToken);

module.exports = router;