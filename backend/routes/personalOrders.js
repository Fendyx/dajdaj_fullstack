const express = require('express');
const router = express.Router();
const PersonalOrder = require('../models/personalOrder');

// Убери router.use(express.json({ limit: '50mb' })) — больше не нужно
// Теперь принимаем только URLs, не base64

router.post('/', async (req, res) => {
  try {
    const { inscription, images } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    // Проверяем что это URLs а не base64
    const isValidUrls = images.every(img => img.startsWith('http'));
    if (!isValidUrls) {
      return res.status(400).json({ message: 'Images must be URLs' });
    }

    const newOrder = new PersonalOrder({ inscription, images });
    const savedOrder = await newOrder.save();

    res.status(201).json({ 
      message: 'Order created', 
      orderId: savedOrder._id 
    });
  } catch (error) {
    console.error('❌ [PersonalOrder] Error:', error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await PersonalOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;