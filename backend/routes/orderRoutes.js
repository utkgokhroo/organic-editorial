const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  mongoIdParam,
  paginationQuery,
  optionalCouponCode,
  indianPhone,
} = require("../validators/commonValidators");

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// ── Validation rules ──────────────────────────────────────
const createOrderRules = [
  body("deliveryAddress.fullName")
    .trim().notEmpty().withMessage("Delivery name is required"),
  indianPhone("deliveryAddress.phone"),
  body("deliveryAddress.line1")
    .trim().notEmpty().withMessage("Address line 1 is required"),
  body("deliveryAddress.city")
    .trim().notEmpty().withMessage("City is required"),
  body("deliveryAddress.state")
    .trim().notEmpty().withMessage("State is required"),
  body("deliveryAddress.pincode")
    .trim().notEmpty().withMessage("Pincode is required")
    .isLength({ min: 6, max: 6 }).withMessage("Pincode must be 6 digits")
    .isNumeric().withMessage("Pincode must be numeric"),
  body("paymentMethod")
    .notEmpty().withMessage("Payment method is required")
    .isIn(["upi", "card", "netbanking", "cod"])
    .withMessage("Invalid payment method"),
  body("deliveryType")
    .optional()
    .isIn(["express", "scheduled"])
    .withMessage("deliveryType must be express or scheduled"),
  body("deliverySlot")
    .optional()
    .isLength({ max: 80 })
    .withMessage("deliverySlot cannot exceed 80 characters"),
  ...optionalCouponCode,
];

const updateStatusRules = [
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status value"),
  body("note")
    .optional()
    .isLength({ max: 300 }).withMessage("Note cannot exceed 300 characters"),
];

const orderIdParamRules = mongoIdParam("id", "Order id");

const paginationRules = [
  ...paginationQuery({ maxLimit: 100, defaultLimit: 10 }),
  query("status").optional().isIn(["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid status value"),
];

// ── User routes ───────────────────────────────────────────
// NOTE: /my must come before /:id so Express doesn't treat "my" as an id
router.post("/",    createOrderRules, validate, createOrder);
router.get( "/my",  paginationRules, validate, getMyOrders);
router.get( "/:id", orderIdParamRules, validate, getOrder);

// ── Admin only ────────────────────────────────────────────
router.get("/"          , isAdmin, paginationRules, validate, getAllOrders);
router.put("/:id/status", isAdmin, orderIdParamRules, updateStatusRules, validate, updateOrderStatus);

module.exports = router;
