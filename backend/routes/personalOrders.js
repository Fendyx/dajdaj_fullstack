const express = require('express');
const router = express.Router();
const PersonalOrder = require('../models/personalOrder');

// Принудительно ставим лимит 50mb
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

router.post('/', async (req, res) => {
  try {
    const { inscription, images } = req.body;

    console.log("📥 [PersonalOrder] Request received");
    
    if (!images || images.length === 0) {
      console.warn("⚠️ [PersonalOrder] No images!");
      return res.status(400).send('No images provided');
    }

    const newOrder = new PersonalOrder({
      inscription,
      images
    });

    const savedOrder = await newOrder.save();
    console.log("✅ [PersonalOrder] Created ID:", savedOrder._id);

    // 👇 ВАЖНО: Мы должны вернуть именно 'orderId', так как фронт ждет это поле
    res.status(201).json({ 
        message: 'Order created', 
        orderId: savedOrder._id 
    });

  } catch (error) {
    console.error('❌ [PersonalOrder] Error:', error);
    res.status(500).send('Server Error: ' + error.message);
  }
});

module.exports = router;