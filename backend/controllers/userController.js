const User = require("../models/User");

// ── @route   GET /api/users/profile
// ── @desc    Get current user's profile
// ── @access  Private
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "getProfile — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   PUT /api/users/profile
// ── @desc    Update current user's profile
// ── @access  Private
const updateProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "updateProfile — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   PUT /api/users/password
// ── @desc    Update password
// ── @access  Private
const updatePassword = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "updatePassword — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   POST /api/users/addresses
// ── @desc    Add a delivery address
// ── @access  Private
const addAddress = async (req, res, next) => {
  try {
    res.status(201).json({ success: true, message: "addAddress — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   DELETE /api/users/addresses/:addressId
// ── @desc    Remove a delivery address
// ── @access  Private
const removeAddress = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "removeAddress — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   GET /api/users/wishlist
// ── @desc    Get user's wishlist
// ── @access  Private
const getWishlist = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "getWishlist — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   POST /api/users/wishlist/:productId
// ── @desc    Add product to wishlist
// ── @access  Private
const addToWishlist = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "addToWishlist — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

// ── @route   DELETE /api/users/wishlist/:productId
// ── @desc    Remove product from wishlist
// ── @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: "removeFromWishlist — not yet implemented" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  addAddress,
  removeAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
