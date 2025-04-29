const router = require("express").Router();
const profileController = require("../controllers/profileController");
const { verifyToken, verifyProfileOwner } = require("../middlewares/verifyToken");

// Obtener todos los perfiles del usuario
router.get("/", verifyToken, profileController.getProfiles);

// Crear un nuevo perfil
router.post("/", verifyToken, profileController.createProfile);

// Obtener un perfil específico
router.get("/:id", verifyToken, verifyProfileOwner, profileController.getProfile);

// Actualizar un perfil
router.put("/:id", verifyToken, verifyProfileOwner, profileController.updateProfile);

// Eliminar un perfil
router.delete("/:id", verifyToken, verifyProfileOwner, profileController.deleteProfile);

// Cambiar tipo de perfil (adulto, adolescente, niño)
router.patch("/:id/type", verifyToken, verifyProfileOwner, profileController.changeProfileType);

module.exports = router;