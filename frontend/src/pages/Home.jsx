import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Activity, FileText, Users, Shield, Download, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handleDashboard = () => {
    navigate(role === 'doctor' ? '/doctor-dashboard' : '/dashboard');
  };

  return (
    <div className="home-page">
      <nav className="home-nav">
        <Link to="/" className="home-nav-brand">
          <img src="/logo.png" alt="Momucoo Logo" />
          <span>Momucoo</span>
        </Link>
        <div className="home-nav-links">
          {isAuthenticated ? (
            <button className="btn-primary" onClick={handleDashboard}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/login">Sign In</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-hero-text">
          <div className="eyebrow">
            <Droplet size={14} />
            WHO 2011 Clinical Guidelines
          </div>
          <h1>
            AI-Based Anemia Screening
            <span> During Pregnancy</span>
          </h1>
          <p>
            AnemiaAI provides preliminary anemia screening for pregnant women using WHO 2011
            haemoglobin thresholds. Upload your CBC report, assess symptoms, and receive
            evidence-based guidance — not a replacement for medical care.
          </p>
          <div className="home-hero-actions">
            {isAuthenticated ? (
              <button className="btn-primary" onClick={handleDashboard} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Open Dashboard <ChevronRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/register" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Start Screening <ChevronRight size={16} />
                </Link>
                <Link to="/login" className="btn-outline">Sign In</Link>
              </>
            )}
          </div>
        </div>
        <div className="home-hero-image">
          <img src="/logo.png" alt="AnemiaAI" />
        </div>
      </section>

      <div className="home-stats">
        <div className="home-stat">
          <strong>32%</strong>
          <span>Pregnant women with anemia globally (WHO)</span>
        </div>
        <div className="home-stat">
          <strong>WHO 2011</strong>
          <span>Clinical guidelines used for screening</span>
        </div>
        <div className="home-stat">
          <strong>11.0 g/dL</strong>
          <span>Normal Hb threshold in pregnancy</span>
        </div>
        <div className="home-stat">
          <strong>Free</strong>
          <span>No subscription, no hidden costs</span>
        </div>
      </div>

      <section className="home-features">
        <h2>How AnemiaAI Helps</h2>
        <p>Evidence-based preliminary screening — transparent, clinical, and free</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Droplet size={24} /></div>
            <h3>CBC Report Analysis</h3>
            <p>Upload your blood report image or PDF. Our OCR extracts haemoglobin, RBC, MCV, MCHC and other values automatically.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Activity size={24} /></div>
            <h3>WHO-Based Screening</h3>
            <p>Classifies anemia severity using WHO 2011 haemoglobin thresholds: No Anemia ≥ 11.0, Mild 10–10.9, Moderate 7–9.9, Severe &lt; 7.0 g/dL.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FileText size={24} /></div>
            <h3>Symptom Assessment</h3>
            <p>Answer structured questions about fatigue, breathlessness, dizziness and other symptoms. Emergency flags for serious symptoms.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Download size={24} /></div>
            <h3>PDF Reports</h3>
            <p>Download a detailed PDF screening report including CBC values, assessment category, factors, and WHO-based recommendations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={24} /></div>
            <h3>Secure & Private</h3>
            <p>Your health data is stored securely. JWT authentication, bcrypt password hashing, and role-based access control.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Users size={24} /></div>
            <h3>Doctor Access</h3>
            <p>Doctors can view patient assessment histories and CBC trends to support clinical decision-making during consultations.</p>
          </div>
        </div>
      </section>

      <div className="home-footer">
        <p>
          © 2024 <span>AnemiaAI</span> — Preliminary Clinical Screening Tool |{' '}
          Not a substitute for medical diagnosis or treatment |{' '}
          Based on WHO/NMH/NHD/MNM/11.1 (2011)
        </p>
      </div>
    </div>
  );
}

export default Home;
