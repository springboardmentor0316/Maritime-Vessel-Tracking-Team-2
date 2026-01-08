import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-overlay" />

      <div className="home-card">
        <div className="home-logo">⚓</div>

        <h1>Maritime Intelligence</h1>
        <p className="home-subtitle">
          Vessel Tracking & Port Analytics Platform
        </p>

        <h2>Welcome</h2>
        <p className="home-desc">
          Access your maritime intelligence dashboard
        </p>

        <button onClick={() => navigate("/login")}>
          Sign In
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/register")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
