const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const auth = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");

const isAdmin = [auth, authorizeRole("admin"), authorizeRole("superadmin")];

// Middleware: пропускает admin ИЛИ superadmin
const adminOrSuper = [
  auth,
  (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "superadmin") return next();
    return res.status(403).json({ message: "Доступ запрещен" });
  },
];

// GET /api/admin/products — все продукты (raw, без локализации)
router.get("/", adminOrSuper, async (req, res) => {
  try {
    const products = await Product.find().sort({ sortOrder: 1 }).lean();
    res.json(products);
  } catch (err) {
    console.error("❌ Ошибка получения продуктов (admin):", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// GET /api/admin/products/:id — один продукт по _id (raw)
router.get("/:id", adminOrSuper, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Продукт не найден" });
    res.json(product);
  } catch (err) {
    console.error("❌ Ошибка получения продукта (admin):", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// PATCH /api/admin/products/:id — обновление продукта
router.patch("/:id", adminOrSuper, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Продукт не найден" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Ошибка обновления продукта:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// DELETE /api/admin/products/:id — удаление продукта
router.delete("/:id", adminOrSuper, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Продукт не найден" });
    res.json({ message: "Продукт удален", id: req.params.id });
  } catch (err) {
    console.error("❌ Ошибка удаления продукта:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;