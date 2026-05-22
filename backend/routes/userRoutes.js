const express = require("express");
const { body } = require("express-validator");
const {
  getProfile,
  updateProfile,
  addAddress,
  removeAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/userController");
const { changePassword } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { changePasswordRules } = require("../validators/passwordValidators");
const { mongoIdParam } = require("../validators/commonValidators");

const router = express.Router();

// ── All user routes require a valid token ─────────────────
router.use(verifyToken);

const profileRules = [
  body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be between 2 and 80 characters"),
  body("email").optional().trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  body("phone").optional().trim().matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian mobile number"),
];

const addressRules = [
  body("type").optional().isIn(["Home", "Office", "Other"]).withMessage("Invalid address type"),
  body("fullName").optional().trim().isLength({ max: 80 }).withMessage("Full name cannot exceed 80 characters"),
  body("phone").optional({ checkFalsy: true }).trim().matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian mobile number"),
  body("line1").trim().notEmpty().withMessage("Address line 1 is required"),
  body("line2").optional().trim().isLength({ max: 120 }).withMessage("Address line 2 cannot exceed 120 characters"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").trim().notEmpty().withMessage("State is required"),
  body("pincode").trim().isLength({ min: 6, max: 6 }).withMessage("Pincode must be 6 digits").isNumeric().withMessage("Pincode must be numeric"),
  body("isDefault").optional().isBoolean().withMessage("isDefault must be boolean"),
];

const addressIdRules = mongoIdParam("addressId", "Address id");
const productIdRules = mongoIdParam("productId", "Product id");

// ── Profile ───────────────────────────────────────────────
router.get("/profile", getProfile);
router.put("/profile", profileRules, validate, updateProfile);
// Deprecated path — same handler as PUT /api/auth/change-password
router.put("/password", changePasswordRules, validate, changePassword);

// ── Addresses ─────────────────────────────────────────────
router.post(  "/addresses",            addressRules, validate, addAddress);
router.delete("/addresses/:addressId", addressIdRules, validate, removeAddress);

// ── Wishlist ──────────────────────────────────────────────
router.get(   "/wishlist",              getWishlist);
router.post(  "/wishlist/:productId",   productIdRules, validate, addToWishlist);
router.delete("/wishlist/:productId",   productIdRules, validate, removeFromWishlist);

module.exports = router;