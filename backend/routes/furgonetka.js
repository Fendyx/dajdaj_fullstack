const express = require('express');
const router = express.Router();
const orders = require('../models/order');
require('dotenv').config();

// Миддлвар для проверки токена
router.use((req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token !== process.env.FURGONETKA_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
});

// GET /furgonetka/orders – Furgonetka будет дергать, чтобы получить новые заказы
router.get('/orders', async (req, res) => {
  try {
    const allOrders = await orders.find({ status: 'pending_shipment' });
    // привести к формату Furgonetka
    const response = allOrders.map(order => ({
      id: order._id,
      order_number: order.orderNumber,
      recipient: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      delivery: {
        type: order.deliveryType, // np. 'inpost', 'dpd'
        point_code: order.pickupPointCode // если есть
      },
      products: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        weight: item.weight || 1
      }))
    }));
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /furgonetka/orders/:id/tracking_number – Furgonetka пришлет tracking
router.post('/orders/:id/tracking_number', async (req, res) => {
  const { tracking_number } = req.body;
  try {
    await orders.findByIdAndUpdate(req.params.id, { trackingNumber: tracking_number });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update order' });
  }
});

module.exports = router;
