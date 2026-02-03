import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./PortsPage.css";

/* ================= HELPERS ================= */

function getCongestionLevel(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MODERATE";
  return "LOW";
}

function getMarkerColor(score) {
  if (score >= 70) return "#e8445a";
  if (score >= 40) return "#f0a629";
  return "#3ecf8e";
}

/* Custom Marker */
function createMarkerIcon(color) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div class="marker-dot" style="background:${color};box-shadow:0 0 6px ${color}88;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

/* Fit all markers */
function FitBounds({ ports }) {
  const map = useMap();

  useEffect(() => {
    if (!ports.length) return;

    const bounds = L.latLngBounds(
      ports.map((p) => [p.lat, p.lng])
    );

    map.fitBounds(bounds, { padding: [40, 40] });

  }, [ports, map]);

  return null;
}

/* Fly to selected port */
function FlyToPort({ port }) {
  const map = useMap();

  useEffect(() => {
    if (!port) return;

    map.flyTo([port.lat, port.lng], 8, {
      duration: 1.2,
    });

  }, [port, map]);

  return null;
}

/* ================= COMPONENT ================= */

export default function PortsPage() {

  const [ports, setPorts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPort, setSelectedPort] = useState(null);

  const [sortBy, setSortBy] = useState("congestion");
  const [sortAsc, setSortAsc] = useState(false);

  const [loading, setLoading] = useState(true);


  /* ================= FETCH REAL DATA ================= */

  useEffect(() => {

    const API_BASE =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");


    async function loadPorts() {

      try {

        const res = await fetch(
          `${API_BASE}/api/ports/dashboard/?page=1`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("API Error");
        }

        const data = await res.json();

        console.log("PORT DASHBOARD DATA:", data);


        if (data?.results?.length) {

          const mapped = data.results
            .filter(
              (p) =>
                p.latitude !== null &&
                p.longitude !== null
            )
            .map((p) => ({

              id: p.id,

              name: p.name,

              country: p.country || "",

              lat: Number(p.latitude),
              lng: Number(p.longitude),

              congestion: Number(p.congestion),

              vessels: Number(p.vessels),

              waitHours: Number(p.avg_wait),

              weather: {
                condition: "Clear",
                temp: 25,
                icon: "sun",
              },
            }));


          setPorts(mapped);
        }

      } catch (err) {

        console.error("Ports API failed:", err);

      } finally {

        // 🔥 VERY IMPORTANT
        setLoading(false);

      }
    }

    loadPorts();

  }, []);


  /* ================= FILTER + SORT ================= */

  const filtered = ports
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {

      let val = 0;

      if (sortBy === "name") {
        val = a.name.localeCompare(b.name);
      }
      else if (sortBy === "vessels") {
        val = a.vessels - b.vessels;
      }
      else {
        val = a.congestion - b.congestion;
      }

      return sortAsc ? val : -val;
    });


  /* ================= SORT TOGGLE ================= */

  const cycleSortBy = () => {

    const order = ["congestion", "vessels", "name"];

    const idx = order.indexOf(sortBy);

    if (idx < order.length - 1) {

      setSortBy(order[idx + 1]);

    } else {

      setSortBy(order[0]);
      setSortAsc(!sortAsc);

    }
  };


  /* ================= LOADING ================= */

  if (loading) {
    return <div className="ports-loading">Loading ports...</div>;
  }


  /* ================= UI ================= */

  return (
    <div className="ports-page">

      {/* HEADER */}
      <div className="ports-page-header">
        <h1 className="ports-page-title">
          Port Authority Overview
        </h1>
      </div>


      <div className="ports-layout">

        {/* ========== LEFT PANEL ========== */}
        <div className="ports-left-panel">


          {/* TOP */}
          <div className="ports-panel-header">

            <span className="ports-panel-title">
              Port Authorities
            </span>

            <button
              className="ports-sort-btn"
              onClick={cycleSortBy}
            >
              ⇅
            </button>

          </div>


          {/* SEARCH */}
          <div className="ports-search-wrap">

            <input
              className="ports-search-input"
              type="text"
              placeholder="Find port..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>


          {/* CARDS */}
          <div className="ports-card-list">

            {filtered.map((port) => {

              const level =
                getCongestionLevel(port.congestion);

              const selected =
                selectedPort?.id === port.id;

              return (

                <div
                  key={port.id}
                  className={`port-card ${
                    selected ? "port-card--selected" : ""
                  }`}
                  onClick={() => setSelectedPort(port)}
                >


                  {/* TOP */}
                  <div className="port-card-top">

                    <div className="port-card-name-wrap">

                      <span className="port-card-name">
                        {port.name}
                      </span>

                      <span className="port-card-code">
                        {port.country}
                      </span>

                    </div>

                    <span
                      className={`port-badge port-badge--${level.toLowerCase()}`}
                    >
                      {level}
                    </span>

                  </div>


                  {/* STATS */}
                  <div className="port-card-stats">

                    <div className="port-stat">
                      <span>ANCHORAGE</span>
                      <strong>{port.vessels}</strong>
                    </div>

                    <div className="port-stat">
                      <span>AVG WAIT</span>
                      <strong>{port.waitHours}h</strong>
                    </div>

                  </div>


                  {/* WEATHER */}
                  <div className="port-card-weather">
                    ☀ Clear | {port.weather.temp}°C
                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* ========== RIGHT PANEL (MAP) ========== */}
        <div className="ports-right-panel">

          <MapContainer
            className="ports-map"
            center={[20, 60]}
            zoom={3}
            scrollWheelZoom
          >

            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />


            <FitBounds ports={filtered} />

            <FlyToPort port={selectedPort} />


            {filtered.map((port) => (

              <Marker
                key={port.id}
                position={[port.lat, port.lng]}
                icon={createMarkerIcon(
                  getMarkerColor(port.congestion)
                )}
                eventHandlers={{
                  click: () => setSelectedPort(port),
                }}
              >

                <Popup maxWidth={180}>

                  <strong>{port.name}</strong>

                  <br />

                  {port.country}

                  <br />

                  {port.vessels} vessels · {port.waitHours}h wait

                </Popup>

              </Marker>

            ))}

          </MapContainer>


          {/* LEGEND */}
          <div className="ports-legend">

            <span className="ports-legend-title">
              CONGESTION INDEX
            </span>

            <div className="ports-legend-items">

              <div>
                <span style={{ color: "#e8445a" }}>●</span> High
              </div>

              <div>
                <span style={{ color: "#f0a629" }}>●</span> Moderate
              </div>

              <div>
                <span style={{ color: "#3ecf8e" }}>●</span> Low
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
