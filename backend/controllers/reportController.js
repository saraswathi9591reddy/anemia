const BloodReport = require('../models/BloodReport');

const createReport = async (req, res) => {
  try {
    const { hb, rbc, mcv, mch, mchc, hematocrit, rdw, ferritin, reportDate, ocrExtracted, ocrConfirmed, uploadedFileName } = req.body;

    if (hb === undefined || hb === null || String(hb).trim() === '' || isNaN(parseFloat(hb))) {
      return res.status(400).json({ error: 'Haemoglobin (Hb) value is required and must be a valid number.' });
    }

    const report = new BloodReport({
      userId: req.user._id,
      hb: parseFloat(hb),
      rbc: rbc !== undefined && rbc !== null && rbc !== '' && !isNaN(parseFloat(rbc)) ? parseFloat(rbc) : undefined,
      mcv: mcv !== undefined && mcv !== null && mcv !== '' && !isNaN(parseFloat(mcv)) ? parseFloat(mcv) : undefined,
      mch: mch !== undefined && mch !== null && mch !== '' && !isNaN(parseFloat(mch)) ? parseFloat(mch) : undefined,
      mchc: mchc !== undefined && mchc !== null && mchc !== '' && !isNaN(parseFloat(mchc)) ? parseFloat(mchc) : undefined,
      hematocrit: hematocrit !== undefined && hematocrit !== null && hematocrit !== '' && !isNaN(parseFloat(hematocrit)) ? parseFloat(hematocrit) : undefined,
      rdw: rdw !== undefined && rdw !== null && rdw !== '' && !isNaN(parseFloat(rdw)) ? parseFloat(rdw) : undefined,
      ferritin: ferritin !== undefined && ferritin !== null && ferritin !== '' && !isNaN(parseFloat(ferritin)) ? parseFloat(ferritin) : undefined,
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

