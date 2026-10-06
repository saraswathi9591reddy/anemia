import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import AIAnalysis from "./pages/AIAnalysis";
import CBCAnalysis from "./pages/CBCAnalysis";
import CarePlan from "./pages/CarePlan";
import Dashboard from "./pages/Dashboard";
import EmergencyHelp from "./pages/EmergencyHelp";
import Feedback from "./pages/Feedback";
import HealthCheck from "./pages/HealthCheck";
import HealthJourney from "./pages/HealthJourney";
import HealthQuiz from "./pages/HealthQuiz";
import Home from "./pages/Home";
import KnowledgeHub from "./pages/KnowledgeHub";
import Login from "./pages/Login";
import PatientProfile from "./pages/PatientProfile";
import Reminders from "./pages/Reminders";
import Reports from "./pages/Reports";
import Register from "./pages/Register";

function App() {
  const [page, setPage] = useState("login");

  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");

  const [account, setAccount] = useState({
    name: "",
    age: "",
    password: "",
  });

  const [error, setError] = useState("");

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/cbc-analysis" element={<CBCAnalysis />} />
        <Route path="/care-plan" element={<CarePlan />} />
        <Route path="/emergency" element={<EmergencyHelp />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/health-check" element={<HealthCheck />} />
        <Route path="/health-journey" element={<HealthJourney />} />
        <Route path="/health-quiz" element={<HealthQuiz />} />
        <Route path="/knowledge-hub" element={<KnowledgeHub />} />
        <Route path="/profile" element={<PatientProfile />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Dashboard />} />
    </Routes>
  );

  // SEND OTP
  const sendOTP = () => {
    if (!contact.trim()) {
      setError("Please enter your Gmail or mobile number.");
      return;
    }

    setError("");

    // Demo OTP
    console.log("Demo OTP: 123456");

    setPage("otp");
  };

  // VERIFY OTP
  const verifyOTP = () => {
    if (otp === "123456") {
      setError("");
      setPage("create-account");
    } else {
      setError("Wrong OTP. Please enter 123456 for this demo.");
    }
  };

  // CREATE ACCOUNT
  const createAccount = () => {
    if (!account.name || !account.age || !account.password) {
      setError("Please fill all the details.");
      return;
    }

    setError("");
    setPage("home");
  };

  // LOGIN PAGE
  if (page === "login") {
    return (
      <div className="auth-page">
        <div className="auth-image">
          <div className="brand">🩸 AnemiaCare AI</div>

          <h1>
            AI-Based Detection of
            <span> Anemia in Pregnancy</span>
          </h1>

          <p>
            Early detection and health monitoring for pregnant women.
          </p>

          <div className="pregnant-image">
            🤰
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-icon">🩸</div>

          <h2>Welcome</h2>

          <p className="sub-text">
            Login or create your AnemiaCare AI account
          </p>

          <label>Gmail or Mobile Number</label>

          <input
            type="text"
            placeholder="Enter Gmail or mobile number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button className="primary-btn" onClick={sendOTP}>
            Send OTP
          </button>

          <p className="demo-text">
            Demo OTP: <b>123456</b>
          </p>
        </div>
      </div>
    );
  }

  // OTP PAGE
  if (page === "otp") {
    return (
      <div className="auth-page simple-auth">
        <div className="auth-card">
          <div className="auth-icon">🔐</div>

          <h2>Verify OTP</h2>

          <p className="sub-text">
            We sent a verification OTP to
          </p>

          <p className="contact-text">{contact}</p>

          <input
            className="otp-input"
            type="text"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button className="primary-btn" onClick={verifyOTP}>
            Verify OTP
          </button>

          <button
            className="back-btn"
            onClick={() => {
              setPage("login");
              setOtp("");
              setError("");
            }}
          >
            ← Change Email / Mobile
          </button>

          <p className="demo-text">
            For testing: <b>123456</b>
          </p>
        </div>
      </div>
    );
  }

  // CREATE ACCOUNT
  if (page === "create-account") {
    return (
      <div className="auth-page simple-auth">
        <div className="auth-card">
          <div className="auth-icon">👤</div>

          <h2>Create Your Account</h2>

          <p className="sub-text">
            Your contact has been verified successfully ✓
          </p>

          <input
            type="text"
            placeholder="Full Name"
            value={account.name}
            onChange={(e) =>
              setAccount({
                ...account,
                name: e.target.value,
              })
            }
          />

          <input
            type="number"
            placeholder="Age"
            value={account.age}
            onChange={(e) =>
              setAccount({
                ...account,
                age: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Create Password"
            value={account.password}
            onChange={(e) =>
              setAccount({
                ...account,
                password: e.target.value,
              })
            }
          />

          {error && <p className="error">{error}</p>}

          <button
            className="primary-btn"
            onClick={createAccount}
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // HOME DASHBOARD
  if (page === "home") {
    return (
      <div className="home-page">
        <nav className="navbar">
          <h2>🩸 AnemiaCare AI</h2>

          <button
            onClick={() => {
              setPage("login");
              setContact("");
              setOtp("");
            }}
          >
            Logout
          </button>
        </nav>

        <main className="dashboard">
          <div className="welcome-box">
            <div>
              <p>WELCOME BACK 👋</p>

              <h1>
                Hello {account.name}
              </h1>

              <span>
                Your pregnancy health dashboard
              </span>
            </div>

            <div className="dashboard-image">
              🤰
            </div>
          </div>

          <h2 className="dashboard-title">
            What would you like to do?
          </h2>

          <div className="feature-grid">

            <div className="feature-card">
              <span>👩</span>
              <h3>Patient Details</h3>
              <p>
                Enter your personal and pregnancy information.
              </p>
            </div>

            <div className="feature-card">
              <span>❤️</span>
              <h3>Symptoms</h3>
              <p>
                Enter symptoms and health information.
              </p>
            </div>

            <div className="feature-card">
              <span>🩸</span>
              <h3>CBC / Medical Report</h3>
              <p>
                Enter your CBC report information.
              </p>
            </div>

            <div className="feature-card">
              <span>🤖</span>
              <h3>AI Analysis</h3>
              <p>
                Analyze anemia risk using AI.
              </p>
            </div>

            <div className="feature-card">
              <span>📊</span>
              <h3>Health Score</h3>
              <p>
                View your overall health score.
              </p>
            </div>

            <div className="feature-card">
              <span>💡</span>
              <h3>Recommendations</h3>
              <p>
                Get personalized recommendations.
              </p>
            </div>

            <div className="feature-card">
              <span>📋</span>
              <h3>Report History</h3>
              <p>
                View your previous reports.
              </p>
            </div>

            <div className="feature-card">
              <span>📈</span>
              <h3>Health Progress</h3>
              <p>
                Track your health progress.
              </p>
            </div>

          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;