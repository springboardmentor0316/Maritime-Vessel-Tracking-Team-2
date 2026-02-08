import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import "../styles/ResetPassword.css";


export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uid || !token) {
      alert("Invalid or expired reset link");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await resetPassword({
        uid,
        token,
        new_password: password,
      });

      alert("Password reset successful");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to reset password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Set New Password</h2>

        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
}
