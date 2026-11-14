const User = require('../models/User');
const Assessment = require('../models/Assessment');
const PatientProfile = require('../models/PatientProfile');

const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 });
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch patients.' });
  }
};

const getPatientSummary = async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.patientId, role: 'patient' }).select('-password');
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    const profile = await PatientProfile.findOne({ userId: patient._id });
    const assessments = await Assessment.find({ userId: patient._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('bloodReportId', 'hb rbc mcv hematocrit reportDate');
    res.json({ patient, profile, assessments });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch patient summary.' });
  }
};

module.exports = { getAllPatients, getPatientSummary };
