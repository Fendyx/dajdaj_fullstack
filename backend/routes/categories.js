const express = require("express");
const router = express.Router();
const Category = require("../models/category");

// GET /api/categories — public, only visible, sorted
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isVisible: true })
      .sort({ sortOrder: 1 })
      .lean();
    res.json(categories);
  } catch (err) {
    console.error("❌ Ошибка получения категорий:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;