const express = require("express");
const {
  getProfile,
  updateProfile,
  updatePassword,
  addAddress,
  removeAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// ── All user routes require a valid token ─────────────────
router.use(verifyToken);

// ── Profile ───────────────────────────────────────────────
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", updatePassword);

// ── Addresses ─────────────────────────────────────────────
router.post(  "/addresses",            addAddress);
router.delete("/addresses/:addressId", removeAddress);

// ── Wishlist ──────────────────────────────────────────────
router.get(   "/wishlist",              getWishlist);
router.post(  "/wishlist/:productId",   addToWishlist);
router.delete("/wishlist/:productId",   removeFromWishlist);

module.exports = router;
