const mongoose = require('mongoose');

const bloodReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hb: { type: Number },
  rbc: { type: Number },
  mcv: { type: Number },
  mch: { type: Number },
  mchc: { type: Number },
  hematocrit: { type: Number },
  rdw: { type: Number },
  ferritin: { type: Number },
  reportDate: { type: Date, default: Date.now },
  uploadedFileName: { type: String, default: '' },
  ocrExtracted: { type: Boolean, default: false },
  ocrConfirmed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BloodReport', bloodReportSchema);
