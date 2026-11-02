import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Droplet, Search, AlertCircle } from 'lucide-react';
import PageLayout from './PageLayout';
import api from '../api/client';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/doctor/patients')
      .then(d => setPatients(d.patients || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout title="Doctor Dashboard" activePath="/doctor-dashboard" description="View and review your patients' anemia screening history">
      <div className="doctor-banner">
        <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Users size={28} />
        </div>
        <div>
          <h2>Doctor Portal</h2>
          <p>View patient CBC data and anemia screening results. All screenings are based on WHO 2011 clinical guidelines.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon teal"><Users size={22} /></div>
          <div className="stat-info"><strong>{patients.length}</strong><span>Total Patients</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Activity size={22} /></div>
          <div className="stat-info"><strong>WHO 2011</strong><span>Guideline Used</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Droplet size={22} /></div>
          <div className="stat-info"><strong>≥ 11.0</strong><span>Normal Hb (g/dL)</span></div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18 }}><Users size={20} /> Patient List</h2>
        </div>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 14px 11px 40px', border: '2px solid #E5D4CE', borderRadius: 10, fontSize: 14 }}
          />
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /><p>Loading patients...</p></div>
        ) : error ? (
          <div className="alert alert-error"><AlertCircle size={16} />{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Users size={44} /><p>{search ? 'No matching patients found.' : 'No patients registered yet.'}</p></div>
        ) : (
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C0392B, #E74C3C)', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: '#6B7280' }}>{p.email}</td>
                  <td style={{ color: '#6B7280' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button className="btn-sm btn-sm-teal" onClick={() => navigate(`/doctor-review/${p._id}`)}>
                      View Records
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageLayout>
  );
}

export default DoctorDashboard;
