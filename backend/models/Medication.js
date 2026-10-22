const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medication: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    frequency: { type: String, required: true, trim: true },
    route: { type: String, enum: ['Oral', 'IV', 'IM', 'Topical', 'Subcutaneous', 'Inhaled', 'Other'], default: 'Oral' },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ['Active', 'Completed', 'Discontinued'], default: 'Active', index: true },
  },
  { timestamps: true }
);

medicationSchema.index({ patient: 1, status: 1 });

module.exports = mongoose.model('Medication', medicationSchema);
