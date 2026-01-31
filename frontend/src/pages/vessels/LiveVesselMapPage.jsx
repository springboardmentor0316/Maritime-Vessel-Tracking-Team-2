import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import 'leaflet/dist/leaflet.css';
import './LiveVesselMapPage.css';

import { 
  FaSearch, 
  FaShieldAlt, 
  FaCloud, 
  FaEdit, 
  FaExclamationTriangle
} from "react-icons/fa";

/* --------------------------------------
   CUSTOM VESSEL ICON
--------------------------------------- */
const createVesselIcon = (status) => {
  const colors = {
    underway: '#10b981',
    active: '#10b981',
    anchored: '#f59e0b',
    moored: '#64748b',
    inactive: '#64748b',
    alert: '#ef4444',
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

/* --------------------------------------
   MAIN COMPONENT
--------------------------------------- */
const LiveVesselMapPage = () => {

  const toast = useToast();
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // MAP REF
  const mapRef = useRef(null);

  // LIVE ZOOM %
  const [zoomLevel, setZoomLevel] = useState(6);

  // Correct zoom listener
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateZoom = () => {
      const currentZoom = map.getZoom();
      setZoomLevel(currentZoom);
    };

    map.on("zoomend", updateZoom);

    // Set initial zoom correctly
    setZoomLevel(map.getZoom());

    return () => map.off("zoomend", updateZoom);

  }, []); // Must be empty array

  /* FETCH VESSELS */
  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      const data = await vesselService.getLiveVessels(1);
      setVessels(data);
      setLoading(false);
    } catch {
      toast.error("Failed to load live vessel data");
      setLoading(false);
    }
  };

  /* SEARCH FILTER */
  const filteredVessels = vessels.filter((v) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      v.name?.toLowerCase().includes(s) ||
      v.mmsi?.toLowerCase().includes(s) ||
      v.imo_number?.toLowerCase().includes(s)
    );
  });

  /* TEMP ALERT LOGIC */
  const vesselsWithAlerts = filteredVessels.map((v, i) => ({
    ...v,
    hasAlert: i < 3 && v.status !== 'inactive',
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

      {/* HEADER */}
      <div className="map-header">
        <div className="header-left">
          <h1>Live Map Operations</h1>
        </div>

        <div className="header-center">
          <div className="search-container">
            <span className="search-icon"><FaSearch /></span>
            <input
              type="text"
              className="map-search"
              placeholder="Search vessel IMO or Port..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="action-bar">
        <div className="action-buttons">
          <button className="action-btn"><FaShieldAlt /></button>
          <button className="action-btn"><FaCloud /></button>

          <button className="action-btn primary" onClick={fetchVessels}>
            <FaEdit />
            <span>Update Position</span>
          </button>
        </div>
      </div>

      {/* MAP */}
      <div className="map-wrapper">

        <MapContainer
          center={[1.3521, 103.8198]}
          zoom={6}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(map) => {
            mapRef.current = map;
            setZoomLevel(map.getZoom());
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* VESSELS */}
          {vesselsWithAlerts.map((v) =>
            v.latitude && v.longitude ? (
              <React.Fragment key={v.id}>

                {v.hasAlert && (
                  <>
                    <Circle
                      center={[+v.latitude, +v.longitude]}
                      radius={80000}
                      pathOptions={{
                        color: "#ef4444",
                        fillOpacity: 0.07,
                        dashArray: "10, 10",
                      }}
                    />
                    <Circle
                      center={[+v.latitude, +v.longitude]}
                      radius={15000}
                      pathOptions={{
                        color: "#ef4444",
                        fillOpacity: 0.9,
                      }}
                    />
                  </>
                )}

                <Marker
                  position={[+v.latitude, +v.longitude]}
                  icon={createVesselIcon(v.hasAlert ? "alert" : v.status)}
                >
                  <Popup>
                    <div className="vessel-popup-content">
                      <h4>{v.name || "Unknown"}</h4>
                      <p><strong>MMSI:</strong> {v.mmsi}</p>
                      <p><strong>Type:</strong> {v.vessel_type}</p>
                      <p><strong>Status:</strong> {v.status}</p>

                      {v.hasAlert && (
                        <p>
                          <FaExclamationTriangle color="#ef4444" /> <strong>ALERT</strong>
                        </p>
                      )}

                      <p><strong>Speed:</strong> {v.speed || "N/A"} kn</p>
                      <p><strong>Position:</strong> {v.latitude}, {v.longitude}</p>
                    </div>
                  </Popup>
                </Marker>

              </React.Fragment>
            ) : null
          )}

        </MapContainer>

        {/* ⭐ TOP-LEFT ZOOM BAR (FINAL WORKING VERSION) */}
        <div className="zoom-bar">

          {/* – BUTTON */}
          <button 
            className="zoom-btn-small"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setZoom(mapRef.current.getZoom() - 1);
              }
            }}
          >
            −
          </button>

          {/* + BUTTON */}
          <button 
            className="zoom-btn-small"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setZoom(mapRef.current.getZoom() + 1);
              }
            }}
          >
            +
          </button>

          {/* RESET BUTTON */}
          <button 
            className="zoom-reset-small"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setZoom(6);
              }
            }}
          >
            Reset
          </button>

          {/* LIVE PERCENT */}
          <span className="zoom-percent-small">
            {zoomLevel * 25}%
          </span>

        </div>

        {/* LEGEND */}
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
