const { validationResult } = require("express-validator");
const { sendFailure } = require("../utils/apiResponse");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendFailure(res, 400, "Validation failed", errors.array().map((entry) => ({
      field: entry.path,
      message: entry.msg,
    })));
  }

  next();
};

module.exports = validate;
