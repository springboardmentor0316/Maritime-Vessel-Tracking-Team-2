import "../styles/Login.css";
import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Operator");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Backend login API call
      const res = await loginUser({
        email,
        password,
      });

      // Store JWT tokens
      localStorage.setItem("access", res.access);
      localStorage.setItem("refresh", res.refresh);

      // Store role for Sidebar display
      localStorage.setItem("role", role);

      // Redirect to correct dashboard
      navigate("/vessel-tracking");
    } catch (err) {
      setError("Invalid email or password");
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
            placeholder="user@maritime.com"
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

          {/* Forgot Password Link */}
          <div className="forgot">
            <button type="button" className="forgot-password" onClick={goToForgotPassword}>
              Forgot Password?
            </button>
          </div>

          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Operator">Operator - Vessel Tracking</option>
            <option value="Analyst">Analyst - Port Analytics</option>
            <option value="Admin">Admin - System Control</option>
          </select>

          <button type="submit" className="login-btn">Sign In</button>
        </form>

        <p className="demo">Demo Credentials: Any email/password works</p>
      </div>
    </div>
  );
}
