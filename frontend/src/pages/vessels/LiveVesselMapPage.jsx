import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import 'leaflet/dist/leaflet.css';
import './LiveVesselMapPage.css';

import { FaSearch, FaExclamationTriangle } from "react-icons/fa";

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
   ZOOM CONTROLS (Ports Style)
--------------------------------------- */
function ZoomControls() {
  const map = useMap();
  const defaultZoom = 4; // default zoom level for Reset
  const [zoomPercent, setZoomPercent] = useState(map.getZoom() * 25);

  // Update zoom % whenever zoom changes
  map.on("zoomend", () => {
    setZoomPercent(map.getZoom() * 25);
  });

  return (
    <div className="zoom-control-box">
      <div className="zoom-display">{zoomPercent}%</div>

      <button className="zoom-btn" onClick={() => map.zoomOut()}>
        −
      </button>

      <button className="zoom-btn" onClick={() => map.zoomIn()}>
        +
      </button>

      <button
        className="reset-btn"
        onClick={() => map.setView(map.getCenter(), defaultZoom)}
      >
        Reset
      </button>
    </div>
  );
}

/* --------------------------------------
   MAIN COMPONENT
--------------------------------------- */
const LiveVesselMapPage = () => {

  const toast = useToast();
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const mapRef = useRef(null);

  /* FETCH LIVE VESSELS */
  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    try {
      const res = await vesselService.getLiveVessels(1);
      const list = res?.results || res || [];

      const mapped = list
        .filter(v => v.latitude && v.longitude)
        .map(v => ({
          id: v.id,
          name: v.name || "Unknown Vessel",
          mmsi: v.mmsi || "",
          imo_number: v.imo_number || "",
          latitude: Number(v.latitude),
          longitude: Number(v.longitude),
          status: v.status || "active",
          speed: Number(v.speed) || 0,
          vessel_type: v.vessel_type || "Unknown",
        }));

      setVessels(mapped);
      setLoading(false);

    } catch (err) {
      console.error("Live vessel fetch error:", err);
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
      String(v.mmsi || "").toLowerCase().includes(s) ||
      String(v.imo_number || "").toLowerCase().includes(s)
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

      {/* MAP */}
      <div className="map-wrapper">

        <div className="map-container-box">

          <MapContainer
            center={[1.3521, 103.8198]}
            zoom={6}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => (mapRef.current = map)}
          >
            <ZoomControls />

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
    </div>
  );
};

export default LiveVesselMapPage;
