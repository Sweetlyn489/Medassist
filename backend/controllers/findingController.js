const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const ClinicalFinding = require('../models/ClinicalFinding');
const auditService = require('../services/auditService');

/**
 * GET /api/findings?status=&severity=&page=&limit=
 * Global findings queue (used by the dashboard / findings screen).
 */
const listFindings = asyncHandler(async (req, res) => {
  const { status, severity, page = 1, limit = 25 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (severity) query.severity = severity;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100);

  const [findings, total] = await Promise.all([
    ClinicalFinding.find(query)
      .populate('patient', 'patientId firstName lastName')
      .populate('reviewedBy', 'name')
      .sort({ createdDate: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ClinicalFinding.countDocuments(query),
  ]);

  sendSuccess(res, 200, findings, { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) });
});

/**
 * GET /api/patients/:patientId/findings
 */
const listPatientFindings = asyncHandler(async (req, res) => {
  const findings = await ClinicalFinding.find({ patient: req.params.patientId })
    .populate('reviewedBy', 'name')
    .sort({ createdDate: -1 });
  sendSuccess(res, 200, findings);
});

/**
 * PUT /api/findings/:id/review
 * The clinician marks a finding Reviewed or Resolved. This is a human
 * decision — the system never auto-resolves a finding.
 */
const reviewFinding = asyncHandler(async (req, res) => {
  const { status, reviewNotes } = req.body;
  if (!['Reviewed', 'Resolved'].includes(status)) {
    throw new ApiError(400, 'Status must be Reviewed or Resolved.');
  }

  const finding = await ClinicalFinding.findById(req.params.id);
  if (!finding) throw new ApiError(404, 'Finding not found.');

  finding.status = status;
  finding.reviewedBy = req.user._id;
  finding.reviewedAt = new Date();
  if (reviewNotes) finding.reviewNotes = reviewNotes;
  await finding.save();

  await auditService.logAction({ user: req.user, action: 'Finding reviewed', entity: 'ClinicalFinding', entityId: finding._id, details: { status } });

  sendSuccess(res, 200, finding);
});

module.exports = { listFindings, listPatientFindings, reviewFinding };
