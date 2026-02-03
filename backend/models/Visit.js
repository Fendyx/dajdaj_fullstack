// backend/models/Visit.js
const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Если пользователь авторизован
  lastActive: { type: Date, default: Date.now },
  userAgent: String,
});

// Индекс для автоматического удаления старых записей (если нужно чистить историю активных сессий),
// но для подсчета "всех уникальных за всё время" нам удалять нельзя.
// Поэтому просто оставим как есть.

module.exports = mongoose.model("Visit", visitSchema);