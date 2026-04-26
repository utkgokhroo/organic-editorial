const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// ── All order routes require a valid token ────────────────
router.use(verifyToken);

// ── User routes ───────────────────────────────────────────
router.post("/",    createOrder);
router.get( "/my",  getMyOrders);
router.get( "/:id", getOrder);

// ── Admin only ────────────────────────────────────────────
router.get("/"           , isAdmin, getAllOrders);
router.put("/:id/status" , isAdmin, updateOrderStatus);

module.exports = router;
