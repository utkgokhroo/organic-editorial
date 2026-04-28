// ─────────────────────────────────────────────────────────
//  Input sanitizer middleware
//
//  Recursively walks req.body, req.query and req.params and:
//    1. Strips leading/trailing whitespace from strings
//    2. Removes keys that start with "$" (blocks NoSQL injection)
//    3. Removes keys that contain "." (blocks dot-notation attacks)
//
//  This runs BEFORE route handlers so all input is clean
//  by the time it reaches controllers.
// ─────────────────────────────────────────────────────────

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === "object") {
    return sanitizeObject(value);
  }

  return value;
};

const sanitizeObject = (obj) => {
  const clean = {};
  for (const key of Object.keys(obj)) {
    // Block NoSQL injection operators and dot-notation traversal
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    clean[key] = sanitizeValue(obj[key]);
  }
  return clean;
};

const sanitize = (req, _res, next) => {
  if (req.body   && typeof req.body   === "object") req.body   = sanitizeObject(req.body);
  if (req.query  && typeof req.query  === "object") req.query  = sanitizeObject(req.query);
  if (req.params && typeof req.params === "object") req.params = sanitizeObject(req.params);
  next();
};

module.exports = sanitize;
