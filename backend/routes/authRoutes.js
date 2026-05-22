const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  changePassword,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { changePasswordRules } = require("../validators/passwordValidators");
const { registerRules, loginRules } = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

router.get("/me", verifyToken, getMe);
router.post("/logout", verifyToken, logout);
router.put("/change-password", verifyToken, changePasswordRules, validate, changePassword);

module.exports = router;
