const mongoose = require("mongoose");

const DailyStatsSchema = new mongoose.Schema({
  date: {
    type: String, // Формат "YYYY-MM-DD"
    required: true,
    unique: true,
  },
  maxActiveUsers: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DailyStats", DailyStatsSchema);