const express = require("express");
const { body, param } = require("express-validator");
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} = require("../controllers/cartController");
const { verifyToken } = require("../middleware/auth");
const validate        = require("../middleware/validate");

const router = express.Router();

// All cart routes require a valid token
router.use(verifyToken);

// ── Validation rules ──────────────────────────────────────
const addItemRules = [
  body("productId")
    .notEmpty().withMessage("productId is required")
    .isMongoId().withMessage("productId must be a valid ID"),
  body("quantity")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("quantity must be an integer between 1 and 50"),
];

const updateItemRules = [
  param("productId").isMongoId().withMessage("productId must be a valid ID"),
  body("quantity")
    .notEmpty().withMessage("quantity is required")
    .isInt({ min: 0, max: 50 })
    .withMessage("quantity must be an integer between 0 and 50"),
];

const productIdParamRule = [
  param("productId").isMongoId().withMessage("productId must be a valid ID"),
];

// ── Routes ────────────────────────────────────────────────
router.get   ("/",                  getCart);
router.post  ("/items",             addItemRules,    validate, addItem);
router.put   ("/items/:productId",  updateItemRules, validate, updateItem);
router.delete("/items/:productId",  productIdParamRule, validate, removeItem);
router.delete("/",                  clearCart);

module.exports = router;
