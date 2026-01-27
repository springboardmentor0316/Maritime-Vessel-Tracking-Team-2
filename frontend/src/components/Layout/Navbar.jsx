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
        <h1 className="navbar-title">Maritime Vessel Tracking</h1>
      </div>

      <div className="navbar-right">
        <div className="user-menu">
          <button
            className="user-menu-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
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