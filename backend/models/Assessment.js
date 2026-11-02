const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodReport' },
  symptoms: [{ symptom: String, answer: String }],
  pregnancyWeek: { type: Number },
  trimester: { type: String, enum: ['first', 'second', 'third', ''], default: '' },
  screeningCategory: {
    type: String,
    enum: ['no_anemia', 'mild_anemia', 'moderate_anemia', 'severe_anemia', 'insufficient_data'],
    default: 'insufficient_data'
  },
  hbValue: { type: Number },
  guidelineUsed: { type: String, default: 'WHO 2011' },
  factors: [String],
  recommendations: [String],
  missingData: [String],
  emergencyFlag: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
