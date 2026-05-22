const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { updateUserPassword } = require("../utils/userPassword");
const { sendSuccess, createError } = require("../utils/apiResponse");
const wrapControllers = require("../utils/wrapControllers");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.isActive;
  delete userObj.passwordChangedAt;

  return sendSuccess(res, statusCode, { token, data: { user: userObj } });
};

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw createError(409, "An account with this email already exists. Please log in.", { field: "email" });
  }

  const user = await User.create({ name, email, password, phone });
  return sendTokenResponse(user, 201, res);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select("+password +isActive +passwordChangedAt");

  if (!user || !(await user.comparePassword(password))) {
    throw createError(401, "Invalid email or password.", "InvalidCredentials");
  }

  if (!user.isActive) {
    throw createError(403, "Your account has been deactivated. Please contact support.", "AccountDeactivated");
  }

  return sendTokenResponse(user, 200, res);
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw createError(404, "User not found.", "UserNotFound");
  }

  return sendSuccess(res, 200, { data: { user } });
};

const logout = async (_req, res) =>
  sendSuccess(res, 200, {
    message: "Logged out successfully. Please delete your token on the client.",
  });

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await updateUserPassword(req.user.id, { currentPassword, newPassword });
  return sendTokenResponse(user, 200, res);
};

module.exports = wrapControllers({
  register,
  login,
  getMe,
  logout,
  changePassword,
});
