import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import 'leaflet/dist/leaflet.css';
import './LiveVesselMapPage.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vessel icon based on status
const createVesselIcon = (statusColor, heading) => {
  return L.divIcon({
    className: 'custom-vessel-icon',
    html: `
      <div style="transform: rotate(${heading || 0}deg); color: ${statusColor};">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 7v10c0 5.5 8 8 8 8s8-2.5 8-8V7l-8-5z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const LiveVesselMapPage = () => {
  const toast = useToast();
  const [vessels, setVessels] = useState([]);
  const [stats, setStats] = useState({
    total_vessels: 0,
    active_1h: 0,
  });
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [vesselRoute, setVesselRoute] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchLiveVessels();
    fetchStatistics();
    
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLiveVessels();
        fetchStatistics();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchLiveVessels = async () => {
    try {
      const data = await vesselService.getLiveVessels(1); // Last 1 hour
      setVessels(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
      if (!loading) { // Only show error after initial load
        toast.error('Failed to fetch vessel data');
      }
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await vesselService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchVesselRoute = async (vesselId, hours = 24) => {
    try {
      const response = await vesselService.getVesselRoute(vesselId, hours);
      const route = response.route.map(pos => [pos.latitude, pos.longitude]);
      setVesselRoute(route);
    } catch (error) {
      console.error('Failed to fetch route:', error);
    }
  };

  const handleVesselClick = (vessel) => {
    setSelectedVessel(vessel.id);
    fetchVesselRoute(vessel.id, 6); // Last 6 hours
  };

  // Calculate map center based on vessels
  const getMapCenter = () => {
    if (vessels.length === 0) return [20, 0]; // Default center
    
    const latSum = vessels.reduce((sum, v) => sum + parseFloat(v.latitude), 0);
    const lonSum = vessels.reduce((sum, v) => sum + parseFloat(v.longitude), 0);
    
    return [latSum / vessels.length, lonSum / vessels.length];
  };

  const mapCenter = getMapCenter();

  return (
    <div className="live-vessel-map-page">
      {/* Controls */}
      <div className="map-controls-bar">
        <div className="controls-left">
          <h2>🗺️ Live Vessel Map</h2>
          <div className="vessel-count">
            <span className="count-badge">{vessels.length}</span> vessels visible
          </div>
          <div className="vessel-stats">
            <span>Total: {stats.total_vessels}</span>
            <span>Active (1h): {stats.active_1h}</span>
          </div>
        </div>

        <div className="controls-right">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button className="refresh-btn" onClick={fetchLiveVessels}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="map-wrapper">
        {loading ? (
          <div className="map-loading">
            <div className="spinner"></div>
            <p>Loading {stats.total_vessels} vessels...</p>
          </div>
        ) : vessels.length === 0 ? (
          <div className="map-loading">
            <p>No vessels found. Make sure AIS streaming is running.</p>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Vessel Markers */}
            {vessels.map(vessel => (
              vessel.latitude && vessel.longitude && (
                <Marker
                  key={vessel.id}
                  position={[parseFloat(vessel.latitude), parseFloat(vessel.longitude)]}
                  icon={createVesselIcon(vessel.status_color, vessel.heading)}
                  eventHandlers={{
                    click: () => handleVesselClick(vessel)
                  }}
                >
                  <Popup>
                    <div className="vessel-popup">
                      <h3>{vessel.name || 'Unknown'}</h3>
                      <div className="popup-info">
                        <p><strong>MMSI:</strong> {vessel.mmsi}</p>
                        {vessel.imo_number && vessel.imo_number !== `IMO${vessel.mmsi}` && (
                          <p><strong>IMO:</strong> {vessel.imo_number}</p>
                        )}
                        <p><strong>Type:</strong> {vessel.type || vessel.vessel_type || 'Unknown'}</p>
                        <p><strong>Status:</strong> <span className={`status-${vessel.status}`}>{vessel.status}</span></p>
                        <p><strong>Position:</strong> {parseFloat(vessel.latitude).toFixed(4)}, {parseFloat(vessel.longitude).toFixed(4)}</p>
                        {vessel.speed && <p><strong>Speed:</strong> {parseFloat(vessel.speed).toFixed(1)} knots</p>}
                        {vessel.heading && <p><strong>Heading:</strong> {vessel.heading}°</p>}
                        {vessel.destination && <p><strong>Destination:</strong> {vessel.destination}</p>}
                        <p className="data-source">Source: {vessel.data_source}</p>
                      </div>
                      <button 
                        className="view-details-btn"
                        onClick={() => window.open(`/app/vessels/${vessel.id}`, '_blank')}
                      >
                        View Details →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Vessel Route */}
            {vesselRoute.length > 1 && (
              <Polyline
                positions={vesselRoute}
                color="#3b82f6"
                weight={3}
                opacity={0.7}
                dashArray="10, 10"
              />
            )}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-icon" style={{background: '#10b981'}}>⬆</span>
            <span>Active</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon" style={{background: '#3b82f6'}}>⬆</span>
            <span>Moving/Underway</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon" style={{background: '#f59e0b'}}>⬆</span>
            <span>Anchored</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon" style={{background: '#64748b'}}>⬆</span>
            <span>Inactive</span>
          </div>
        </div>
        <div className="legend-footer">
          <small>Live AIS data via AISStream.io</small>
        </div>
      </div>
    </div>
  );
};

export default LiveVesselMapPage;

