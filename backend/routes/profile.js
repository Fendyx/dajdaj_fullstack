const express = require("express");
const router = express.Router();
const Joi = require("joi");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const Order = require("../models/order");
const User = require("../models/user");
const products = require("../products");

// Схема валидации доставки
const deliverySchema = Joi.object({
  personalData: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    surname: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-]{7,20}$/).required(),
  }).required(),
  delivery: Joi.object({
    address: Joi.string().min(5).max(200).required(),
    method: Joi.string().max(50).required(),
  }).required(),
});

// ✅ Получить полный профиль пользователя
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email role clientId cardNumber registrationDate discounts favorites deliveryDatas defaultDeliveryId"
    );
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при получении профиля" });
  }
});

// ✅ Добавить новые данные доставки
router.post("/delivery", auth, async (req, res) => {
  const { error } = deliverySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { personalData, delivery } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const maxId = user.deliveryDatas.reduce((max, d) => Math.max(max, d.deliveryId), 0);
    const nextId = maxId + 1;

    user.deliveryDatas.push({ deliveryId: nextId, personalData, delivery });

    if (user.defaultDeliveryId === null || user.deliveryDatas.length === 1) {
      user.defaultDeliveryId = nextId;
    }

    await user.save();

    res.status(201).json({
      message: "Данные доставки добавлены",
      deliveryDatas: user.deliveryDatas,
      defaultDeliveryId: user.defaultDeliveryId,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при добавлении delivery" });
  }
});

// ✅ Обновить существующий профиль доставки
router.patch("/delivery/:deliveryId", auth, async (req, res) => {
  const { error } = deliverySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { deliveryId } = req.params;
    const { personalData, delivery } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const profile = user.deliveryDatas.find((d) => d.deliveryId === Number(deliveryId));
    if (!profile) return res.status(404).json({ message: "Профиль доставки не найден" });

    if (personalData) Object.assign(profile.personalData, personalData);
    if (delivery) Object.assign(profile.delivery, delivery);

    await user.save();

    res.json({ message: "Профиль доставки обновлён", deliveryDatas: user.deliveryDatas });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при обновлении delivery" });
  }
});

// ✅ Удалить профиль доставки
router.delete("/delivery/:deliveryId", auth, async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const idNum = Number(deliveryId);
    user.deliveryDatas = user.deliveryDatas.filter((d) => d.deliveryId !== idNum);

    if (user.defaultDeliveryId === idNum) {
      user.defaultDeliveryId = user.deliveryDatas[0]?.deliveryId ?? null;
    }

    await user.save();

    res.json({
      message: "Профиль доставки удалён",
      deliveryDatas: user.deliveryDatas,
      defaultDeliveryId: user.defaultDeliveryId,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при удалении delivery" });
  }
});

// ✅ Сменить дефолтный профиль доставки
router.patch("/delivery/:deliveryId/set-default", auth, async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const exists = user.deliveryDatas.some((d) => d.deliveryId === Number(deliveryId));
    if (!exists) return res.status(404).json({ message: "Профиль доставки не найден" });

    user.defaultDeliveryId = Number(deliveryId);
    await user.save();

    res.json({ message: "Дефолтный профиль доставки обновлён", defaultDeliveryId: user.defaultDeliveryId });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при смене дефолта" });
  }
});

// ✅ Получить историю заказов пользователя
router.get("/orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({ path: "products.personalOrderId", model: "PersonalOrder", select: "images inscription" })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
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
    res.status(500).json({ message: "Ошибка сервера при получении скидок" });
  }
});

// ✅ Получить список избранных товаров
router.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const favoriteProducts = products.filter((p) => user.favorites.includes(p.id));
    res.json(favoriteProducts);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при получении избранного" });
  }
});

// ✅ Добавить товар в избранное
router.post("/favorites/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const exists = products.some((p) => p.id === productId);
    if (!exists) return res.status(400).json({ message: "Товар с таким ID не найден" });

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.json({ message: "Товар добавлен в избранное", favorites: user.favorites });
  } catch (error) {
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

    res.json({ message: "Товар удален из избранного", favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при удалении из избранного" });
  }
});

// ✅ Удалить аккаунт (GDPR)
router.delete("/account", auth, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userId = new mongoose.Types.ObjectId(req.user._id); // ← конвертируем строку в ObjectId

    await Order.updateMany(
      { userId },
      {
        $set: {
          userId: null,
          "deliveryInfo.name": "Deleted User",
          "deliveryInfo.phone": "",
          "deliveryInfo.email": "",
          "deliveryInfo.address": {},
        },
      }
    );

    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "Аккаунт успешно удалён" });
  } catch (error) {
    console.error("Ошибка удаления аккаунта:", error);
    res.status(500).json({ message: "Ошибка сервера при удалении аккаунта" });
  }
});

router.patch("/gdpr-consent", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    user.gdprConsent = {
      accepted: true,
      acceptedAt: new Date(),
      version: "1.0",
    };

    await user.save();
    res.json({ message: "Согласие принято" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;