const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      en: { type: String, required: true },
      pl: { type: String, required: true },
    },
    // 'grid' = standard grid, 'carousel' = horizontal scroll
    layout: {
      type: String,
      enum: ["grid", "carousel"],
      default: "grid",
    },
    // How many columns on desktop (2-6)
    columns: {
      type: Number,
      min: 2,
      max: 6,
      default: 4,
    },
    mobileColumns: { type: Number, default: 2 },
    // Max products to show (0 = show all)
    showCount: {
      type: Number,
      default: 0,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ sortOrder: 1 });

module.exports = mongoose.model("Category", categorySchema);