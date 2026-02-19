import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from "../../context/AuthContext";
import eventService from '../../services/eventService';
import vesselService from '../../services/vesselService';

import './EventsPage.css';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiAlertTriangle,
  FiMapPin,
  FiClock,
  FiInfo,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiSave,
} from 'react-icons/fi';

const EventsPage = () => {
  const toast = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
const isOperator = user?.role === "operator";
const isAnalyst = user?.role === "analyst";

  const [events, setEvents] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const [formData, setFormData] = useState({
    vessel: '',
    event_type: '',
    location: '',
    details: '',
    severity: 'MEDIUM',
  });

  const eventTypes = [
    'Arrival',
    'Departure',
    'Incident',
    'Alert',
  ];

  useEffect(() => {
    fetchEvents();
    fetchVessels();
  }, []);

  const parseDescription = (description = '') => {
    const match = description.match(/^\[Location:\s*(.*?)\]\s*(.*)$/s);
    if (!match) return { location: '', details: description };
    return { location: match[1] || '', details: match[2] || '' };
  };

  const buildDescription = (location = '', details = '') => {
    const cleanLocation = location.trim();
    const cleanDetails = details.trim();
    if (cleanLocation && cleanDetails) return `[Location: ${cleanLocation}] ${cleanDetails}`;
    if (cleanLocation) return `[Location: ${cleanLocation}]`;
    return cleanDetails;
  };

  const normalizeEvent = (event) => {
    const { location, details } = parseDescription(event.description || '');
    return {
      ...event,
      location,
      details,
      severity: (event.severity || 'Medium').toUpperCase(),
    };
  };

  const toApiSeverity = (severity) => {
    if (!severity) return 'Medium';
    return severity[0] + severity.slice(1).toLowerCase();
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      const list = data?.results || data || [];
      setEvents(list.map(normalizeEvent));
    } catch (error) {
      toast.error('Failed to load events');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVessels = async () => {
    try {
      const data = await vesselService.getAllVessels({ page_size: 1000 });
      setVessels(data?.results || data || []);
    } catch (error) {
      console.error('Failed to load vessels for event form:', error);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      vessel: '',
      event_type: 'Incident',
      location: '',
      details: '',
      severity: 'MEDIUM',
    });
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      vessel: event.vessel ? String(event.vessel) : '',
      event_type: event.event_type,
      location: event.location,
      details: event.details,
      severity: event.severity,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter((e) => e.id !== id));
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        vessel: Number(formData.vessel),
        event_type: formData.event_type,
        severity: toApiSeverity(formData.severity),
        description: buildDescription(formData.location, formData.details),
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(payload);
        toast.success('Event created successfully');
      }
      await fetchEvents();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save event');
      console.error(error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      (event.vessel_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.event_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = filterSeverity === 'ALL' || event.severity === filterSeverity;
    const matchesType = filterType === 'ALL' || event.event_type === filterType;

    return matchesSearch && matchesSeverity && matchesType;
  });

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'severity-high';
      case 'MEDIUM':
        return 'severity-medium';
      case 'LOW':
        return 'severity-low';
      default:
        return 'severity-medium';
    }
  };

  const recentEvents = filteredEvents.slice(0, 3);

  if (loading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <p>Loading Events...</p>
      </div>
    );
  }

  return (
    <div className="events-page">
      {/* Header */}
      <div
        className="events-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          width: '100%'
        }}
      >
        <div className="header-left" style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0 }}>Vessel Events History</h1>
          <p className="header-subtitle" style={{ marginTop: 4 }}>Monitor and manage vessel events and incidents</p>
        </div>
        {!isAnalyst && (
  <button
    className="btn-create-small"
    onClick={handleCreate}
    style={{
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      whiteSpace: 'nowrap',
      width: 'auto',
      maxWidth: '240px'
    }}
  >
    <FiPlus size={16} /> Create Event
  </button>
)}

      </div>

      {/* Filters */}
      <div className="events-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by vessel, type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group-wrapper">
          <label className="filter-label-top">Filter by Severity:</label>
          <select
            className="filter-select-compact"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="filter-group-wrapper">
          <label className="filter-label-top">Filter by Type:</label>
          <select
            className="filter-select-compact"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recent Events Cards */}
      {recentEvents.length > 0 && (
        <>
          <h2 className="section-title">Recent Events</h2>
          <div className="recent-events-grid">
            {recentEvents.map((event) => (
              <div key={event.id} className={`event-card ${getSeverityClass(event.severity)}`}>
                <div className="event-card-header">
                  <FiAlertTriangle className="event-icon" />
                  <span className="event-type">{event.event_type}</span>
                  <span className={`severity-badge ${getSeverityClass(event.severity)}`}>
                    {event.severity}
                  </span>
                </div>
                <div className="event-card-body">
                  <div className="event-vessel">Vessel: {event.vessel_name}</div>
                  <div className="event-time">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* All Events Table */}
      <h2 className="section-title">All Events ({filteredEvents.length})</h2>
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
              <th>Severity</th>
             {(isAdmin || isOperator) && <th>Actions</th>}


            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={isAnalyst ? 7 : 8} className="no-data">

                  No events found
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.id}</td>
                  <td className="vessel-cell">{event.vessel_name}</td>
                  <td>{event.event_type}</td>
                  <td>
                    <FiMapPin className="icon-inline" /> {event.location}
                  </td>
                  <td>
                    <FiClock className="icon-inline" />{' '}
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="details-cell">{event.details}</td>
                  <td>
  <span
    style={{
      padding: "6px 12px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      color: "white",
      backgroundColor:
        event.severity === "HIGH"
          ? "#ef4444"
          : event.severity === "MEDIUM"
          ? "#f59e0b"
          : "#10b981",
    }}
  >
    {event.severity}
  </span>
</td>

               {(isAdmin || isOperator) && (
                <td className="actions-cell">
  {/* Edit - Admin & Operator */}
  {(isAdmin || isOperator) && (
    <button
      className="btn-icon-action btn-edit"
      onClick={() => handleEdit(event)}
      title="Edit"
    >
      <FiEdit2 />
    </button>
  )}

  {/* Delete - Admin Only */}
  {isAdmin && (
    <button
      className="btn-icon-action btn-delete"
      onClick={() => handleDelete(event.id)}
      title="Delete"
    >
      <FiTrash2 />
    </button>
  )}
</td>

  
)}

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
                title="Close"
                style={{
                  marginLeft: 'auto',
                  width: 32,
                  height: 32,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Vessel *</label>
                  <select
                    required
                    value={formData.vessel}
                    onChange={(e) => setFormData({ ...formData, vessel: e.target.value })}
                  >
                    <option value="">Select vessel</option>
                    {vessels.map((vessel) => (
                      <option key={vessel.id} value={vessel.id}>
                        {vessel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Event Type *</label>
                  <select
                    required
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  >
                    <option value="">Select type</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Port of Singapore"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Severity *</label>
                <div className="severity-options" style={{ display: 'flex', gap: 8 }}>
                  {['LOW', 'MEDIUM', 'HIGH'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity: sev })}
                      className={`severity-chip ${getSeverityClass(sev)}`}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: formData.severity === sev ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                        background: 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                        fontWeight: 600,
                        opacity: formData.severity === sev ? 1 : 0.8,
                      }}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Details</label>
                <textarea
                  rows="4"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Enter event details..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  <FiSave /> {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
