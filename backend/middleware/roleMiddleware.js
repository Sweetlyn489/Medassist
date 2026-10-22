const ApiError = require('../utils/apiError');

/**
 * Restricts a route to the given roles. Must run after `protect`.
 * Usage: router.post('/', protect, requireRole('admin'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action.');
  }
  next();
};

module.exports = { requireRole };
