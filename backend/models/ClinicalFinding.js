const mongoose = require('mongoose');

const clinicalFindingSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    finding: { type: String, required: true, trim: true }, // e.g. "Elevated value detected — requires clinical review."
    severity: { type: String, enum: ['Low', 'Moderate', 'High'], required: true, index: true },
    reason: { type: String, required: true, trim: true }, // human-readable explanation of the triggering rule
    sourceType: { type: String, enum: ['Vital', 'Lab', 'Medication'], required: true },
    sourceModel: { type: String, enum: ['Assessment', 'LaboratoryResult', 'Medication'], required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'sourceModel' },
    sourceData: { type: mongoose.Schema.Types.Mixed, default: {} }, // snapshot of the value(s) that triggered the rule
    ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicalRule', default: null },
    status: { type: String, enum: ['Open', 'Reviewed', 'Resolved'], default: 'Open', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNotes: { type: String, trim: true, default: '' },
  },
  { timestamps: { createdAt: 'createdDate', updatedAt: true } }
);

clinicalFindingSchema.index({ patient: 1, status: 1, createdDate: -1 });

module.exports = mongoose.model('ClinicalFinding', clinicalFindingSchema);
