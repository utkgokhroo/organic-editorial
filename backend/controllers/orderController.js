const Order = require("../models/Order");

// ── @route   POST /api/orders
// ── @desc    Create a new order
// ── @access  Private
const createOrder = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, message: "createOrder — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   GET /api/orders/my
// ── @desc    Get logged-in user's orders
// ── @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "getMyOrders — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   GET /api/orders/:id
// ── @desc    Get a single order by ID
// ── @access  Private
const getOrder = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "getOrder — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   GET /api/orders
// ── @desc    Get all orders (admin only)
// ── @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "getAllOrders — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   PUT /api/orders/:id/status
// ── @desc    Update order status (admin only)
// ── @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "updateOrderStatus — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus };
