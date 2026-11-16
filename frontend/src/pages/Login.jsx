import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email: form.email.trim(), password: form.password });
      login(data.token, data.user);
      navigate(data.user.role === 'doctor' ? '/doctor-dashboard' : from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-brand">
          <img src="/logo.png" alt="Momucoo" />
          <div>
            <h2>Momucoo</h2>
            <p>Pregnancy Anemia Screening</p>
          </div>
        </div>
        <h1>Welcome<span> back.</span></h1>
        <p>Sign in to continue your anemia screening journey. Your health data is safe and secure.</p>
        <div style={{ marginTop: 28, padding: '14px 18px', background: '#FEF9E7', borderRadius: 10, borderLeft: '4px solid #F39C12', fontSize: 13, color: '#7D6608' }}>
          <strong>Preliminary screening tool only.</strong> Based on WHO 2011 guidelines. Not a substitute for medical diagnosis.
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-card-logo">
          <img src="/logo.png" alt="AnemiaAI" />
        </div>
        <h2>Sign In</h2>
        <p className="auth-subtitle">Enter your credentials to access your account</p>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ paddingLeft: 40 }}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingLeft: 40, paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
        <p className="auth-footer-link" style={{ marginTop: 8 }}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
