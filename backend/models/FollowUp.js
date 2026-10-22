const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    reason: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true, index: true },
    assignedClinician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Scheduled', 'Due', 'Completed', 'Cancelled'], default: 'Scheduled', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

followUpSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
