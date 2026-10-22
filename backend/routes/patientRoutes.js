const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  listPatients,
  createPatient,
  getPatient,
  updatePatient,
  listPatientImages,
  listPatientDocuments,
} = require('../controllers/patientController');
const { createPatientRules } = require('../validators/patientValidators');
const validate = require('../validators/validate');

const { listAssessments, createAssessment } = require('../controllers/assessmentController');
const { createAssessmentRules } = require('../validators/assessmentValidators');

const { listLabResults, createLabResult } = require('../controllers/labController');
const { createLabRules } = require('../validators/labValidators');

const { listMedications, createMedication, updateMedication } = require('../controllers/medicationController');
const { createMedicationRules } = require('../validators/medicationValidators');

const { listPatientFindings } = require('../controllers/findingController');
const { listPatientFollowUps } = require('../controllers/followUpController');
const { getPatientTimeline } = require('../controllers/timelineController');

router.use(protect);

// Demographic & administrative patient endpoints (both Clinicians and Admins)
router.get('/', listPatients);
router.post('/', createPatientRules, validate, createPatient);
router.get('/:id', getPatient);
router.put('/:id', updatePatient);

// Confidential clinical records & Protected Health Information (PHI) — strictly Clinicians
router.get('/:patientId/assessments', requireRole('clinician'), listAssessments);
router.post('/:patientId/assessments', requireRole('clinician'), createAssessmentRules, validate, createAssessment);

router.get('/:patientId/labs', requireRole('clinician'), listLabResults);
router.post('/:patientId/labs', requireRole('clinician'), createLabRules, validate, createLabResult);

router.get('/:patientId/medications', requireRole('clinician'), listMedications);
router.post('/:patientId/medications', requireRole('clinician'), createMedicationRules, validate, createMedication);
router.put('/:patientId/medications/:id', requireRole('clinician'), updateMedication);

router.get('/:patientId/findings', requireRole('clinician'), listPatientFindings);
router.get('/:patientId/followups', listPatientFollowUps);
router.get('/:patientId/timeline', requireRole('clinician'), getPatientTimeline);
router.get('/:patientId/images', requireRole('clinician'), listPatientImages);
router.get('/:patientId/documents', requireRole('clinician'), listPatientDocuments);

module.exports = router;
