const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const rateLimit = require("express-rate-limit");
const dotenv   = require("dotenv");

// ── Load env first — nothing else runs without it ─────────
dotenv.config();

const connectDB      = require("./config/db");
const logger         = require("./utils/logger");
const sanitize       = require("./middleware/sanitize");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes    = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes    = require("./routes/cartRoutes");
const orderRoutes   = require("./routes/orderRoutes");
const userRoutes    = require("./routes/userRoutes");

// ── Connect to MongoDB ────────────────────────────────────
connectDB();

const app = express();

// ─────────────────────────────────────────────────────────
//  Security middleware
// ─────────────────────────────────────────────────────────

// Sets secure HTTP headers (X-Frame-Options, CSP, etc.)
app.use(helmet());

// CORS — only allow the frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─────────────────────────────────────────────────────────
//  Body parsing
// ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─────────────────────────────────────────────────────────
//  Input sanitization — runs before every route handler
//  Strips $ keys (NoSQL injection) and trims strings
// ─────────────────────────────────────────────────────────
app.use(sanitize);

// ─────────────────────────────────────────────────────────
//  Logging
//  morgan for dev (colourful, concise)
//  logger.httpMiddleware writes structured JSON to daily files
// ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(logger.httpMiddleware);

// ─────────────────────────────────────────────────────────
//  Rate limiting
//
//  General limiter: 100 requests / 15 min per IP
//  Auth limiter: 10 requests / 15 min per IP (stricter)
// ─────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX, 10)        || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

app.use("/api", generalLimiter);
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// ─────────────────────────────────────────────────────────
//  Health check — not behind rate limiter
// ─────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success:     true,
    message:     "The Organic Editorial API is running",
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────
//  API Routes
// ─────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/users",    userRoutes);

// ─────────────────────────────────────────────────────────
//  404 + Global error handler — must be last
// ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────
//  Start server
// ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// ─────────────────────────────────────────────────────────
//  Process-level error guards — prevent silent crashes
// ─────────────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection", { message: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { message: err.message, stack: err.stack });
  process.exit(1);
});

module.exports = app;
