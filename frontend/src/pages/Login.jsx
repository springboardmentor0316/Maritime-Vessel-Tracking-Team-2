import "../styles/Login.css";
import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Operator - Vessel Tracking");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // CALL BACKEND LOGIN API 
      const res = await loginUser({
        email,
        password,
        role,
      });

      console.log("LOGIN SUCCESS:", res);

      // STORE TOKENS FOR AUTH 
      localStorage.setItem("access", res.access);
      localStorage.setItem("refresh", res.refresh);

      // STORE ROLE FOR SIDEBAR 
      localStorage.setItem("role", role);

      // REDIRECT TO DASHBOARD 
      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err?.detail || "Invalid credentials");
    }
  };

  const goToForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-container">
      <div className="overlay" />

      <div className="login-card">
        <div className="logo">⚓</div>

        <h1>Maritime Intelligence</h1>
        <p className="subtitle">Vessel Tracking & Port Analytics Platform</p>

        <h2>Sign In</h2>
        <p className="desc">Access your maritime intelligence dashboard</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="analyst@maritime.com"
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

          <div className="forgot-link-wrapper">
            <button
              type="button"
              className="forgot-password"
              onClick={goToForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Operator - Vessel Tracking</option>
            <option>Analyst - Port Analytics</option>
            <option>Admin - System Control</option>
          </select>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <p className="demo">Demo Credentials: Any email/password combination</p>
      </div>
    </div>
  );
}
