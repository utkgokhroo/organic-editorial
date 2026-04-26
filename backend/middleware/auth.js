const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────
//  verifyToken
//  Validates the Bearer JWT from the Authorization header.
//  On success, attaches the full user document to req.user
//  and calls next(). On failure, returns a clean 401.
// ─────────────────────────────────────────────────────────
const verifyToken = async (req, res, next) => {
  try {
    // ── 1. Extract token ────────────────────────────────
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No token provided.",
      });
    }

    // ── 2. Verify signature and expiry ──────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Token has expired. Please log in again.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Invalid token.",
      });
    }

    // ── 3. Confirm user still exists in DB ──────────────
    const user = await User.findById(decoded.id).select("+isActive +passwordChangedAt");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. The account for this token no longer exists.",
      });
    }

    // ── 4. Confirm account is still active ──────────────
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Your account has been deactivated.",
      });
    }

    // ── 5. Confirm password hasn't changed since token was issued ──
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Password was changed recently. Please log in again.",
      });
    }

    // ── 6. Attach user to request and continue ──────────
    req.user = user;
    next();
  } catch (error) {
    // Catch unexpected errors (DB down, etc.) and pass to global handler
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
//  isAdmin
//  Must be used AFTER verifyToken so req.user is available.
//  Returns 403 Forbidden if the user's role is not "admin".
// ─────────────────────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (!req.user) {
    // Guard against accidental use without verifyToken
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in first.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Admin access required.",
    });
  }

  next();
};

// ─────────────────────────────────────────────────────────
//  restrictTo  (optional — accepts any list of roles)
//  Usage: router.delete("/", verifyToken, restrictTo("admin"), handler)
// ─────────────────────────────────────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${roles.join(", ")}.`,
      });
    }
    next();
  };
};

module.exports = { verifyToken, isAdmin, restrictTo };
