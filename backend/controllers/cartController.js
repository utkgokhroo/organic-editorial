const Cart    = require("../models/Cart");
const Product = require("../models/Product");

// ─────────────────────────────────────────────────────────
//  Helper — fetch the cart (with virtuals) or create empty
// ─────────────────────────────────────────────────────────
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// ─────────────────────────────────────────────────────────
//  Helper — build a safe response object that includes
//  computed virtuals (toObject triggers virtual getters)
// ─────────────────────────────────────────────────────────
const cartResponse = (cart) => {
  const obj = cart.toObject({ virtuals: true });
  return {
    _id:         obj._id,
    items:       obj.items,
    itemCount:   obj.itemCount,
    subtotal:    obj.subtotal,
    gst:         obj.gst,
    deliveryFee: obj.deliveryFee,
    total:       obj.total,
    updatedAt:   obj.updatedAt,
  };
};

// ─────────────────────────────────────────────────────────
//  @route   GET /api/cart
//  @desc    Get the current user's cart with full price breakdown
//  @access  Private
// ─────────────────────────────────────────────────────────
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    return res.status(200).json({
      success: true,
      data: { cart: cartResponse(cart) },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   POST /api/cart/items
//  @desc    Add an item to cart, or increment quantity if exists.
//           Price is fetched from DB — never trusted from client.
//  @access  Private
//
//  Body: { productId: string, quantity: number }
// ─────────────────────────────────────────────────────────
const addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // ── Validate product exists and is available ──────────
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unavailable.",
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: `"${product.name}" is out of stock.`,
      });
    }

    const cart = await getOrCreateCart(req.user.id);

    // Check if this product is already in the cart
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      // ── Item already in cart — increment quantity ─────────
      const newQty = cart.items[existingIndex].quantity + quantity;

      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) of "${product.name}" available.`,
        });
      }

      cart.items[existingIndex].quantity = newQty;
    } else {
      // ── New item — push with snapshotted price ─────────────
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) of "${product.name}" available.`,
        });
      }

      // Use salePrice (price after discount) as the cart price
      const cartPrice = product.discount
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

      cart.items.push({
        product:  product._id,
        name:     product.name,
        image:    product.image,
        price:    cartPrice,
        quantity,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: `"${product.name}" added to cart.`,
      data: { cart: cartResponse(cart) },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   PUT /api/cart/items/:productId
//  @desc    Set exact quantity for a cart item.
//           quantity: 0  → removes the item entirely.
//  @access  Private
//
//  Body: { quantity: number }
// ─────────────────────────────────────────────────────────
const updateItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity }  = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        message: "quantity is required.",
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a non-negative integer.",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart.",
      });
    }

    if (qty === 0) {
      // Remove the item
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(200).json({
        success: true,
        message: "Item removed from cart.",
        data: { cart: cartResponse(cart) },
      });
    }

    // Validate against current stock
    const product = await Product.findById(productId).select("stock name");
    if (product && qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) of "${product.name}" available.`,
      });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated.",
      data: { cart: cartResponse(cart) },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   DELETE /api/cart/items/:productId
//  @desc    Remove a single item from the cart
//  @access  Private
// ─────────────────────────────────────────────────────────
const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === before) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart.",
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart.",
      data: { cart: cartResponse(cart) },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   DELETE /api/cart
//  @desc    Clear all items from the cart
//  @access  Private
// ─────────────────────────────────────────────────────────
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared.",
      data: { cart: cartResponse(cart) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
