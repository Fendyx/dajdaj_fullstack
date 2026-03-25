const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const auth = require("../middleware/auth");

const adminOrSuper = [
  auth,
  (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "superadmin") return next();
    return res.status(403).json({ message: "Доступ запрещен" });
  },
];

// GET /api/admin/categories — all categories (including hidden)
router.get("/", adminOrSuper, async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 }).lean();
    res.json(categories);
  } catch (err) {
    console.error("❌ Ошибка получения категорий (admin):", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// POST /api/admin/categories — create new category
router.post("/", adminOrSuper, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("❌ Ошибка создания категории:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Категория с таким slug уже существует" });
    }
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// PATCH /api/admin/categories/:id — update category
router.patch("/:id", adminOrSuper, async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Категория не найдена" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Ошибка обновления категории:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// DELETE /api/admin/categories/:id
router.delete("/:id", adminOrSuper, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Категория не найдена" });
    res.json({ message: "Категория удалена", id: req.params.id });
  } catch (err) {
    console.error("❌ Ошибка удаления категории:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;