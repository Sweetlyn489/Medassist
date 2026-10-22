const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const Patient = require('../models/Patient');
const Assessment = require('../models/Assessment');
const ruleEngine = require('../rules/ruleEngine');
const auditService = require('../services/auditService');

/**
 * GET /api/patients/:patientId/assessments
 */
const listAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ patient: req.params.patientId })
    .populate('clinician', 'name title')
    .sort({ createdAt: -1 });
  sendSuccess(res, 200, assessments);
});

/**
 * POST /api/patients/:patientId/assessments
 * Creates the assessment, then runs the vitals through the rule engine
 * to generate any "requires clinical review" findings.
 */
const createAssessment = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) throw new ApiError(404, 'Patient not found.');

  const { chiefComplaint, symptoms, vitals, clinicalFindingsNotes, assessmentNotes } = req.body;

  const assessment = await Assessment.create({
    patient: patient._id,
    clinician: req.user._id,
    chiefComplaint,
    symptoms,
    vitals,
    clinicalFindingsNotes,
    assessmentNotes,
  });

  patient.lastReviewed = new Date();
  await patient.save();

  const findings = await ruleEngine.evaluateVitals(assessment, req.user);

  await auditService.logAction({ user: req.user, action: 'Assessment created', entity: 'Assessment', entityId: assessment._id, details: { patient: patient._id, findingsGenerated: findings.length } });

  sendSuccess(res, 201, { assessment, findingsGenerated: findings });
});

module.exports = { listAssessments, createAssessment };
