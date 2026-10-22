const mongoose = require('mongoose');

/**
 * Configurable demonstration rules for the clinical decision-support engine.
 * These are transparent, editable thresholds — not a diagnostic model.
 *
 * type "vital": field is a key on Assessment.vitals (e.g. "heartRate")
 * type "lab": field is a lab test name (e.g. "Potassium"); if referenceOverride
 *             is false, the rule engine simply flags out-of-reference-range results.
 * type "medication_interaction": field holds "DrugA|DrugB" (case-insensitive)
 */
const clinicalRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['vital', 'lab', 'medication_interaction'], required: true, index: true },
    field: { type: String, required: true, trim: true },
    operator: { type: String, enum: ['gt', 'gte', 'lt', 'lte', 'eq', 'interaction'], required: true },
    threshold: { type: Number }, // used for vital rules; ignored for lab (reference range) and interaction rules
    severity: { type: String, enum: ['Low', 'Moderate', 'High'], required: true },
    message: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicalRule', clinicalRuleSchema);
