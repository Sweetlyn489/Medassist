const AuditLog = require('../models/AuditLog');

/**
 * Records an audit trail entry. Never throws into the caller's flow —
 * a logging failure should not block a clinical action — but does log
 * to the console so operators can notice a broken audit pipeline.
 */
async function logAction({ user, action, entity, entityId, details = {} }) {
  try {
    await AuditLog.create({
      user: user?._id || user,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Audit logging failed:', err.message);
  }
}

module.exports = { logAction };
