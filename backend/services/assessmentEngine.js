/**
 * AnemiaAI Clinical Assessment Engine
 * WHO 2011 Guidelines: WHO/NMH/NHD/MNM/11.1
 *
 * Haemoglobin thresholds for pregnant women (all trimesters):
 *   No Anemia:       Hb >= 11.0 g/dL
 *   Mild Anemia:     Hb 10.0 - 10.9 g/dL
 *   Moderate Anemia: Hb  7.0 - 9.9  g/dL
 *   Severe Anemia:   Hb <  7.0 g/dL
 */

const EMERGENCY_SYMPTOMS = ['chest_pain', 'breathlessness'];

function getTrimester(week) {
  if (!week) return '';
  if (week <= 12) return 'first';
  if (week <= 26) return 'second';
  return 'third';
}

function classifyHb(hb) {
  if (hb === null || hb === undefined || isNaN(Number(hb))) return null;
  const v = Number(hb);
  if (v < 7.0)  return 'severe_anemia';
  if (v < 10.0) return 'moderate_anemia';
  if (v < 11.0) return 'mild_anemia';
  return 'no_anemia';
}

function buildRecommendations(category, symptoms) {
  const recs = [];
  const emergencyYes = symptoms && symptoms.some(s => s.answer === 'yes' && EMERGENCY_SYMPTOMS.includes(s.symptom));

  if (emergencyYes) {
    recs.push('EMERGENCY: You reported chest pain or severe breathlessness. Seek emergency medical care immediately — call your hospital or emergency services now.');
  }

  if (category === 'severe_anemia') {
    recs.push('URGENT: Haemoglobin below 7.0 g/dL is severe anemia. Seek immediate medical attention today.');
    recs.push('Severe anemia in pregnancy requires urgent clinical evaluation and may require blood transfusion or IV iron therapy.');
  } else if (category === 'moderate_anemia') {
    recs.push('Your Hb (7.0–9.9 g/dL) indicates moderate anemia. Schedule an urgent appointment with your doctor within 24–48 hours.');
    recs.push('Your doctor may prescribe oral or IV iron therapy. Do not self-medicate.');
    recs.push('Rest adequately and avoid strenuous activity until evaluated.');
  } else if (category === 'mild_anemia') {
    recs.push('Your Hb (10.0–10.9 g/dL) indicates mild anemia. Discuss iron supplementation at your next prenatal visit.');
    recs.push('Increase iron-rich foods: leafy greens, lentils, fortified cereals, jaggery.');
    recs.push('Take iron-rich foods with vitamin C sources (amla, orange juice) to improve absorption.');
    recs.push('Avoid tea/coffee within 1 hour of iron-rich meals — tannins inhibit iron absorption.');
  } else if (category === 'no_anemia') {
    recs.push('Your haemoglobin is within normal range for pregnancy (≥ 11.0 g/dL per WHO 2011).');
    recs.push('Continue regular prenatal check-ups and maintain a balanced iron-rich diet.');
    recs.push('Recheck haemoglobin levels as advised by your healthcare provider.');
  } else {
    recs.push('Haemoglobin value is missing. Please upload a complete CBC report for anemia classification.');
    recs.push('Without Hb, no definitive screening category can be assigned.');
  }

  recs.push('⚠ This is a preliminary clinical rule-based screening (WHO 2011). It does NOT replace professional medical diagnosis or treatment. Always consult a qualified doctor.');
  return recs;
}

function buildFactors(hb, other, symptoms) {
  const factors = [];
  if (hb !== null && hb !== undefined) {
    factors.push(`Haemoglobin: ${hb} g/dL (WHO 2011 pregnancy threshold: ≥ 11.0 g/dL)`);
  }
  if (other.mcv) {
    const s = other.mcv < 80 ? 'Low — microcytic (possible iron/B12 deficiency)' : other.mcv > 100 ? 'High — macrocytic' : 'Normal range';
    factors.push(`MCV: ${other.mcv} fL — ${s}`);
  }
  if (other.ferritin) {
    const s = other.ferritin < 12 ? 'Low — suggests iron deficiency' : other.ferritin < 30 ? 'Borderline' : 'Normal';
    factors.push(`Ferritin: ${other.ferritin} ng/mL — ${s}`);
  }
  if (other.rdw) {
    const s = other.rdw > 14.5 ? 'Elevated — anisocytosis present' : 'Normal range';
    factors.push(`RDW: ${other.rdw}% — ${s}`);
  }
  const yesSymptoms = (symptoms || []).filter(s => s.answer === 'yes').map(s => s.symptom.replace(/_/g, ' '));
  if (yesSymptoms.length > 0) factors.push(`Reported symptoms: ${yesSymptoms.join(', ')}`);
  return factors;
}

function runAssessment({ hb, mcv, mch, mchc, rdw, ferritin, symptoms, pregnancyWeek }) {
  const missingData = [];
  if (!hb) missingData.push('Haemoglobin (Hb) — required for WHO 2011 classification');

  const hbNum = hb ? Number(hb) : null;
  const hbCategory = classifyHb(hbNum);

  let screeningCategory = hbCategory || 'insufficient_data';
  let emergencyFlag = false;

  const emergencyYes = symptoms && symptoms.some(s => s.answer === 'yes' && EMERGENCY_SYMPTOMS.includes(s.symptom));
  if (emergencyYes) {
    emergencyFlag = true;
    if (screeningCategory === 'insufficient_data' || screeningCategory === 'no_anemia') {
      screeningCategory = 'moderate_anemia';
    }
  }

  const trimester = getTrimester(pregnancyWeek);
  const factors = buildFactors(hbNum, { mcv, mch, mchc, rdw, ferritin }, symptoms);
  const recommendations = buildRecommendations(screeningCategory, symptoms);

  return {
    screeningCategory,
    hbValue: hbNum,
    trimester,
    guidelineUsed: 'WHO 2011 (WHO/NMH/NHD/MNM/11.1)',
    factors,
    recommendations,
    missingData,
    emergencyFlag,
  };
}

module.exports = { runAssessment };

