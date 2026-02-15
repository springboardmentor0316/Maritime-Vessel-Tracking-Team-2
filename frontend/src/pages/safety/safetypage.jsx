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
      severity: "low",
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

      {/* HEADER */}
      <div className="page-header">
        <h1>Safety Monitoring Dashboard</h1>
        <p className="page-subtitle">
          Monitor vessel risks, alerts and compliance
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="safety-cards">
        <div className="safety-card">
          <FaBell className="stat-icon red" />
          <div>
            <h3>{statistics.activeAlerts}</h3>
            <p>Active Alerts</p>
          </div>
        </div>

        <div className="safety-card">
          <FaCloud className="stat-icon yellow" />
          <div>
            <h3>{statistics.weatherWarnings}</h3>
            <p>Weather Warnings</p>
          </div>
        </div>

        <div className="safety-card">
          <FaShieldAlt className="stat-icon orange" />
          <div>
            <h3>{statistics.restrictedZones}</h3>
            <p>Restricted Zones</p>
          </div>
        </div>

        <div className="safety-card">
          <FaShip className="stat-icon green" />
          <div>
            <h3>{statistics.safeVessels}</h3>
            <p>Safe Vessels</p>
          </div>
        </div>
      </div>

      {/* ALERT CARDS */}
      <div className="alerts-section">
        <h2>Recent Safety Alerts</h2>

        <div className="alerts-grid">
          {alerts.map((alert) => (
            <div key={alert.id} className={`alert-card ${alert.severity}`}>
              <FaExclamationTriangle className="alert-icon" />

              <div className="alert-content">
                <h4>{alert.type}</h4>
                <p>Vessel: {alert.vessel}</p>
                <span>{alert.time}</span>
              </div>

              <div className={`severity-badge ${alert.severity}`}>
                {alert.severity.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="table-section">
        <h2>Vessel Safety Status</h2>

        <div className="table-container">
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
                  <td className={`risk ${v.risk.toLowerCase()}`}>
                    {v.risk}
                  </td>
                  <td className={`comp ${v.compliance.toLowerCase()}`}>
                    {v.compliance}
                  </td>
                  <td>{v.lastAlert}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WEATHER SECTION */}
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
