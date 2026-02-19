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
    underway: '#2bfecf',
    active: '#2bfecf',
    anchored: '#ffb020',
    moored: '#90a4c8',
    inactive: '#7d8fb5',
    alert: '#ff4d7a',
  };

  const color = colors[status?.toLowerCase()] || '#2bfecf';

  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <svg width="34" height="38" viewBox="0 0 34 38" fill="none">
        <g>
          <path d="M17 3.5L23.8 15.6L17 27.7L10.2 15.6L17 3.5Z"
                stroke="${color}" stroke-width="2.4" fill="rgba(16,20,28,0.18)" stroke-linejoin="round"/>
          <path d="M17 9.5L20 15.6L17 21.7L14 15.6L17 9.5Z"
                stroke="${color}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
          <line x1="17" y1="27.7" x2="17" y2="33.5" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
          <rect x="13.2" y="33.5" width="7.6" height="2.6" rx="1.3" stroke="${color}" stroke-width="1.8" fill="none"/>
        </g>
      </svg>
    `,
    iconSize: [34, 38],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
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
            minZoom={2}
            zoomControl={false}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => (mapRef.current = map)}
            worldCopyJump={false}
            maxBounds={[[-85, -180], [85, 180]]}
            maxBoundsViscosity={1.0}
            inertia={false}
          >
            <ZoomControls />

            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              noWrap={true}
              bounds={[[-85, -180], [85, 180]]}
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
                    <Popup className="vessel-map-popup" maxWidth={220}>
                      <div className="vessel-popup-content">
                        <strong className="vessel-popup-title">{v.name || "Unknown Vessel"}</strong>
                        <div className="vessel-popup-body">
                          <div>MMSI: {v.mmsi || "N/A"}</div>
                          <div>IMO: {v.imo_number || "N/A"}</div>
                          <div>Status: {v.status || "N/A"}</div>
                          <div>Type: {v.vessel_type || "N/A"}</div>
                          <div>Speed: {v.speed || "N/A"} kn</div>
                          <div>Position: {v.latitude}, {v.longitude}</div>
                          {v.hasAlert && (
                            <div className="vessel-alert-row">
                              <FaExclamationTriangle color="#ef4444" /> ALERT
                            </div>
                          )}
                        </div>
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
