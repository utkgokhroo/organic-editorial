const express = require("express");
const { body, query } = require("express-validator");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// ─────────────────────────────────────────────────────────
//  Validation rule sets
// ─────────────────────────────────────────────────────────

const createRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required")
    .isLength({ max: 150 }).withMessage("Name cannot exceed 150 characters"),

  body("brand")
    .trim()
    .notEmpty().withMessage("Brand is required"),

  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(["Fruits", "Vegetables", "Dairy", "Bakery", "Beverages", "Grains", "Snacks", "Pantry"])
    .withMessage("Invalid category"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Discount must be between 0 and 100"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

  body("image")
    .trim()
    .notEmpty().withMessage("Product image is required"),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

const updateRules = [
  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Discount must be between 0 and 100"),

  body("stock")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("category")
    .optional()
    .isIn(["Fruits", "Vegetables", "Dairy", "Bakery", "Beverages", "Grains", "Snacks", "Pantry"])
    .withMessage("Invalid category"),
];

// ─────────────────────────────────────────────────────────
//  Public routes
// ─────────────────────────────────────────────────────────
router.get("/",    getProducts);
router.get("/:id", getProduct);

// ─────────────────────────────────────────────────────────
//  Admin-only routes
// ─────────────────────────────────────────────────────────
router.post(  "/",    verifyToken, isAdmin, createRules, validate, createProduct);
router.put(   "/:id", verifyToken, isAdmin, updateRules, validate, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
