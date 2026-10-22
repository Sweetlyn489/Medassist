const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const Patient = require('../models/Patient');
const LaboratoryResult = require('../models/LaboratoryResult');
const ruleEngine = require('../rules/ruleEngine');
const auditService = require('../services/auditService');

/**
 * GET /api/patients/:patientId/labs
 */
const listLabResults = asyncHandler(async (req, res) => {
  const labs = await LaboratoryResult.find({ patient: req.params.patientId }).sort({ date: -1 });
  sendSuccess(res, 200, labs);
});

/**
 * POST /api/patients/:patientId/labs
 * Creates the lab result, then runs it through the rule engine
 * (reference-range check + any configured demonstration rules).
 */
const createLabResult = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) throw new ApiError(404, 'Patient not found.');

  const { test, result, unit, referenceLow, referenceHigh, date, status } = req.body;

  const lab = await LaboratoryResult.create({
    patient: patient._id,
    orderedBy: req.user._id,
    test,
    result,
    unit,
    referenceLow,
    referenceHigh,
    date: date || Date.now(),
    status: status || 'Completed',
  });

  const findings = lab.status === 'Completed' ? await ruleEngine.evaluateLabResult(lab, req.user) : [];

  await auditService.logAction({ user: req.user, action: 'Lab result added', entity: 'LaboratoryResult', entityId: lab._id, details: { patient: patient._id, test, findingsGenerated: findings.length } });

  sendSuccess(res, 201, { lab, findingsGenerated: findings });
});

module.exports = { listLabResults, createLabResult };
