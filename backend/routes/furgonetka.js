// backend/routes/furgonetka.js
const express = require('express');
const router = express.Router();
const orders = require('../models/order');
const axios = require('axios');
require('dotenv').config();

const FURG_API_BASE = process.env.FURGONETKA_API_BASE || 'https://api.furgonetka.pl'; // настроить в .env
const FURG_TOKEN = process.env.FURGONETKA_TOKEN;

// --- Middleware для внутренних вызовов (вебхуков) ---
// Мы будем применять его только к роутам, которые действительно должны
// быть вызваны внешней Furgonetka (например, /orders и /orders/:id/tracking_number).
const requireFurgonetkaAuth = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token !== FURG_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// ----------------- Публичный эндпоинт для фронтенда -----------------
// GET /furgonetka/pickup-points?carrier=inpost|orlen|dpd|all&lat=&lng=&q=
router.get('/pickup-points', async (req, res) => {
  try {
    const { carrier = 'all', lat, lng, q } = req.query;

    // Если у тебя есть конкретный внутренний метод обращения к furgonetka,
    // используй его. Ниже общий пример проксирования запроса.
    // Подразумевается, что внешний API furgonetka умеет фильтровать по carrier.
    // Если нет — можно запрашивать отдельно для каждого перевозчика и объединять.

    // Если carrier === 'all' — запрашиваем все доступные (или объединяем несколько).
    let results = [];

    const doRequest = async (carrierName) => {
      const params = { carrier: carrierName };
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }
      if (q) params.q = q;
      const resp = await axios.get(`${FURG_API_BASE}/api/rest/points`, {
        params,
        headers: { Authorization: `Bearer ${FURG_TOKEN}` },
        timeout: 15000,
      });
      return resp.data || [];
    };

    if (carrier === 'all') {
      // можно параллельно запрашивать несколько поставщиков
      const carriers = ['inpost', 'orlen', 'dpd'];
      const promises = carriers.map(c => doRequest(c).catch(e => {
        console.error(`pickup for ${c} failed`, e?.message || e);
        return [];
      }));
      const arrays = await Promise.all(promises);
      results = arrays.flat();
    } else {
      results = await doRequest(carrier);
    }

    // Нормализуем формат (унификация полей для фронтенда)
    const normalized = (Array.isArray(results) ? results : []).map(item => ({
      // ожидаю, что в item есть: id/code, name, address, lat, lng, carrier, opening_hours
      id: item.id || item.code || item.point_code || `${item.carrier}_${item.code || item.id}`,
      code: item.code || item.point_code,
      name: item.name || item.title || item.description || '',
      address: item.address || item.full_address || `${item.city || ''} ${item.street || ''}`.trim(),
      latitude: Number(item.lat || item.latitude || item.latitude_wgs84) || Number(item.latitude) || null,
      longitude: Number(item.lng || item.lon || item.longitude_wgs84) || Number(item.longitude) || null,
      carrier: item.carrier || item.provider || carrier,
      raw: item // для отладки/доп.данных
    })).filter(p => p.latitude && p.longitude); // фильтруем невалидные

    res.json({ success: true, points: normalized });
  } catch (err) {
    console.error('Error /furgonetka/pickup-points', err?.message || err);
    res.status(500).json({ success: false, error: 'Could not fetch pickup points' });
  }
});

// ----------------- Роуты, защищённые токеном Furgonetka -----------------
router.use(requireFurgonetkaAuth);

// GET /furgonetka/orders – Furgonetka будет дергать, чтобы получить новые заказы
router.get('/orders', async (req, res) => {
  try {
    const allOrders = await orders.find({ status: 'pending_shipment' });
    const response = allOrders.map(order => ({
      id: order._id,
      order_number: order.orderNumber,
      recipient: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      delivery: {
        type: order.deliveryType,
        point_code: order.pickupPointCode
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
