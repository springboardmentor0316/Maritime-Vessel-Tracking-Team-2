import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/VesselTracking.css";
import LiveMap from "../components/LiveMap";
import { FiAlertCircle, FiAnchor, FiTrendingUp, FiTruck } from "react-icons/fi";

export default function VesselTracking() {
  // -------------------------------
  //  BACKEND DATA STATES
  // -------------------------------
  const [stats, setStats] = useState(null);
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);

  useEffect(() => {
    loadStats();
    loadVessels();
  }, []);

  // Load all stats + notifications
  async function loadStats() {
    try {
      const res = await fetch("http://localhost:8001/api/stats/");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  }

  // Load vessel list
  async function loadVessels() {
    try {
      const res = await fetch("http://localhost:8001/api/vessels/");
      const data = await res.json();

      setVessels(data);
      if (data.length > 0) setSelectedVessel(data[0]);
    } catch (error) {
      console.error("Failed to load vessels", error);
    }
  }

  return (
    <div className="vessel-page">
      <Sidebar />

      <div className="main">
        {/* TOP BAR */}
        <div className="topbar">
          <div>
            <h1>Vessel Tracking</h1>
            <p>Real-time maritime intelligence</p>
          </div>

          {/* 🔔 Notifications Badge — from backend */}
          <div className="notif-badge">
            <span className="bell">🔔</span>
            <span className="count">{stats?.notifications || 0}</span>
          </div>
        </div>

        {/* STATS FROM BACKEND */}
        <div className="stats">
          <StatCard
            title="Active Vessels"
            value={stats?.active || "—"}
            icon={<FiTruck />}
          />

          <StatCard
            title="In Transit"
            value={stats?.transit || "—"}
            icon={<FiTrendingUp />}
          />

          <StatCard
            title="Docked"
            value={stats?.docked || "—"}
            icon={<FiAnchor />}
          />

          <StatCard
            title="Alerts"
            value={stats?.alerts || "—"}
            icon={<FiAlertCircle />}
          />
        </div>

        {/* CONTENT AREA */}
        <div className="content">

          {/* LEFT AREA */}
          <div className="center">
            <div className="search-box">
              <h3>🔍 Vessel Search & Filters</h3>

              <div className="filters">
                <input placeholder="Search by vessel name or IMO..." />

                <select>
                  <option>All Types</option>
                  <option>Container Ship</option>
                  <option>Tanker</option>
                  <option>Cargo</option>
                  <option>Passenger</option>
                </select>

                <select>
                  <option>All Status</option>
                  <option>Active</option>
                  <option>In Transit</option>
                  <option>Docked</option>
                </select>
              </div>
            </div>

            {/* MAP */}
            <div className="map-box">
              <div className="map-header">
                <h3>📍 Live Vessel Tracking</h3>

                <div className="map-tags">
                  <span>Weather</span>
                  <span>Traffic</span>
                  <span>Ports</span>
                </div>
              </div>

              <p className="subtext">Real-time vessel positions and movements</p>

              <LiveMap vessels={vessels} />
            </div>
          </div>

          {/* RIGHT – VESSEL DETAILS */}
          <div className="details">
            {selectedVessel ? (
              <>
                <h2>{selectedVessel.name}</h2>
                <p className="muted">
                  {selectedVessel.imo} • {selectedVessel.flag}
                </p>

                <DetailRow label="Type" value={selectedVessel.type} />
                <DetailRow label="Status" value={selectedVessel.status} highlight />
                <DetailRow label="Speed" value={selectedVessel.speed} />
                <DetailRow label="Course" value={selectedVessel.course} />
                <DetailRow label="Current Location" value={selectedVessel.location} />
                <DetailRow label="Cargo" value={selectedVessel.cargo} />
                <DetailRow label="ETA Rotterdam" value={selectedVessel.eta} />

                <button className="track-btn">Track Vessel</button>
              </>
            ) : (
              <p>Loading vessel details...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong className={highlight ? "active" : ""}>{value}</strong>
    </div>
  );
}
