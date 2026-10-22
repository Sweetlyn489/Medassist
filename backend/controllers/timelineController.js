const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const Assessment = require('../models/Assessment');
const LaboratoryResult = require('../models/LaboratoryResult');
const Medication = require('../models/Medication');
const FollowUp = require('../models/FollowUp');
const ClinicalFinding = require('../models/ClinicalFinding');
const MedicalImage = require('../models/MedicalImage');
const MedicalDocument = require('../models/MedicalDocument');

/**
 * GET /api/patients/:patientId/timeline
 * Builds a chronological feed of real database events for the patient —
 * no synthetic or decorative entries.
 */
const getPatientTimeline = asyncHandler(async (req, res) => {
  const patientId = req.params.patientId;

  const [assessments, labs, medications, followUps, findings, images, documents] = await Promise.all([
    Assessment.find({ patient: patientId }).populate('clinician', 'name'),
    LaboratoryResult.find({ patient: patientId }).populate('orderedBy', 'name'),
    Medication.find({ patient: patientId }).populate('prescribedBy', 'name'),
    FollowUp.find({ patient: patientId }).populate('assignedClinician', 'name'),
    ClinicalFinding.find({ patient: patientId }).populate('reviewedBy', 'name'),
    MedicalImage.find({ patient: patientId }).populate('orderedBy', 'name'),
    MedicalDocument.find({ patient: patientId }).populate('author', 'name'),
  ]);

  const events = [];

  assessments.forEach((a) =>
    events.push({
      type: 'Assessment created',
      category: 'Assessment',
      date: a.createdAt,
      summary: a.chiefComplaint,
      by: a.clinician?.name,
      refId: a._id,
      details: a.vitals,
    })
  );
  labs.forEach((l) =>
    events.push({
      type: 'Lab result added',
      category: 'Lab',
      date: l.date || l.createdAt,
      summary: `${l.test}: ${l.result} ${l.unit}`,
      by: l.orderedBy?.name,
      refId: l._id,
      details: { test: l.test, result: l.result, unit: l.unit, referenceLow: l.referenceLow, referenceHigh: l.referenceHigh },
    })
  );
  medications.forEach((m) => {
    events.push({
      type: m.status === 'Active' ? 'Medication prescribed' : `Medication ${m.status.toLowerCase()}`,
      category: 'Medication',
      date: m.startDate || m.createdAt,
      summary: `${m.medication} (${m.dosage}, ${m.frequency}) — ${m.status}`,
      by: m.prescribedBy?.name,
      refId: m._id,
    });
  });
  followUps.forEach((f) =>
    events.push({
      type: 'Follow-up scheduled',
      category: 'FollowUp',
      date: f.createdAt,
      summary: `${f.reason} (Due: ${new Date(f.dueDate).toLocaleDateString()})`,
      by: f.assignedClinician?.name,
      refId: f._id,
      status: f.status,
    })
  );
  findings
    .filter((f) => f.status !== 'Open')
    .forEach((f) =>
      events.push({
        type: 'Finding reviewed',
        category: 'Finding',
        date: f.reviewedAt || f.updatedAt,
        summary: `${f.finding} — Outcome: ${f.status}`,
        by: f.reviewedBy?.name,
        refId: f._id,
        notes: f.reviewNotes,
      })
    );
  images.forEach((img) =>
    events.push({
      type: `Imaging: ${img.modality}`,
      category: 'Imaging',
      date: img.acquisitionDate || img.createdAt,
      summary: `${img.title} (${img.bodySite || img.modality})`,
      by: img.orderedBy?.name,
      refId: img._id,
      thumbnailUrl: img.thumbnailUrl || img.imageUrl,
    })
  );
  documents.forEach((doc) =>
    events.push({
      type: `Document: ${doc.category}`,
      category: 'Document',
      date: doc.date || doc.createdAt,
      summary: doc.title,
      by: doc.authorName || doc.author?.name,
      refId: doc._id,
    })
  );

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  sendSuccess(res, 200, events);
});

module.exports = { getPatientTimeline };
