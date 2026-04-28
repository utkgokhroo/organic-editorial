const fs   = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────
//  Ensure logs directory exists
// ─────────────────────────────────────────────────────────
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────
//  Log levels with colour codes for console output
// ─────────────────────────────────────────────────────────
const LEVELS = {
  INFO:  { label: "INFO",  colour: "\x1b[36m" },  // cyan
  WARN:  { label: "WARN",  colour: "\x1b[33m" },  // yellow
  ERROR: { label: "ERROR", colour: "\x1b[31m" },  // red
  DEBUG: { label: "DEBUG", colour: "\x1b[35m" },  // magenta
};

const RESET = "\x1b[0m";

// ─────────────────────────────────────────────────────────
//  Core write function
//  Writes to console (always) and appends to a daily log
//  file (in non-test environments).
// ─────────────────────────────────────────────────────────
const write = (level, message, meta = null) => {
  const now       = new Date();
  const timestamp = now.toISOString();
  const { label, colour } = LEVELS[level];

  // ── Console output ────────────────────────────────────
  const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : "";
  console.log(`${colour}[${label}]${RESET} ${timestamp} — ${message}${metaStr}`);

  // ── File output (skip in test env) ───────────────────
  if (process.env.NODE_ENV !== "test") {
    const dateStr   = now.toISOString().split("T")[0];          // YYYY-MM-DD
    const logFile   = path.join(logsDir, `${dateStr}.log`);
    const logLine   = JSON.stringify({ level: label, timestamp, message, meta }) + "\n";
    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error("Logger file write error:", err.message);
    });
  }
};

// ─────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────
const logger = {
  info:  (msg, meta) => write("INFO",  msg, meta),
  warn:  (msg, meta) => write("WARN",  msg, meta),
  error: (msg, meta) => write("ERROR", msg, meta),
  debug: (msg, meta) => {
    // Only output debug in development
    if (process.env.NODE_ENV === "development") write("DEBUG", msg, meta);
  },

  // ── Express request logger middleware ─────────────────
  // Use this instead of morgan if you want structured JSON logs
  httpMiddleware: (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const level    = res.statusCode >= 500 ? "ERROR"
                     : res.statusCode >= 400 ? "WARN"
                     : "INFO";
      write(level, `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`, {
        ip:     req.ip,
        userAgent: req.get("user-agent"),
      });
    });
    next();
  },
};

module.exports = logger;
