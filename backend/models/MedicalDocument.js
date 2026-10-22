const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Laboratory', 'Prescription', 'Radiology', 'Clinical Note', 'Discharge Summary', 'Other'],
      required: true,
      index: true,
    },
    date: { type: Date, required: true, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, trim: true, default: '' },
    summary: { type: String, trim: true, default: '' },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    isSynthetic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicalDocumentSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
