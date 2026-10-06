import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Register() {
  const navigate = useNavigate();
  const [account, setAccount] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const update = (event) => setAccount({ ...account, [event.target.name]: event.target.value });
  const register = (event) => {
    event.preventDefault();
    const name = account.name.trim();
    const email = account.email.trim().toLowerCase();
    if (!name || !email || account.password.length < 6) {
      setError("Enter your name, a valid email, and a password of at least 6 characters.");
      return;
    }
    if (account.password !== account.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    localStorage.setItem("momucooAccount", JSON.stringify({ name, email, password: account.password }));
    localStorage.setItem("momucooProfile", JSON.stringify({ name, age: "", gender: "", bloodGroup: "", pregnancyStatus: "Pregnant", pregnancyWeek: "", dueDate: "" }));
    navigate("/login");
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="brand register-brand">
          🩸 Momucoo
        </div>

        <h1>Create Your Account</h1>

        <p className="register-subtitle">
          Start your early-pregnancy health journey with Momucoo
        </p>

        <div className="account-type single-account-type">
          <button className="selected-type" type="button">👤 Patient account</button>
        </div>

        <form className="form-grid" onSubmit={register}>

          <div>
            <label>Full Name</label>
            <input name="name" value={account.name} onChange={update} placeholder="Enter your name" required />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email" value={account.email} onChange={update} placeholder="Enter your email" required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password" value={account.password} onChange={update} placeholder="Create password" required
            />
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword" value={account.confirmPassword} onChange={update} placeholder="Confirm password" required
            />
          </div>

        {error && <p className="error auth-error">{error}</p>}

        <button className="create-account" type="submit">
          Create Account →
        </button>

        </form>

        <p className="already-account">
          Already have an account?

          <button onClick={() => navigate("/login")}>
            Login
          </button>
        </p>

      </div>

    </div>
  );
}

export default Register;