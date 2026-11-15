import { AlertTriangle, Phone, ShieldAlert, HeartPulse, Hospital, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from './PageLayout';

const RED_FLAGS = [
  'Sudden or severe chest pain or pressure',
  'Extreme shortness of breath even while sitting or resting',
  'Fainting, collapse, or loss of consciousness',
  'Coughing up blood or acute difficulty breathing',
  'Unusual vaginal bleeding or sudden severe abdominal pain',
  'Rapid, fluttering heartbeat accompanied by dizziness'
];

function EmergencyHelp() {
  return (
    <PageLayout 
      title="Emergency Medical Help" 
      activePath="/emergency" 
      description="Immediate clinical guidance and contact lines when symptoms feel severe or acute."
    >
      {/* Critical Emergency Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
        border: '2px solid #EF4444',
        borderRadius: 16,
        padding: '24px 28px',
        marginBottom: 24,
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#DC2626', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
          <ShieldAlert size={20} />
          Life-Threatening Emergency Protocol
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#991B1B', margin: '0 0 10px 0' }}>
          Call Emergency Services Immediately (112 / 108)
        </h2>
        <p style={{ fontSize: 14, color: '#7F1D1D', margin: '0 0 18px 0', lineHeight: 1.6, maxWidth: 680 }}>
          If you or someone around you experiences severe acute symptoms during pregnancy, do not wait for an online screening or appointment. Contact your nearest hospital emergency department or dial your regional emergency line right now.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="tel:112" style={{ textDecoration: 'none' }}>
            <button
              className="btn-submit"
              style={{
                width: 'auto',
                padding: '12px 28px',
                background: '#DC2626',
                color: '#FFFFFF',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
              }}
            >
              <Phone size={18} />
              <span>Call Emergency (112)</span>
            </button>
          </a>

          <a href="tel:108" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                width: 'auto',
                padding: '12px 24px',
                background: '#FFFFFF',
                color: '#DC2626',
                border: '1.5px solid #EF4444',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Hospital size={18} />
              <span>Ambulance Hotline (108)</span>
            </button>
          </a>
        </div>
      </div>

      {/* Grid of Red Flags and Non-Urgent Guidance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Red Flag Symptoms */}
        <div className="section-card" style={{ marginBottom: 0, border: '1px solid #FECACA', background: '#FFFDFD' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="#DC2626" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1F2937' }}>
                Emergency Red Flags
              </h3>
              <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>Require Hospital Visit</span>
            </div>
          </div>

          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
            {RED_FLAGS.map((flag, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>{flag}</li>
            ))}
          </ul>
        </div>

        {/* Urgent vs Non-Urgent Care */}
        <div className="section-card" style={{ marginBottom: 0, border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF9E7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#D97706" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1F2937' }}>
                Next-Day Clinical Review
              </h3>
              <span style={{ fontSize: 12, color: '#D97706', fontWeight: 600 }}>Contact Doctor Within 24–48 Hours</span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 16 }}>
            If your Hb test indicates <strong>Moderate Anemia (7.0–9.9 g/dL)</strong>, or if you experience persistent lightheadedness without emergency red flags, schedule an urgent appointment with your obstetrician.
          </p>

          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
            <strong style={{ display: 'block', fontSize: 13, color: '#1F2937', marginBottom: 4 }}>
              What to tell your doctor:
            </strong>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              Share your latest hemoglobin value, current pregnancy week, and any symptoms of fatigue or breathlessness.
            </span>
          </div>

          <Link to="/cbc-analysis" style={{ textDecoration: 'none' }}>
            <button
              type="button"
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                color: '#1F2937',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>Review CBC Screening Status</span>
              <ChevronRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

export default EmergencyHelp;
