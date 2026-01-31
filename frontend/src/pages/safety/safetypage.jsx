import React, { useState } from "react";
import {
  FaBell,
  FaExclamationTriangle,
  FaShip,
  FaShieldAlt,
  FaCloud,
  FaWind,
  FaMapMarkedAlt
} from "react-icons/fa";

import "./SafetyPage.css";

export default function SafetyPage() {
  // -------------------------
  // STATIC DATA
  // -------------------------
  const [statistics] = useState({
    activeAlerts: 3,
    weatherWarnings: 4,
    restrictedZones: 2,
    safeVessels: 148,
  });

  const [alerts] = useState([
    {
      id: 1,
      vessel: "MV Ocean Star",
      type: "Restricted Zone Breach",
      severity: "high",
      time: "5 mins ago",
    },
    {
      id: 2,
      vessel: "Poseidon Carrier",
      type: "Severe Weather Warning",
      severity: "medium",
      time: "18 mins ago",
    },
    {
      id: 3,
      vessel: "Blue Pearl",
      type: "AIS Signal Lost",
      severity: "high",
      time: "30 mins ago",
    },
  ]);

  const [vesselSafety] = useState([
    {
      vessel: "Sea Spirit",
      mmsi: "987654321",
      risk: "High",
      compliance: "Non-Compliant",
      lastAlert: "AIS Lost",
    },
    {
      vessel: "Ocean Breeze",
      mmsi: "123456789",
      risk: "Medium",
      compliance: "Partial",
      lastAlert: "Weather Warning",
    },
    {
      vessel: "Marine Ace",
      mmsi: "765432198",
      risk: "Low",
      compliance: "Compliant",
      lastAlert: "None",
    },
  ]);

  return (
    <div className="safety-page">
      <h1 className="safety-title">Safety Monitoring Dashboard</h1>

      {/* TOP CARDS */}
      <div className="safety-cards">
        <div className="safety-card">
          <FaBell className="safety-card-icon red" />
          <div>
            <h3>{statistics.activeAlerts}</h3>
            <p>Active Alerts</p>
          </div>
        </div>

        <div className="safety-card">
          <FaCloud className="safety-card-icon yellow" />
          <div>
            <h3>{statistics.weatherWarnings}</h3>
            <p>Weather Warnings</p>
          </div>
        </div>

        <div className="safety-card">
          <FaShieldAlt className="safety-card-icon orange" />
          <div>
            <h3>{statistics.restrictedZones}</h3>
            <p>Restricted Zones</p>
          </div>
        </div>

        <div className="safety-card">
          <FaShip className="safety-card-icon green" />
          <div>
            <h3>{statistics.safeVessels}</h3>
            <p>Safe Vessels</p>
          </div>
        </div>
      </div>

      {/* LIVE ALERT FEED */}
      <div className="alerts-section">
        <h2>Live Safety Alerts</h2>

        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              <FaExclamationTriangle
                className={`alert-icon ${alert.severity}`}
              />
              <div>
                <p className="alert-title">{alert.type}</p>
                <p className="alert-description">
                  Vessel: <strong>{alert.vessel}</strong>
                </p>
                <span className="alert-time">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VESSEL SAFETY TABLE */}
      <div className="table-section">
        <h2>Vessel Safety Status</h2>

        <table className="safety-table">
          <thead>
            <tr>
              <th>Vessel</th>
              <th>MMSI</th>
              <th>Risk Level</th>
              <th>Compliance</th>
              <th>Last Alert</th>
            </tr>
          </thead>
          <tbody>
            {vesselSafety.map((v, index) => (
              <tr key={index}>
                <td>{v.vessel}</td>
                <td>{v.mmsi}</td>
                <td className={`risk ${v.risk.toLowerCase()}`}>{v.risk}</td>
                <td className={`comp ${v.compliance.toLowerCase()}`}>
                  {v.compliance}
                </td>
                <td>{v.lastAlert}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* WEATHER / SEA CONDITIONS */}
      <div className="weather-section">
        <h2>Sea & Weather Conditions</h2>

        <div className="weather-cards">
          <div className="weather-card">
            <FaWind className="weather-icon" />
            <p>Wind Speed</p>
            <h3>18 km/h</h3>
          </div>

          <div className="weather-card">
            <FaCloud className="weather-icon" />
            <p>Visibility</p>
            <h3>Low</h3>
          </div>

          <div className="weather-card">
            <FaMapMarkedAlt className="weather-icon" />
            <p>Wave Height</p>
            <h3>2.4 m</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
