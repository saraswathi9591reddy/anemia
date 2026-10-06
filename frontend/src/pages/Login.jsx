import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const account = readAccount();
    const enteredEmail = email.trim().toLowerCase();
    if (!account || account.email.trim().toLowerCase() !== enteredEmail || account.password !== password) {
      setError("Account not found or password is incorrect. Please register first.");
      return;
    }

    localStorage.setItem("momucooProfile", JSON.stringify({
      ...(JSON.parse(localStorage.getItem("momucooProfile") || "{}")),
      name: account.name
    }));
    localStorage.setItem("momucooSession", "true");
    setError("");

    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      <div className="login-left">
        <div className="brand">
          🩸 <span>Momucoo</span>
        </div>

        <div className="login-content">
          <p className="small-title">AI-ASSISTED HEALTHCARE</p>

          <h1>
            Your Health.
            <br />
            <span>Your Care.</span>
          </h1>

          <p className="description">
            Smart anemia screening, health monitoring and
            pregnancy screening and care guidance — all in one place.
          </p>

          <div className="features">
            <div>🤖 AI Health Analysis</div>
            <div>🤰 Early Pregnancy Care</div>
            <div>📈 Health Progress Tracking</div>
          </div>
        </div>
      </div>

      <div className="login-right">

        <div className="login-box">

          <div className="welcome">
            <h2>Welcome Back 👋</h2>
            <p>Sign in to continue your health journey</p>
          </div>

          <form onSubmit={handleLogin}>

            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error auth-error">{error}</p>}

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <span>Secure login</span>
            </div>

            <button className="login-button">
              Login as Patient →
            </button>

          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <p className="register-text">
            Don't have an account?
            <button onClick={() => navigate("/register")}>
              Create Account
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}

function readAccount() {
  try {
    const stored = JSON.parse(localStorage.getItem("momucooAccount") || "null");
    if (!stored || typeof stored.email !== "string" || typeof stored.password !== "string") return null;
    return { ...stored, email: stored.email.trim().toLowerCase() };
  } catch {
    return null;
  }
}

export default Login;