const express = require("express");
const { body }  = require("express-validator");

const {
  register,
  login,
  getMe,
  logout,
  changePassword,
} = require("../controllers/authController");

const { verifyToken }  = require("../middleware/auth");
const validate         = require("../middleware/validate");

const router = express.Router();

// ─────────────────────────────────────────────────────────
//  Validation rule sets
// ─────────────────────────────────────────────────────────

const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit Indian mobile number (starts with 6–9)"),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const changePasswordRules = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("New password must contain at least one number"),
];

// ─────────────────────────────────────────────────────────
//  Public routes  (no token required)
// ─────────────────────────────────────────────────────────
router.post("/register", registerRules, validate, register);
router.post("/login",    loginRules,    validate, login);

// ─────────────────────────────────────────────────────────
//  Protected routes  (valid JWT required)
// ─────────────────────────────────────────────────────────
router.get ("/me",              verifyToken, getMe);
router.post("/logout",          verifyToken, logout);
router.put ("/change-password", verifyToken, changePasswordRules, validate, changePassword);

module.exports = router;
