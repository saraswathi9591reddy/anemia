const Assessment = require('../models/Assessment');
const BloodReport = require('../models/BloodReport');
const { runAssessment } = require('../services/assessmentEngine');

const createAssessment = async (req, res) => {
  try {
    const { bloodReportId, symptoms, pregnancyWeek } = req.body;

    let hb, mcv, mch, mchc, rdw, ferritin;
    if (bloodReportId) {
      const report = await BloodReport.findOne({ _id: bloodReportId, userId: req.user._id });
      if (report) {
        hb = report.hb;
        mcv = report.mcv;
        mch = report.mch;
        mchc = report.mchc;
        rdw = report.rdw;
        ferritin = report.ferritin;
      }
    }

    const engineResult = runAssessment({ hb, mcv, mch, mchc, rdw, ferritin, symptoms, pregnancyWeek });

    const assessment = new Assessment({
      userId: req.user._id,
      bloodReportId: bloodReportId || undefined,
      symptoms: symptoms || [],
      pregnancyWeek: pregnancyWeek || undefined,
      ...engineResult,
    });
    await assessment.save();
    res.status(201).json({ assessment });
  } catch (err) {
    console.error('Create assessment error:', err);
    res.status(500).json({ error: 'Could not create assessment.' });
  }
};

const getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('bloodReportId', 'hb rbc mcv mch mchc hematocrit rdw ferritin reportDate');
    res.json({ assessments });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch assessments.' });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('bloodReportId', 'hb rbc mcv mch mchc hematocrit rdw ferritin reportDate');
    if (!assessment) return res.status(404).json({ error: 'Assessment not found.' });
    res.json({ assessment });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch assessment.' });
  }
};

module.exports = { createAssessment, getAssessments, getAssessmentById };

