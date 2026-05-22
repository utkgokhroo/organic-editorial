const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { buildCartPayload, listCouponCodes } = require("../utils/commerce");
const { sendSuccess, createError } = require("../utils/apiResponse");
const wrapControllers = require("../utils/wrapControllers");
const {
  buildCartLineFromProduct,
  syncCartWithCatalog,
  assertProductAvailable,
  throwUnlessAvailable,
  PRODUCT_FIELDS,
} = require("../utils/cartSync");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const respondWithCart = async (cart, couponCode = null, extra = {}) => {
  const { cart: syncedCart, warnings } = await syncCartWithCatalog(cart);
  const payload = buildCartPayload(syncedCart.toObject({ virtuals: true }), couponCode);

  return {
    ...payload,
    availableCouponCodes: listCouponCodes(),
    warnings,
    readyForCheckout: payload.items.length > 0,
    ...extra,
  };
};

const requireCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw createError(404, "Cart not found.", "CartNotFound");
  }
  return cart;
};

const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  return sendSuccess(res, 200, { data: { cart: await respondWithCart(cart) } });
};

const addItem = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findOne({ _id: productId, isActive: true }).select(PRODUCT_FIELDS);
  throwUnlessAvailable(assertProductAvailable(product, quantity, productId));

  const cart = await getOrCreateCart(req.user.id);
  const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    throwUnlessAvailable(assertProductAvailable(product, newQty, productId));
    cart.items[existingIndex].quantity = newQty;
    Object.assign(cart.items[existingIndex], buildCartLineFromProduct(product, newQty));
  } else {
    cart.items.push(buildCartLineFromProduct(product, quantity));
  }

  await cart.save();

  return sendSuccess(res, 200, {
    message: `"${product.name}" added to cart.`,
    data: { cart: await respondWithCart(cart) },
  });
};

const updateItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity === null) {
    throw createError(400, "quantity is required.", { field: "quantity" });
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 0) {
    throw createError(400, "quantity must be a non-negative integer.", { field: "quantity" });
  }

  const cart = await requireCart(req.user.id);
  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  if (itemIndex === -1) {
    throw createError(404, "Item not found in cart.", { field: "productId" });
  }

  if (qty === 0) {
    cart.items.splice(itemIndex, 1);
    await cart.save();
    return sendSuccess(res, 200, {
      message: "Item removed from cart.",
      data: { cart: await respondWithCart(cart) },
    });
  }

  const product = await Product.findOne({ _id: productId, isActive: true }).select(PRODUCT_FIELDS);
  throwUnlessAvailable(assertProductAvailable(product, qty, productId));

  Object.assign(cart.items[itemIndex], buildCartLineFromProduct(product, qty));
  await cart.save();

  return sendSuccess(res, 200, {
    message: "Cart updated.",
    data: { cart: await respondWithCart(cart) },
  });
};

const removeItem = async (req, res) => {
  const { productId } = req.params;
  const cart = await requireCart(req.user.id);
  const before = cart.items.length;

  cart.items = cart.items.filter((item) => item.product.toString() !== productId);

  if (cart.items.length === before) {
    throw createError(404, "Item not found in cart.", { field: "productId" });
  }

  await cart.save();

  return sendSuccess(res, 200, {
    message: "Item removed from cart.",
    data: { cart: await respondWithCart(cart) },
  });
};

const clearCart = async (req, res) => {
  const cart = await requireCart(req.user.id);
  cart.items = [];
  await cart.save();

  return sendSuccess(res, 200, {
    message: "Cart cleared.",
    data: { cart: await respondWithCart(cart) },
  });
};

const previewCoupon = async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  const payload = await respondWithCart(cart, req.body.couponCode);

  return sendSuccess(res, 200, {
    message: payload.couponMessage || (payload.couponValid ? "Coupon applied." : "Invalid coupon code."),
    data: { cart: payload },
  });
};

const checkoutPreview = async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  const couponCode = req.body.couponCode || null;
  const payload = await respondWithCart(cart, couponCode);

  if (!payload.readyForCheckout) {
    throw createError(400, "Your cart is empty. Add items before checkout.", "CartEmpty", {
      data: { cart: payload },
    });
  }

  return sendSuccess(res, 200, { data: { cart: payload } });
};

module.exports = wrapControllers({
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  previewCoupon,
  checkoutPreview,
});
