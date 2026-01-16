import { useState } from "react";
import "../styles/Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reset link sent to:", email);
    setSent(true);
  };

  return (
    <div className="login-container">
      <div className="overlay" />

      <div className="login-card">
        <h2>Forgot Password</h2>
        <p className="desc">Enter your registered email</p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              placeholder="analyst@maritime.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit">Send Reset Link</button>
          </form>
        ) : (
          <p className="success">
            Reset link sent to your email ✔
          </p>
        )}
      </div>
    </div>
  );
}
