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
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>

        <div className="profile-info">
          <div className="info-row">
            <span className="label">Name:</span>
            <span className="value">{user?.first_name} {user?.last_name}</span>
          </div>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>
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