const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const Patient = require('../models/Patient');
const FollowUp = require('../models/FollowUp');
const auditService = require('../services/auditService');

/**
 * GET /api/followups?status=&assignedClinician=&dueBefore=
 */
const listFollowUps = asyncHandler(async (req, res) => {
  const { status, assignedClinician, dueBefore } = req.query;
  const query = {};
  if (status) query.status = status;
  if (assignedClinician) query.assignedClinician = assignedClinician;
  if (dueBefore) query.dueDate = { $lte: new Date(dueBefore) };

  const followUps = await FollowUp.find(query)
    .populate('patient', 'patientId firstName lastName')
    .populate('assignedClinician', 'name')
    .sort({ dueDate: 1 });

  sendSuccess(res, 200, followUps);
});

/**
 * GET /api/patients/:patientId/followups
 */
const listPatientFollowUps = asyncHandler(async (req, res) => {
  const followUps = await FollowUp.find({ patient: req.params.patientId })
    .populate('assignedClinician', 'name')
    .sort({ dueDate: 1 });
  sendSuccess(res, 200, followUps);
});

/**
 * POST /api/followups
 */
const createFollowUp = asyncHandler(async (req, res) => {
  const { patient, reason, dueDate, assignedClinician, notes } = req.body;

  const patientDoc = await Patient.findById(patient);
  if (!patientDoc) throw new ApiError(404, 'Patient not found.');

  const followUp = await FollowUp.create({
    patient,
    reason,
    dueDate,
    assignedClinician,
    notes,
    createdBy: req.user._id,
  });

  await auditService.logAction({ user: req.user, action: 'Follow-up created', entity: 'FollowUp', entityId: followUp._id, details: { patient, dueDate } });

  sendSuccess(res, 201, followUp);
});

/**
 * PUT /api/followups/:id
 */
const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findById(req.params.id);
  if (!followUp) throw new ApiError(404, 'Follow-up not found.');

  const editableFields = ['reason', 'dueDate', 'assignedClinician', 'notes', 'status'];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) followUp[field] = req.body[field];
  }
  await followUp.save();

  await auditService.logAction({ user: req.user, action: 'Follow-up updated', entity: 'FollowUp', entityId: followUp._id, details: { fields: Object.keys(req.body) } });

  sendSuccess(res, 200, followUp);
});

module.exports = { listFollowUps, listPatientFollowUps, createFollowUp, updateFollowUp };
