import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  //  Read data saved from backend login
  const role = localStorage.getItem("role") || "Operator";
  const username = localStorage.getItem("username") || 
    (role === "Operator"
      ? "Captain"
      : role === "Analyst"
      ? "Analyst"
      : "Admin");

  const handleLogout = () => {
    // clear all authentication & user data
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    navigate("/login");
  };

  return (
    <div className="sidebar">
      {/* LOGO */}
      <div className="logo-section">
        <div className="logo-box">⚓</div>
        <div>
          <h2 className="logo-title">Maritime</h2>
          <p className="logo-sub">Intelligence</p>
        </div>
      </div>

      <div className="divider" />

      {/* MENU */}
      <div className="menu">
        <Link
          to="/vessel-tracking"
          className={`menu-item ${
            location.pathname === "/vessel-tracking" ? "active" : ""
          }`}
        >
          🚢 Vessel Tracking
        </Link>

        <Link
          to="/voyage-replay"
          className={`menu-item ${
            location.pathname === "/voyage-replay" ? "active" : ""
          }`}
        >
          🎞 Voyage Replay
        </Link>
      </div>

      {/* USER & LOGOUT */}
      <div className="sidebar-bottom">
        <div className="user-block">
          <div className="user-icon">👤</div>
          <div>
            <p className="user-name">{username}</p>
            <p className="user-role">{role}</p>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          ⏻ Sign Out
        </button>
      </div>
    </div>
  );
}
