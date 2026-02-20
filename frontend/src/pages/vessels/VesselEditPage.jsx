import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/common/Loading';
import './VesselEditPage.css';
import { useAuth } from '../../context/AuthContext';


// ⭐ React Icons Added
import { FaArrowLeft, FaPlus, FaEdit } from "react-icons/fa";

const VesselEditPage = () => {
  const { id } = useParams();
  const isCreateMode = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    imo_number: '',
    mmsi: '',
    vessel_type: 'Other',
    flag: '',
    latitude: '',
    longitude: '',
    speed: '',
    status: 'active',
  });

  useEffect(() => {
  if (id) {
    fetchVesselDetails();
  } else {
    setLoading(false);
  }
}, [id]);


  const fetchVesselDetails = async () => {
    try {
      const data = await vesselService.getVesselById(id);
      setFormData({
        name: data.name || '',
        imo_number: data.imo_number || '',
        mmsi: data.mmsi || '',
        vessel_type: data.vessel_type || 'Other',
        flag: data.flag || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        speed: data.speed || '',
        status: data.status || 'active',
      });
    } catch (error) {
      console.error('Failed to fetch vessel:', error);
      toast.error('Failed to load vessel details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.name) {
        toast.error('Vessel name is required');
        setSaving(false);
        return;
      }

      if (!formData.mmsi && isCreateMode) {
        toast.error('MMSI is required for new vessels');
        setSaving(false);
        return;
      }

      const vesselData = {
        name: formData.name,
        vessel_type: formData.vessel_type,
        flag: formData.flag || 'Unknown',
        status: formData.status,
      };

      if (isCreateMode) {
        vesselData.mmsi = formData.mmsi;
        vesselData.imo_number = formData.imo_number || `IMO${formData.mmsi}`;
      }

      if (formData.latitude) vesselData.latitude = parseFloat(formData.latitude);
      if (formData.longitude) vesselData.longitude = parseFloat(formData.longitude);
      if (formData.speed) vesselData.speed = parseFloat(formData.speed);

      if (isCreateMode) {
  await vesselService.createVessel(vesselData);
  toast.success('Vessel created successfully');
} else {
  await vesselService.updateVessel(id, vesselData);
  toast.success('Vessel updated successfully');
}


      navigate('/app/vessels');
    } catch (error) {
      console.error('Save failed:', error);
      const errorMsg = error.response?.data?.detail 
        || error.response?.data?.message 
        || JSON.stringify(error.response?.data)
        || 'Failed to save vessel';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(isCreateMode ? '/app/vessels' : `/app/vessels/${id}`);

  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="vessel-edit-page">
      <div className="edit-header">
  <div className="left-section">
    <button className="btn-back" onClick={handleCancel}>
      <FaArrowLeft style={{ marginRight: "6px" }} /> Back
    </button>
  </div>

  <h1 className="edit-title">
    {isCreateMode ? (
      <>
        <FaPlus style={{ marginRight: "8px" }} /> Add New Vessel
      </>
    ) : (
      <>
        <FaEdit style={{ marginRight: "8px" }} /> Edit Vessel
      </>
    )}
  </h1>

  <div className="right-section">
    {!isCreateMode && user?.role === "admin" && (
      <button className="btn-delete" onClick={handleDelete}>
        Delete
      </button>
    )}
  </div>
</div>


      <form className="vessel-form" onSubmit={handleSubmit}>
        <div className="form-card">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">
                Vessel Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter vessel name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="imo_number">IMO Number</label>
              <input
  type="text"
  id="imo_number"
  name="imo_number"
  value={formData.imo_number}
  onChange={handleChange}
  disabled={!isCreateMode}
  placeholder="IMO1234567"
/>

              {!isCreateMode && (
                <small className="form-help">IMO cannot be changed after creation</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="mmsi">
                MMSI {isCreateMode && <span className="required">*</span>}
              </label>
              <input
                type="text"
                id="mmsi"
                name="mmsi"
                value={formData.mmsi}
                onChange={handleChange}
                disabled={!isCreateMode}

                required={isCreateMode}
                placeholder="123456789"
              />
              {!isCreateMode && (
                <small className="form-help">MMSI cannot be changed after creation</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="vessel_type">
                Vessel Type <span className="required">*</span>
              </label>
              <select
                id="vessel_type"
                name="vessel_type"
                value={formData.vessel_type}
                onChange={handleChange}
                required
              >
                <option value="Cargo">Cargo</option>
                <option value="Tanker">Tanker</option>
                <option value="Passenger">Passenger</option>
                <option value="Fishing">Fishing</option>
                <option value="Sailing">Sailing</option>
                <option value="Tug">Tug</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="flag">Flag</label>
              <input
                type="text"
                id="flag"
                name="flag"
                value={formData.flag}
                onChange={handleChange}
                placeholder="Country of registration"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">
                Status <span className="required">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="active">Active</option>
                <option value="Moving">Moving</option>
                <option value="underway">Underway</option>
                <option value="Anchored">Anchored</option>
                <option value="Docked">Docked</option>
                <option value="moored">Moored</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3>Position (Optional)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="0.000001"
                placeholder="e.g., 51.5074"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="0.000001"
                placeholder="e.g., -0.1278"
              />
            </div>

            <div className="form-group">
              <label htmlFor="speed">Speed (knots)</label>
              <input
                type="number"
                id="speed"
                name="speed"
                value={formData.speed}
                onChange={handleChange}
                step="0.1"
                placeholder="e.g., 12.5"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : isCreateMode ? 'Create Vessel' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VesselEditPage;
