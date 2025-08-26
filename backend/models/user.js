const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  discounts: [
    {
      code: String,
      value: Number,
      expiresAt: Date,
    },
  ],

  // ❤️ избранное — храним id из products.js
  favorites: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("User", userSchema);
