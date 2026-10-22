const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Runs after an array of express-validator checks; short-circuits with a
 * 400 ApiError (collecting all messages) if any check failed.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => `${e.path}: ${e.msg}`).join('; ');
    throw new ApiError(400, message, errors.array());
  }
  next();
}

module.exports = validate;
