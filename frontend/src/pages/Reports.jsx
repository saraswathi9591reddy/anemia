import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Droplet, Activity, AlertCircle } from 'lucide-react';
import PageLayout from './PageLayout';
import api from '../api/client';

const CATEGORY_LABEL = {
  no_anemia: 'No Anemia',
  mild_anemia: 'Mild Anemia',
  moderate_anemia: 'Moderate Anemia',
  severe_anemia: 'Severe Anemia',
  insufficient_data: 'Insufficient Data',
};

const DOT_CLASS = {
  no_anemia: 'dot-green',
  mild_anemia: 'dot-yellow',
  moderate_anemia: 'dot-orange',
  severe_anemia: 'dot-red',
  insufficient_data: 'dot-gray',
};

function Reports() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, rRes] = await Promise.all([api.get('/assessments'), api.get('/reports')]);
        setAssessments(aRes.assessments || []);
        setReports(rRes.reports || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const downloadPDF = async (assessmentId) => {
    setDownloading(assessmentId);
    try {
      const token = sessionStorage.getItem('anemiaai_token');
      const res = await fetch(`/api/download/assessment/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anemiaai-report-${assessmentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download error: ' + err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <PageLayout title="Reports & History" activePath="/reports" description="All your CBC reports and screening assessments">
      {loading ? (
        <div className="loading-center"><div className="spinner" /><p>Loading reports...</p></div>
      ) : (
        <>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}><AlertCircle size={16} />{error}</div>}

          {/* Screening assessments */}
          <div className="section-card" style={{ marginBottom: 24 }}>
            <div className="section-header">
              <h2 style={{ fontSize: 18 }}><Activity size={20} /> Screening Assessments</h2>
              <button className="btn-sm btn-sm-primary" onClick={() => navigate('/cbc-analysis')}>+ New Screening</button>
            </div>

            {assessments.length === 0 ? (
              <div className="empty-state">
                <Activity size={44} />
                <p>No screenings yet. Upload a CBC report to get started.</p>
                <button className="btn-sm btn-sm-primary" style={{ marginTop: 12 }} onClick={() => navigate('/cbc-analysis')}>Start Screening</button>
              </div>
            ) : (
              <div className="report-list">
                {assessments.map(a => (
                  <div key={a._id} className="report-item">
                    <div className="report-item-left">
                      <div className={`report-dot ${DOT_CLASS[a.screeningCategory] || 'dot-gray'}`} />
                      <div>
                        <strong>{CATEGORY_LABEL[a.screeningCategory] || 'Unknown'}</strong>
                        <small>
                          {a.hbValue ? `Hb: ${a.hbValue} g/dL • ` : ''}
                          {new Date(a.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          {a.pregnancyWeek ? ` • Week ${a.pregnancyWeek}` : ''}
                        </small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-sm btn-sm-outline" onClick={() => navigate(`/ai-analysis/${a._id}`)}>View</button>
                      <button className="btn-sm btn-sm-primary" onClick={() => downloadPDF(a._id)} disabled={downloading === a._id}>
                        <Download size={13} />
                        {downloading === a._id ? '...' : 'PDF'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blood Reports */}
          <div className="section-card">
            <div className="section-header">
              <h2 style={{ fontSize: 18 }}><Droplet size={20} /> CBC Blood Reports</h2>
            </div>

            {reports.length === 0 ? (
              <div className="empty-state">
                <FileText size={44} />
                <p>No CBC reports uploaded yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Hb (g/dL)</th>
                      <th>RBC</th>
                      <th>MCV</th>
                      <th>Hematocrit</th>
                      <th>Ferritin</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r._id}>
                        <td>{new Date(r.reportDate || r.createdAt).toLocaleDateString('en-IN')}</td>
                        <td><strong style={{ color: r.hb < 7 ? '#C0392B' : r.hb < 11 ? '#E67E22' : '#27AE60' }}>{r.hb ?? '—'}</strong></td>
                        <td>{r.rbc ?? '—'}</td>
                        <td>{r.mcv ?? '—'}</td>
                        <td>{r.hematocrit ?? '—'}</td>
                        <td>{r.ferritin ?? '—'}</td>
                        <td>{r.ocrExtracted ? (r.ocrConfirmed ? '✓ OCR (confirmed)' : 'OCR') : 'Manual'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}

export default Reports;
