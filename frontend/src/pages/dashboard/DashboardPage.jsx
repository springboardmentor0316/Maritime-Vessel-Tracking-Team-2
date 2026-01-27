import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import statsService from '../../services/statsService';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeVessels: 1248,
    avgDelay: '4.2h',
    activeAlerts: 3,
    systemStatus: 'Operational',
    throughput: '12.4k'
  });

  const [alerts] = useState([
    {
      id: 1,
      type: 'PIRACY WARNING',
      severity: 'critical',
      message: 'Suspicious skiff activity reported near Vessel Nordic Star.',
      time: '2m ago',
      coordinates: '04°12\'N, 98°16\'E',
      color: '#ef4444'
    },
    {
      id: 2,
      type: 'SEVERE WEATHER',
      severity: 'warning',
      message: 'Cyclone \'Biparjoy\' forming. Wind speeds > 120km/h expected.',
      time: '15m ago',
      sector: 'Sector 4',
      color: '#f97316'
    },
    {
      id: 3,
      type: 'PORT CONGESTION',
      severity: 'info',
      message: 'Port of Singapore berth availability critical (< 10%).',
      time: '1h ago',
      color: '#3b82f6'
    }
  ]);

  return (
    <div className="dashboard-page">
      {/* Top Bar */}
      <div className="dashboard-header">
        <div className="header-search">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search vessels (IMO), ports, or safety zone" />
        </div>
        <div className="header-right">
          <span className="view-as">VIEW AS:</span>
          <select className="role-select">
            <option>Admin</option>
            <option>Operator</option>
            <option>Analyst</option>
          </select>
          <div className="notifications-icon">
            🔔
            <span className="badge">3</span>
          </div>
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">Capt. A. Smith</div>
              <div className="user-role">SYSTEM ADMINISTRATOR</div>
            </div>
            <div className="user-avatar">AS</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">ACTIVE VESSELS</div>
          <div className="stat-value">
            {stats.activeVessels.toLocaleString()}
            <span className="stat-trend positive">↗ 4.2%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">AVG. DELAY ⏱</div>
          <div className="stat-value">{stats.avgDelay}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '35%' }}></div>
          </div>
        </div>

        <div className="stat-card alert-card">
          <div className="stat-label">⚠ ACTIVE ALERTS</div>
          <div className="stat-value">
            {stats.activeAlerts}
            <span className="stat-sublabel">Critical</span>
          </div>
        </div>

        <div className="stat-card status-card">
          <div className="stat-label">💚 SYSTEM STATUS</div>
          <div className="stat-value">
            {stats.systemStatus}
            <span className="status-indicator">●</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">📦 THROUGHPUT (TEU)</div>
          <div className="stat-value">
            {stats.throughput}
            <span className="stat-sublabel">Daily Avg</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Map Section */}
        <div className="map-section">
          <div className="map-controls">
            <button className="map-filter active">
              <span className="filter-dot green"></span> Vessels
            </button>
            <button className="map-filter">
              <span className="filter-dot blue"></span> Ports
            </button>
            <button className="map-filter">
              <span className="filter-dot red"></span> Risks
            </button>
          </div>

          <div className="map-container">
            <div className="map-placeholder">
              <div className="map-overlay-text">🗺️ Map View</div>
              <div className="vessel-marker" style={{ top: '45%', left: '65%' }}>
                <div className="marker-icon">⚓</div>
                <div className="marker-label">Singapore</div>
              </div>
              <div className="vessel-marker" style={{ top: '55%', left: '58%' }}>
                <div className="marker-icon ship">🚢</div>
                <div className="marker-label">Ever Given</div>
              </div>
              <div className="danger-zone" style={{ bottom: '20%', left: '40%' }}></div>
            </div>
          </div>

          <button className="map-location-btn">📍</button>
        </div>

        {/* Alerts Sidebar */}
        <div className="alerts-sidebar">
          <div className="alerts-header">
            <h3>Priority Alerts</h3>
            <span className="real-time-badge">Real-time</span>
          </div>

          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <div className="alert-icon" style={{ background: alert.color }}>
                  {alert.severity === 'critical' ? '⚠️' : alert.severity === 'warning' ? '🌀' : 'ℹ️'}
                </div>
                <div className="alert-content">
                  <div className="alert-header">
                    <span className="alert-type">{alert.type}</span>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                  <div className="alert-message">{alert.message}</div>
                  {alert.coordinates && (
                    <div className="alert-meta">{alert.coordinates}</div>
                  )}
                  {alert.sector && (
                    <div className="alert-footer">
                      <span className="alert-sector">{alert.sector}</span>
                      <button className="alert-action">View Zone</button>
                    </div>
                  )}
                  {alert.severity === 'critical' && (
                    <button className="acknowledge-btn">Acknowledge</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;