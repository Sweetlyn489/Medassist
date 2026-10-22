const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const User = require('../models/User');
const auditService = require('../services/auditService');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.active) throw new ApiError(401, 'Invalid credentials.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials.');

  const token = signToken(user);
  await auditService.logAction({ user, action: 'User login', entity: 'User', entityId: user._id, details: {} });

  sendSuccess(res, 200, { token, user: user.toSafeObject() });
});

/**
 * POST /api/auth/register
 * Admin-only: creates a new clinician or admin account.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, title } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'A user with this email already exists.');

  const user = await User.create({ name, email: email.toLowerCase(), password, role: role || 'clinician', title });
  await auditService.logAction({ user: req.user, action: 'User created', entity: 'User', entityId: user._id, details: { createdEmail: user.email, role: user.role } });

  sendSuccess(res, 201, { user: user.toSafeObject() });
});

/**
 * GET /api/auth/me
 */
const me = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user.toSafeObject() });
});

/**
 * GET /api/auth/clinicians
 * Returns list of active clinicians for assignment and review
 */
const listClinicians = asyncHandler(async (req, res) => {
  const clinicians = await User.find({ active: true }).select('name email role title').sort({ name: 1 });
  sendSuccess(res, 200, clinicians);
});

/**
 * GET /api/auth/users
 * Admin-only: list all system users (clinicians, staff, admins)
 */
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ role: 1, name: 1 });
  sendSuccess(res, 200, users);
});

/**
 * PUT /api/auth/users/:id/status
 * Admin-only: toggle or set active status of a user
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found.');

  // Prevent admin from deactivating themselves
  if (String(user._id) === String(req.user._id)) {
    throw new ApiError(400, 'Administrators cannot deactivate their own account.');
  }

  user.active = active !== undefined ? Boolean(active) : !user.active;
  await user.save();

  await auditService.logAction({
    user: req.user,
    action: `User ${user.active ? 'activated' : 'deactivated'}`,
    entity: 'User',
    entityId: user._id,
    details: { targetEmail: user.email, active: user.active },
  });

  sendSuccess(res, 200, user.toSafeObject());
});

module.exports = { login, register, me, listClinicians, listUsers, updateUserStatus };
