/**
 * Clinical Decision Support Rule Engine
 * ---------------------------------------------------------------------------
 * This module NEVER diagnoses. Every rule produces a transparent,
 * configurable "requires clinical review" style finding, never a
 * definitive medical claim. Rules are stored in MongoDB (ClinicalRule)
 * so an admin can review, edit or disable them without a code change.
 *
 * The engine is intentionally kept separate from controllers: controllers
 * call these functions after persisting clinical data, and the engine
 * decides whether a ClinicalFinding should be created.
 */
const ClinicalRule = require('../models/ClinicalRule');
const findingService = require('./../services/findingService');

const OPERATORS = {
  gt: (value, threshold) => value > threshold,
  gte: (value, threshold) => value >= threshold,
  lt: (value, threshold) => value < threshold,
  lte: (value, threshold) => value <= threshold,
  eq: (value, threshold) => value === threshold,
};

/**
 * Evaluates a newly-created Assessment's vitals against active "vital" rules.
 * Returns the list of findings created (may be empty).
 */
async function evaluateVitals(assessment, actingUser) {
  const vitals = assessment.vitals || {};
  const vitalFields = Object.keys(vitals).filter((k) => typeof vitals[k] === 'number');
  if (vitalFields.length === 0) return [];

  const rules = await ClinicalRule.find({ type: 'vital', active: true, field: { $in: vitalFields } });
  const created = [];

  for (const rule of rules) {
    const value = vitals[rule.field];
    const comparator = OPERATORS[rule.operator];
    if (!comparator || value === undefined || value === null) continue;

    if (comparator(value, rule.threshold)) {
      const finding = await findingService.createFinding(
        {
          patient: assessment.patient,
          finding: rule.message,
          severity: rule.severity,
          reason: `${rule.name}: recorded ${rule.field} = ${value} (${rule.operator} ${rule.threshold})`,
          sourceType: 'Vital',
          sourceModel: 'Assessment',
          sourceId: assessment._id,
          sourceData: { field: rule.field, value },
          ruleId: rule._id,
        },
        actingUser
      );
      created.push(finding);
    }
  }
  return created;
}

/**
 * Evaluates a newly-created LaboratoryResult. Two layers, both
 * "requires clinical review" — never a diagnosis:
 *   1. Reference-range check: result outside [referenceLow, referenceHigh].
 *   2. Configured demonstration rules for that specific test.
 */
async function evaluateLabResult(labResult, actingUser) {
  const created = [];

  const isLow = labResult.result < labResult.referenceLow;
  const isHigh = labResult.result > labResult.referenceHigh;

  if (isLow || isHigh) {
    const direction = isLow ? 'Subnormal / Low' : 'Elevated / High';
    const relation = isLow ? 'below' : 'above';
    const finding = await findingService.createFinding(
      {
        patient: labResult.patient,
        finding: `${direction} lab value detected — requires clinical review.`,
        severity: 'Moderate',
        reason: `${labResult.test} result ${labResult.result} ${labResult.unit} is ${relation} the reference range (${labResult.referenceLow}–${labResult.referenceHigh} ${labResult.unit}).`,
        sourceType: 'Lab',
        sourceModel: 'LaboratoryResult',
        sourceId: labResult._id,
        sourceData: {
          test: labResult.test,
          result: labResult.result,
          referenceLow: labResult.referenceLow,
          referenceHigh: labResult.referenceHigh,
          direction: isLow ? 'Low' : 'High',
        },
      },
      actingUser
    );
    created.push(finding);
  }

  const rules = await ClinicalRule.find({ type: 'lab', active: true, field: labResult.test });
  for (const rule of rules) {
    const comparator = OPERATORS[rule.operator];
    if (!comparator) continue;
    if (comparator(labResult.result, rule.threshold)) {
      const finding = await findingService.createFinding(
        {
          patient: labResult.patient,
          finding: rule.message,
          severity: rule.severity,
          reason: `${rule.name}: ${labResult.test} = ${labResult.result} ${labResult.unit} (${rule.operator} ${rule.threshold})`,
          sourceType: 'Lab',
          sourceModel: 'LaboratoryResult',
          sourceId: labResult._id,
          sourceData: { test: labResult.test, result: labResult.result },
          ruleId: rule._id,
        },
        actingUser
      );
      created.push(finding);
    }
  }

  return created;
}

/**
 * Checks whether medication name matches a documented allergy or common cross-reactive class.
 */
const ALLERGY_CLASSES = {
  penicillin: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin', 'piperacillin', 'ticarcillin'],
  sulfa: ['sulfa', 'sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine'],
  nsaid: ['aspirin', 'ibuprofen', 'naproxen', 'ketorolac', 'meloxicam', 'celecoxib', 'diclofenac'],
  opioid: ['codeine', 'morphine', 'oxycodone', 'hydrocodone', 'fentanyl', 'hydromorphone'],
};

function matchesAllergy(medicationName, allergySubstance) {
  const med = medicationName.trim().toLowerCase();
  const allg = allergySubstance.trim().toLowerCase();

  // Direct substring / name match
  if (med.includes(allg) || allg.includes(med)) return true;

  // Class-based cross-reactivity
  for (const [key, drugs] of Object.entries(ALLERGY_CLASSES)) {
    const allgMatchesClass = allg.includes(key) || drugs.some((d) => allg.includes(d));
    const medMatchesClass = med.includes(key) || drugs.some((d) => med.includes(d));
    if (allgMatchesClass && medMatchesClass) return true;
  }
  return false;
}

