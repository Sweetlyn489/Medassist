const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    temperatureC: { type: Number }, // Celsius
    heartRate: { type: Number }, // bpm
    respiratoryRate: { type: Number }, // breaths/min
    systolicBP: { type: Number }, // mmHg
    diastolicBP: { type: Number }, // mmHg
    oxygenSaturation: { type: Number }, // %
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    clinician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chiefComplaint: { type: String, required: true, trim: true },
    symptoms: { type: [String], default: [] },
    vitals: { type: vitalsSchema, default: () => ({}) },
    clinicalFindingsNotes: { type: String, trim: true, default: '' },
    assessmentNotes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Open', 'Completed'], default: 'Completed', index: true },
  },
  { timestamps: true }
);

assessmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
