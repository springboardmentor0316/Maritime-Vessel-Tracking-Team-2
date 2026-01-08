import "../styles/Register.css";
import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Operator");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log({ email, password, role });
    alert("Demo Registration Successful");
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
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Operator</option>
            <option>Analyst</option>
            <option>Admin</option>
            
          </select>

          <button type="submit">Create Account</button>
        </form>

        <p className="register-demo">
          Already have an account?{" "}
          <span
            onClick={() => (window.location.href = "/login")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
