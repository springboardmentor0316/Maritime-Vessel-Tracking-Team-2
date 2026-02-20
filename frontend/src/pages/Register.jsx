import "../styles/Register.css";
import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [passwordError, setPasswordError] = useState("");




  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email,
        password,
        role: role.toLowerCase(), // "operator" or "analyst"
      };

      const res = await registerUser(payload);
      console.log("REGISTER SUCCESS:", res);

      toast.success("Registration successful! Please login.");
      
      // Redirect to login
      navigate("/login");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.detail || 
        err.response?.data?.email?.[0] ||
        "Registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-overlay" />

      <div className="register-card">
        <div className="register-logo">⚓</div>

        <h1>Maritime Intelligence</h1>
        <p className="register-subtitle">
          Vessel Tracking & Port Analytics Platform
        </p>

        <h2>Sign Up</h2>
        <p className="register-desc">
          Create your maritime intelligence account
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="operator@maritime.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label>Password</label>
<div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Create your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
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

<label>Confirm Password</label>
<div className="password-wrapper">
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Re-enter your password"
    value={confirmPassword}
    onChange={(e) => {
      setConfirmPassword(e.target.value);

      if (e.target.value !== password) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    }}
    required
    disabled={loading}
  />

  <span
    className="toggle-eye"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>
{confirmPassword.length > 0 && passwordError && (
  <p className="password-error">{passwordError}</p>
)}





          <label>Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option>Operator</option>
            <option>Analyst</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-demo">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ cursor: 'pointer' }}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
