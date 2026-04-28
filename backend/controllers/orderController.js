const mongoose = require("mongoose");
const Order   = require("../models/Order");
const Cart    = require("../models/Cart");
const Product = require("../models/Product");

// ─────────────────────────────────────────────────────────
//  Pricing constants — single source of truth
// ─────────────────────────────────────────────────────────
const GST_RATE            = 0.05;
const DELIVERY_FEE        = 49;
const FREE_DELIVERY_ABOVE = 499;

// ─────────────────────────────────────────────────────────
//  Helper — calculate all price components from an items array
//  Items: [{ price, quantity }]
// ─────────────────────────────────────────────────────────
const calculatePricing = (items) => {
  const subtotal    = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gst         = Math.round(subtotal * GST_RATE);
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total       = subtotal + gst + deliveryFee;
  return { subtotal, gst, deliveryFee, total };
};

// ─────────────────────────────────────────────────────────
//  @route   POST /api/orders
//  @desc    Place an order from the user's current cart.
//           All price calculation happens here — never trusted from client.
//           Uses a Mongoose session for atomic stock decrement + order create.
//  @access  Private
//
//  Body: { deliveryAddress, paymentMethod, deliveryType?, deliverySlot? }
// ─────────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { deliveryAddress, paymentMethod, deliveryType = "scheduled", deliverySlot } = req.body;

    // ── 1. Load the user's cart ───────────────────────────
    const cart = await Cart.findOne({ user: req.user.id }).session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add items before placing an order.",
      });
    }

    // ── 2. Validate stock and build order items ────────────
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = await Product
        .findById(cartItem.product)
        .select("name image price discount stock isActive")
        .session(session);

      if (!product || !product.isActive) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `"${cartItem.name}" is no longer available. Please remove it from your cart.`,
        });
      }

      if (product.stock < cartItem.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) of "${product.name}" are left in stock. Please update your cart.`,
        });
      }

      // Recalculate price from DB — ignore whatever the cart stored
      const unitPrice = product.discount
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

      orderItems.push({
        product:  product._id,
        name:     product.name,
        image:    product.image,
        price:    unitPrice,
        quantity: cartItem.quantity,
      });
    }

    // ── 3. Calculate totals on the backend ────────────────
    const { subtotal, gst, deliveryFee, total } = calculatePricing(orderItems);

    // ── 4. Create the order document ─────────────────────
    const [order] = await Order.create(
      [
        {
          user:            req.user.id,
          items:           orderItems,
          deliveryAddress,
          paymentMethod,
          deliveryType,
          deliverySlot:    deliverySlot || null,
          subtotal,
          gst,
          deliveryFee,
          total,
          status:          "placed",
        },
      ],
      { session }
    );

    // ── 5. Decrement stock for each product atomically ────
    const stockUpdates = orderItems.map((item) =>
      Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { session }
      )
    );
    await Promise.all(stockUpdates);

    // ── 6. Clear the cart ─────────────────────────────────
    cart.items = [];
    await cart.save({ session });

    // ── 7. Commit the transaction ─────────────────────────
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: { order },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────
//  @route   GET /api/orders/my
//  @desc    Get the logged-in user's orders, newest first.
//           Supports ?page and ?limit for pagination.
//  @access  Private
// ─────────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip  = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-statusHistory"),   // keep response lean
      Order.countDocuments({ user: req.user.id }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   GET /api/orders/:id
//  @desc    Get a single order. Users can only access their own.
//           Admins can access any order.
//  @access  Private
// ─────────────────────────────────────────────────────────
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name image brand");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Non-admin users cannot view other users' orders
    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have access to this order.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   GET /api/orders
//  @desc    Admin: get all orders with optional status filter
//           and pagination.
//  @access  Private — Admin only
// ─────────────────────────────────────────────────────────
const getAllOrders = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip   = (page - 1) * limit;
    const filter = {};

    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email phone"),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   PUT /api/orders/:id/status
//  @desc    Admin: update order status and append to history.
//  @access  Private — Admin only
//
//  Body: { status: string, note?: string }
// ─────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Prevent backwards status movement (except cancellation)
    const flow = ["placed", "confirmed", "processing", "shipped", "delivered"];
    const currentIdx = flow.indexOf(order.status);
    const newIdx     = flow.indexOf(status);

    if (
      status !== "cancelled" &&
      order.status !== "cancelled" &&
      newIdx < currentIdx
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from "${order.status}" back to "${status}".`,
      });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || "", timestamp: new Date() });

    if (status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "paid";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
