const express = require('express');
const router = express.Router();
const PersonalOrder = require('../models/personalOrder');

// --- ЖЕЛЕЗОБЕТОННОЕ РЕШЕНИЕ ---
// Мы подключаем парсер с лимитом 50mb ПРЯМО ЗДЕСЬ.
// Это гарантирует, что для этого роута лимит будет большим, 
// независимо от настроек в index.js
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

// POST /api/personal-orders
router.post('/', async (req, res) => {
  try {
    const { inscription, images } = req.body;

    console.log("📥 Received order request in personalOrders route");
    // Проверка, пришли ли данные
    if (images) {
        console.log(`🖼️ Images count: ${images.length}`);
        // Для отладки: проверим размер первой картинки (первые 50 символов)
        console.log(`🔍 Base64 sample: ${images[0].substring(0, 50)}...`);
    } else {
        console.log("⚠️ Images is undefined or null");
    }

    // Простая валидация
    if (!images || images.length === 0) {
      console.log("❌ No images provided");
      return res.status(400).send('No images provided');
    }

    const newOrder = new PersonalOrder({
      inscription,
      images
    });

    const savedOrder = await newOrder.save();
    console.log("✅ Order saved to MongoDB:", savedOrder._id);

    res.status(201).json({ message: 'Order created successfully', orderId: savedOrder._id });
  } catch (error) {
    console.error('❌ Error saving order:', error);
    // Если ошибка все еще PayloadTooLarge, Express выбросит её до входа в эту функцию,
    // но если ошибка внутри Mongoose, мы её увидим здесь.
    res.status(500).send('Server Error: ' + error.message);
  }
});

module.exports = router;