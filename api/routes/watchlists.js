const router = require("express").Router();
const watchlistController = require("../controllers/watchlistController");
const { verifyToken, verifyProfileOwner } = require("../middlewares/verifyToken");

// Añadir anime a watchlist
router.post("/", verifyToken, watchlistController.addToWatchlist);

// Obtener watchlist de un perfil
router.get("/:profileId", verifyToken, watchlistController.getWatchlist);

// Obtener estadísticas de watchlist
router.get("/:profileId/stats", verifyToken, watchlistController.getWatchlistStats);

// Verificar si un anime está en la watchlist
router.get("/:profileId/anime/:animeId", verifyToken, watchlistController.isInWatchlist);

// Obtener favoritos de un perfil
router.get("/profile/:profileId/favorites", verifyToken, watchlistController.getFavorites);

// Eliminar anime de watchlist (usando IDs de perfil y anime)
router.delete("/:profileId/anime/:animeId", verifyToken, watchlistController.removeAnimeFromWatchlist);

// Actualizar entrada de watchlist
router.put("/:id", verifyToken, watchlistController.updateWatchlistEntry);

// Eliminar entrada de watchlist
router.delete("/:id", verifyToken, watchlistController.removeFromWatchlist);

// Marcar/desmarcar como favorito
router.patch("/:id/favorite", verifyToken, watchlistController.toggleFavorite);

module.exports = router;