const express = require('express');
const router = express.Router();
const PersonalOrder = require('../models/personalOrder');

// 1. Создаем локальный парсер специально для этого роута
// Это "силовой прием", чтобы гарантированно пропустить большие данные
const jsonParser = express.json({ limit: '50mb' });

// 2. Вставляем jsonParser вторым аргументом в router.post
// POST /api/personal-orders
router.post('/', jsonParser, async (req, res) => {
  try {
    const { inscription, images } = req.body;

    // Простая валидация
    if (!images || images.length === 0) {
      return res.status(400).send('No images provided');
    }

    const newOrder = new PersonalOrder({
      inscription,
      images
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order created successfully', orderId: newOrder._id });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});

module.exports = router;