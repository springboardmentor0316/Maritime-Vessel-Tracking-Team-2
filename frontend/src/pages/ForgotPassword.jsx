import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import "../styles/Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await forgotPassword(email);

    const { uid, token } = res;

    if (!uid || !token) {
      alert("Unable to reset password");
      return;
    }

    navigate(`/reset-password?uid=${uid}&token=${token}`);
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};


  return (
    <div className="login-container">
      <div className="overlay" />

      <div className="login-card">
        <h2>Forgot Password</h2>
        <p className="desc">Enter your registered email</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="analyst@maritime.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Continue</button>
        </form>
      </div>
    </div>
  );
}
