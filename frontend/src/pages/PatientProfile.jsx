import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react';
import PageLayout from './PageLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function PatientProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ dateOfBirth: '', phone: '', bloodGroup: '', pregnancyStatus: true, pregnancyWeek: '', expectedDeliveryDate: '', medicalHistory: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/patient/profile').then(d => {
      const p = d.profile || {};
      setProfile({
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        phone: p.phone || '',
        bloodGroup: p.bloodGroup || '',
        pregnancyStatus: p.pregnancyStatus !== false,
        pregnancyWeek: p.pregnancyWeek || '',
        expectedDeliveryDate: p.expectedDeliveryDate ? p.expectedDeliveryDate.split('T')[0] : '',
        medicalHistory: p.medicalHistory || '',
      });
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (profile.pregnancyWeek && (profile.pregnancyWeek < 1 || profile.pregnancyWeek > 42)) {
      setError('Pregnancy week must be between 1 and 42.'); return;
    }
    setSaving(true);
    try {
      await api.put('/patient/profile', {
        ...profile,
        pregnancyWeek: profile.pregnancyWeek ? parseInt(profile.pregnancyWeek) : undefined,
      });
      setSuccess('Profile saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <PageLayout title="My Profile" activePath="/profile" description="Manage your personal and pregnancy information">
      {loading ? (
        <div className="loading-center"><div className="spinner" /><p>Loading profile...</p></div>
      ) : (
        <form onSubmit={handleSave}>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}><AlertCircle size={16} />{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 20 }}><CheckCircle size={16} />{success}</div>}

          {/* Header */}
          <div className="section-card" style={{ marginBottom: 24 }}>
            <div className="profile-header">
              <div className="profile-avatar">{initials}</div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user?.name}</h2>
                <p style={{ color: '#6B7280', marginTop: 4 }}>{user?.email}</p>
                <span style={{ display: 'inline-block', marginTop: 6, padding: '4px 12px', background: '#FDE8E6', color: '#C0392B', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="section-card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 20 }}><User size={18} /> Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={profile.dateOfBirth} onChange={e => setProfile(p => ({ ...p, dateOfBirth: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 98765 43210" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 240 }}>
              <label>Blood Group</label>
              <select value={profile.bloodGroup} onChange={e => setProfile(p => ({ ...p, bloodGroup: e.target.value }))}>
                <option value="">Select blood group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Pregnancy Info */}
          <div className="section-card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 20 }}>Pregnancy Information</h2>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={profile.pregnancyStatus} onChange={e => setProfile(p => ({ ...p, pregnancyStatus: e.target.checked }))} style={{ width: 18, height: 18 }} />
                Currently pregnant
              </label>
            </div>
            {profile.pregnancyStatus && (
              <div className="form-row">
                <div className="form-group">
                  <label>Pregnancy Week (1–42)</label>
                  <input type="number" min="1" max="42" placeholder="e.g. 24" value={profile.pregnancyWeek} onChange={e => setProfile(p => ({ ...p, pregnancyWeek: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Expected Delivery Date</label>
                  <input type="date" value={profile.expectedDeliveryDate} onChange={e => setProfile(p => ({ ...p, expectedDeliveryDate: e.target.value }))} />
                </div>
              </div>
            )}
          </div>

          {/* Medical History */}
          <div className="section-card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>Medical History</h2>
            <div className="form-group">
              <label>Known conditions, allergies, or relevant history</label>
              <textarea rows={4} placeholder="e.g. Iron deficiency anemia in previous pregnancy, thalassemia trait..." value={profile.medicalHistory} onChange={e => setProfile(p => ({ ...p, medicalHistory: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
          </div>

          <button type="submit" className="btn-submit" style={{ width: 'auto', padding: '12px 36px', display: 'flex', alignItems: 'center', gap: 8 }} disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}
    </PageLayout>
  );
}

export default PatientProfile;
