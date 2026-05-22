const logger = require("../utils/logger");
const { formatErrorBody } = require("../utils/apiResponse");

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let error = err.error ?? null;
  const extras = {};

  if (err.data !== undefined) extras.data = err.data;

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource id.";
    error = { field: err.path, value: err.value };
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" is already registered.`;
    error = { field, value };
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    error = Object.values(err.errors).map((entry) => ({
      field: entry.path,
      message: entry.message,
    }));
    message = "Validation failed";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
    error = "TokenInvalid";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again.";
    error = "TokenExpired";
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${statusCode}`, {
      message: err.message,
      stack: err.stack,
      body: req.body,
    });
    extras.stack = err.stack;
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);
  }

  return res
    .status(statusCode)
    .json(formatErrorBody(statusCode, message, error, extras));
};

const notFound = (req, res) => {
  logger.warn(`404 — Route not found: ${req.method} ${req.originalUrl}`);
  return res.status(404).json(
    formatErrorBody(404, `Route not found: ${req.method} ${req.originalUrl}`, "RouteNotFound")
  );
};

module.exports = { errorHandler, notFound };
