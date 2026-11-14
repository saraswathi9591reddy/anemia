const BloodReport = require('../models/BloodReport');

const createReport = async (req, res) => {
  try {
    const { hb, rbc, mcv, mch, mchc, hematocrit, rdw, ferritin, reportDate, ocrExtracted, ocrConfirmed, uploadedFileName } = req.body;

    const report = new BloodReport({
      userId: req.user._id,
      hb: hb ? parseFloat(hb) : undefined,
      rbc: rbc ? parseFloat(rbc) : undefined,
      mcv: mcv ? parseFloat(mcv) : undefined,
      mch: mch ? parseFloat(mch) : undefined,
      mchc: mchc ? parseFloat(mchc) : undefined,
      hematocrit: hematocrit ? parseFloat(hematocrit) : undefined,
      rdw: rdw ? parseFloat(rdw) : undefined,
      ferritin: ferritin ? parseFloat(ferritin) : undefined,
      reportDate: reportDate || Date.now(),
      uploadedFileName: uploadedFileName || '',
      ocrExtracted: ocrExtracted || false,
      ocrConfirmed: ocrConfirmed || false,
    });
    await report.save();
    res.status(201).json({ report });
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Could not save report.' });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await BloodReport.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch reports.' });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json({ filename: req.file.filename, originalName: req.file.originalname, path: req.file.path });
  } catch (err) {
    res.status(500).json({ error: 'File upload failed.' });
  }
};

module.exports = { createReport, getReports, uploadFile };
