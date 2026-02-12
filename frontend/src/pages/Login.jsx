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
      // 🔥 Call Django SimpleJWT login API
      const res = await loginUser({ email, password });

      // 🔥 Pass tokens to AuthContext
      authLogin(res);

      toast.success("Login successful!");

      navigate("/app/dashboard", { replace: true });

    } catch (err) {
      console.log("LOGIN ERROR:", err);

      const errorMessage =
        err?.detail ||
        err?.error ||
        err?.message ||
        err?.non_field_errors?.[0] ||
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

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <label>Email</label>
          <input
            type="email"
            placeholder="analyst@maritime.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          {/* PASSWORD */}
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);

                if (passwordError) {
                  setPasswordError("");
                  setError("");
                }

                if (value.trim().length === 0) {
                  setPasswordError("Password cannot be empty");
                }
              }}
              required
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

          {/* FORGOT PASSWORD */}
          <div className="forgot-password-link">
            <a onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </a>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* SIGN UP */}
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
