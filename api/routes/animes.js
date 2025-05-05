const router = require("express").Router();
const animeController = require("../controllers/animeController");
const { verifyToken, verifyAdmin, verifyContentAccess } = require("../middlewares/verifyToken");

// Obtener todos los animes (paginados y filtrados)
router.get("/", animeController.getAllAnimes);

// Buscar animes por término
router.get("/search", verifyToken, animeController.searchAnimes);

// Obtener géneros disponibles
router.get("/genres", verifyToken, animeController.getGenres);

// Obtener animes aleatorios
router.get("/random", verifyToken, animeController.getRandomAnimes);

// Buscar en API externa
router.get("/external/search", verifyToken, animeController.searchExternalAPI);

// Importar desde API externa (solo admin)
router.post("/external/import", verifyToken, verifyAdmin, animeController.importFromExternalAPI);

// Obtener un anime específico (con verificación de restricciones de edad)
router.get("/:id", verifyToken, verifyContentAccess, animeController.getAnimeById);

// Crear un nuevo anime (solo admin)
router.post("/", verifyToken, verifyAdmin, animeController.createAnime);

// Actualizar un anime (solo admin)
router.put("/:id", verifyToken, verifyAdmin, animeController.updateAnime);

// Eliminar un anime (solo admin)
router.delete("/:id", verifyToken, verifyAdmin, animeController.deleteAnime);

module.exports = router;