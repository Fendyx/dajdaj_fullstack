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