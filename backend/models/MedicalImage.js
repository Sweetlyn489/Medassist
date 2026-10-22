const mongoose = require('mongoose');

const medicalImageSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    title: { type: String, required: true, trim: true },
    modality: { type: String, enum: ['X-Ray', 'ECG', 'MRI', 'Ultrasound', 'Dermoscopy', 'CT', 'Other'], required: true },
    bodySite: { type: String, trim: true, default: '' },
    acquisitionDate: { type: Date, required: true, default: Date.now },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    indication: { type: String, trim: true, default: '' },
    findings: { type: String, trim: true, default: '' },
    impression: { type: String, trim: true, default: '' },
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSynthetic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicalImageSchema.index({ patient: 1, acquisitionDate: -1 });

module.exports = mongoose.model('MedicalImage', medicalImageSchema);
