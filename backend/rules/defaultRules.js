/**
 * Default set of transparent, configurable demonstration rules loaded by
 * the seed script. Administrators can edit/disable these from Settings
 * (ClinicalRule collection) without touching code.
 */
module.exports = [
  // --- Vital sign rules ---
  { name: 'Tachycardia threshold', type: 'vital', field: 'heartRate', operator: 'gt', threshold: 120, severity: 'High', message: 'Elevated heart rate detected — requires clinical review.', description: 'Heart rate above 120 bpm.' },
  { name: 'Bradycardia threshold', type: 'vital', field: 'heartRate', operator: 'lt', threshold: 50, severity: 'Moderate', message: 'Low heart rate detected — requires clinical review.', description: 'Heart rate below 50 bpm.' },
  { name: 'Fever threshold', type: 'vital', field: 'temperatureC', operator: 'gt', threshold: 38.5, severity: 'Moderate', message: 'Elevated temperature detected — requires clinical review.', description: 'Temperature above 38.5°C.' },
  { name: 'Hypotension threshold', type: 'vital', field: 'systolicBP', operator: 'lt', threshold: 90, severity: 'High', message: 'Low blood pressure detected — requires clinical review.', description: 'Systolic BP below 90 mmHg.' },
  { name: 'Hypertension threshold', type: 'vital', field: 'systolicBP', operator: 'gt', threshold: 160, severity: 'Moderate', message: 'Elevated blood pressure detected — requires clinical review.', description: 'Systolic BP above 160 mmHg.' },
  { name: 'Low oxygen saturation threshold', type: 'vital', field: 'oxygenSaturation', operator: 'lt', threshold: 92, severity: 'High', message: 'Low oxygen saturation detected — requires clinical review.', description: 'SpO2 below 92%.' },
  { name: 'Elevated respiratory rate threshold', type: 'vital', field: 'respiratoryRate', operator: 'gt', threshold: 24, severity: 'Moderate', message: 'Elevated respiratory rate detected — requires clinical review.', description: 'Respiratory rate above 24/min.' },

  // --- Lab rules (in addition to automatic reference-range checks) ---
  { name: 'Critical potassium threshold', type: 'lab', field: 'Potassium', operator: 'gt', threshold: 6.0, severity: 'High', message: 'Critical lab value detected — requires urgent clinical review.', description: 'Potassium above 6.0 mmol/L.' },
  { name: 'Critical glucose threshold', type: 'lab', field: 'Glucose (Fasting)', operator: 'gt', threshold: 250, severity: 'High', message: 'Critical lab value detected — requires urgent clinical review.', description: 'Fasting glucose above 250 mg/dL.' },
  { name: 'Low hemoglobin threshold', type: 'lab', field: 'Hemoglobin', operator: 'lt', threshold: 8.0, severity: 'High', message: 'Critical lab value detected — requires urgent clinical review.', description: 'Hemoglobin below 8.0 g/dL.' },

  // --- Medication interaction rules (demonstration only, not exhaustive) ---
  { name: 'Anticoagulant + antiplatelet interaction', type: 'medication_interaction', field: 'Warfarin|Aspirin', operator: 'interaction', threshold: 0, severity: 'High', message: 'Potential medication safety concern — review required.', description: 'Concurrent anticoagulant and antiplatelet therapy raises bleeding risk.' },
  { name: 'ACE inhibitor + potassium-sparing diuretic interaction', type: 'medication_interaction', field: 'Lisinopril|Spironolactone', operator: 'interaction', threshold: 0, severity: 'Moderate', message: 'Potential medication safety concern — review required.', description: 'Combined use may raise serum potassium.' },
  { name: 'Sedative + opioid interaction', type: 'medication_interaction', field: 'Lorazepam|Morphine', operator: 'interaction', threshold: 0, severity: 'High', message: 'Potential medication safety concern — review required.', description: 'Combined CNS depressants raise respiratory depression risk.' },
];
