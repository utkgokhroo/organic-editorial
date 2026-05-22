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
const { mongoIdParam, paginationQuery } = require("../validators/commonValidators");

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

const listRules = [
  ...paginationQuery({ maxLimit: 100, defaultLimit: 12 }),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be a positive number"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be a positive number"),
  query("minRating").optional().isFloat({ min: 0, max: 5 }).withMessage("minRating must be between 0 and 5"),
  query("rating").optional().isFloat({ min: 0, max: 5 }).withMessage("rating must be between 0 and 5"),
  query("inStock").optional().isBoolean().withMessage("inStock must be true or false"),
  query("sort")
    .optional()
    .isIn(["featured", "price_asc", "price_desc", "rating", "discount", "name_asc", "newest"])
    .withMessage("Invalid sort option"),
  query("search").optional().isLength({ max: 80 }).withMessage("search cannot exceed 80 characters"),
];

const productIdRules = mongoIdParam("id", "Product id");

// ─────────────────────────────────────────────────────────
//  Public routes
// ─────────────────────────────────────────────────────────
router.get("/",    listRules, validate, getProducts);
router.get("/:id", productIdRules, validate, getProduct);

// ─────────────────────────────────────────────────────────
//  Admin-only routes
// ─────────────────────────────────────────────────────────
router.post(  "/",    verifyToken, isAdmin, createRules, validate, createProduct);
router.put(   "/:id", verifyToken, isAdmin, productIdRules, updateRules, validate, updateProduct);
router.delete("/:id", verifyToken, isAdmin, productIdRules, validate, deleteProduct);

module.exports = router;