const mongoose = require("mongoose");

const personalOrderSchema = new mongoose.Schema(
  {
    inscription: { 
      type: String, 
      required: false, 
      default: "" 
    },
    // 👇 Массив строк для Base64 картинок
    images: { 
      type: [String], 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }
);

// Если коллекция уже создана с другой схемой, это может помочь избежать ошибок
// (но лучше проверить в Compass/Atlas)
module.exports = mongoose.model("PersonalOrder", personalOrderSchema);