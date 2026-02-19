import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import ZoomControls from "../../components/ZoomControls";

import './DashboardPage.css';
import 'leaflet/dist/leaflet.css';
import { FiRefreshCw } from "react-icons/fi";

import {
  RefreshCw,
  Settings,
  Ship,
  Anchor,
  AlertTriangle,
  BarChart3,
  Navigation,
  Clock,
  Map,
  Globe,
  Bell,
  CloudFog,
  Skull
} from "lucide-react";


// React Icons (matching sidebar)
import {
  FiActivity,
  FiAnchor,
  FiAlertTriangle,
  FiBarChart2,
  FiNavigation,
  FiClock,
  FiMap,
  FiFlag,
  FiCloud
} from "react-icons/fi";

// Vessel Marker Icon
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
    total_ports: 0,
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
          <button className={`btn-icon ${refreshing ? 'refreshing' : ''}`} onClick={handleRefresh}>
            <FiRefreshCw />
          </button>

         
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <FiActivity size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Vessels</div>
            <div className="stat-value">{stats.total_vessels}</div>
            <div className="stat-change positive">+12% from yesterday</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-cyan">
            <FiAnchor size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Ports Monitored</div>
            <div className="stat-value">{stats.total_ports || 0}</div>
            <div className="stat-change neutral">Global coverage</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <FiAlertTriangle size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value">3</div>
            <div className="stat-change critical">3 critical</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-orange">
            <FiBarChart2 size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg Congestion</div>
            <div className="stat-value">74%</div>
            <div className="stat-change negative">+5% this week</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green">
            <FiNavigation size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Vessels Underway</div>
            <div className="stat-value">{statusCounts.underway}</div>
            <div className="stat-change positive">Real-time tracking</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <FiClock size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Recent Arrivals</div>
            <div className="stat-value">{Math.floor(stats.active_24h * 0.15)}</div>
            <div className="stat-change neutral">Last 24h</div>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        
        {/* Map Section */}
        <div className="map-section">

          <div className="section-header">
            <div className="section-title">
              <FiMap className="title-icon" />
              <span>Global Vessel Tracking</span>
            </div>

            <div className="section-stats">
              <span><FiActivity /> {vessels.length} vessels</span>
              <span><FiAnchor /> {statusCounts.anchored} anchored</span>
              <span><FiAlertTriangle /> 3 alerts</span>
            </div>
          </div>

          <div className="map-container">
            <MapContainer
              center={[1.3521, 103.8198]}
              zoom={2}
              minZoom={2}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              attributionControl={false}
              worldCopyJump={false}
              maxBounds={[[-85, -180], [85, 180]]}
              maxBoundsViscosity={1.0}
              inertia={false}
            >
                <ZoomControls />

              <TileLayer
                attribution=""
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                noWrap={true}
                bounds={[[-85, -180], [85, 180]]}
              />

              {vesselsWithAlerts.map((v) =>
                v.latitude && v.longitude ? (
                  <Marker
                    key={v.id}
                    position={[parseFloat(v.latitude), parseFloat(v.longitude)]}
                    icon={createVesselIcon(v.hasAlert ? "alert" : v.status)}
                  >
                    <Popup className="vessel-map-popup" maxWidth={220}>
                      <div className="vessel-popup-content">
                        <strong className="vessel-popup-title">{v.name || "Unknown Vessel"}</strong>
                        <div className="vessel-popup-body">
                          <div>MMSI: {v.mmsi || "N/A"}</div>
                          <div>IMO: {v.imo_number || "N/A"}</div>
                          <div>Status: {v.status || "N/A"}</div>
                          <div>Type: {v.vessel_type || "N/A"}</div>
                          <div>
                            Position: {v.latitude ?? "N/A"}, {v.longitude ?? "N/A"}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>

            <div className="map-legend">
              <div className="legend-title">VESSEL STATUS</div>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "#10b981" }}></span>
                  Underway / Active
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "#f59e0b" }}></span>
                  Anchored
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "#64748b" }}></span>
                  Moored / Inactive
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "#ef4444" }}></span>
                  Alert
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Alerts Sidebar */}
        <div className="alerts-sidebar">

          <div className="alerts-header">
            <h3>Safety Alerts</h3>
            <span className="alerts-count">3 active alerts</span>
          </div>

          <div className="alert-card critical">
            <div className="alert-icon"><FiAlertTriangle size={20} /></div>
            <div className="alert-content">
              <div className="alert-title">
                <span>Tropical Storm Warning</span>
                <span className="alert-badge high">High</span>
              </div>
              <p>Tropical storm developing in the Gulf of Mexico.</p>
              <div className="alert-location"><FiFlag /> Gulf of Mexico</div>
            </div>
          </div>

          <div className="alert-card critical">
            <div className="alert-icon"><FiFlag size={20} /></div>
            <div className="alert-content">
              <div className="alert-title">
                <span>High-Risk Piracy Zone</span>
                <span className="alert-badge critical">Critical</span>
              </div>
              <p>Multiple piracy incidents reported.</p>
              <div className="alert-location"><FiFlag /> Gulf of Aden</div>
            </div>
          </div>

          <div className="alert-card warning">
            <div className="alert-icon"><FiCloud size={20} /></div>
            <div className="alert-content">
              <div className="alert-title">
                <span>Heavy Fog Advisory</span>
                <span className="alert-badge medium">Medium</span>
              </div>
              <p>Dense fog reducing visibility.</p>
              <div className="alert-location"><FiCloud /> English Channel</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
