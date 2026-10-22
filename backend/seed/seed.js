/**
 * Enhanced seed script for MediAssist.
 * Seeds complete, coherent, realistic longitudinal clinical records.
 * All clinical data is synthetic demonstration data.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Assessment = require('../models/Assessment');
const LaboratoryResult = require('../models/LaboratoryResult');
const Medication = require('../models/Medication');
const ClinicalFinding = require('../models/ClinicalFinding');
const FollowUp = require('../models/FollowUp');
const AuditLog = require('../models/AuditLog');
const ClinicalRule = require('../models/ClinicalRule');
const MedicalImage = require('../models/MedicalImage');
const MedicalDocument = require('../models/MedicalDocument');

const ruleEngine = require('../rules/ruleEngine');
const defaultRules = require('../rules/defaultRules');
const auditService = require('../services/auditService');

const { patients, createSvgDataUrl } = require('./seedData');

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function run() {
  await connectDB();
  console.log('Clearing existing collections and indexes...');
  try {
    await mongoose.connection.db.dropDatabase();
  } catch (err) {
    console.log('Database reset note:', err.message);
  }

  console.log('Creating clinical users...');
  const admin = await User.create({
    name: 'Dana Whitfield',
    email: 'admin@mediassist.local',
    password: 'Admin@12345',
    role: 'admin',
    title: 'System Administrator',
  });
  const clinicianA = await User.create({
    name: 'Dr. Elena Voss',
    email: 'elena.voss@mediassist.local',
    password: 'Clinician@123',
    role: 'clinician',
    title: 'MD, Internal Medicine',
  });
  const clinicianB = await User.create({
    name: 'Dr. Marcus Ibe',
    email: 'marcus.ibe@mediassist.local',
    password: 'Clinician@123',
    role: 'clinician',
    title: 'MD, Cardiology Fellow',
  });
  const clinicians = [clinicianA, clinicianB];

  console.log('Loading clinical decision-support rules...');
  const rules = await ClinicalRule.insertMany(defaultRules);
  await auditService.logAction({
    user: admin,
    action: 'Clinical rules loaded',
    entity: 'ClinicalRule',
    entityId: rules[0]._id,
    details: { count: rules.length },
  });

  console.log('Creating coherent longitudinal patient records...');
  let findingsCount = 0;

  for (let i = 0; i < patients.length; i++) {
    const pData = patients[i];
    const clinician = clinicians[i % clinicians.length];
    const patientId = `P${String(i + 1).padStart(4, '0')}`;

    const patient = await Patient.create({
      patientId,
      firstName: pData.firstName,
      lastName: pData.lastName,
      dateOfBirth: pData.dateOfBirth,
      gender: pData.gender,
      bloodGroup: pData.bloodGroup,
      avatarUrl: pData.avatarUrl,
      contact: pData.contact,
      allergies: pData.allergies,
      medicalHistory: pData.medicalHistory,
      createdBy: admin._id,
      lastReviewed: daysAgo(i % 5),
    });

    await auditService.logAction({
      user: admin,
      action: 'Patient created',
      entity: 'Patient',
      entityId: patient._id,
      details: { patientId },
    });

    // 1. Longitudinal Assessments (3 to 4 sequential visits per patient)
    const baseVitals = {
      systolic: i === 1 ? 165 : i === 3 ? 130 : 120,
      diastolic: i === 1 ? 102 : i === 3 ? 82 : 78,
      hr: i === 3 ? 128 : i === 5 ? 88 : 72,
      rr: i === 4 ? 26 : 16,
      temp: i === 0 ? 37.1 : 36.8,
      spo2: i === 4 ? 90 : 98,
    };

    const visitIntervals = [75, 45, 18, 2];
    for (let v = 0; v < visitIntervals.length; v++) {
      const dAgo = visitIntervals[v];
      const variance = (v - 1) * 3;
      const vitals = {
        temperatureC: +(baseVitals.temp + (v === 3 && i === 7 ? 1.6 : (v % 2) * 0.2)).toFixed(1),
        heartRate: Math.max(45, baseVitals.hr - variance + (i % 3 === 0 ? (v === 3 ? 35 : 0) : 0)),
        respiratoryRate: Math.max(12, baseVitals.rr - (v > 1 ? 2 : 0)),
        systolicBP: Math.max(85, baseVitals.systolic - (v * 4) + (i === 1 ? 10 : 0)),
        diastolicBP: Math.max(55, baseVitals.diastolic - (v * 2)),
        oxygenSaturation: Math.min(100, baseVitals.spo2 + (v * 2)),
      };

      const symptomsList = [];
      if (i === 0) symptomsList.push('Polyuria', 'Polydipsia', 'Mild fatigue');
      if (i === 1) symptomsList.push('Morning headache', 'Occasional lightheadedness');
      if (i === 3) symptomsList.push('Palpitations', 'Exertional dyspnea');
      if (i === 4) symptomsList.push('Expiratory wheezing', 'Productive cough', 'Chest tightness');
      if (i === 5) symptomsList.push('Fatigue', 'Bilateral lower extremity edema');

      const assessment = await Assessment.create({
        patient: patient._id,
        clinician: clinician._id,
        chiefComplaint: v === 0 ? 'Initial clinical baseline assessment' : v === 3 ? 'Follow-up consultation for symptom review' : 'Routine interval review and vitals check',
        symptoms: symptomsList,
        vitals,
        clinicalFindingsNotes: 'Evaluated according to standard clinic protocols.',
        assessmentNotes: `Visit documented on day -${dAgo}. Patient alert and oriented. Clinical findings discussed.`,
        createdAt: daysAgo(dAgo),
      });

      const vitalFindings = await ruleEngine.evaluateVitals(assessment, clinician);
      findingsCount += vitalFindings.length;
    }

    // 2. Longitudinal Laboratory Results (3 to 6 results per patient)
    const patientLabs = [
      {
        test: 'Potassium',
        unit: 'mmol/L',
        referenceLow: 3.5,
        referenceHigh: 5.0,
        results: i === 5 ? [5.2, 5.8, 6.2] : [4.1, 4.3, 4.0], // Thomas Novak has hyperkalemia
      },
      {
        test: 'Glucose (Fasting)',
        unit: 'mg/dL',
        referenceLow: 70,
        referenceHigh: 99,
        results: i === 0 || i === 7 ? [185, 210, 248] : [88, 92, 95], // Diabetic cohort has elevated glucose
      },
      {
        test: 'Hemoglobin',
        unit: 'g/dL',
        referenceLow: 12.0,
        referenceHigh: 17.5,
        results: i === 6 ? [8.2, 7.8, 7.5] : [14.1, 14.5, 13.9], // Grace Mensah has low hemoglobin
      },
      {
        test: 'Creatinine',
        unit: 'mg/dL',
        referenceLow: 0.6,
        referenceHigh: 1.3,
        results: i === 5 ? [1.5, 1.7, 1.9] : [0.9, 1.0, 0.95],
      },
    ];

    for (const pl of patientLabs) {
      for (let rIdx = 0; rIdx < pl.results.length; rIdx++) {
        const labVal = pl.results[rIdx];
        const labDate = daysAgo(60 - (rIdx * 25));
        const lab = await LaboratoryResult.create({
          patient: patient._id,
          orderedBy: clinician._id,
          test: pl.test,
          result: labVal,
          unit: pl.unit,
          referenceLow: pl.referenceLow,
          referenceHigh: pl.referenceHigh,
          date: labDate,
          status: 'Completed',
          createdAt: labDate,
        });

        const labFindings = await ruleEngine.evaluateLabResult(lab, clinician);
        findingsCount += labFindings.length;
      }
    }

    // 3. Medications (specifically engineered to demonstrate CDS checks)
    const activeMeds = [];

    // Patient 0 (Ananya Rao): Penicillin allergy. Prescribe Metformin, then Amoxicillin -> Allergy contraindication!
    if (i === 0) {
      const med1 = await Medication.create({
        patient: patient._id,
        prescribedBy: clinician._id,
        medication: 'Metformin',
        dosage: '850mg',
        frequency: 'Twice daily with meals',
        route: 'Oral',
        startDate: daysAgo(90),
        status: 'Active',
      });
      activeMeds.push(med1);

      const med2 = await Medication.create({
        patient: patient._id,
        prescribedBy: clinician._id,
        medication: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        route: 'Oral',
        startDate: daysAgo(3),
        status: 'Active',
      });
      const f = await ruleEngine.evaluateMedicationSafety(med2, activeMeds, patient, clinician);
      findingsCount += f.length;
      activeMeds.push(med2);
    }
    // Patient 3 (Liam O'Connor): CAD & Atrial Fibrillation. Prescribe Warfarin + Aspirin -> Drug-drug interaction!
    else if (i === 3) {
      const med1 = await Medication.create({
        patient: patient._id,
        prescribedBy: clinician._id,
        medication: 'Warfarin',
        dosage: '5mg',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        startDate: daysAgo(60),
        status: 'Active',
      });
      activeMeds.push(med1);

      const med2 = await Medication.create({
        patient: patient._id,
        prescribedBy: clinician._id,
        medication: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        route: 'Oral',
        startDate: daysAgo(10),
        status: 'Active',
      });
      const f = await ruleEngine.evaluateMedicationSafety(med2, activeMeds, patient, clinician);
      findingsCount += f.length;
      activeMeds.push(med2);
    }
    // Patient 5 (Thomas Novak): CKD. Prescribe Ibuprofen -> Chronic condition contraindication!
    else if (i === 5) {
      const med1 = await Medication.create({
        patient: patient._id,
        prescribedBy: clinician._id,
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        route: 'Oral',
        startDate: daysAgo(100),
        status: 'Active',
      });
      activeMeds.push(med1);

      const med2 = await Medication.create({
        patient: patient._id,
        prescribedBy: clinician._id,
        medication: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'Three times daily as needed',
        route: 'Oral',
        startDate: daysAgo(2),
        status: 'Active',
      });
      const f = await ruleEngine.evaluateMedicationSafety(med2, activeMeds, patient, clinician);
      findingsCount += f.length;
      activeMeds.push(med2);
    } else {
      // Standard maintenance therapies for others
      const medCatalog = [
        { medication: 'Lisinopril', dosage: '20mg', frequency: 'Once daily' },
        { medication: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at night' },
        { medication: 'Albuterol HFA', dosage: '90mcg', frequency: '2 puffs q4-6h prn' },
        { medication: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily before breakfast' },
        { medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' },
        { medication: 'Metoprolol Tartrate', dosage: '25mg', frequency: 'Twice daily' },
      ];
      const selected = medCatalog[i % medCatalog.length];
      const med = await Medication.create({
        patient: patient._id,
        prescribedBy: clinician._id,
        medication: selected.medication,
        dosage: selected.dosage,
        frequency: selected.frequency,
        route: 'Oral',
        startDate: daysAgo(40),
        status: 'Active',
      });
      const f = await ruleEngine.evaluateMedicationSafety(med, [], patient, clinician);
      findingsCount += f.length;
    }

    // 4. Follow-up appointments
    const followUpPlan = [
      { reason: 'Comprehensive Diabetic Foot & Eye Exam', offset: -2, status: 'Due' },
      { reason: 'Hypertension Recheck & BP Log Review', offset: 3, status: 'Scheduled' },
      { reason: 'Serum Potassium & eGFR Panel Follow-up', offset: 5, status: 'Scheduled' },
      { reason: 'Anticoagulation INR Monitoring & Medication Review', offset: -1, status: 'Due' },
      { reason: 'Routine Chronic Care Check-in', offset: 14, status: 'Scheduled' },
    ];
    const fu = followUpPlan[i % followUpPlan.length];
    await FollowUp.create({
      patient: patient._id,
      reason: fu.reason,
      dueDate: daysFromNow(fu.offset),
      assignedClinician: clinician._id,
      notes: 'Scheduled via clinical review queue.',
      status: fu.status,
      createdBy: clinician._id,
    });

    // 5. Medical Images for representative patients
    if (i === 3) {
      // Liam O'Connor -> 12-lead ECG
      await MedicalImage.create({
        patient: patient._id,
        title: '12-Lead Electrocardiogram',
        modality: 'ECG',
        bodySite: 'Heart / Thorax',
        acquisitionDate: daysAgo(12),
        imageUrl: createSvgDataUrl('Liam O\'Connor', '12-Lead ECG · Sinus Rhythm with PACs', 'ecg'),
        thumbnailUrl: createSvgDataUrl('Liam O\'Connor', 'ECG', 'ecg'),
        indication: 'Evaluation of recurrent palpitations and history of atrial fibrillation.',
        findings: 'Normal sinus rhythm with rate of 84 bpm. Narrow QRS complex (88ms). PR interval 156ms. Isolated premature atrial complexes noted in V1 and II.',
        impression: 'Sinus rhythm with occasional PACs. No acute ST-T segment elevation or depression.',
        orderedBy: clinician._id,
      });
    } else if (i === 8 || i === 4) {
      // Robert Sanders / David Kim -> Chest X-Ray
      await MedicalImage.create({
        patient: patient._id,
        title: 'Chest Radiograph PA & Lateral',
        modality: 'X-Ray',
        bodySite: 'Chest',
        acquisitionDate: daysAgo(20),
        imageUrl: createSvgDataUrl(`${pData.firstName} ${pData.lastName}`, 'Chest PA View', 'xray_chest'),
        thumbnailUrl: createSvgDataUrl(`${pData.firstName} ${pData.lastName}`, 'Chest X-Ray', 'xray_chest'),
        indication: 'Chronic cough and exertional dyspnea; evaluate for infiltrates or hyperinflation.',
        findings: 'Lungs demonstrate mild hyperinflation consistent with obstructive airway disease. No focal consolidation, pneumothorax, or large pleural effusion. Cardiothoracic ratio within normal limits.',
        impression: 'Mild hyperinflation without acute pulmonary consolidation or cardiopulmonary congestion.',
        orderedBy: clinician._id,
      });
    } else if (i === 12) {
      // Charles Dubois -> Left Knee X-Ray
      await MedicalImage.create({
        patient: patient._id,
        title: 'Weight-Bearing Knee Radiographs (AP/Lateral)',
        modality: 'X-Ray',
        bodySite: 'Left Knee',
        acquisitionDate: daysAgo(15),
        imageUrl: createSvgDataUrl('Charles Dubois', 'Left Knee AP View', 'xray_knee'),
        thumbnailUrl: createSvgDataUrl('Charles Dubois', 'Knee X-Ray', 'xray_knee'),
        indication: 'Persistent medial joint line pain on ambulation.',
        findings: 'Moderate joint space narrowing localized to the medial compartment. Marginal osteophyte formation along the tibial plateau and medial femoral condyle. No joint effusion.',
        impression: 'Moderate primary medial compartment osteoarthritis of the left knee.',
        orderedBy: clinician._id,
      });
    } else if (i === 2) {
      // Sofia Alvarez -> Brain MRI
      await MedicalImage.create({
        patient: patient._id,
        title: 'Brain MRI without Contrast (T1, T2, FLAIR)',
        modality: 'MRI',
        bodySite: 'Head / Brain',
        acquisitionDate: daysAgo(28),
        imageUrl: createSvgDataUrl('Sofia Alvarez', 'Brain MRI T2 / FLAIR', 'mri_brain'),
        thumbnailUrl: createSvgDataUrl('Sofia Alvarez', 'Brain MRI', 'mri_brain'),
        indication: 'Intractable atypical migraine headaches without aura.',
        findings: 'Parenchymal architecture normal throughout cerebral hemispheres. No acute intracranial hemorrhage, mass effect, or territorial infarction. Ventricles and sulci age-appropriate.',
        impression: 'Unremarkable brain MRI without intracranial mass or vascular lesion.',
        orderedBy: clinician._id,
      });
    } else if (i === 5) {
      // Thomas Novak -> Renal Ultrasound
      await MedicalImage.create({
        patient: patient._id,
        title: 'Renal & Bladder Ultrasound',
        modality: 'Ultrasound',
        bodySite: 'Kidneys / Retroperitoneum',
        acquisitionDate: daysAgo(35),
        imageUrl: createSvgDataUrl('Thomas Novak', 'Renal Ultrasound', 'ultrasound'),
        thumbnailUrl: createSvgDataUrl('Thomas Novak', 'Ultrasound', 'ultrasound'),
        indication: 'Staging and anatomical evaluation of Chronic Kidney Disease (Stage 3).',
        findings: 'Right kidney measures 10.2 cm, left kidney measures 10.5 cm. Mild bilateral increase in cortical echogenicity. Corticomedullary differentiation preserved. No hydronephrosis or calculi.',
        impression: 'Mild bilateral medical renal disease. No evidence of urinary tract obstruction.',
        orderedBy: clinician._id,
      });
    }

    // 6. Medical Documents for representative patients
    await MedicalDocument.create({
      patient: patient._id,
      title: 'Diagnostic Comprehensive Metabolic Panel & Lipid Profile',
      category: 'Laboratory',
      date: daysAgo(14),
      author: clinician._id,
      authorName: clinician.name,
      summary: 'Outpatient diagnostic biochemical assessment performed by Central Diagnostics.',
      content: {
        facility: 'Metropolitan Clinical Laboratories',
        specimen: 'Serum (Venipuncture)',
        collectionTime: daysAgo(14).toISOString(),
        findings: [
          { test: 'Serum Sodium', result: '141 mmol/L', reference: '135 - 145 mmol/L', status: 'Normal' },
          { test: 'Serum Potassium', result: i === 5 ? '6.2 mmol/L [CRITICAL]' : '4.2 mmol/L', reference: '3.5 - 5.0 mmol/L', status: i === 5 ? 'High' : 'Normal' },
          { test: 'Fasting Blood Glucose', result: i === 0 ? '248 mg/dL [ELEVATED]' : '92 mg/dL', reference: '70 - 99 mg/dL', status: i === 0 ? 'High' : 'Normal' },
          { test: 'Serum Creatinine', result: i === 5 ? '1.9 mg/dL' : '0.9 mg/dL', reference: '0.6 - 1.3 mg/dL', status: i === 5 ? 'High' : 'Normal' },
          { test: 'Total Cholesterol', result: '198 mg/dL', reference: '< 200 mg/dL', status: 'Desirable' },
        ],
        clinicalRemarks: 'Specimen verified without gross hemolysis. Clinical correlation recommended for any abnormal flags.',
      },
    });

    await MedicalDocument.create({
      patient: patient._id,
      title: 'Official Electronic Prescription Order (eRx)',
      category: 'Prescription',
      date: daysAgo(3),
      author: clinician._id,
      authorName: clinician.name,
      summary: 'Electronic prescription authorized for outpatient pharmacy fulfillment.',
      content: {
        rxNumber: `RX-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        prescriber: `${clinician.name}, ${clinician.title}`,
        prescriberNPI: '1942859102',
        deaRegistration: 'BW9281742',
        pharmacy: 'MediAssist Community Pharmacy #104',
        medications: activeMeds.map((m) => ({
          name: m.medication,
          strength: m.dosage,
          directions: `${m.frequency} via ${m.route}`,
          quantity: 60,
          refills: 2,
        })),
        safetyCheckResult: 'CDS automated screening passed with clinician review required for documented clinical cues.',
      },
    });

    if (i % 2 === 0) {
      await MedicalDocument.create({
        patient: patient._id,
        title: 'Clinical Consultation Summary & Management Plan',
        category: 'Clinical Note',
        date: daysAgo(2),
        author: clinician._id,
        authorName: clinician.name,
        summary: 'Documented SOAP note from clinical encounter.',
        content: {
          subjective: 'Patient presents for scheduled interval review. Reports general compliance with prescribed regimen. Denies severe acute distress.',
          objective: 'Alert, oriented x 4. Vitals stable at time of visit. Heart regular rate and rhythm, lungs clear to auscultation bilaterally.',
          assessment: 'Chronic conditions managed under current protocol. Laboratory tests evaluated.',
          plan: 'Continue current medications, maintain follow-up interval, patient educated on warning signs.',
        },
      });
    }
  }

  // Mark approximately 40% of findings as Reviewed or Resolved
  const allFindings = await ClinicalFinding.find();
  for (let fIdx = 0; fIdx < allFindings.length; fIdx++) {
    const finding = allFindings[fIdx];
    const clinician = clinicians[fIdx % clinicians.length];
    if (fIdx % 3 === 1) {
      finding.status = 'Reviewed';
      finding.reviewedBy = clinician._id;
      finding.reviewedAt = daysAgo(2);
      finding.reviewNotes = 'Clinical cue reviewed by attending physician. Management plan adjusted accordingly.';
      await finding.save();
      await auditService.logAction({
        user: clinician,
        action: 'Finding reviewed',
        entity: 'ClinicalFinding',
        entityId: finding._id,
        details: { status: 'Reviewed' },
      });
    } else if (fIdx % 3 === 2) {
      finding.status = 'Resolved';
      finding.reviewedBy = clinician._id;
      finding.reviewedAt = daysAgo(1);
      finding.reviewNotes = 'Identified condition stabilized. Medication dosage modified and verified.';
      await finding.save();
      await auditService.logAction({
        user: clinician,
        action: 'Finding reviewed',
        entity: 'ClinicalFinding',
        entityId: finding._id,
        details: { status: 'Resolved' },
      });
    }
  }

  console.log('\nSeed completed successfully.');
  console.log(`  Users: ${await User.countDocuments()}`);
  console.log(`  Patients: ${await Patient.countDocuments()}`);
  console.log(`  Assessments: ${await Assessment.countDocuments()}`);
  console.log(`  Lab results: ${await LaboratoryResult.countDocuments()}`);
  console.log(`  Medications: ${await Medication.countDocuments()}`);
  console.log(`  Clinical findings: ${await ClinicalFinding.countDocuments()} (${findingsCount} total generated)`);
  console.log(`  Follow-ups: ${await FollowUp.countDocuments()}`);
  console.log(`  Medical images: ${await MedicalImage.countDocuments()}`);
  console.log(`  Medical documents: ${await MedicalDocument.countDocuments()}`);
  console.log(`  Audit log entries: ${await AuditLog.countDocuments()}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
