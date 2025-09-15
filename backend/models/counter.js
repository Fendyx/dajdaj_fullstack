const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, default: 0 },
});

// проверяем, есть ли уже модель с таким именем
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

module.exports = Counter;

