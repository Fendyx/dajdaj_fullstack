const mongoose = require("mongoose");

const specificationSchema = new mongoose.Schema(
  {
    label: { en: { type: String, required: true }, pl: { type: String, required: true } },
    value: { en: { type: String, required: true }, pl: { type: String, required: true } },
  },
  { _id: false }
);

const orderExampleSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    caption: {
      en: { type: String, default: "" },
      pl: { type: String, default: "" },
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // ── Идентификация ──────────────────────────────────────────
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ── Основные поля ──────────────────────────────────────────
    name: {
      en: { type: String, required: true },
      pl: { type: String, required: true },
    },
    description: {
      en: { type: String, default: "" },
      pl: { type: String, default: "" },
    },
    descriptionProductPage: {
      en: { type: String, default: "" },
      pl: { type: String, default: "" },
    },
    price: { type: Number, required: true },
    category: { type: String, required: true },

    // ── Ключевые слова для поиска ───────────────────────────────
    // Примеры: ["boyfriend", "for him", "couple", "парень", "подарок"]
    // Чем больше — тем лучше findability. Добавляй синонимы, кому подходит,
    // повод (день рождения, свадьба), материал, стиль.
    keywords: {
      en: { type: [String], default: [] },
      pl: { type: [String], default: [] },
    },

    // ── Медиа ──────────────────────────────────────────────────
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    threeDModelSrc: { type: String, default: null },

    // ── Флаги ──────────────────────────────────────────────────
    isNew: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isPersonalized: { type: Boolean, default: false },
    personalizationType: { type: String, default: null },

    // ── Персонализация ─────────────────────────────────────────
    phrases: {
      en: { type: [String], default: [] },
      pl: { type: [String], default: [] },
    },

    // ── Характеристики ─────────────────────────────────────────
    specifications: { type: [specificationSchema], default: [] },

    // ── Примеры заказов ────────────────────────────────────────
    orderExamples: { type: [orderExampleSchema], default: [] },

    // ── FAQ ────────────────────────────────────────────────────
    faq: {
      type: [
        {
          question: { en: String, pl: String },
          answer: { en: String, pl: String },
          _id: false,
        },
      ],
      default: [],
    },

    // ── Порядок отображения ────────────────────────────────────
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Индексы ────────────────────────────────────────────────────────────────
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });

// name — строки, можно в одном составном индексе
productSchema.index(
  { "name.en": 1, "name.pl": 1 },
  { collation: { locale: "en", strength: 2 } }
);

// keywords — массивы, MongoDB запрещает два массива в одном индексе,
// поэтому каждый язык индексируется отдельно
productSchema.index({ "keywords.en": 1 });
productSchema.index({ "keywords.pl": 1 });

module.exports = mongoose.model("Product", productSchema);