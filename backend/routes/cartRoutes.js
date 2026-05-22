const express = require("express");
const { body } = require("express-validator");
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  previewCoupon,
  checkoutPreview,
} = require("../controllers/cartController");
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  mongoIdParam,
  optionalCouponCode,
  requiredCouponCode,
} = require("../validators/commonValidators");

const router = express.Router();

router.use(verifyToken);

const addItemRules = [
  body("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("productId must be a valid ID"),
  body("quantity")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("quantity must be an integer between 1 and 50"),
];

const updateItemRules = [
  ...mongoIdParam("productId"),
  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ min: 0, max: 50 })
    .withMessage("quantity must be an integer between 0 and 50"),
];

router.get("/", getCart);
router.post("/checkout-preview", optionalCouponCode, validate, checkoutPreview);
router.post("/coupon", requiredCouponCode, validate, previewCoupon);
router.post("/items", addItemRules, validate, addItem);
router.put("/items/:productId", updateItemRules, validate, updateItem);
router.delete("/items/:productId", mongoIdParam("productId"), validate, removeItem);
router.delete("/", clearCart);

module.exports = router;
