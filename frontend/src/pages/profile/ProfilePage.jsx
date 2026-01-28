import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          <svg
            width="90"
            height="90"
            viewBox="0 0 24 24"
            fill="white"
            className="profile-icon"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
          </svg>
        </div>

        <div className="profile-info">

          {/* EMAIL ONLY */}
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>

          {/* ROLE ONLY */}
          <div className="info-row">
            <span className="label">Role:</span>
            <span className="value">{user?.role}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
