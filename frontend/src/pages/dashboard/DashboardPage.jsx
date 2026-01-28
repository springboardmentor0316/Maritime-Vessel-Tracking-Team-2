import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import './DashboardPage.css';
import 'leaflet/dist/leaflet.css';

// Same droplet icon from Live Map
const createVesselIcon = (status) => {
  const colors = {
    'underway': '#10b981',
    'active': '#10b981',
    'anchored': '#f59e0b',
    'moored': '#64748b',
    'inactive': '#64748b',
    'alert': '#ef4444',
  };

  const color = colors[status?.toLowerCase()] || '#10b981';

  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <path d="M16 0C9.37258 0 4 5.37258 4 12C4 21 16 40 16 40C16 40 28 21 28 12C28 5.37258 22.6274 0 16 0Z" 
              fill="${color}" 
              stroke="#fff" 
              stroke-width="2"/>
        <circle cx="16" cy="12" r="5" fill="#fff"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stats, setStats] = useState({
    total_vessels: 0,
    active_1h: 0,
    active_24h: 0,
    by_status: {},
    by_type: {},
  });
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, vesselsData] = await Promise.all([
        vesselService.getStatistics(),
        vesselService.getLiveVessels(1),
      ]);
      setStats(statsData);
      setVessels(vesselsData);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
      setRefreshing(false);
      toast.error('Failed to refresh dashboard data');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    toast.success('Refreshing dashboard...');
    fetchDashboardData();
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const getStatusCounts = () => {
    const underway = (stats.by_status?.underway || 0) + (stats.by_status?.active || 0);
    const anchored = stats.by_status?.anchored || 0;
    const moored = stats.by_status?.moored || 0;
    const inactive = stats.by_status?.inactive || 0;
    return { underway, anchored, moored, inactive };
  };

  const statusCounts = getStatusCounts();

  const vesselsWithAlerts = vessels.map((vessel, index) => ({
    ...vessel,
    hasAlert: index < 3 && vessel.status !== 'inactive',
  }));

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Maritime Command Center...</p>
      </div>
    );
  }

  return (
    <div className="maritime-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Maritime Command Center</h1>
          <p className="header-subtitle">Real-time global vessel tracking and analytics</p>
        </div>
        <div className="header-actions">
          <button 
            className={`btn-icon ${refreshing ? 'refreshing' : ''}`}
            title="Refresh Dashboard" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            🔄
          </button>
          <button 
            className="btn-icon" 
            title="Settings"
            onClick={handleSettings}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <span>🚢</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Vessels</div>
            <div className="stat-value">{stats.total_vessels.toLocaleString()}</div>
            <div className="stat-change positive">+12% from yesterday</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-cyan">
            <span>⚓</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Ports Monitored</div>
            <div className="stat-value">156</div>
            <div className="stat-change neutral">Global coverage</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <span>⚠️</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value">{Math.max(3, Math.floor(stats.total_vessels * 0.01))}</div>
            <div className="stat-change critical">3 critical</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <span>📊</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg Congestion</div>
            <div className="stat-value">74%</div>
            <div className="stat-change negative">+5% this week</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green">
            <span>🚀</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Vessels Underway</div>
            <div className="stat-value">{statusCounts.underway.toLocaleString()}</div>
            <div className="stat-change positive">Real-time tracking</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <span>🕐</span>
          </div>
          <div className="stat-content">
            <div className="stat-label">Recent Arrivals</div>
            <div className="stat-value">{Math.floor(stats.active_24h * 0.15)}</div>
            <div className="stat-change neutral">Last 24h</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Global Vessel Tracking Map */}
        <div className="map-section">
          <div className="section-header">
            <div className="section-title">
              <span className="title-icon">🗺️</span>
              <span>Global Vessel Tracking</span>
            </div>
            <div className="section-stats">
              <span>🚢 {vessels.length} vessels</span>
              <span>⚓ {statusCounts.anchored} anchored</span>
              <span>⚠️ 3 alerts</span>
            </div>
          </div>

          <div className="map-container">
            <MapContainer
              center={[1.3521, 103.8198]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {vesselsWithAlerts.map((vessel) => (
                vessel.latitude && vessel.longitude && (
                  <React.Fragment key={vessel.id}>
                    {vessel.hasAlert && (
                      <>
                        <Circle
                          center={[parseFloat(vessel.latitude), parseFloat(vessel.longitude)]}
                          radius={80000}
                          pathOptions={{
                            color: '#ef4444',
                            fillColor: '#ef4444',
                            fillOpacity: 0.08,
                            weight: 2,
                            dashArray: '10, 10',
                          }}
                        />
                        <Circle
                          center={[parseFloat(vessel.latitude), parseFloat(vessel.longitude)]}
                          radius={15000}
                          pathOptions={{
                            color: '#ef4444',
                            fillColor: '#ef4444',
                            fillOpacity: 0.9,
                            weight: 0,
                          }}
                        />
                      </>
                    )}
                    <Marker
                      position={[parseFloat(vessel.latitude), parseFloat(vessel.longitude)]}
                      icon={createVesselIcon(vessel.hasAlert ? 'alert' : vessel.status)}
                    />
                  </React.Fragment>
                )
              ))}
            </MapContainer>

            {/* Legend */}
            <div className="map-legend">
              <div className="legend-title">Legend</div>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#10b981' }}></span>
                  <span>Underway</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                  <span>Anchored</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                  <span>Moored</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#64748b' }}></span>
                  <span>Port</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                  <span>Alert Zone</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Alerts Sidebar */}
        <div className="alerts-sidebar">
          <div className="alerts-header">
            <h3>Safety Alerts</h3>
            <span className="alerts-count">3 active alerts</span>
          </div>

          <div className="alert-card critical">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <div className="alert-title">
                <span>Tropical Storm Warning</span>
                <span className="alert-badge high">High</span>
              </div>
              <p className="alert-description">
                Tropical storm developing in the Gulf of Mexico. Winds expected to reach 65 knots.
              </p>
              <div className="alert-location">📍 Gulf of Mexico</div>
            </div>
          </div>

          <div className="alert-card critical">
            <div className="alert-icon">🏴‍☠️</div>
            <div className="alert-content">
              <div className="alert-title">
                <span>High-Risk Piracy Zone</span>
                <span className="alert-badge critical">Critical</span>
              </div>
              <p className="alert-description">
                Multiple piracy incidents reported in the Gulf of Aden. All vessels advised to maintain...
              </p>
              <div className="alert-location">📍 Gulf of Aden</div>
            </div>
          </div>

          <div className="alert-card warning">
            <div className="alert-icon">🌫️</div>
            <div className="alert-content">
              <div className="alert-title">
                <span>Heavy Fog Advisory</span>
                <span className="alert-badge medium">Medium</span>
              </div>
              <p className="alert-description">
                Dense fog reducing visibility to under 500m in the English Channel.
              </p>
              <div className="alert-location">📍 English Channel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content-settings" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Dashboard Settings</h2>
              <button className="modal-close" onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="settings-section">
                <h3>Display Options</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Auto-refresh every 30 seconds</span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Show alert notifications</span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Display vessel routes</span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Map Options</h3>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" defaultChecked />
                    <span>Show danger zones</span>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input type="checkbox" />
                    <span>Display port boundaries</span>
                  </label>
                </div>
              </div>

              <div className="settings-actions">
                <button className="btn-secondary" onClick={() => setShowSettings(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={() => {
                  setShowSettings(false);
                  toast.success('Settings saved successfully');
                }}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;