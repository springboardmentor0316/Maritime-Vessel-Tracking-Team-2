import { useState } from "react";
import Sidebar from "../components/Sidebar";
import LiveMapVoyage from "../components/LiveMapVoyage";
import "../styles/VoyageReplay.css";
import { getVoyageReplay } from "../api/voyage"; // 🔥 backend API

export default function VoyageReplay() {
  // ---------- FRONTEND STATES (filled by backend later) ---------- //
  const [vessels, setVessels] = useState([
    "Atlantic Pioneer",
    "Ocean Pearl",
  ]);

  const [selectedVessel, setSelectedVessel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [departure, setDeparture] = useState({
    label: "New York",
    coords: [-74.006, 40.7128],
  });

  const [currentPos, setCurrentPos] = useState({
    label: "Mid Atlantic",
    coords: [-30, 22],
  });

  const [destination, setDestination] = useState({
    label: "Rotterdam",
    coords: [4.47917, 51.9225],
  });

  const [details, setDetails] = useState({
    vesselName: "Atlantic Pioneer",
    imo: "IMO9234567",
    flag: "Panama",
    distance: "3,456 NM",
    avgSpeed: "14.2 knots",
    departure: "2026-01-09 • 08:00",
    arrival: "2026-01-12 • 16:40",
    compliance: "97%",
  });

  const [timeline, setTimeline] = useState([
    { icon: "🟢", event: "Departed Port", time: "2026-01-09 • 08:00" },
    { icon: "⚓", event: "Anchored", time: "2026-01-10 • 13:30" },
    { icon: "🌧", event: "Weather Alert", time: "2026-01-11 • 09:20" },
    { icon: "🟣", event: "Arrived Port", time: "2026-01-12 • 16:40" },
  ]);

  // =======================  LOAD REPLAY (API)  ========================= //
  const handleLoadReplay = async () => {
    if (!selectedVessel || !startDate || !endDate) {
      alert("Please select vessel and dates");
      return;
    }

    try {
      const data = await getVoyageReplay(
        selectedVessel,
        startDate,
        endDate
      );

      // ---------------- MAP COORDS ----------------
      setDeparture(data.departure);
      setCurrentPos(data.current);
      setDestination(data.destination);

      // ---------------- INFO PANEL ----------------
      setDetails({
        vesselName: data.details.vessel_name,
        imo: data.details.imo,
        flag: data.details.flag,
        distance: `${data.details.distance} NM`,
        avgSpeed: `${data.details.avg_speed} knots`,
        departure: data.details.departure,
        arrival: data.details.arrival,
        compliance: `${data.details.compliance_score}%`,
      });

      // ---------------- TIMELINE ----------------
      setTimeline(data.timeline);

      console.log("Voyage Replay Loaded:", data);
    } catch (err) {
      alert("Failed to load replay");
      console.error(err);
    }
  };

  return (
    <div className="voyage-page">
      <Sidebar />

      <div className="voyage-main">
        <div className="vr-header">
          <h1>Voyage Replay</h1>
          <p>Replay historical vessel routes & movements</p>
        </div>

        {/* FILTER BAR */}
        <div className="vr-filters">
          <select
            className="vr-select"
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
          >
            <option>Select Vessel</option>
            {vessels.map((v, i) => (
              <option key={i}>{v}</option>
            ))}
          </select>

          <input
            type="date"
            className="vr-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="vr-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button className="vr-load-btn" onClick={handleLoadReplay}>
            Load Replay
          </button>
        </div>

        {/* MAP SECTION */}
        <div className="vr-map-card">
          <h3>📍 Route Visualization</h3>

          <div className="vr-map-wrapper">
            <LiveMapVoyage
              departure={departure}
              currentPos={currentPos}
              destination={destination}
            />
          </div>

          {/* LEGEND */}
          <div className="vr-legend">
            <div className="legend-item">
              <span className="dot green"></span> Departure Port
            </div>
            <div className="legend-item">
              <span className="dot blue"></span> Current Location
            </div>
            <div className="legend-item">
              <span className="dot red"></span> Destination Port
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="vr-right-panel">
        <h2>{details.vesselName}</h2>
        <p className="vr-imo">{details.imo} • {details.flag}</p>

        <div className="vr-info-row">
          <span>Distance</span>
          <strong>{details.distance}</strong>
        </div>

        <div className="vr-info-row">
          <span>Avg Speed</span>
          <strong>{details.avgSpeed}</strong>
        </div>

        <div className="vr-info-row">
          <span>Departure</span>
          <strong>{details.departure}</strong>
        </div>

        <div className="vr-info-row">
          <span>Arrival</span>
          <strong>{details.arrival}</strong>
        </div>

        <div className="vr-info-row">
          <span>Compliance Score</span>
          <strong className="success">{details.compliance}</strong>
        </div>

        <h3>Event Timeline</h3>

        <div className="vr-timeline">
          {timeline.map((item, idx) => (
            <div key={idx} className="tl-item">
              <span>{item.icon} {item.event}</span>
              <p>{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
