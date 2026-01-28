import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-toggle" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="navbar-title">Maritime Vessel Tracking</div>

      </div>

      <div className="navbar-right">
        <div className="user-menu">
          <button
            className="user-menu-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="#fff"
    className="navbar-profile-icon"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
  </svg>
</div>

            <span className="user-name">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="user-menu-arrow">▼</span>
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <button onClick={() => { navigate('/app/profile'); setDropdownOpen(false); }}>
                Profile
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;