const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const ClinicalRule = require('../models/ClinicalRule');
const auditService = require('../services/auditService');

/**
 * GET /api/rules
 */
const listRules = asyncHandler(async (req, res) => {
  const rules = await ClinicalRule.find().sort({ type: 1, name: 1 });
  sendSuccess(res, 200, rules);
});

/**
 * PUT /api/rules/:id
 * Admin-only: edit threshold/severity/message or toggle active. Rules
 * stay fully transparent and inspectable — nothing here is a black box.
 */
const updateRule = asyncHandler(async (req, res) => {
  const rule = await ClinicalRule.findById(req.params.id);
  if (!rule) throw new ApiError(404, 'Rule not found.');

  const editableFields = ['threshold', 'severity', 'message', 'active', 'description'];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) rule[field] = req.body[field];
  }
  await rule.save();

  await auditService.logAction({ user: req.user, action: 'Clinical rule updated', entity: 'ClinicalRule', entityId: rule._id, details: req.body });

  sendSuccess(res, 200, rule);
});

module.exports = { listRules, updateRule };
