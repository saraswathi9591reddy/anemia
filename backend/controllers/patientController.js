const PatientProfile = require('../models/PatientProfile');

const getProfile = async (req, res) => {
  try {
    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await new PatientProfile({ userId: req.user._id }).save();
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { dateOfBirth, phone, bloodGroup, pregnancyStatus, pregnancyWeek, expectedDeliveryDate, medicalHistory } = req.body;
    const update = { updatedAt: Date.now() };
    if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth;
    if (phone !== undefined) update.phone = phone;
    if (bloodGroup !== undefined) update.bloodGroup = bloodGroup;
    if (pregnancyStatus !== undefined) update.pregnancyStatus = pregnancyStatus;
    if (pregnancyWeek !== undefined) update.pregnancyWeek = pregnancyWeek;
    if (expectedDeliveryDate !== undefined) update.expectedDeliveryDate = expectedDeliveryDate;
    if (medicalHistory !== undefined) update.medicalHistory = medicalHistory;

    const profile = await PatientProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Could not update profile.' });
  }
};

module.exports = { getProfile, updateProfile };
