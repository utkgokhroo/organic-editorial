const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { computePricing } = require("../utils/commerce");
const { sendSuccess, createError, buildPagination } = require("../utils/apiResponse");
const wrapControllers = require("../utils/wrapControllers");
const { syncCartWithCatalog, decrementProductStock } = require("../utils/cartSync");

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { deliveryAddress, paymentMethod, deliveryType = "scheduled", deliverySlot, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).session(session);

    if (!cart || cart.items.length === 0) {
      throw createError(400, "Your cart is empty. Add items before placing an order.", "CartEmpty");
    }

    const { warnings } = await syncCartWithCatalog(cart, { session });

    if (!cart.items.length) {
      throw createError(
        400,
        warnings[0] || "Your cart is empty. Add items before placing an order.",
        "CartEmpty"
      );
    }

    const orderItems = cart.items.map((cartItem) => ({
      product: cartItem.product,
      name: cartItem.name,
      brand: cartItem.brand,
      unit: cartItem.unit,
      image: cartItem.image,
      price: cartItem.price,
      quantity: cartItem.quantity,
    }));

    const {
      subtotal,
      gst,
      deliveryFee,
      discount,
      couponCode: appliedCouponCode,
      grandTotal: total,
    } = computePricing(orderItems, couponCode);

    const [order] = await Order.create(
      [
        {
          user: req.user.id,
          items: orderItems,
          deliveryAddress,
          paymentMethod,
          deliveryType,
          deliverySlot: deliverySlot || null,
          subtotal,
          gst,
          deliveryFee,
          discount,
          couponCode: appliedCouponCode,
          total,
          status: "placed",
        },
      ],
      { session }
    );

    for (const item of orderItems) {
      const updated = await decrementProductStock(item.product, item.quantity, session);

      if (!updated) {
        throw createError(
          400,
          `Only limited stock remains for "${item.name}". Please refresh your cart and try again.`,
          "InsufficientStock"
        );
      }
    }

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    return sendSuccess(res, 201, {
      message: "Order placed successfully.",
      data: { order },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-statusHistory"),
    Order.countDocuments({ user: req.user.id }),
  ]);

  return sendSuccess(res, 200, {
    total,
    pagination: buildPagination(page, limit, total),
    data: { orders },
  });
};

const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product", "name image brand");

  if (!order) {
    throw createError(404, "Order not found.", "OrderNotFound");
  }

  const isOwner = order.user.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw createError(403, "Forbidden. You do not have access to this order.", "OrderForbidden");
  }

  return sendSuccess(res, 200, { data: { order } });
};

const getAllOrders = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
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

  return sendSuccess(res, 200, {
    total,
    pagination: buildPagination(page, limit, total),
    data: { orders },
  });
};

const updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    throw createError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}.`, {
      field: "status",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw createError(404, "Order not found.", "OrderNotFound");
  }

  const flow = ["placed", "confirmed", "processing", "shipped", "delivered"];
  const currentIdx = flow.indexOf(order.status);
  const newIdx = flow.indexOf(status);

  if (status !== "cancelled" && order.status !== "cancelled" && newIdx < currentIdx) {
    throw createError(
      400,
      `Cannot move order from "${order.status}" back to "${status}".`,
      "InvalidStatusTransition"
    );
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || "", timestamp: new Date() });

  if (status === "delivered") {
    order.deliveredAt = new Date();
    order.paymentStatus = "paid";
  }

  await order.save();

  return sendSuccess(res, 200, {
    message: `Order status updated to "${status}".`,
    data: { order },
  });
};

module.exports = wrapControllers({
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
});
