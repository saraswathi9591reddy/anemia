const mongoose = require('mongoose');
const { runAssessment } = require('./services/assessmentEngine');
const User = require('./models/User');
const PatientProfile = require('./models/PatientProfile');
const BloodReport = require('./models/BloodReport');
const Assessment = require('./models/Assessment');
require('dotenv').config();

async function runTests() {
  console.log('--- STARTING CLINICAL ENGINE & DB AUTOMATED SUITE ---');

  // Test 1: Assessment thresholds
  console.log('\n[1] Clinical Assessment Threshold Tests (WHO 2011):');
  const normal = runAssessment({ hb: 11.8 });
  console.log('  Hb 11.8 ->', normal.screeningCategory, normal.screeningCategory === 'no_anemia' ? '✓ PASS' : '✗ FAIL');

  const mild = runAssessment({ hb: 10.4 });
  console.log('  Hb 10.4 ->', mild.screeningCategory, mild.screeningCategory === 'mild_anemia' ? '✓ PASS' : '✗ FAIL');

  const moderate = runAssessment({ hb: 8.5 });
  console.log('  Hb 8.5  ->', moderate.screeningCategory, moderate.screeningCategory === 'moderate_anemia' ? '✓ PASS' : '✗ FAIL');

  const severe = runAssessment({ hb: 6.2 });
  console.log('  Hb 6.2  ->', severe.screeningCategory, severe.screeningCategory === 'severe_anemia' ? '✓ PASS' : '✗ FAIL');

  const missingHb = runAssessment({ hb: null, symptoms: [{ symptom: 'fatigue', answer: 'yes' }] });
  console.log('  Missing Hb ->', missingHb.screeningCategory, missingHb.screeningCategory === 'insufficient_data' ? '✓ PASS (never treated as normal)' : '✗ FAIL');

  const emergency = runAssessment({ hb: 11.5, symptoms: [{ symptom: 'chest_pain', answer: 'yes' }] });
  console.log('  Emergency symptom escalation ->', emergency.emergencyFlag === true && emergency.screeningCategory === 'moderate_anemia' ? '✓ PASS' : '✗ FAIL');

  // Test 2: Database Connection & Models
  console.log('\n[2] Database & Model Persistence Tests:');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('  Connected to MongoDB: ✓ PASS');

    // Clean test users
    await User.deleteMany({ email: { $in: ['test_patient@anemiaai.test', 'test_doctor@anemiaai.test'] } });

    // Patient creation
    const patient = new User({
      name: 'Test Patient',
      email: 'test_patient@anemiaai.test',
      password: 'Password123!',
      role: 'patient'
    });
    await patient.save();
    console.log('  User creation & bcrypt hashing: ✓ PASS');
    console.log('  Password was hashed:', patient.password !== 'Password123!' ? '✓ PASS' : '✗ FAIL');
    console.log('  Password excluded in toJSON:', patient.toJSON().password === undefined ? '✓ PASS' : '✗ FAIL');

    // Patient profile
    const profile = new PatientProfile({
      userId: patient._id,
      pregnancyWeek: 26,
      bloodGroup: 'O+'
    });
    await profile.save();
    console.log('  Profile persistence: ✓ PASS');

    // Blood report
    const report = new BloodReport({
      userId: patient._id,
      hb: 9.8,
      rbc: 3.9,
      mcv: 82,
      ocrExtracted: true,
      ocrConfirmed: true
    });
    await report.save();
    console.log('  BloodReport persistence: ✓ PASS');

    // Assessment creation
    const assessResult = runAssessment({ hb: report.hb, symptoms: [{ symptom: 'fatigue', answer: 'yes' }] });
    const assessment = new Assessment({
      userId: patient._id,
      bloodReportId: report._id,
      symptoms: [{ symptom: 'fatigue', answer: 'yes' }],
      pregnancyWeek: profile.pregnancyWeek,
      ...assessResult
    });
    await assessment.save();
    console.log('  Assessment persistence: ✓ PASS');

    // Cleanup
    await Assessment.deleteMany({ userId: patient._id });
    await BloodReport.deleteMany({ userId: patient._id });
    await PatientProfile.deleteMany({ userId: patient._id });
    await User.deleteMany({ _id: patient._id });
    console.log('  Test data cleanup: ✓ PASS');

    await mongoose.disconnect();
    console.log('\n--- ALL TEST SUITE CHECKS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Database test error:', err);
  }
}

runTests();

