const mongoose = require("mongoose");
const { computeSalePrice } = require("../utils/commerce");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxlength: [80, "Brand cannot exceed 80 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Fruits", "Vegetables", "Dairy", "Bakery", "Beverages", "Grains", "Snacks", "Pantry"],
        message: "{VALUE} is not a valid category",
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    // discount is stored as a percentage integer e.g. 15 means 15%
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },
    // stock replaces the old stockCount — total units available
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    unit: {
      type: String,
      trim: true,
      default: "1 piece",
    },
    farm: {
      type: String,
      trim: true,
      default: "",
    },
    deliveryTime: {
      type: String,
      default: "45 mins",
    },
    tags: {
      type: [String],
      default: [],
    },
    badge: {
      type: String,
      default: null,
    },
    badgeColor: {
      type: String,
      default: null,
    },
    // ratings holds the aggregate average and count
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: (v) => Math.round(v * 10) / 10, // always stored to 1 decimal
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────
//  Virtuals
// ─────────────────────────────────────────────────────────

// Derived selling price after applying discount
productSchema.virtual("salePrice").get(function () {
  return computeSalePrice(this.price, this.discount);
});

// Convenience boolean driven by stock count
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// ─────────────────────────────────────────────────────────
//  Indexes
// ─────────────────────────────────────────────────────────

// Text index enables $text search across name, brand and tags
productSchema.index({ name: "text", brand: "text", tags: "text" });

// Compound index for the most common filtered listing query
productSchema.index({ category: 1, isActive: 1, "ratings.average": -1 });

// Single-field indexes used in sorting and range filters
productSchema.index({ price: 1 });
productSchema.index({ "ratings.average": -1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
