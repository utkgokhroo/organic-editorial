const mongoose = require("mongoose");

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
//  Virtuals — all price calculations on the backend
// ─────────────────────────────────────────────────────────

const GST_RATE             = 0.05;  // 5%
const DELIVERY_FEE         = 49;
const FREE_DELIVERY_ABOVE  = 499;

cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

cartSchema.virtual("gst").get(function () {
  return Math.round(this.subtotal * GST_RATE);
});

cartSchema.virtual("deliveryFee").get(function () {
  return this.subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
});

cartSchema.virtual("total").get(function () {
  return this.subtotal + this.gst + this.deliveryFee;
});

cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ─────────────────────────────────────────────────────────
//  Index
// ─────────────────────────────────────────────────────────
cartSchema.index({ user: 1 });

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
