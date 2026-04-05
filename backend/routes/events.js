// backend/routes/events.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// POST /api/events — принимает события с фронта
// Без auth — события пишут анонимы тоже
router.post('/', async (req, res) => {
  try {
    const { event, productId, sessionId, meta, source, medium, campaign } = req.body;
    if (!event) return res.sendStatus(400);

    await Event.create({
      event,
      userId:    req.user?.id ?? null,
      sessionId: sessionId   ?? null,
      productId: productId   ?? null,
      meta:      meta        ?? {},
      // Пишем null явно если нет UTM — не undefined
      source:   source   ?? null,
      medium:   medium   ?? null,
      campaign: campaign ?? null,
    });

    res.sendStatus(204);
  } catch (e) {
    console.error('Event track error:', e);
    res.sendStatus(500);
  }
});

// GET /api/events/funnel?from=...&to=...
router.get('/funnel', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {
      createdAt: {
        $gte: new Date(from || Date.now() - 30 * 86400000),
        $lte: new Date(to   || Date.now()),
      }
    };

    const steps = ['product_view', 'add_to_cart', 'checkout_start', 'order_complete'];
    const counts = await Promise.all(
      steps.map(e => Event.countDocuments({ event: e, ...dateFilter }))
    );

    res.json(steps.map((e, i) => ({ step: e, count: counts[i] })));
  } catch (e) {
    console.error('Funnel error:', e);
    res.status(500).json({ message: 'Error' });
  }
});

// GET /api/events/top-products?limit=10
router.get('/top-products', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
 
    const result = await Event.aggregate([
      { $match: { event: 'product_view', productId: { $type: 'objectId' } } },
      {
        $group: {
          _id:            '$productId',
          views:          { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' },
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from:         'products',
          localField:   '_id',
          foreignField: '_id',
          as:           'product',
        }
      },
      { $match: { 'product.0': { $exists: true } } },
      { $unwind: '$product' },
      {
        $project: {
          _id:         0,
          productId:   '$_id',
          // 🔥 ФИКС: product.name может быть строкой ИЛИ объектом { en: '...', pl: '...' }
          // Пробуем оба варианта
          name: {
            $cond: {
              if:   { $eq: [{ $type: '$product.name' }, 'string'] },
              then: '$product.name',
              // Если объект — берём en, потом pl
              else: { $ifNull: ['$product.name.en', { $ifNull: ['$product.name.pl', 'Unknown'] }] }
            }
          },
          namePl: {
            $cond: {
              if:   { $eq: [{ $type: '$product.name' }, 'string'] },
              then: '$product.name',
              else: { $ifNull: ['$product.name.pl', ''] }
            }
          },
          slug:       '$product.slug',
          views:      1,
          uniqueViews: { $size: '$uniqueSessions' },
        }
      }
    ]);
 
    res.json(result);
  } catch (e) {
    console.error('❌ Top products error:', e.message, e.stack);
    res.status(500).json({ message: 'Error', error: e.message });
  }
});
// GET /api/events/sources
// Показывает ВСЕ источники: UTM-теггированные + прямые/органические
router.get('/sources', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = from || to ? {
      createdAt: {
        $gte: new Date(from || Date.now() - 30 * 86400000),
        $lte: new Date(to   || Date.now()),
      }
    } : {};

    const result = await Event.aggregate([
      // Берём product_view (первый реальный контакт с контентом)
      { $match: { event: 'product_view', ...dateFilter } },
      {
        $group: {
          _id: {
            $cond: {
              if:   { $ne: ['$source', null] },
              then: '$source',
              else: 'direct / organic',   // null source = прямой/органический трафик
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
    ]);

    res.json(result);
  } catch (e) {
    console.error('Sources error:', e);
    res.status(500).json({ message: 'Error' });
  }
});

// GET /api/events/searches
router.get('/searches', auth, async (req, res) => {
  try {
    const result = await Event.aggregate([
      { $match: { event: 'search_query', 'meta.query': { $exists: true, $ne: '' } } },
      { $group: { _id: '$meta.query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    res.json(result);
  } catch (e) {
    console.error('Searches error:', e);
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;