import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Stethoscope, Baby, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'patient' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  };
  const pwValid = Object.values(pwChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) { setError('All fields are required.'); return; }
    if (!pwValid) { setError('Password does not meet requirements.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const data = await api.post('/auth/register', { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
      login(data.token, data.user);
      navigate(data.user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PwCheck = ({ ok, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: ok ? '#27AE60' : '#9CA3AF' }}>
      <CheckCircle size={12} fill={ok ? '#27AE60' : 'none'} />
      {label}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-brand">
          <img src="/logo.png" alt="AnemiaAI" />
          <div>
            <h2>AnemiaAI</h2>
            <p>Pregnancy Anemia Screening</p>
          </div>
        </div>
        <h1>Create your <span>account.</span></h1>
        <p>Join AnemiaAI to get preliminary anemia screening based on WHO 2011 clinical guidelines — free, secure, and evidence-based.</p>
        <div style={{ marginTop: 28, padding: '14px 18px', background: '#D5F5E3', borderRadius: 10, borderLeft: '4px solid #27AE60', fontSize: 13, color: '#186A3B' }}>
          <strong>Your data is secure.</strong> Passwords are hashed with bcrypt. No data is sold or shared.
        </div>
      </div>

      <div className="auth-card" style={{ width: 460 }}>
        <div className="auth-card-logo">
          <img src="/logo.png" alt="AnemiaAI" />
        </div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Fill in your details to get started</p>

        {error && <div className="alert alert-error"><AlertCircle size={16} />{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>I am a...</label>
            <div className="role-selector">
              <div className={`role-option ${form.role === 'patient' ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, role: 'patient' }))}>
                <Baby size={22} style={{ margin: '0 auto 6px', display: 'block', color: '#C0392B' }} />
                <strong>Patient</strong>
                <span>Pregnant woman seeking screening</span>
              </div>
              <div className={`role-option ${form.role === 'doctor' ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, role: 'doctor' }))}>
                <Stethoscope size={22} style={{ margin: '0 auto 6px', display: 'block', color: '#1A5276' }} />
                <strong>Doctor</strong>
                <span>Healthcare provider reviewing patients</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingLeft: 40, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} style={{ paddingLeft: 40 }} />
              </div>
            </div>
          </div>

          {form.password && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <PwCheck ok={pwChecks.length} label="8+ characters" />
              <PwCheck ok={pwChecks.upper} label="Uppercase letter" />
              <PwCheck ok={pwChecks.number} label="One number" />
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-link">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="auth-footer-link" style={{ marginTop: 8 }}><Link to="/">← Back to Home</Link></p>
      </div>
    </div>
  );
}

export default Register;
