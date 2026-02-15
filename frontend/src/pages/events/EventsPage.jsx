import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from "../../context/AuthContext";

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

// Mock service - replace with your actual API service
const eventService = {
  getAllEvents: async () => {
    // Replace with actual API call
    return {
      data: [
        {
          id: 1,
          vessel_name: 'Sea Spirit',
          event_type: 'Entering Port',
          location: 'Port of Singapore',
          timestamp: '2026-01-31T14:20:00Z',
          details: 'Vessel approaching from the east at slow speed.',
          severity: 'HIGH',
        },
        {
          id: 2,
          vessel_name: 'Ocean Breeze',
          event_type: 'Weather Alert',
          location: 'Malacca Strait',
          timestamp: '2026-01-31T13:50:00Z',
          details: 'Heavy rainfall and turbulence detected.',
          severity: 'MEDIUM',
        },
        {
          id: 3,
          vessel_name: 'Marine Ace',
          event_type: 'Cargo Loading',
          location: 'Port Klang',
          timestamp: '2026-01-31T11:30:00Z',
          details: 'Container loading in progress.',
          severity: 'LOW',
        },
        {
          id: 4,
          vessel_name: 'Blue Pearl',
          event_type: 'AIS Signal Lost',
          location: 'South China Sea',
          timestamp: '2026-01-31T10:10:00Z',
          details: 'Communication interrupted for 4 minutes.',
          severity: 'HIGH',
        },
      ],
    };
  },
  createEvent: async (data) => {
    console.log('Creating event:', data);
    return { data: { id: Date.now(), ...data } };
  },
  updateEvent: async (id, data) => {
    console.log('Updating event:', id, data);
    return { data: { id, ...data } };
  },
  deleteEvent: async (id) => {
    console.log('Deleting event:', id);
    return { data: { success: true } };
  },
};

const EventsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

const isAdmin = user?.role === "admin";
const isOperator = user?.role === "operator";
const isAnalyst = user?.role === "analyst";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const [formData, setFormData] = useState({
    vessel_name: '',
    event_type: '',
    location: '',
    timestamp: '',
    details: '',
    severity: 'MEDIUM',
  });

  const eventTypes = [
    'Entering Port',
    'Leaving Port',
    'Weather Alert',
    'Cargo Loading',
    'Cargo Unloading',
    'AIS Signal Lost',
    'Engine Failure',
    'Collision Warning',
    'Piracy Alert',
    'Medical Emergency',
    'Other',
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents();
      setEvents(response.data || []);
    } catch (error) {
      toast.error('Failed to load events');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      vessel_name: '',
      event_type: '',
      location: '',
      timestamp: new Date().toISOString().slice(0, 16),
      details: '',
      severity: 'MEDIUM',
    });
    setShowModal(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      vessel_name: event.vessel_name,
      event_type: event.event_type,
      location: event.location,
      timestamp: new Date(event.timestamp).toISOString().slice(0, 16),
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
      if (editingEvent) {
        const response = await eventService.updateEvent(editingEvent.id, formData);
        setEvents(events.map((e) => (e.id === editingEvent.id ? response.data : e)));
        toast.success('Event updated successfully');
      } else {
        const response = await eventService.createEvent(formData);
        setEvents([response.data, ...events]);
        toast.success('Event created successfully');
      }
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save event');
      console.error(error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

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
                  <label>Vessel Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.vessel_name}
                    onChange={(e) => setFormData({ ...formData, vessel_name: e.target.value })}
                    placeholder="Enter vessel name"
                  />
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

                <div className="form-group">
                  <label>Timestamp *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.timestamp}
                    onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
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