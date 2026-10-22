const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: String, required: true, trim: true }, // e.g. "Potassium"
    result: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    referenceLow: { type: Number, required: true },
    referenceHigh: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Completed', index: true },
  },
  { timestamps: true }
);

labResultSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('LaboratoryResult', labResultSchema);
