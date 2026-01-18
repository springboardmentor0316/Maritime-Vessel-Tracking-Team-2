import "../styles/Login.css";
import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Operator - Vessel Tracking");
  const goToForgotPassword = () => {
  navigate("/forgot-password");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", res);

      localStorage.setItem("access", res.access);
      localStorage.setItem("refresh", res.refresh);

      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert(err?.detail || "Login failed");
    }
  };

   
  

  return (
    <div className="login-container">
      <div className="overlay" />

      <div className="login-card">
        <div className="logo">
          ⚓
        </div>

        <h1>Maritime Intelligence</h1>
        <p className="subtitle">Vessel Tracking & Port Analytics Platform</p>

        <h2> Sign In</h2>
        <p className="desc">Access your maritime intelligence dashboard</p>

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
          
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Operator - Vessel Tracking</option>
            <option>Analyst - Port Analytics</option>
            <option>Admin - System Control</option>
          </select>

          <button type="submit">Sign In</button>
          <button
            type="button"
            className="forgot-password"
            onClick={goToForgotPassword}
          >
            Forgot Password?
          </button>
          
        </form>

        <p className="demo">
          Demo Credentials: Any email/password combination
        </p>
      </div>
    </div>
  );
}
