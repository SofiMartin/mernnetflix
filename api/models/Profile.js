const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    type: { 
      type: String, 
      enum: ['adult', 'teen', 'kid'],
      default: 'adult'
    },
    maxContentRating: { 
      type: String, 
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
      default: 'NC-17'
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Índice compuesto para evitar nombres duplicados para el mismo usuario
ProfileSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Profile", ProfileSchema);