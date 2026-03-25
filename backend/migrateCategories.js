/**
 * Run once to seed initial categories into MongoDB:
 *   node backend/migrateCategories.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/category");

const INITIAL_CATEGORIES = [
  {
    slug: "figurines",
    name: { en: "Figurines", pl: "Figurki" },
    layout: "grid",
    columns: 4,
    showCount: 0,
    sortOrder: 0,
    isVisible: true,
  },
  {
    slug: "maps",
    name: { en: "Interior Maps", pl: "Mapy Wnętrz" },
    layout: "grid",
    columns: 3,
    showCount: 0,
    sortOrder: 1,
    isVisible: true,
  },
  {
    slug: "puzzles",
    name: { en: "Puzzles", pl: "Puzzle" },
    layout: "carousel",
    columns: 4,
    showCount: 0,
    sortOrder: 2,
    isVisible: true,
  },
  {
    slug: "gifts",
    name: { en: "Gifts", pl: "Prezenty" },
    layout: "grid",
    columns: 4,
    showCount: 8,
    sortOrder: 3,
    isVisible: true,
  },
];

async function run() {
  await mongoose.connect(process.env.DB_URI);
  console.log("✅ Connected to MongoDB");

  for (const cat of INITIAL_CATEGORIES) {
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
    console.log(`  ↳ Upserted: ${cat.slug}`);
  }

  console.log("✅ Done");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});