const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const { sendFailure } = require("../utils/apiResponse");

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
      return sendFailure(res, 401, "Unauthorized. No token provided.", "TokenMissing");
    }

    // ── 2. Verify signature and expiry ──────────────────
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return sendFailure(res, 401, "Unauthorized. Token has expired. Please log in again.", "TokenExpired");
      }
      return sendFailure(res, 401, "Unauthorized. Invalid token.", "TokenInvalid");
    }

    // ── 3. Confirm user still exists in DB ──────────────
    const user = await User.findById(decoded.id).select("+isActive +passwordChangedAt");

    if (!user) {
      return sendFailure(res, 401, "Unauthorized. The account for this token no longer exists.", "UserNotFound");
    }

    if (!user.isActive) {
      return sendFailure(res, 403, "Forbidden. Your account has been deactivated.", "AccountDeactivated");
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return sendFailure(res, 401, "Unauthorized. Password was changed recently. Please log in again.", "PasswordChanged");
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
    return sendFailure(res, 401, "Unauthorized. Please log in first.", "AuthRequired");
  }

  if (req.user.role !== "admin") {
    return sendFailure(res, 403, "Forbidden. Admin access required.", "AdminRequired");
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
      return sendFailure(
        res,
        403,
        `Forbidden. This action requires one of the following roles: ${roles.join(", ")}.`,
        "RoleForbidden"
      );
    }
    next();
  };
};

module.exports = { verifyToken, isAdmin, restrictTo };
