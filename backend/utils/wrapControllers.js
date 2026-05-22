const asyncHandler = require("../middleware/asyncHandler");

const wrapControllers = (handlers) =>
  Object.fromEntries(
    Object.entries(handlers).map(([name, handler]) => [name, asyncHandler(handler)])
  );

module.exports = wrapControllers;
