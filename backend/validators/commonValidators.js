const { body, param, query } = require("express-validator");

const mongoIdParam = (name, label = name) => [
  param(name).isMongoId().withMessage(`${label} must be a valid ID`),
];

const paginationQuery = ({ maxLimit = 100, defaultLimit = 12 } = {}) => [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: maxLimit })
    .withMessage(`limit must be between 1 and ${maxLimit}`),
];

const optionalCouponCode = [
  body("couponCode")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage("couponCode cannot exceed 20 characters"),
];

const requiredCouponCode = [
  body("couponCode")
    .trim()
    .notEmpty()
    .withMessage("couponCode is required")
    .isLength({ max: 20 })
    .withMessage("couponCode cannot exceed 20 characters"),
];

const indianPhone = (field, { required = true } = {}) => {
  const chain = body(field).trim();
  return required
    ? chain
        .notEmpty()
        .withMessage(`${field} is required`)
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Enter a valid 10-digit Indian mobile number")
    : chain
        .optional({ checkFalsy: true })
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Enter a valid 10-digit Indian mobile number");
};

module.exports = {
  mongoIdParam,
  paginationQuery,
  optionalCouponCode,
  requiredCouponCode,
  indianPhone,
};
