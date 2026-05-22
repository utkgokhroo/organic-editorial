/**
 * Standard API response helpers and operational errors.
 *
 * Success: { success: true, message?, token?, data?, ...meta }
 * Failure: { success: false, message, error, data? }
 */

const createError = (statusCode, message, errorCode, extras = {}) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.error = errorCode !== undefined && errorCode !== null ? errorCode : message;
  err.isOperational = true;

  if (extras.data !== undefined) err.data = extras.data;

  return err;
};

const sendSuccess = (res, statusCode, payload = {}) => {
  const { message, token, data, ...meta } = payload;
  const body = { success: true, ...meta };

  if (message) body.message = message;
  if (token) body.token = token;
  if (data !== undefined) body.data = data;

  return res.status(statusCode).json(body);
};

const sendFailure = (res, statusCode, message, error, extras = {}) => {
  const body = {
    success: false,
    message,
    error: error !== undefined && error !== null ? error : message,
    ...extras,
  };

  return res.status(statusCode).json(body);
};

const formatErrorBody = (statusCode, message, error, extras = {}) => {
  const body = {
    success: false,
    message,
    error: error !== undefined && error !== null ? error : (statusCode >= 500 ? "InternalServerError" : message),
    ...extras,
  };

  if (process.env.NODE_ENV === "development" && statusCode >= 500 && extras.stack) {
    body.stack = extras.stack;
  }

  return body;
};

const buildPagination = (page, limit, total) => {
  const pages = Math.ceil(total / limit) || 1;
  return {
    page,
    pages,
    limit,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };
};

const paginate = async (model, query = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(
    options.maxLimit || 100,
    Math.max(1, parseInt(options.limit, 10) || options.defaultLimit || 12)
  );
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.find(query).sort(options.sort || { createdAt: -1 }).skip(skip).limit(limit),
    model.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  return {
    data,
    count: data.length,
    total,
    pagination: buildPagination(page, limit, total),
  };
};

module.exports = {
  createError,
  sendSuccess,
  sendFailure,
  formatErrorBody,
  buildPagination,
  paginate,
};
