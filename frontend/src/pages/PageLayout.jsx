import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const menuItems = [
  ["🏠", "Dashboard", "/dashboard"],
  ["👤", "My Profile", "/profile"],
  ["❤️", "Health Check", "/health-check"],
  ["🩸", "CBC Analysis", "/cbc-analysis"],
  ["🤖", "AI Analysis", "/ai-analysis"],
  ["📄", "Reports", "/reports"]
];

function PageLayout({ title, eyebrow, description, activePath, children }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem("momucooProfile") || JSON.stringify({ name: "Ananya Sharma" })));

  useEffect(() => {
    const updateProfile = () => setProfile(JSON.parse(localStorage.getItem("momucooProfile") || JSON.stringify({ name: "Ananya Sharma" })));
    window.addEventListener("momucoo-profile-updated", updateProfile);
    return () => window.removeEventListener("momucoo-profile-updated", updateProfile);
  }, []);

  const initials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <button className="side-brand" onClick={() => navigate("/dashboard")}>
          🩸 Momucoo
        </button>
        <p className="menu-title">MAIN MENU</p>
        {menuItems.map(([icon, label, path]) => (
          <button
            className={`menu ${activePath === path ? "active" : ""}`}
            key={path}
            onClick={() => navigate(path)}
          >
            {icon} {label}
          </button>
        ))}
        <p className="menu-title">SUPPORT</p>
        <button className="menu" onClick={() => navigate("/knowledge-hub")}>📚 Knowledge Hub</button>
        <button className="menu" onClick={() => navigate("/feedback")}>💬 Feedback</button>
        <button className="menu" onClick={() => navigate("/emergency")}>🆘 Emergency Help</button>
        <button className="logout" onClick={() => { localStorage.removeItem("momucooSession"); navigate("/"); }}>🚪 Logout</button>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="good-morning">MOMUCOO • PATIENT PORTAL</p>
            <h1>{title}</h1>
            <p className="page-description">{description}</p>
          </div>
          <div className="header-user">
            <div className="notification">🔔</div>
            <div className="avatar">{initials}</div>
            <div><strong>{profile.name}</strong><small>Patient</small></div>
          </div>
        </header>
        <div className="page-eyebrow">{eyebrow}</div>
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
