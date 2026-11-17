import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Activity, Droplet, FileText, BookOpen, Heart, Bell, HelpCircle, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const patientMenu = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'My Profile', path: '/profile' },
  { icon: Activity, label: 'Symptom Check', path: '/health-check' },
  { icon: Droplet, label: 'CBC Analysis', path: '/cbc-analysis' },
  { icon: FileText, label: 'Screening Results', path: '/ai-analysis' },
  { icon: FileText, label: 'Reports & History', path: '/reports' },
  { icon: Heart, label: 'Nutrition Guide', path: '/care-plan' },
];

const doctorMenu = [
  { icon: LayoutDashboard, label: 'Doctor Dashboard', path: '/doctor-dashboard' },
  { icon: User, label: 'Patient List', path: '/doctor-patients' },
];

const supportMenu = [
  { icon: BookOpen, label: 'Knowledge Hub', path: '/knowledge-hub' },
  { icon: Bell, label: 'Reminders', path: '/reminders' },
  { icon: HelpCircle, label: 'Emergency Help', path: '/emergency' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
];

function PageLayout({ title, eyebrow, description, activePath, children }) {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = role === 'doctor' ? doctorMenu : patientMenu;

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <button className="sidebar-brand" onClick={() => navigate(role === 'doctor' ? '/doctor-dashboard' : '/dashboard')}>
          <img src="/logo.png" alt="Momucoo" />
          <span>Momucoo</span>
        </button>

        <p className="menu-section-title">Main Menu</p>
        {menuItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            className={`menu-btn ${activePath === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}

        <p className="menu-section-title">Support</p>
        {supportMenu.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            className={`menu-btn ${activePath === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div className="header-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'capitalize' }}>{role || 'patient'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header" style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #F1E4DF',
          padding: '20px 32px',
          boxShadow: '0 2px 8px rgba(192, 57, 43, 0.03)'
        }}>
          <div className="header-breadcrumb">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C0392B', display: 'inline-block' }}></span>
              <small style={{
                color: '#C0392B',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                Momucoo • {role === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
              </small>
            </div>
            <h1 style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#1F2937',
              margin: '2px 0 4px 0',
              letterSpacing: '-0.4px'
            }}>
              {title}
            </h1>
            {description && (
              <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0, lineHeight: 1.45 }}>
                {description}
              </p>
            )}
          </div>
          <div className="header-user">
            <div className="header-avatar">{initials}</div>
            <div className="header-user-info">
              <strong>{user?.name || 'User'}</strong>
              <small>{role}</small>
            </div>
          </div>
        </header>
        {eyebrow && <div style={{ padding: '8px 32px', background: '#FEF9E7', borderBottom: '1px solid #FAD7A0', fontSize: 13, color: '#7D6608' }}>{eyebrow}</div>}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default PageLayout;
