const Product = require("../models/Product");

// ── @route   GET /api/products
// ── @desc    Get all products with filtering, sorting, pagination
// ── @access  Public
const getProducts = async (req, res, next) => {
  try {
    // Business logic to be implemented
    res.status(200).json({ success: true, message: "getProducts — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   GET /api/products/:id
// ── @desc    Get single product by ID
// ── @access  Public
const getProduct = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "getProduct — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   POST /api/products
// ── @desc    Create a new product (admin only)
// ── @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, message: "createProduct — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   PUT /api/products/:id
// ── @desc    Update a product (admin only)
// ── @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "updateProduct — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   DELETE /api/products/:id
// ── @desc    Delete a product (admin only)
// ── @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "deleteProduct — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
