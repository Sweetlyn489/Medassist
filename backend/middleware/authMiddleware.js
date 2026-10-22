const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT on the request and attaches the authenticated
 * user (minus password) to req.user. Rejects deactivated accounts.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized — no token provided.');
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authorized — invalid or expired token.');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.active) {
    throw new ApiError(401, 'Not authorized — account not found or deactivated.');
  }

  req.user = user;
  next();
});

module.exports = { protect };
