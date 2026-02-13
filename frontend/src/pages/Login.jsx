import "../styles/Login.css";
import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Login → get tokens
      const res = await loginUser({ email, password });

      const access = res.access;
      const refresh = res.refresh;

      if (!access) {
        throw new Error("Login failed. No access token returned.");
      }

      // 2️⃣ Save tokens
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // 3️⃣ Fetch user info
      const userRes = await fetch(
        "http://127.0.0.1:8001/api/users/me/",
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      if (!userRes.ok) {
        throw new Error("Failed to fetch user info");
      }

      const userData = await userRes.json();

      // 4️⃣ Save user
      localStorage.setItem("user", JSON.stringify(userData));

      // 5️⃣ Update auth context
      authLogin(userData, { access, refresh });

      toast.success("Login successful!");

      navigate("/app/dashboard", { replace: true });

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        "Invalid email or password";

      setError(errorMessage);
      setPasswordError(errorMessage);
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
        <p className="subtitle">
          Vessel Tracking & Port Analytics Platform
        </p>

        <h2>Sign In</h2>
        <p className="desc">
          Access your maritime intelligence dashboard
        </p>

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
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);

                if (value.trim().length === 0) {
                  setPasswordError("Password cannot be empty");
                } else {
                  setPasswordError("");
                  setError("");
                }
              }}
              disabled={loading}
            />

            <span
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {passwordError && (
            <p className="password-error">{passwordError}</p>
          )}

          <div className="forgot-password-link">
            <a onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="signup-link">
          <p>
            Don’t have an account?{" "}
            <a onClick={() => navigate("/register")}>
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
