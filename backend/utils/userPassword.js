const User = require("../models/User");
const { createError } = require("./apiResponse");

/**
 * Change password for an existing user. Validation of body shape
 * is handled by express-validator on the route.
 */
const updateUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw createError(404, "User not found.", "UserNotFound");
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw createError(401, "Current password is incorrect.", { field: "currentPassword" });
  }

  if (currentPassword === newPassword) {
    throw createError(400, "New password must be different from the current one.", { field: "newPassword" });
  }

  user.password = newPassword;
  await user.save();

  return user;
};

module.exports = { updateUserPassword };
