import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();
  const [profile] = useState(() => JSON.parse(localStorage.getItem("momucooProfile") || JSON.stringify({ name: "Ananya Sharma" })));
  const pregnancy = JSON.parse(localStorage.getItem("pregnancyData") || "null");
  const cbc = JSON.parse(localStorage.getItem("cbcData") || "null");
  const scan = JSON.parse(localStorage.getItem("scanData") || "null");
  const ai = JSON.parse(localStorage.getItem("aiResult") || "null");

  const initials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="dashboard-page">

      <aside className="sidebar">

        <div className="side-brand">
          🩸 Momucoo
        </div>

        <p className="menu-title">MAIN MENU</p>

        <button className="menu active">
          🏠 Dashboard
        </button>

        <button
          className="menu"
          onClick={() => navigate("/profile")}
        >
          👤 My Profile
        </button>

        <button
          className="menu"
          onClick={() => navigate("/health-check")}
        >
          ❤️ Health Check
        </button>

        <button
          className="menu"
          onClick={() => navigate("/cbc-analysis")}
        >
          🩸 CBC Analysis
        </button>

        <button
          className="menu"
          onClick={() => navigate("/ai-analysis")}
        >
          🤖 AI Analysis
        </button>

        <p className="menu-title">SUPPORT</p>

        <button
          className="menu"
          onClick={() => navigate("/knowledge-hub")}
        >
          📚 Knowledge Hub
        </button>

        <button
          className="menu"
          onClick={() => navigate("/feedback")}
        >
          💬 Feedback
        </button>

        <button
          className="menu"
          onClick={() => navigate("/emergency")}
        >
          🆘 Emergency Help
        </button>

        <button
          className="logout"
          onClick={() => navigate("/")}
        >
          🚪 Logout
        </button>

      </aside>


      <main className="dashboard-main">

        <header className="dashboard-header">

          <div className="header-user">
            <div className="notification">🔔</div>
            <div className="avatar">{initials}</div>
            <div>
              <strong>{profile.name}</strong>
              <small>Patient</small>
            </div>
          </div>

        </header>


        <section className="hero-card">

          <div>
            <p>YOUR HEALTH JOURNEY</p>

            <h2>
              Take control of your
              <br />
              health today.
            </h2>

            <p>
              Check your symptoms, analyze your CBC
              and understand your pregnancy health.
            </p>

            <button
              onClick={() => navigate("/health-check")}
            >
              Start Health Check →
            </button>
          </div>

          <div className="hero-icon">
            🩸
          </div>

        </section>


        <section className="history-section">
          <div className="section-heading-row"><div><p className="good-morning">PATIENT HISTORY</p><h2>Completed health analysis</h2></div><button className="secondary-btn" onClick={() => navigate("/reports")}>View all reports →</button></div>
          <div className="history-list">
            <HistoryItem done={Boolean(pregnancy)} icon="💬" title="Pregnancy symptom chat" detail={pregnancy ? `Week ${pregnancy.week || "not entered"} • ${pregnancy.symptoms.length} symptom(s)` : "Not completed"} onClick={() => navigate("/health-check")} />
            <HistoryItem done={Boolean(cbc)} icon="🩸" title="CBC blood report" detail={cbc ? `Hemoglobin ${cbc.hb} g/dL • Latest report` : "Not uploaded"} onClick={() => navigate("/cbc-analysis")} />
            <HistoryItem done={Boolean(scan?.uploaded)} icon="🖥️" title="Pregnancy scan report" detail={scan?.uploaded ? scan.name : "Optional report not uploaded"} onClick={() => navigate("/cbc-analysis")} />
            <HistoryItem done={Boolean(ai)} icon="🤖" title="AI anemia risk analysis" detail={ai ? `${ai.risk} risk • Score ${ai.score}/100` : "Waiting for CBC analysis"} onClick={() => navigate("/ai-analysis")} />
          </div>
        </section>


        <section className="dashboard-bottom single-insight">

          <div className="insight-card">

            <div className="card-heading">
              <h2>🤖 AI Health Insight</h2>
              <span>NEW</span>
            </div>

            <p>
              Your latest CBC values show a pattern that
              may need professional evaluation.
            </p>

            <div className="factor">
              🔴 Low hemoglobin
            </div>

            <div className="factor">
              🟠 Low MCV
            </div>

            <div className="factor">
              🟡 Fatigue reported
            </div>

            <button
              onClick={() => navigate("/ai-analysis")}
            >
              View Full Analysis →
            </button>

          </div>


        </section>

      </main>

    </div>
  );
}

function HistoryItem({ done, icon, title, detail, onClick }) {
  return <button className={`history-item ${done ? "done" : ""}`} onClick={onClick}><span className="history-icon">{icon}</span><span className="history-copy"><strong>{title}</strong><small>{detail}</small></span><span className="history-state">{done ? "✓" : "→"}</span></button>;
}

export default Dashboard;