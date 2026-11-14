import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, AlertTriangle, CheckCircle, Activity, FileText, ChevronLeft, Info, Plus } from 'lucide-react';
import PageLayout from './PageLayout';
import api from '../api/client';

const CATEGORY_CONFIG = {
  no_anemia: {
    label: 'No Anemia Detected',
    description: 'Your haemoglobin level is within the normal range for pregnancy (≥ 11.0 g/dL per WHO 2011 guidelines).',
    className: 'no_anemia',
    badgeClass: 'badge-green',
    icon: CheckCircle,
  },
  mild_anemia: {
    label: 'Mild Anemia',
    description: 'Your haemoglobin is between 10.0–10.9 g/dL. Mild anemia during pregnancy should be discussed with your doctor.',
    className: 'mild_anemia',
    badgeClass: 'badge-yellow',
    icon: AlertTriangle,
  },
  moderate_anemia: {
    label: 'Moderate Anemia',
    description: 'Your haemoglobin is between 7.0–9.9 g/dL. Moderate anemia requires prompt medical attention.',
    className: 'moderate_anemia',
    badgeClass: 'badge-orange',
    icon: AlertTriangle,
  },
  severe_anemia: {
    label: 'Severe Anemia',
    description: 'Your haemoglobin is below 7.0 g/dL. Severe anemia is a medical emergency. Seek immediate care.',
    className: 'severe_anemia',
    badgeClass: 'badge-red',
    icon: AlertTriangle,
  },
  insufficient_data: {
    label: 'Insufficient Data',
    description: 'Haemoglobin value was not provided. Upload a CBC report with Hb value for a complete assessment.',
    className: 'insufficient_data',
    badgeClass: 'badge-blue',
    icon: Info,
  },
};

function AIAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          const data = await api.get(`/assessments/${id}`);
          setAssessment(data.assessment);
        } else {
          const data = await api.get('/assessments');
          if (data.assessments && data.assessments.length > 0) {
            setAssessment(data.assessments[0]);
          }
        }
      } catch (err) {
        setError(err.message || 'Could not load assessment.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownload = async () => {
    if (!assessment) return;
    setDownloading(true);
    try {
      const token = sessionStorage.getItem('anemiaai_token');
      const res = await fetch(`/api/download/assessment/${assessment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anemiaai-report-${assessment._id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Screening Result" activePath="/ai-analysis">
        <div className="loading-center">
          <div className="spinner" />
          <p>Loading result...</p>
        </div>
      </PageLayout>
    );
  }

  // Friendly Empty State when the patient has not done any screening yet
  if (!assessment) {
    return (
      <PageLayout
        title="Screening Result"
        activePath="/ai-analysis"
        description="Clinical rule-based preliminary screening — WHO 2011 guidelines"
      >
        <div className="section-card" style={{ maxWidth: 640, margin: '20px auto', textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#FDE8E6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#C0392B' }}>
            <Activity size={32} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, justifyContent: 'center' }}>No Screening Done Yet</h2>
          <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            You haven't uploaded a blood report or completed a symptom check yet. 
            Upload your Complete Blood Count (CBC) report or enter your values to generate your preliminary anemia screening.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontSize: 15 }}
              onClick={() => navigate('/cbc-analysis')}
            >
              <Plus size={18} />
              Start CBC Screening
            </button>
            <button
              className="btn-outline"
              style={{ padding: '12px 24px', fontSize: 15 }}
              onClick={() => navigate('/health-check')}
            >
              Check Symptoms Only
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const config = CATEGORY_CONFIG[assessment.screeningCategory] || CATEGORY_CONFIG.insufficient_data;
  const Icon = config.icon;
  const report = assessment.bloodReportId;

  const yesSymptoms = assessment.symptoms?.filter(s => s.answer === 'yes') || [];
  const noSymptoms = assessment.symptoms?.filter(s => s.answer === 'no') || [];

  return (
    <PageLayout title="Screening Result" activePath="/ai-analysis" description="Clinical rule-based preliminary screening — WHO 2011 guidelines">
      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}><AlertTriangle size={16} />{error}</div>}

      {assessment.emergencyFlag && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} />
          <div>
            <strong>Emergency symptoms reported.</strong> Seek immediate medical attention.
            Do not rely on this screening tool during a medical emergency.
          </div>
        </div>
      )}

      {/* Result banner */}
      <div className={`result-banner ${config.className}`} style={{ marginBottom: 24 }}>
        <div className="result-banner-icon">
          <Icon size={28} />
        </div>
        <div>
          <p style={{ fontSize: 13, marginBottom: 4, opacity: 0.7 }}>Preliminary Screening Result</p>
          <h2>{config.label}</h2>
          <p style={{ fontSize: 15, marginTop: 6 }}>{config.description}</p>
          {assessment.hbValue && (
            <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className={`result-badge ${config.badgeClass}`}>
                Hb: {assessment.hbValue} g/dL
              </span>
              <span className="result-badge badge-blue">
                {assessment.guidelineUsed}
              </span>
              {assessment.trimester && (
                <span className="result-badge badge-blue" style={{ textTransform: 'capitalize' }}>
                  {assessment.trimester} trimester
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* CBC Values */}
        {report && (
          <div className="section-card">
            <h2 style={{ fontSize: 16, marginBottom: 16 }}><FileText size={18} /> CBC Report Values</h2>
            <div className="cbc-result-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {[
                { key: 'hb', label: 'Haemoglobin', unit: 'g/dL' },
                { key: 'rbc', label: 'RBC', unit: 'M/µL' },
                { key: 'mcv', label: 'MCV', unit: 'fL' },
                { key: 'mch', label: 'MCH', unit: 'pg' },
                { key: 'mchc', label: 'MCHC', unit: 'g/dL' },
                { key: 'hematocrit', label: 'Hematocrit', unit: '%' },
                { key: 'rdw', label: 'RDW', unit: '%' },
                { key: 'ferritin', label: 'Ferritin', unit: 'ng/mL' },
              ].filter(f => report[f.key]).map(({ key, label, unit }) => (
                <div key={key} className="cbc-result-item">
                  <strong>{label}</strong>
                  <span>{report[key]}</span>
                  <small>{unit}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Symptoms */}
        <div className="section-card">
          <h2 style={{ fontSize: 16, marginBottom: 16 }}><Activity size={18} /> Reported Symptoms</h2>
          {yesSymptoms.length > 0 ? (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#C0392B', marginBottom: 8 }}>Present:</p>
              {yesSymptoms.map(s => (
                <div key={s.symptom} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 6, color: '#C0392B' }}>
                  <AlertTriangle size={14} />
                  {s.symptom.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 12 }}>No symptoms reported as present.</p>}
          {noSymptoms.length > 0 && (
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#27AE60', marginBottom: 8 }}>Absent:</p>
              {noSymptoms.map(s => (
                <div key={s.symptom} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 6, color: '#27AE60' }}>
                  <CheckCircle size={14} />
                  {s.symptom.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Factors */}
      {assessment.factors?.length > 0 && (
        <div className="section-card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}><Info size={18} /> Assessment Factors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {assessment.factors.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: '#F8F9FA', borderRadius: 8, fontSize: 14 }}>
                <span style={{ color: '#C0392B', fontWeight: 700, flexShrink: 0 }}>•</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {assessment.recommendations?.length > 0 && (
        <div className="section-card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}><CheckCircle size={18} /> Recommendations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {assessment.recommendations.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: '#F0FFF4', borderRadius: 10, fontSize: 14, color: '#1a4731', border: '1px solid #A9DFBF' }}>
                <CheckCircle size={16} style={{ color: '#27AE60', flexShrink: 0, marginTop: 1 }} />
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing data */}
      {assessment.missingData?.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          <Info size={16} />
          <div>
            <strong>Missing data:</strong> {assessment.missingData.join(', ')}.
            Provide complete CBC values for a more accurate screening result.
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ padding: '16px 20px', background: '#EBF5FB', borderRadius: 12, fontSize: 13, color: '#1A5276', border: '1px solid #A9CCE3', marginBottom: 24 }}>
        <strong>Important Disclaimer:</strong> This is a <strong>preliminary clinical rule-based screening</strong> using WHO 2011 haemoglobin thresholds.
        It is NOT a medical diagnosis. Always consult a qualified healthcare professional for diagnosis and treatment.
        Assessment date: {new Date(assessment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <button className="btn-sm btn-sm-primary" style={{ padding: '12px 24px', fontSize: 14 }} onClick={handleDownload} disabled={downloading}>
          <Download size={16} />
          {downloading ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
        <button className="btn-sm btn-sm-outline" style={{ padding: '12px 24px', fontSize: 14 }} onClick={() => navigate('/cbc-analysis')}>
          New Screening
        </button>
        <button className="btn-sm btn-sm-teal" style={{ padding: '12px 24px', fontSize: 14 }} onClick={() => navigate('/reports')}>
          View All Reports
        </button>
        <button style={{ padding: '12px 20px', background: 'none', border: '2px solid #E5D4CE', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }} onClick={() => navigate('/dashboard')}>
          <ChevronLeft size={16} /> Dashboard
        </button>
      </div>
    </PageLayout>
  );
}

export default AIAnalysis;
