const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware para encriptar contraseña antes de guardar
UserSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = CryptoJS.AES.encrypt(
      this.password,
      process.env.SECRET_KEY
    ).toString();
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
