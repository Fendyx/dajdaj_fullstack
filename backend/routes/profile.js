const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/order");
const User = require("../models/user");
const products = require("../products");

// ✅ Получить полный профиль пользователя
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при получении профиля" });
  }
});

// ✅ Добавить новые данные доставки
router.post("/delivery", auth, async (req, res) => {
  try {
    const { personalData, delivery } = req.body;
    if (!personalData || !delivery) {
      return res.status(400).json({ message: "Не переданы personalData или delivery" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    // автоинкремент deliveryId
    const nextId = (user.deliveryDatas?.length || 0) + 1;

    user.deliveryDatas.push({
      deliveryId: nextId,
      personalData,
      delivery,
    });

    await user.save();

    res.status(201).json({
      message: "Данные доставки добавлены",
      deliveryDatas: user.deliveryDatas,
    });
  } catch (error) {
    console.error("Ошибка добавления delivery:", error);
    res.status(500).json({ message: "Ошибка сервера при добавлении delivery" });
  }
});


// ✅ Получить историю заказов пользователя
router.get("/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при получении заказов" });
  }
});

// ✅ Получить активные скидки пользователя
router.get("/discounts", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const now = new Date();
    const activeDiscounts = (user.discounts || []).filter(
      (d) => d.expiresAt && new Date(d.expiresAt) > now
    );
    res.json(activeDiscounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при получении скидок" });
  }
});

// ✅ Получить список избранных товаров (полные карточки из products.js)
router.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const favoriteProducts = products.filter((p) => user.favorites.includes(p.id));
    res.json(favoriteProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при получении избранного" });
  }
});

// ✅ Добавить товар в избранное
router.post("/favorites/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    // проверим, что товар существует в products.js (необязательно, но полезно)
    const exists = products.some((p) => p.id === productId);
    if (!exists) {
      return res.status(400).json({ message: "Товар с таким ID не найден" });
    }

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.json({
      message: "Товар добавлен в избранное",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при добавлении в избранное" });
  }
});

// ✅ Удалить товар из избранного
router.delete("/favorites/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    user.favorites = (user.favorites || []).filter((id) => id !== productId);
    await user.save();

    res.json({
      message: "Товар удален из избранного",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при удалении из избранного" });
  }
});

module.exports = router;