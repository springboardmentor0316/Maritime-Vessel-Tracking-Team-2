import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import 'leaflet/dist/leaflet.css';
import './LiveVesselMapPage.css';

// Custom droplet/pin vessel icons
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

const LiveVesselMapPage = () => {
  const toast = useToast();
  const [vessels, setVessels] = useState([]);
  const [stats, setStats] = useState({ total: 0, underway: 0, anchored: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchVessels();
    
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchVessels, 30000);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  const fetchVessels = async () => {
    try {
      const [vesselsData, statsData] = await Promise.all([
        vesselService.getLiveVessels(1),
        vesselService.getStatistics(),
      ]);
      
      setVessels(vesselsData);
      setStats({
        total: vesselsData.length,
        underway: statsData.by_status?.underway || 0,
        anchored: statsData.by_status?.anchored || 0,
        moored: statsData.by_status?.moored || 0,
        alerts: 3,
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
      toast.error('Failed to load vessel data');
      setLoading(false);
    }
  };

  const handleUpdatePosition = () => {
    toast.success('Position update initiated');
    fetchVessels();
  };

  const filteredVessels = vessels.filter(vessel => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vessel.name?.toLowerCase().includes(search) ||
      vessel.mmsi?.toLowerCase().includes(search) ||
      vessel.imo_number?.toLowerCase().includes(search)
    );
  });

  // Mark first 3 vessels as alerts for demo
  const vesselsWithAlerts = filteredVessels.map((vessel, index) => ({
    ...vessel,
    hasAlert: index < 3 && vessel.status !== 'inactive',
  }));

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading Live Map...</p>
      </div>
    );
  }

  return (
    <div className="live-map-page">
      {/* Header */}
      <div className="map-header">
        <div className="header-left">
          <h1>Live Map Operations</h1>
        </div>
        
        <div className="header-center">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search vessel IMO or Port..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="map-search"
            />
          </div>
        </div>

        <div className="header-right">
          <select className="admin-select">
            <option>View as Admin</option>
            <option>View as Operator</option>
            <option>View as Guest</option>
          </select>
          <button className="notification-btn">
            🔔
            <span className="notification-badge">3</span>
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-buttons">
          <button className="action-btn" title="Filter">
            <span>🛡️</span>
          </button>
          <button className="action-btn" title="Layers">
            <span>☁️</span>
          </button>
          <button className="action-btn primary" onClick={handleUpdatePosition}>
            <span>✏️</span>
            <span>Update Position</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-wrapper">
        <MapContainer
          center={[1.3521, 103.8198]} // Singapore
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Vessel Markers with Alert Circles */}
          {vesselsWithAlerts.map((vessel) => (
            vessel.latitude && vessel.longitude && (
              <React.Fragment key={vessel.id}>
                {/* Red Dashed Circle for Alert Vessels */}
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
                    {/* Center Red Dot */}
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

                {/* Vessel Marker */}
                <Marker
                  position={[parseFloat(vessel.latitude), parseFloat(vessel.longitude)]}
                  icon={createVesselIcon(vessel.hasAlert ? 'alert' : vessel.status)}
                  eventHandlers={{
                    click: () => setSelectedVessel(vessel),
                  }}
                >
                  <Popup>
                    <div className="vessel-popup-content">
                      <h4>{vessel.name || 'Unknown'}</h4>
                      <div className="popup-details">
                        <p><strong>MMSI:</strong> {vessel.mmsi}</p>
                        <p><strong>Type:</strong> {vessel.vessel_type || 'Unknown'}</p>
                        <p><strong>Status:</strong> <span className={`status-${vessel.status}`}>{vessel.status}</span></p>
                        {vessel.hasAlert && <p><strong>⚠️ ALERT:</strong> <span className="status-alert">Safety Alert Active</span></p>}
                        <p><strong>Speed:</strong> {vessel.speed ? `${parseFloat(vessel.speed).toFixed(1)} kn` : 'N/A'}</p>
                        <p><strong>Position:</strong> {parseFloat(vessel.latitude).toFixed(4)}, {parseFloat(vessel.longitude).toFixed(4)}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            )
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="map-legend-box">
          <div className="legend-title">LIVE STATUS</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-indicator underway"></span>
              <span>Underway</span>
            </div>
            <div className="legend-item">
              <span className="legend-indicator restricted"></span>
              <span>Restricted / Delayed</span>
            </div>
            <div className="legend-item">
              <span className="legend-indicator alert"></span>
              <span>Safety Alert</span>
            </div>
            <div className="legend-item">
              <span className="legend-indicator moored"></span>
              <span>Moored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVesselMapPage;