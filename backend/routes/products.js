//backend/routes/products.js
const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// ── Утилита локализации ───────────────────────────────────────────────────────
function localize(product, lang) {
  const l = lang === "pl" ? "pl" : "en";
  return {
    slug:                   product.slug,
    name:                   product.name?.[l] || "",
    description:            product.description?.[l] || "",
    descriptionProductPage: product.descriptionProductPage?.[l] || "",
    price:                  product.price,
    category:               product.category,
    image:                  product.image,
    images:                 product.images,
    threeDModelSrc:         product.threeDModelSrc,
    isNew:                  product.isNew,
    isPopular:              product.isPopular,
    isPersonalized:         product.isPersonalized,
    personalizationType:    product.personalizationType,
    phrases:                product.phrases?.[l] || [],
    specifications: product.specifications.map((s) => ({
      label: s.label?.[l] || "",
      value: s.value?.[l] || "",
    })),
    orderExamples: product.orderExamples.map((e) => ({
      image:   e.image,
      caption: e.caption?.[l] || "",
    })),
    faq: product.faq.map((f) => ({
      question: f.question?.[l] || "",
      answer:   f.answer?.[l] || "",
    })),
    sortOrder: product.sortOrder,
  };
}

// ── Утилита: лёгкий объект для suggestions ───────────────────────────────────
function localizeShort(product, lang) {
  const l = lang === "pl" ? "pl" : "en";
  return {
    slug:     product.slug,
    name:     product.name?.[l] || "",
    price:    product.price,
    image:    product.image,
    category: product.category,
  };
}

// ── GET /api/products/search — suggestions для autocomplete ──────────────────
//
// Query params:
//   q     — строка поиска (обязательно, мин. 2 символа)
//   lang  — "en" | "pl" (default "en")
//   limit — кол-во результатов (default 6, max 10)
//
// Как ищет:
//   $or по name.en / name.pl / keywords.en / keywords.pl через $regex
//   Это поддерживает prefix + substring matching (в отличие от $text)
//   Collation strength:2 = регистронезависимо на уровне запроса
//
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const lang = req.query.lang === "pl" ? "pl" : "en";
    const limit = Math.min(parseInt(req.query.limit) || 6, 10);

    // Минимум 2 символа — иначе вернём пустой массив
    if (q.length < 2) {
      return res.json([]);
    }

    // Экранируем спецсимволы regex чтобы не было инъекций
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const products = await Product.find(
      {
        $or: [
          { "name.en":     regex },
          { "name.pl":     regex },
          { "keywords.en": regex },
          { "keywords.pl": regex },
        ],
      },
      // Projection: берём только нужные поля — быстрее и легче
      { slug: 1, name: 1, price: 1, image: 1, category: 1 }
    )
      .limit(limit)
      .lean();

    res.setHeader("Cache-Control", "public, max-age=10"); // короткий кэш
    res.json(products.map((p) => localizeShort(p, lang)));
  } catch (err) {
    console.error("❌ Ошибка поиска:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ── GET /api/products — все продукты ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const lang = req.query.lang === "pl" ? "pl" : "en";
    const products = await Product.find().sort({ sortOrder: 1 }).lean();
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(products.map((p) => localize(p, lang)));
  } catch (err) {
    console.error("❌ Ошибка получения продуктов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ── GET /api/products/:slug — один продукт по slug ───────────────────────────
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const lang = req.query.lang === "pl" ? "pl" : "en";
    const product = await Product.findOne({ slug }).lean();
    if (!product) {
      return res.status(404).json({ message: `Продукт '${slug}' не найден` });
    }
    res.json(localize(product, lang));
  } catch (err) {
    console.error("❌ Ошибка получения продукта:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;