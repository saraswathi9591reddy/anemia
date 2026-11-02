import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import PageLayout from './PageLayout';
import api from '../api/client';

const SYMPTOMS = [
  { key: 'fatigue', label: 'Fatigue or Weakness', desc: 'Do you feel unusually tired, weak, or lacking energy?' },
  { key: 'breathlessness', label: 'Shortness of Breath', desc: 'Do you feel breathless during normal activities like walking?' },
  { key: 'dizziness', label: 'Dizziness or Lightheadedness', desc: 'Do you feel dizzy, lightheaded, or like you might faint?' },
  { key: 'pale_skin', label: 'Pale Skin or Gums', desc: 'Have others noticed your skin, lips, or gums appear paler than usual?' },
  { key: 'rapid_heartbeat', label: 'Rapid or Irregular Heartbeat', desc: 'Do you notice your heart beating faster or irregularly at rest?' },
  { key: 'headache', label: 'Frequent Headaches', desc: 'Are you experiencing headaches more often than usual?' },
  { key: 'cold_hands', label: 'Cold Hands or Feet', desc: 'Do your hands and feet feel cold even in warm weather?' },
  { key: 'chest_pain', label: 'Chest Pain', desc: 'Do you have any chest pain or tightness? (Emergency symptom)' },
];

const EMERGENCY_KEYS = ['chest_pain', 'breathlessness'];

function HealthCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = location.state?.reportId || null;

  const [answers, setAnswers] = useState({});
  const [pregnancyWeek, setPregnancyWeek] = useState('');
  const [step, setStep] = useState(0); // 0 = intro, 1..N = symptoms, N+1 = pw, N+2 = submitting
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = SYMPTOMS.length + 1; // symptoms + pregnancy week
  const isIntro = step === 0;
  const isPregnancyWeek = step === SYMPTOMS.length + 1;
  const symptomIndex = step - 1; // which symptom (0-based)
  const currentSymptom = !isIntro && !isPregnancyWeek ? SYMPTOMS[symptomIndex] : null;

  const hasEmergency = EMERGENCY_KEYS.some(k => answers[k] === 'yes');

  const progress = step === 0 ? 0 : Math.round((step / (totalSteps + 1)) * 100);

  const handleAnswer = (key, value) => {
    setAnswers(a => ({ ...a, [key]: value }));
  };

  const handleNext = () => {
    if (currentSymptom && !answers[currentSymptom.key]) { setError('Please select an answer.'); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const symptoms = SYMPTOMS.map(s => ({ symptom: s.key, answer: answers[s.key] || 'unknown' }));
      const body = { symptoms, pregnancyWeek: pregnancyWeek ? parseInt(pregnancyWeek) : undefined };
      if (reportId) body.bloodReportId = reportId;
      const data = await api.post('/assessments', body);
      navigate(`/ai-analysis/${data.assessment._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit assessment.');
      setSubmitting(false);
    }
  };

  const optionClass = (key, val) => {
    if (answers[key] !== val) return 'symptom-option';
    if (val === 'yes') return 'symptom-option selected-yes';
    if (val === 'no') return 'symptom-option selected-no';
    return 'symptom-option selected-unknown';
  };

  return (
    <PageLayout title="Symptom Assessment" activePath="/health-check" description="Answer questions about your symptoms for a complete screening">
      {/* Progress */}
      {!isIntro && (
        <div className="symptom-progress" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#6B7280' }}>
            <span>Step {step} of {totalSteps}</span>
            <span>{progress}% complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Emergency alert */}
      {hasEmergency && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />
          <strong>Emergency symptoms reported.</strong> Please seek immediate medical attention. Do not rely on this tool alone.
        </div>
      )}

      {/* Intro */}
      {isIntro && (
        <div className="section-card" style={{ maxWidth: 600 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, background: '#FDE8E6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#C0392B' }}>
              <Activity size={32} />
            </div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Symptom Assessment</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.6 }}>
              Answer {SYMPTOMS.length} short questions about your current symptoms.
              This takes about 2–3 minutes and helps improve your anemia screening accuracy.
            </p>
          </div>

          {!reportId && (
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>
              <AlertTriangle size={16} />
              You can complete symptoms without a CBC report. For a full screening, upload CBC values first.
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-submit" onClick={() => setStep(1)}>
              Start Assessment
            </button>
            <button onClick={() => navigate('/cbc-analysis')} style={{ padding: '12px 20px', background: 'none', border: '2px solid #E5D4CE', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
              Upload CBC First
            </button>
          </div>
        </div>
      )}

      {/* Symptom question */}
      {currentSymptom && (
        <div className="section-card" style={{ maxWidth: 600 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Question {step} of {SYMPTOMS.length}</p>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>{currentSymptom.label}</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.6 }}>{currentSymptom.desc}</p>
            {EMERGENCY_KEYS.includes(currentSymptom.key) && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#FDE8E6', borderRadius: 8, fontSize: 13, color: '#C0392B' }}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
                Emergency symptom — answer carefully
              </div>
            )}
          </div>

          <div className="symptom-options">
            {[['yes', 'Yes'], ['no', 'No'], ['unknown', 'Not Sure']].map(([val, label]) => (
              <button key={val} className={optionClass(currentSymptom.key, val)} onClick={() => handleAnswer(currentSymptom.key, val)}>
                {label}
              </button>
            ))}
          </div>

          {error && <p style={{ color: '#C0392B', fontSize: 13, marginTop: 10 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={() => { setStep(s => s - 1); setError(''); }} style={{ padding: '11px 20px', background: 'none', border: '2px solid #E5D4CE', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn-submit" style={{ width: 'auto', padding: '11px 28px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleNext} disabled={!answers[currentSymptom.key]}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Pregnancy week */}
      {isPregnancyWeek && (
        <div className="section-card" style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Pregnancy Week</h2>
          <p style={{ color: '#6B7280', marginBottom: 20 }}>Enter your current pregnancy week (optional, but helps determine trimester).</p>

          <div className="form-group" style={{ maxWidth: 240 }}>
            <label>Week of Pregnancy (1–42)</label>
            <input type="number" min="1" max="42" placeholder="e.g. 24" value={pregnancyWeek} onChange={e => setPregnancyWeek(e.target.value)} />
          </div>

          {error && <div className="alert alert-error"><AlertTriangle size={16} />{error}</div>}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={() => setStep(s => s - 1)} style={{ padding: '11px 20px', background: 'none', border: '2px solid #E5D4CE', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <button className="btn-submit" style={{ width: 'auto', padding: '11px 28px', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Analyzing...' : <><span>Get Screening Result</span><ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default HealthCheck;
