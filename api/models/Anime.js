const mongoose = require("mongoose");

const AnimeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    synopsis: { type: String, required: true },
    genres: { type: [String], required: true },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    seasonCount: { type: Number, min: 1, default: 1 },
    episodeCount: { type: Number, min: 1, default: 1 },
    status: { 
      type: String, 
      enum: ['En emisión', 'Finalizado', 'Anunciado', 'Pausado'],
      default: 'En emisión'
    },
    releaseYear: { type: Number, required: true },
    studio: { type: String, required: true },
    contentRating: { 
      type: String, 
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
      default: 'PG-13'
    },
    externalId: { type: String }, // ID de referencia para API externa
  },
  { timestamps: true }
);

// Índices para búsquedas eficientes
AnimeSchema.index({ title: 'text', synopsis: 'text' });
AnimeSchema.index({ genres: 1 });
AnimeSchema.index({ contentRating: 1 });

module.exports = mongoose.model("Anime", AnimeSchema);