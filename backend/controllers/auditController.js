const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const AuditLog = require('../models/AuditLog');

/**
 * GET /api/audit-logs?entity=&user=&page=&limit=
 * Admin-only.
 */
const listAuditLogs = asyncHandler(async (req, res) => {
  const { entity, user, page = 1, limit = 50 } = req.query;
  const query = {};
  if (entity) query.entity = entity;
  if (user) query.user = user;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    AuditLog.countDocuments(query),
  ]);

  sendSuccess(res, 200, logs, { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) });
});

module.exports = { listAuditLogs };
