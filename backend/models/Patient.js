const mongoose = require('mongoose');

const allergySchema = new mongoose.Schema(
  {
    substance: { type: String, required: true, trim: true },
    reaction: { type: String, trim: true, default: '' },
    severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], default: 'Mild' },
  },
  { _id: false }
);

const historyItemSchema = new mongoose.Schema(
  {
    condition: { type: String, required: true, trim: true },
    diagnosedYear: { type: Number },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, index: true }, // e.g. P0001
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true, index: true },
    dateOfBirth: { type: Date, required: true, index: true },
    gender: { type: String, enum: ['Female', 'Male', 'Other', 'Undisclosed'], required: true },
    contact: {
      phone: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
    },
    allergies: { type: [allergySchema], default: [] },
    medicalHistory: { type: [historyItemSchema], default: [] },
    lastReviewed: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''], default: '' },
    avatarUrl: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
  },
  { timestamps: true }
);

patientSchema.index({ firstName: 'text', lastName: 'text', patientId: 'text' });

patientSchema.virtual('fullName').get(function getFullName() {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);
