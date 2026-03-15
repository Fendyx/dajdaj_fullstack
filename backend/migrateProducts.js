/**
 * Запуск: node migrateProducts.js
 * Берёт все продукты из products.js, генерирует slug если нет, пишет в MongoDB.
 * Повторный запуск безопасен — updateOne с upsert не дублирует записи.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product");
const rawProducts = require("./products");

// ── Утилита: генерация slug из названия ──────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (c) =>
      ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[c] || c)
    )
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Дефолтные характеристики для figurine-продуктов ──────────────────────────
function getDefaultSpecs(product) {
  if (product.personalizationType === "figurine" || product.personalizationType === "custom") {
    return [
      { label: { en: "Material", pl: "Materiał" }, value: { en: "PLA+", pl: "PLA+" } },
      { label: { en: "Height", pl: "Wysokość" }, value: { en: "15 cm", pl: "15 cm" } },
      { label: { en: "Print time", pl: "Czas druku" }, value: { en: "~8 hours", pl: "~8 godzin" } },
      { label: { en: "Finish", pl: "Wykończenie" }, value: { en: "Matte", pl: "Matowe" } },
    ];
  }
  return [];
}

// ── Основной скрипт ───────────────────────────────────────────────────────────
async function migrate() {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Подключились к MongoDB");

    let created = 0;
    let updated = 0;

    for (const p of rawProducts) {
      // Генерируем slug: берём существующий или генерируем из английского имени
      const slug = p.slug || toSlug(p.name?.en || p.name || String(p.id));

      const doc = {
        slug,
        name:                 { en: p.name?.en || "", pl: p.name?.pl || "" },
        description:          { en: p.description?.en || "", pl: p.description?.pl || "" },
        descriptionProductPage: { en: p.descriptionProductPage?.en || "", pl: p.descriptionProductPage?.pl || "" },
        price:                p.price,
        category:             p.category || "other",
        image:                p.image || "",
        images:               p.images || [],
        threeDModelSrc:       p.threeDModelSrc || null,
        isNew:                !!p.isNew,
        isPopular:            !!p.isPopular,
        isPersonalized:       !!p.isPersonalized,
        personalizationType:  p.personalizationType || null,
        phrases: {
          en: p.phrases?.en || [],
          pl: p.phrases?.pl || [],
        },
        specifications:       p.specifications || getDefaultSpecs(p),
        orderExamples:        p.orderExamples || [],
        faq:                  p.faq || [],
        sortOrder:            Number(p.id) || 0,
      };

      const result = await Product.updateOne(
        { slug },
        { $set: doc },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        console.log(`  ➕ Создан: ${slug}`);
        created++;
      } else {
        console.log(`  🔄 Обновлён: ${slug}`);
        updated++;
      }
    }

    console.log(`\n✅ Готово! Создано: ${created}, обновлено: ${updated}`);
  } catch (err) {
    console.error("❌ Ошибка миграции:", err);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();