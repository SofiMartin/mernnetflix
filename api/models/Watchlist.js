const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema(
  {
    profile: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Profile',
      required: true 
    },
    anime: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Anime',
      required: true
    },
    status: { 
      type: String, 
      enum: ['plan_to_watch', 'watching', 'completed', 'dropped'],
      default: 'plan_to_watch'
    },
    isFavorite: { type: Boolean, default: false },
    lastWatched: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

// Índice compuesto para evitar duplicados (un anime solo puede estar una vez en la watchlist de un perfil)
WatchlistSchema.index({ profile: 1, anime: 1 }, { unique: true });

module.exports = mongoose.model("Watchlist", WatchlistSchema);