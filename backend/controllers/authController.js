const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

// ─────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────

/**
 * Sign a JWT for a given user id.
 * Payload contains only the id — minimal surface area.
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Build and send the final JSON response that includes the token.
 * Password is guaranteed not to be in the user object here because
 * mongoose `select: false` keeps it out, but we strip it anyway
 * as a safety net.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Belt-and-suspenders: ensure password never leaks
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.isActive;
  delete userObj.passwordChangedAt;

  return res.status(statusCode).json({
    success: true,
    token,
    data: { user: userObj },
  });
};

// ─────────────────────────────────────────────────────────
//  @route   POST /api/auth/register
//  @desc    Create a new user account and return a JWT
//  @access  Public
// ─────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check for existing account with this email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Create user — password hashing handled in pre-save hook
    const user = await User.create({ name, email, password, phone });

    return sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   POST /api/auth/login
//  @desc    Authenticate user and return a JWT
//  @access  Public
// ─────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // find() does NOT return password by default (select: false)
    // so we must explicitly request it here
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select("+password +isActive +passwordChangedAt");

    // Deliberately vague message — don't reveal which field is wrong
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Account deactivated by admin
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   GET /api/auth/me
//  @desc    Return the currently authenticated user's profile
//  @access  Private (requires verifyToken)
// ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is set by verifyToken middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  @route   POST /api/auth/logout
//  @desc    Logout — client should discard the token
//  @access  Private (requires verifyToken)
// ─────────────────────────────────────────────────────────
const logout = (_req, res) => {
  // JWT is stateless — we cannot truly invalidate it server-side
  // without a token blacklist (out of scope here).
  // The client is responsible for deleting the token from storage.
  return res.status(200).json({
    success: true,
    message: "Logged out successfully. Please delete your token on the client.",
  });
};

// ─────────────────────────────────────────────────────────
//  @route   PUT /api/auth/change-password
//  @desc    Change password for the logged-in user
//  @access  Private (requires verifyToken)
// ─────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both currentPassword and newPassword.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current one.",
      });
    }

    user.password = newPassword; // pre-save hook re-hashes
    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout, changePassword };
