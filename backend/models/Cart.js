const mongoose = require("mongoose");
const {
  computeSubtotal,
  computeGst,
  computeDeliveryFee,
  computeItemCount,
} = require("../utils/commerce");

// ─────────────────────────────────────────────────────────
//  Cart item sub-document
//  Price is snapshotted from the product at the moment the
//  item is added so the cart total stays accurate even if
//  the admin updates the product price mid-session.
// ─────────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    name: { type: String, required: true },
    brand: { type: String, default: "" },
    unit: { type: String, default: "" },
    image: { type: String, required: true },
    price: {
      type: Number,
      required: true,
      min: [0, "Item price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [50, "Cannot add more than 50 of a single item"],
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart document per user
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────
//  Virtuals — delegate to commerce.js
// ─────────────────────────────────────────────────────────

cartSchema.virtual("subtotal").get(function () {
  return computeSubtotal(this.items);
});

cartSchema.virtual("gst").get(function () {
  return computeGst(this.subtotal);
});

cartSchema.virtual("deliveryFee").get(function () {
  return computeDeliveryFee(this.subtotal);
});

cartSchema.virtual("total").get(function () {
  return this.subtotal + this.gst + this.deliveryFee;
});

cartSchema.virtual("itemCount").get(function () {
  return computeItemCount(this.items);
});

// Note: the unique:true constraint on `user` above already creates a unique index;
// no need to call cartSchema.index({ user: 1 }) separately.

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
