const logger = require("../utils/logger");

// ─────────────────────────────────────────────────────────
//  Global error handler
//
//  Express identifies error handlers by their 4-argument
//  signature (err, req, res, next). All errors passed via
//  next(error) in any controller land here.
//
//  Normalises every error into the standard response shape:
//    { success: false, message: string }
//  with an optional `errors` array for validation failures.
// ─────────────────────────────────────────────────────────
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || "Internal server error";
  let errors     = null;

  // ── Mongoose: invalid ObjectId ──────────────────────────
  if (err.name === "CastError") {
    statusCode = 404;
    message    = `Resource not found. Invalid ID: ${err.value}`;
  }

  // ── Mongoose: duplicate key (unique index violation) ────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" is already registered.`;
  }

  // ── Mongoose: schema validation failure ─────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors  = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    message = "Validation failed";
  }

  // ── JWT: bad token ───────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message    = "Invalid token. Please log in again.";
  }

  // ── JWT: expired token ───────────────────────────────────
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message    = "Token expired. Please log in again.";
  }

  // ── Log the error (full stack in dev, message only in prod) ──
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode}`, {
      message:  err.message,
      stack:    err.stack,
      body:     req.body,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);
  }

  // ── Build response ───────────────────────────────────────
  const response = { success: false, message };

  if (errors) response.errors = errors;

  // Expose stack trace only in development
  if (process.env.NODE_ENV === "development" && statusCode >= 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

// ─────────────────────────────────────────────────────────
//  404 handler — catches any request that matched no route
// ─────────────────────────────────────────────────────────
const notFound = (req, res) => {
  logger.warn(`404 — Route not found: ${req.method} ${req.originalUrl}`);
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