/**
 * Known disease-drug contraindication pairs for clinical safety checks.
 */
const CONTRAINDICATIONS = [
  {
    conditionPattern: /kidney disease|renal|ckd|nephropathy/i,
    medicationPattern: /ibuprofen|naproxen|ketorolac|meloxicam|diclofenac|indomethacin/i,
    name: 'NSAID in Renal Impairment',
    reason: 'prescribed for patient with documented renal disease — potential risk of further nephrotoxicity or acute kidney injury.',
    severity: 'High',
  },
  {
    conditionPattern: /peptic ulcer|gastric ulcer|gastrointestinal bleed|gi bleed/i,
    medicationPattern: /ibuprofen|naproxen|aspirin|ketorolac|diclofenac/i,
    name: 'NSAID / Antiplatelet in Peptic Ulcer Disease',
    reason: 'prescribed with documented history of peptic ulcer / GI bleeding — elevated gastrointestinal mucosal injury risk.',
    severity: 'High',
  },
  {
    conditionPattern: /asthma|bronchospasm/i,
    medicationPattern: /propranolol|nadolol|timolol|carvedilol|labetalol/i,
    name: 'Non-selective Beta-Blocker in Asthma',
    reason: 'non-selective beta-blocker prescribed with documented asthma — potential risk of inducing bronchospasm.',
    severity: 'High',
  },
  {
    conditionPattern: /heart failure|congestive heart failure|chf/i,
    medicationPattern: /diltiazem|verapamil/i,
    name: 'Non-Dihydropyridine CCB in Heart Failure',
    reason: 'prescribed with documented heart failure — potential negative inotropic exacerbation.',
    severity: 'Moderate',
  },
];

/**
 * Evaluates a newly-prescribed medication:
 * 1. 2-Drug Interactions across active medications
 * 2. Allergy contraindications against patient's allergies
 * 3. Chronic disease contraindications against patient's medical history
 */
async function evaluateMedicationSafety(newMedication, activeMedications, patient, actingUser) {
  const created = [];
  const medName = newMedication.medication.trim();
  const newNameLower = medName.toLowerCase();

  // 1. Two-drug interactions
  const rules = await ClinicalRule.find({ type: 'medication_interaction', active: true });
  const activeNames = (activeMedications || [])
    .filter((m) => String(m._id) !== String(newMedication._id))
    .map((m) => m.medication.trim().toLowerCase());

  for (const rule of rules) {
    const [drugA, drugB] = rule.field.split('|').map((s) => s.trim().toLowerCase());
    if (!drugA || !drugB) continue;

    const matches =
      (newNameLower === drugA && activeNames.includes(drugB)) ||
      (newNameLower === drugB && activeNames.includes(drugA));

    if (matches) {
      const finding = await findingService.createFinding(
        {
          patient: newMedication.patient,
          finding: rule.message || 'Potential medication interaction — review required.',
          severity: rule.severity,
          reason: `${rule.name}: ${medName} prescribed alongside an active medication in the same interaction pair (${rule.field}).`,
          sourceType: 'Medication',
          sourceModel: 'Medication',
          sourceId: newMedication._id,
          sourceData: { medication: medName, interactsWith: rule.field },
          ruleId: rule._id,
        },
        actingUser
      );
      created.push(finding);
    }
  }

  // 2. Allergy cross-checking
  if (patient && Array.isArray(patient.allergies)) {
    for (const allergy of patient.allergies) {
      if (matchesAllergy(medName, allergy.substance)) {
        const finding = await findingService.createFinding(
          {
            patient: newMedication.patient,
            finding: 'Potential allergy contraindication — requires clinical review.',
            severity: 'High',
            reason: `${medName} matches documented patient allergy: ${allergy.substance} (${allergy.severity} severity${allergy.reaction ? `, reaction: ${allergy.reaction}` : ''}).`,
            sourceType: 'Medication',
            sourceModel: 'Medication',
            sourceId: newMedication._id,
            sourceData: { medication: medName, allergy: allergy.substance, severity: allergy.severity },
          },
          actingUser
        );
        created.push(finding);
      }
    }
  }

  // 3. Chronic disease contraindication checking
  if (patient && Array.isArray(patient.medicalHistory)) {
    for (const item of patient.medicalHistory) {
      const condName = item.condition || '';
      for (const ci of CONTRAINDICATIONS) {
        if (ci.conditionPattern.test(condName) && ci.medicationPattern.test(medName)) {
          const finding = await findingService.createFinding(
            {
              patient: newMedication.patient,
              finding: 'Potential condition-medication contraindication — requires clinical review.',
              severity: ci.severity,
              reason: `${ci.name}: ${medName} ${ci.reason}`,
              sourceType: 'Medication',
              sourceModel: 'Medication',
              sourceId: newMedication._id,
              sourceData: { medication: medName, condition: condName, rule: ci.name },
            },
            actingUser
          );
          created.push(finding);
        }
      }
    }
  }

  return created;
}

// Retain evaluateMedicationInteractions alias for backward compatibility
async function evaluateMedicationInteractions(newMedication, activeMedications, actingUser) {
  return evaluateMedicationSafety(newMedication, activeMedications, null, actingUser);
}

module.exports = {
  evaluateVitals,
  evaluateLabResult,
  evaluateMedicationSafety,
  evaluateMedicationInteractions,
};

