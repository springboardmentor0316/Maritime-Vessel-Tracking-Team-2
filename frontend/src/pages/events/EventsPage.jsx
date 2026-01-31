import React from "react";
import {
  FaExclamationTriangle,
  FaClock,
  FaMapMarkerAlt,
  FaInfoCircle
} from "react-icons/fa";

import "./EventsPage.css";

export default function EventsPage() {
  // ------------------------------
  // STATIC DATA (Replace later with backend API)
  // ------------------------------
  const recentEvents = [
    {
      event_type: "Entering Port",
      vessel: "Sea Spirit",
      severity: "high",
      timestamp: "2026-01-31 14:20"
    },
    {
      event_type: "Weather Alert",
      vessel: "Ocean Breeze",
      severity: "medium",
      timestamp: "2026-01-31 13:50"
    },
    {
      event_type: "Cargo Loading",
      vessel: "Marine Ace",
      severity: "low",
      timestamp: "2026-01-31 11:30"
    }
  ];

  const allEvents = [
    {
      id: 1,
      vessel: "Sea Spirit",
      type: "Entering Port",
      location: "Port of Singapore",
      timestamp: "2026-01-31 14:20",
      details: "Vessel approaching from the east at slow speed."
    },
    {
      id: 2,
      vessel: "Ocean Breeze",
      type: "Weather Alert",
      location: "Malacca Strait",
      timestamp: "2026-01-31 13:50",
      details: "Heavy rainfall and turbulence detected."
    },
    {
      id: 3,
      vessel: "Marine Ace",
      type: "Cargo Loading",
      location: "Port Klang",
      timestamp: "2026-01-31 11:30",
      details: "Container loading in progress."
    },
    {
      id: 4,
      vessel: "Blue Pearl",
      type: "AIS Signal Lost",
      location: "South China Sea",
      timestamp: "2026-01-31 10:10",
      details: "Communication interrupted for 4 minutes."
    }
  ];

  return (
    <div className="events-page">

      {/* MAIN TITLE */}
      <h1 className="events-title">Vessel Events History</h1>

      {/* ⭐ RECENT EVENTS - HORIZONTAL CARDS */}
      <h2 className="section-title">Recent Events</h2>

      <div className="events-feed-container">
        {recentEvents.map((event, i) => (
          <div key={i} className="event-feed-item">

            <div className="event-item-header">
              <FaExclamationTriangle className="event-icon" />
              <span className="event-type">{event.event_type}</span>
              <span className={`event-severity ${event.severity}`}>
                {event.severity.toUpperCase()}
              </span>
            </div>

            <p className="event-vessel">
              Vessel: <strong>{event.vessel}</strong>
            </p>

            <p className="event-time">{event.timestamp}</p>
          </div>
        ))}
      </div>

      {/* ⭐ FULL EVENTS TABLE */}
      <h2 className="section-title">All Events</h2>

      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vessel</th>
              <th>Event Type</th>
              <th>Location</th>
              <th>Timestamp</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {allEvents.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.id}</td>
                <td>{ev.vessel}</td>
                <td>{ev.type}</td>

                <td>
                  <FaMapMarkerAlt className="table-icon" />
                  {ev.location}
                </td>

                <td>
                  <FaClock className="table-icon" />
                  {ev.timestamp}
                </td>

                <td>
                  <FaInfoCircle className="table-icon" />
                  {ev.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
