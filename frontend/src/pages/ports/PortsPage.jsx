import React, { useState } from "react";
import { FaSearch, FaShip, FaClock, FaGlobe, FaMapMarkerAlt } from "react-icons/fa";
import "./PortsPage.css";

export default function PortsPage() {

  const [search, setSearch] = useState("");

  const ports = [
    {
      id: 1,
      name: "Port of Singapore",
      location: "Singapore",
      country: "Singapore",
      congestion_score: 72,
      avg_wait_time: 14,
      arrivals: 120,
      departures: 98,
      last_update: "2026-01-31 14:30"
    },
    {
      id: 2,
      name: "Port of Shanghai",
      location: "Shanghai",
      country: "China",
      congestion_score: 58,
      avg_wait_time: 9,
      arrivals: 145,
      departures: 133,
      last_update: "2026-01-31 13:50"
    },
    {
      id: 3,
      name: "Port Klang",
      location: "Klang",
      country: "Malaysia",
      congestion_score: 33,
      avg_wait_time: 5,
      arrivals: 90,
      departures: 84,
      last_update: "2026-01-31 12:10"
    }
  ];

  const filteredPorts = ports.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ports-page">
      <h1 className="ports-title">Global Ports Overview</h1>

      {/* SEARCH BAR */}
      <div className="ports-search-box">
        <FaSearch className="ports-search-icon" />
        <input 
          type="text"
          placeholder="Search port name or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TOP CARDS */}
      <div className="ports-cards">
        <div className="ports-card">
          <FaShip className="pc-icon blue" />
          <div>
            <h3>{ports.length}</h3>
            <p>Total Ports</p>
          </div>
        </div>

        <div className="ports-card">
          <FaClock className="pc-icon yellow" />
          <div>
            <h3>9.6 hrs</h3>
            <p>Avg Wait Time</p>
          </div>
        </div>

        <div className="ports-card">
          <FaGlobe className="pc-icon green" />
          <div>
            <h3>3 Countries</h3>
            <p>Coverage</p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="ports-table-section">
        <h2>Port Statistics</h2>

        <table className="ports-table">
          <thead>
            <tr>
              <th>Port Name</th>
              <th>Location</th>
              <th>Country</th>
              <th>Congestion</th>
              <th>Avg Wait (hrs)</th>
              <th>Arrivals</th>
              <th>Departures</th>
              <th>Last Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredPorts.map(port => (
              <tr key={port.id}>
                <td>{port.name}</td>
                <td>
                  <FaMapMarkerAlt className="loc-icon" /> {port.location}
                </td>
                <td>{port.country}</td>

                <td>
                  <span className={`cong-tag ${
                    port.congestion_score > 70 
                      ? "high" 
                      : port.congestion_score > 40 
                      ? "medium" 
                      : "low"
                  }`}>
                    {port.congestion_score}%
                  </span>
                </td>

                <td>{port.avg_wait_time}</td>
                <td>{port.arrivals}</td>
                <td>{port.departures}</td>
                <td>{port.last_update}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}
