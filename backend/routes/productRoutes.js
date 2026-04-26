const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// ── Public ────────────────────────────────────────────────
router.get("/",    getProducts);
router.get("/:id", getProduct);

// ── Admin only ────────────────────────────────────────────
router.post(  "/",    verifyToken, isAdmin, createProduct);
router.put(   "/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
