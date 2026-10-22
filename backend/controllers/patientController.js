const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/apiResponse');
const Patient = require('../models/Patient');
const Assessment = require('../models/Assessment');
const LaboratoryResult = require('../models/LaboratoryResult');
const Medication = require('../models/Medication');
const ClinicalFinding = require('../models/ClinicalFinding');
const MedicalImage = require('../models/MedicalImage');
const MedicalDocument = require('../models/MedicalDocument');
const auditService = require('../services/auditService');

async function generatePatientId() {
  const lastPatients = await Patient.find({ patientId: /^P\d+$/ })
    .sort({ patientId: -1 })
    .limit(1);
  let nextNum = 1;
  if (lastPatients.length > 0 && lastPatients[0].patientId) {
    const match = lastPatients[0].patientId.match(/^P(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  return `P${String(nextNum).padStart(4, '0')}`;
}

/**
 * GET /api/patients?search=&status=&page=&limit=
 */
const listPatients = asyncHandler(async (req, res) => {
  const { search = '', status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { firstName: new RegExp(escaped, 'i') },
      { lastName: new RegExp(escaped, 'i') },
      { patientId: new RegExp(escaped, 'i') },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [patients, total] = await Promise.all([
    Patient.find(query)
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Patient.countDocuments(query),
  ]);

  sendSuccess(res, 200, patients, { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) });
});

/**
 * POST /api/patients
 */
const createPatient = asyncHandler(async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, bloodGroup, avatarUrl, contact, allergies, medicalHistory } = req.body;
  const patientId = await generatePatientId();

  const patient = await Patient.create({
    patientId,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    bloodGroup: bloodGroup || '',
    avatarUrl: avatarUrl || '',
    contact,
    allergies,
    medicalHistory,
    createdBy: req.user._id,
  });

  await auditService.logAction({ user: req.user, action: 'Patient created', entity: 'Patient', entityId: patient._id, details: { patientId } });

  sendSuccess(res, 201, patient);
});

/**
 * GET /api/patients/:id
 * Returns the patient plus an "overview" bundle: current observations,
 * recent findings, active medications, allergies and history are already
 * on the patient document itself.
 */
const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, 'Patient not found.');

  // Administrative Role: Clinical PHI is strictly restricted
  if (req.user && req.user.role === 'admin') {
    await auditService.logAction({
      user: req.user,
      action: 'Patient administrative record accessed',
      entity: 'Patient',
      entityId: patient._id,
      details: { restrictedPHI: true, accessLevel: 'Administrative / Demographics only' },
    });

    return sendSuccess(res, 200, {
      patient,
      isRestrictedAdminView: true,
      overview: null,
      privacyNotice: 'Clinical encounter records, active medications, laboratory results, and medical images are confidential Protected Health Information (PHI) restricted to licensed healthcare practitioners.',
    });
  }

  // Clinician Role: Load complete clinical workspace bundle
  const [recentAssessment, activeMedications, recentLabs, openFindings, recentImages, recentDocuments] = await Promise.all([
    Assessment.findOne({ patient: patient._id }).sort({ createdAt: -1 }),
    Medication.find({ patient: patient._id, status: 'Active' }).sort({ startDate: -1 }),
    LaboratoryResult.find({ patient: patient._id }).sort({ date: -1 }).limit(10),
    ClinicalFinding.find({ patient: patient._id, status: 'Open' }).sort({ createdDate: -1 }),
    MedicalImage.find({ patient: patient._id }).sort({ acquisitionDate: -1 }).limit(6),
    MedicalDocument.find({ patient: patient._id }).sort({ date: -1 }).limit(6),
  ]);

  await auditService.logAction({ user: req.user, action: 'Patient clinical record accessed', entity: 'Patient', entityId: patient._id, details: {} });

  sendSuccess(res, 200, {
    patient,
    isRestrictedAdminView: false,
    overview: {
      recentAssessment,
      activeMedications,
      recentLabs,
      openFindings,
      recentImages,
      recentDocuments,
    },
  });
});

/**
 * PUT /api/patients/:id
 */
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, 'Patient not found.');

  const editableFields = [
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'bloodGroup',
    'avatarUrl',
    'contact',
    'allergies',
    'medicalHistory',
    'status',
  ];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) patient[field] = req.body[field];
  }
  patient.lastReviewed = new Date();
  await patient.save();

  await auditService.logAction({
    user: req.user,
    action: 'Patient updated',
    entity: 'Patient',
    entityId: patient._id,
    details: { fields: Object.keys(req.body) },
  });

  sendSuccess(res, 200, patient);
});

/**
 * GET /api/patients/:patientId/images
 */
const listPatientImages = asyncHandler(async (req, res) => {
  const images = await MedicalImage.find({ patient: req.params.patientId })
    .populate('orderedBy', 'name title')
    .sort({ acquisitionDate: -1 });
  sendSuccess(res, 200, images);
});

/**
 * GET /api/patients/:patientId/documents
 */
const listPatientDocuments = asyncHandler(async (req, res) => {
  const documents = await MedicalDocument.find({ patient: req.params.patientId })
    .populate('author', 'name title')
    .sort({ date: -1 });
  sendSuccess(res, 200, documents);
});

module.exports = {
  listPatients,
  createPatient,
  getPatient,
  updatePatient,
  listPatientImages,
  listPatientDocuments,
};
