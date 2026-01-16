import { useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Login.css";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const handleReset = (e) => {
    e.preventDefault();
    console.log("Token:", token);
    console.log("New password:", password);
    setDone(true);
  };

  return (
    <div className="login-container">
      <div className="overlay" />

      <div className="login-card">
        <h2>Reset Password</h2>

        {!done ? (
          <form onSubmit={handleReset}>
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
        ) : (
          <p className="success">Password reset successfully </p>
        )}
      </div>
    </div>
  );
}
