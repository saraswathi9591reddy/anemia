const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  phone: { type: String, trim: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], default: '' },
  pregnancyStatus: { type: Boolean, default: true },
  pregnancyWeek: { type: Number, min: 1, max: 42 },
  expectedDeliveryDate: { type: Date },
  medicalHistory: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
