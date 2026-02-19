import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './VesselDetailPage.css';


import { useAuth } from '../../context/AuthContext';

// ⭐ React Icons
import { FaShip, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

const VesselDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isOperator = user?.role === "operator";
  const isAnalyst = user?.role === "analyst";

  const [vessel, setVessel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchVesselDetails();
  }, [id]);

  const fetchVesselDetails = async () => {
    try {
      const data = await vesselService.getVesselById(id);
      setVessel(data);
    } catch (error) {
      console.error('Failed to fetch vessel:', error);
      toast.error('Failed to load vessel details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/app/vessels');
  };

  const handleEdit = () => {
    navigate(`/app/vessels/${id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await vesselService.deleteVessel(id);
      toast.success('Vessel deleted successfully');
      navigate('/app/vessels');
    } catch (error) {
      console.error('Failed to delete vessel:', error);
      toast.error('Failed to delete vessel');
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!vessel) {
    return (
      <div className="vessel-detail-page">
        <div className="error-message">
          <h2>Vessel not found</h2>
          <button className="btn btn-primary" onClick={handleBack}>
            <FaArrowLeft /> Back to Vessels
          </button>
        </div>
      </div>
    );
  }

  const statusType = {
    'active': 'success',
    'Moving': 'success',
    'underway': 'primary',
    'Anchored': 'warning',
    'anchored': 'warning',
    'Docked': 'info',
    'moored': 'info',
    'inactive': 'danger',
  };

  return (
    <div className="vessel-detail-page">
      <div className="detail-header">
        <button className="btn-back" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>

        <h1>
          <FaShip style={{ marginRight: "8px" }} />
          {vessel.name || 'Unknown Vessel'}
        </h1>

        <div className="header-actions">

          {(isAdmin || isOperator) && (
            <button className="btn btn-secondary" onClick={handleEdit}>
              <FaEdit style={{ marginRight: "5px" }} /> Edit
            </button>
          )}

          {isAdmin && (
            <button className="btn btn-delete" onClick={handleDelete}>
              <FaTrash style={{ marginRight: "5px" }} /> Delete
            </button>
          )}

</div>

      </div>

      <div className="detail-content">
        <div className="detail-card">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Name</label>
              <span>{vessel.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>IMO Number</label>
              <span>{vessel.imo_number || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>MMSI</label>
              <span>{vessel.mmsi || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Call Sign</label>
              <span>{vessel.callsign || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Type</label>
              <Badge text={vessel.vessel_type || vessel.type || 'Other'} type="default" />
            </div>
            <div className="detail-item">
              <label>Status</label>
              <Badge text={vessel.status} type={statusType[vessel.status] || 'default'} />
            </div>
            <div className="detail-item">
              <label>Flag</label>
              <span>{vessel.flag || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <label>Data Source</label>
              <span>{vessel.data_source || 'manual'}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3>Current Position</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Latitude</label>
              <span>{vessel.latitude ? parseFloat(vessel.latitude).toFixed(6) : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Longitude</label>
              <span>{vessel.longitude ? parseFloat(vessel.longitude).toFixed(6) : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Speed</label>
              <span>{vessel.speed ? `${parseFloat(vessel.speed).toFixed(1)} knots` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Course</label>
              <span>{vessel.course ? `${parseFloat(vessel.course).toFixed(1)}°` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Heading</label>
              <span>{vessel.heading ? `${vessel.heading}°` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Last Update</label>
              <span>
                {vessel.last_position_update 
                  ? new Date(vessel.last_position_update).toLocaleString() 
                  : vessel.last_updated 
                    ? new Date(vessel.last_updated).toLocaleString()
                    : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {vessel.destination && (
          <div className="detail-card">
            <h3>Voyage Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Destination</label>
                <span>{vessel.destination}</span>
              </div>
              {vessel.eta && (
                <div className="detail-item">
                  <label>ETA</label>
                  <span>{new Date(vessel.eta).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {(vessel.length || vessel.width || vessel.draft) && (
          <div className="detail-card">
            <h3>Dimensions</h3>
            <div className="detail-grid">
              {vessel.length && (
                <div className="detail-item">
                  <label>Length</label>
                  <span>{vessel.length} m</span>
                </div>
              )}
              {vessel.width && (
                <div className="detail-item">
                  <label>Width</label>
                  <span>{vessel.width} m</span>
                </div>
              )}
              {vessel.draft && (
                <div className="detail-item">
                  <label>Draft</label>
                  <span>{vessel.draft} m</span>
                </div>
              )}
              {vessel.gross_tonnage && (
                <div className="detail-item">
                  <label>Gross Tonnage</label>
                  <span>{vessel.gross_tonnage}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Vessel"
        message={`Delete vessel "${vessel.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default VesselDetailPage;
