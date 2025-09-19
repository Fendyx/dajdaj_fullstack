// backend/routes/furgonetka.js
const express = require("express");
const axios = require("axios");
const orders = require("../models/order");
require("dotenv").config();

const router = express.Router();

const FURG_API_BASE =
  process.env.FURGONETKA_API_BASE || "https://api.furgonetka.pl";
const FURG_TOKEN = process.env.FURGONETKA_TOKEN;

// Middleware для проверки токена при вебхуках
const requireFurgonetkaAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (token !== FURG_TOKEN) {
    console.warn("[DEBUG] Unauthorized Furgonetka webhook call");
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
};

// ----------------- Публичный эндпоинт для фронтенда -----------------
router.get("/pickup-points", async (req, res) => {
  console.log("[DEBUG] /furgonetka/pickup-points вызван");
  console.log("[DEBUG] query params:", req.query);

  try {
    const { carrier = "all", lat, lng, q } = req.query;
    let results = [];

    const doRequest = async (carrierName) => {
      try {
        console.log(`[DEBUG] Запрашиваю точки для carrier=${carrierName}`);
        const params = { carrier: carrierName };
        if (lat) params.lat = lat;
        if (lng) params.lng = lng;
        if (q) params.q = q;

        const resp = await axios.get(`${FURG_API_BASE}/api/rest/points`, {
          params,
          headers: { Authorization: `Bearer ${FURG_TOKEN}` },
          timeout: 15000,
        });

        console.log(
          `[DEBUG] Получено ${Array.isArray(resp.data) ? resp.data.length : 0
          } точек от API для ${carrierName}`
        );

        return resp.data || [];
      } catch (err) {
        console.error(`[DEBUG] Ошибка запроса точек для ${carrierName}:`, err.message);
        return [];
      }
    };

    if (carrier === "all") {
      const carriers = ["inpost", "orlen", "dpd"];
      const promises = carriers.map((c) => doRequest(c));
      const arrays = await Promise.all(promises);
      results = arrays.flat();
    } else {
      results = await doRequest(carrier);
    }

    const normalized = (Array.isArray(results) ? results : []).map((item) => ({
      id:
        item.id ||
        item.code ||
        item.point_code ||
        `${item.carrier}_${item.code || item.id}`,
      code: item.code || item.point_code,
      name: item.name || item.title || item.description || "",
      address:
        item.address ||
        item.full_address ||
        `${item.city || ""} ${item.street || ""}`.trim(),
      latitude:
        Number(item.lat || item.latitude || item.latitude_wgs84) || null,
      longitude:
        Number(item.lng || item.lon || item.longitude_wgs84) || null,
      carrier: item.carrier || item.provider || carrier,
      raw: item,
    })).filter((p) => p.latitude && p.longitude);

    console.log(`[DEBUG] Отправляю на фронтенд ${normalized.length} точек`);
    res.json({ success: true, points: normalized });
  } catch (err) {
    console.error("[DEBUG] Ошибка /pickup-points:", err.message);
    res
      .status(500)
      .json({ success: false, error: "Could not fetch pickup points" });
  }
});

// ----------------- Роуты для интеграции с Furgonetka -----------------
router.use(requireFurgonetkaAuth);

router.get("/orders", async (req, res) => {
  console.log("[DEBUG] /furgonetka/orders вызван");
  try {
    const allOrders = await orders.find({ status: "pending_shipment" });
    console.log(`[DEBUG] Найдено ${allOrders.length} заказов для отгрузки`);
    const response = allOrders.map((order) => ({
      id: order._id,
      order_number: order.orderNumber,
      recipient: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      delivery: {
        type: order.deliveryType,
        point_code: order.pickupPointCode,
      },
      products: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        weight: item.weight || 1,
      })),
    }));
    res.json(response);
  } catch (error) {
    console.error("[DEBUG] Ошибка /orders:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/orders/:id/tracking_number", async (req, res) => {
  console.log("[DEBUG] /furgonetka/orders/:id/tracking_number вызван");
  try {
    const { tracking_number } = req.body;
    if (!tracking_number) {
      return res.status(400).json({ error: "tracking_number is required" });
    }

    await orders.findByIdAndUpdate(req.params.id, {
      trackingNumber: tracking_number,
    });

    console.log(
      `[DEBUG] Трек-номер ${tracking_number} записан для заказа ${req.params.id}`
    );
    res.json({ success: true });
  } catch (err) {
    console.error("[DEBUG] Ошибка записи трек-номера:", err.message);
    res.status(500).json({ error: "Could not update order" });
  }
});

module.exports = router;
