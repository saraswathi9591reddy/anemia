import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Activity, FileText, Plus, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PageLayout from './PageLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const categoryLabel = {
  no_anemia: 'No Anemia',
  mild_anemia: 'Mild Anemia',
  moderate_anemia: 'Moderate Anemia',
  severe_anemia: 'Severe Anemia',
  insufficient_data: 'Insufficient Data',
};

const categoryDotClass = {
  no_anemia: 'dot-green',
  mild_anemia: 'dot-yellow',
  moderate_anemia: 'dot-orange',
  severe_anemia: 'dot-red',
  insufficient_data: 'dot-gray',
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [reports, setReports] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, rRes, pRes] = await Promise.all([
          api.get('/assessments'),
          api.get('/reports'),
          api.get('/patient/profile'),
        ]);
        setAssessments(aRes.assessments || []);
        setReports(rRes.reports || []);
        setProfile(pRes.profile || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latestAssessment = assessments[0];
  const hbTrend = assessments
    .filter(a => a.hbValue)
    .slice(0, 8)
    .reverse()
    .map((a, i) => ({
      name: `#${i + 1}`,
      hb: a.hbValue,
      date: new Date(a.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    }));

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <PageLayout title="Dashboard" activePath="/dashboard" description="Your pregnancy anemia screening overview">
      {loading ? (
        <div className="loading-center"><div className="spinner" /><p>Loading your data...</p></div>
      ) : (
        <>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}><AlertCircle size={16} />{error}</div>}

          {/* Welcome banner */}
          <div style={{ background: 'linear-gradient(135deg, #C0392B, #E74C3C)', borderRadius: 16, padding: '28px 32px', marginBottom: 28, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ opacity: 0.85, fontSize: 14, marginBottom: 4 }}>{greet()},</p>
              <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{user?.name}</h2>
              <p style={{ opacity: 0.85, fontSize: 14 }}>
                {profile?.pregnancyWeek ? `Week ${profile.pregnancyWeek} of pregnancy` : 'Welcome to your AnemiaAI dashboard'}
              </p>
            </div>
            <img src="/logo.png" alt="" style={{ width: 80, height: 80, objectFit: 'contain', opacity: 0.9 }} />
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            <div className="stat-card">
              <div className="stat-icon red"><Droplet size={22} /></div>
              <div className="stat-info">
                <strong>{latestAssessment?.hbValue ?? '—'}</strong>
                <span>Latest Hb (g/dL)</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon teal"><Activity size={22} /></div>
              <div className="stat-info">
                <strong>{assessments.length}</strong>
                <span>Total Screenings</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><FileText size={22} /></div>
              <div className="stat-info">
                <strong>{reports.length}</strong>
                <span>Blood Reports</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><Calendar size={22} /></div>
              <div className="stat-info">
                <strong>{profile?.pregnancyWeek ?? '—'}</strong>
                <span>Pregnancy Week</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {/* Latest result */}
            <div className="section-card">
              <div className="section-header">
                <h2 style={{ fontSize: 16 }}><Droplet size={18} /> Latest Screening</h2>
                <button className="btn-sm btn-sm-primary" onClick={() => navigate('/cbc-analysis')}>
                  <Plus size={14} /> New
                </button>
              </div>
              {latestAssessment ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div className={`report-dot ${categoryDotClass[latestAssessment.screeningCategory] || 'dot-gray'}`} style={{ width: 14, height: 14 }} />
                    <strong style={{ fontSize: 18 }}>{categoryLabel[latestAssessment.screeningCategory] || 'Unknown'}</strong>
                  </div>
                  {latestAssessment.hbValue && <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Hb: {latestAssessment.hbValue} g/dL</p>}
                  <p style={{ fontSize: 13, color: '#9CA3AF' }}>{new Date(latestAssessment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p style={{ fontSize: 12, color: '#BDC3C7', marginTop: 4 }}>Based on {latestAssessment.guidelineUsed}</p>
                  <button className="btn-sm btn-sm-outline" style={{ marginTop: 14 }} onClick={() => navigate(`/ai-analysis/${latestAssessment._id}`)}>
                    View Details
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <Droplet size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>No screenings yet</p>
                  <button className="btn-sm btn-sm-primary" style={{ marginTop: 12 }} onClick={() => navigate('/cbc-analysis')}>
                    Start First Screening
                  </button>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="section-card">
              <h2 style={{ fontSize: 16, marginBottom: 16 }}><Activity size={18} /> Quick Actions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Upload CBC Report', sub: 'Image or PDF with OCR extraction', path: '/cbc-analysis', icon: Droplet },
                  { label: 'Symptom Assessment', sub: 'Answer 8 key symptom questions', path: '/health-check', icon: Activity },
                  { label: 'View All Reports', sub: 'History & downloadable PDFs', path: '/reports', icon: FileText },
                  { label: 'Nutrition Guide', sub: 'Iron-rich foods & meal tips', path: '/care-plan', icon: TrendingUp },
                ].map(({ label, sub, path, icon: Icon }) => (
                  <button key={path} onClick={() => navigate(path)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', border: '1px solid #E5D4CE', borderRadius: 10, background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#C0392B'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E5D4CE'}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FDE8E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#C0392B' }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hb Trend Chart */}
          {hbTrend.length > 1 && (
            <div className="section-card">
              <h2 style={{ fontSize: 16, marginBottom: 4 }}><TrendingUp size={18} /> Haemoglobin Trend</h2>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>WHO threshold: ≥ 11.0 g/dL for pregnant women</p>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hbTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5E8E0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[5, 15]} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v} g/dL`, 'Haemoglobin']} />
                    <ReferenceLine y={11} stroke="#27AE60" strokeDasharray="4 4" label={{ value: 'Normal ≥11', fill: '#27AE60', fontSize: 11 }} />
                    <ReferenceLine y={7} stroke="#C0392B" strokeDasharray="4 4" label={{ value: 'Severe <7', fill: '#C0392B', fontSize: 11 }} />
                    <Line type="monotone" dataKey="hb" stroke="#C0392B" strokeWidth={2.5} dot={{ r: 5, fill: '#C0392B' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent assessments */}
          {assessments.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 style={{ fontSize: 16 }}><FileText size={18} /> Recent Screenings</h2>
                <button className="btn-sm btn-sm-outline" onClick={() => navigate('/reports')}>View All</button>
              </div>
              <div className="report-list">
                {assessments.slice(0, 5).map(a => (
                  <div key={a._id} className="report-item">
                    <div className="report-item-left">
                      <div className={`report-dot ${categoryDotClass[a.screeningCategory] || 'dot-gray'}`} />
                      <div>
                        <strong>{categoryLabel[a.screeningCategory] || 'Unknown'}</strong>
                        <small>{a.hbValue ? `Hb: ${a.hbValue} g/dL • ` : ''}{new Date(a.createdAt).toLocaleDateString('en-IN')}</small>
                      </div>
                    </div>
                    <button className="btn-sm btn-sm-outline" onClick={() => navigate(`/ai-analysis/${a._id}`)}>View</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}

export default Dashboard;
