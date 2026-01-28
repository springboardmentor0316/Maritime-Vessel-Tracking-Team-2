import "../styles/Login.css";
import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Operator - Vessel Tracking");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({
        email,
        password,
        role,
      });

      console.log("LOGIN SUCCESS:", res);

      // Save tokens
      localStorage.setItem("access", res.access);
      localStorage.setItem("refresh", res.refresh);
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      localStorage.setItem("role", role);

      // ⭐ Backend is NOT returning user – so we create user manually
      const userObject = {
        email: email,
        role: role,
      };

      // Save user info
      localStorage.setItem("user", JSON.stringify(userObject));

      // Update AuthContext
      authLogin(userObject);

      toast.success("Login successful!");

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/app/dashboard", { replace: true });
      }, 100);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      const errorMessage = err?.detail || "Invalid credentials";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <label>Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            disabled={loading}
          >
            <option>Operator - Vessel Tracking</option>
            <option>Analyst - Port Analytics</option>
            <option>Admin - System Control</option>
          </select>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="demo">
          Demo Credentials: Any email/password combination
        </p>
      </div>
    </div>
  );
}
