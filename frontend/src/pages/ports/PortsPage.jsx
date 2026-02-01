import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaShip,
  FaClock,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";

import portService from "../../services/portService";
import "./PortsPage.css";

export default function PortsPage() {

  const [ports, setPorts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 100;



  // =====================
  // FETCH PORTS
  // =====================
  useEffect(() => {
    fetchPorts();
  }, [page, search]);


  const fetchPorts = async () => {
    try {
      setLoading(true);

      const res = await portService.getDashboardPorts(page, search);

      console.log("PORT API DATA:", res);

      // Backend pagination response
      setPorts(res.results || []);
      setTotal(res.count || 0);

    } catch (err) {
      console.error("Failed to load ports:", err);
    } finally {
      setLoading(false);
    }
  };



  // =====================
  // STATS (FROM BACKEND DATA ONLY)
  // =====================
  const countrySet = new Set(
    ports.map((p) => p.country).filter(Boolean)
  );


  const totalPages = Math.ceil(total / PAGE_SIZE);



  if (loading) {
    return <div className="ports-loading">Loading ports...</div>;
  }



  return (
    <div className="ports-page">

      <h1 className="ports-title">Global Ports Overview</h1>


      {/* SEARCH */}
      <div className="ports-search-box">
        <FaSearch className="ports-search-icon" />

        <input
          type="text"
          placeholder="Search port name or country..."
          value={search}

          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);   // RESET PAGE ON SEARCH
          }}
        />
      </div>



      {/* PAGINATION */}
      <div className="ports-pagination">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ◀ Prev
        </button>

        <span>
          Page {page} of {totalPages || 1}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next ▶
        </button>

      </div>



      {/* CARDS */}
      <div className="ports-cards">

        <div className="ports-card">
          <FaShip className="pc-icon blue" />
          <div>
            <h3>{total}</h3>
            <p>Total Ports</p>
          </div>
        </div>

        <div className="ports-card">
          <FaClock className="pc-icon yellow" />
          <div>
            <h3>—</h3>
            <p>Avg Wait Time</p>
          </div>
        </div>

        <div className="ports-card">
          <FaGlobe className="pc-icon green" />
          <div>
            <h3>{countrySet.size}</h3>
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

            {ports.map((port) => (

              <tr key={port.id}>

                <td>{port.name}</td>

                <td>
                  <FaMapMarkerAlt className="loc-icon" />
                  {port.location || "—"}
                </td>

                <td>{port.country || "—"}</td>

                <td>
                  <span
                    className={`cong-tag ${
                      port.congestion > 70
                        ? "high"
                        : port.congestion > 40
                        ? "medium"
                        : "low"
                    }`}
                  >
                    {port.congestion}%
                  </span>
                </td>

                <td>{port.avg_wait_time}</td>

                <td>{port.arrivals}</td>

                <td>{port.departures}</td>

                <td>
                  {port.last_update
                    ? new Date(port.last_update).toLocaleString()
                    : "—"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
