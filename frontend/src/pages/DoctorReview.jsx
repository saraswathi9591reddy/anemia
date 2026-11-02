import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Droplet, Activity, AlertCircle } from 'lucide-react';
import PageLayout from './PageLayout';
import api from '../api/client';

const CATEGORY_LABEL = {
  no_anemia: 'No Anemia', mild_anemia: 'Mild Anemia',
  moderate_anemia: 'Moderate Anemia', severe_anemia: 'Severe Anemia', insufficient_data: 'Insufficient Data',
};
const DOT_CLASS = {
  no_anemia: 'dot-green', mild_anemia: 'dot-yellow',
  moderate_anemia: 'dot-orange', severe_anemia: 'dot-red', insufficient_data: 'dot-gray',
};

function DoctorReview() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/doctor/patients/${patientId}`)
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [patientId]);

  return (
    <PageLayout title="Patient Record" activePath="/doctor-patients" description="Screening history and CBC data">
      <button onClick={() => navigate('/doctor-dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#1A5276', fontWeight: 600, marginBottom: 24, fontSize: 14 }}>
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      {loading ? (
        <div className="loading-center"><div className="spinner" /><p>Loading patient data...</p></div>
      ) : error ? (
        <div className="alert alert-error"><AlertCircle size={16} />{error}</div>
      ) : data ? (
        <>
          <div className="section-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>{data.patient.name}</h2>
                <p style={{ color: '#6B7280' }}>{data.patient.email}</p>
                {data.profile?.bloodGroup && <span style={{ display: 'inline-block', marginTop: 6, padding: '4px 12px', background: '#FDE8E6', color: '#C0392B', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Blood Group: {data.profile.bloodGroup}</span>}
                {data.profile?.pregnancyWeek && <span style={{ display: 'inline-block', marginTop: 6, marginLeft: 8, padding: '4px 12px', background: '#D6EAF8', color: '#1A5276', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Week {data.profile.pregnancyWeek}</span>}
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2 style={{ fontSize: 18, marginBottom: 20 }}><Activity size={20} /> Screening History</h2>
            {data.assessments?.length === 0 ? (
              <div className="empty-state"><Activity size={44} /><p>No screenings recorded yet.</p></div>
            ) : (
              <div className="report-list">
                {data.assessments.map(a => (
                  <div key={a._id} className="report-item">
                    <div className="report-item-left">
                      <div className={`report-dot ${DOT_CLASS[a.screeningCategory] || 'dot-gray'}`} />
                      <div>
                        <strong>{CATEGORY_LABEL[a.screeningCategory] || 'Unknown'}</strong>
                        <small>
                          {a.bloodReportId?.hb ? `Hb: ${a.bloodReportId.hb} g/dL • ` : ''}
                          {new Date(a.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          {a.pregnancyWeek ? ` • Week ${a.pregnancyWeek}` : ''}
                        </small>
                      </div>
                    </div>
                    <span className={`result-badge ${DOT_CLASS[a.screeningCategory] === 'dot-green' ? 'badge-green' : DOT_CLASS[a.screeningCategory] === 'dot-red' ? 'badge-red' : DOT_CLASS[a.screeningCategory] === 'dot-yellow' ? 'badge-yellow' : 'badge-blue'}`}>
                      {CATEGORY_LABEL[a.screeningCategory]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </PageLayout>
  );
}

export default DoctorReview;
