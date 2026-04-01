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

// ── GET /api/sitemap.xml — динамический sitemap ───────────────────────────────
router.get("/sitemap", async (req, res) => {
  try {
    const products = await Product.find({}, { slug: 1, updatedAt: 1 }).lean();

    const productUrls = products.map((p) => `
  <url>
    <loc>https://dajdaj.pl/products/${p.slug}</loc>
    <lastmod>${p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : "2025-01-01"}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  
    <url>
      <loc>https://dajdaj.pl/</loc>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/pl/pomoc</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/pl/pomoc/jak-zlozyc-zamowienie</loc>
      <changefreq>yearly</changefreq>
      <priority>0.7</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/pl/pomoc/personalizacja-figurki</loc>
      <changefreq>yearly</changefreq>
      <priority>0.7</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/pl/pomoc/dostawa-i-terminy</loc>
      <changefreq>yearly</changefreq>
      <priority>0.7</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/pl/pomoc/platnosci</loc>
      <changefreq>yearly</changefreq>
      <priority>0.7</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/pl/pomoc/zwroty-i-reklamacje</loc>
      <changefreq>yearly</changefreq>
      <priority>0.7</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/pl/pomoc/jak-usunac-konto</loc>
      <changefreq>yearly</changefreq>
      <priority>0.6</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/pl/pomoc/jak-zrobic-zdjecie</loc>
      <changefreq>yearly</changefreq>
      <priority>0.6</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/privacy</loc>
      <changefreq>yearly</changefreq>
      <priority>0.3</priority>
    </url>
  
    <url>
      <loc>https://dajdaj.pl/terms</loc>
      <changefreq>yearly</changefreq>
      <priority>0.3</priority>
    </url>
  
  ${productUrls}
  </urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600"); // кэш 1 час
    res.send(xml);
  } catch (err) {
    console.error("❌ Ошибка генерации sitemap:", err);
    res.status(500).send("Ошибка генерации sitemap");
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