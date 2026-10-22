const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const Patient = require('../models/Patient');
const Medication = require('../models/Medication');
const ruleEngine = require('../rules/ruleEngine');
const auditService = require('../services/auditService');

/**
 * GET /api/patients/:patientId/medications
 */
const listMedications = asyncHandler(async (req, res) => {
  const medications = await Medication.find({ patient: req.params.patientId }).sort({ startDate: -1 });
  sendSuccess(res, 200, medications);
});

/**
 * POST /api/patients/:patientId/medications
 * Creates the medication order, then checks it against the patient's
 * other active medications using the configurable interaction rule set.
 */
const createMedication = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.patientId);
  if (!patient) throw new ApiError(404, 'Patient not found.');

  const { medication, dosage, frequency, route, startDate, endDate } = req.body;

  const med = await Medication.create({
    patient: patient._id,
    prescribedBy: req.user._id,
    medication,
    dosage,
    frequency,
    route,
    startDate: startDate || Date.now(),
    endDate: endDate || null,
  });

  const activeMedications = await Medication.find({ patient: patient._id, status: 'Active' });
  const findings = await ruleEngine.evaluateMedicationSafety(med, activeMedications, patient, req.user);

  await auditService.logAction({ user: req.user, action: 'Medication added', entity: 'Medication', entityId: med._id, details: { patient: patient._id, medication, findingsGenerated: findings.length } });

  sendSuccess(res, 201, { medication: med, findingsGenerated: findings });
});

/**
 * PUT /api/patients/:patientId/medications/:id
 * Used to discontinue/complete a medication.
 */
const updateMedication = asyncHandler(async (req, res) => {
  const med = await Medication.findOne({ _id: req.params.id, patient: req.params.patientId });
  if (!med) throw new ApiError(404, 'Medication not found.');

  const { status, endDate } = req.body;
  if (status) med.status = status;
  if (endDate) med.endDate = endDate;
  await med.save();

  await auditService.logAction({ user: req.user, action: 'Medication updated', entity: 'Medication', entityId: med._id, details: { patient: req.params.patientId, status: med.status } });

  sendSuccess(res, 200, med);
});

module.exports = { listMedications, createMedication, updateMedication };
