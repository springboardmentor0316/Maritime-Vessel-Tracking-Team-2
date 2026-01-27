import React, { useState, useEffect } from 'react';
import { VESSEL_TYPES, VESSEL_STATUS } from '../../constants';
import './VesselForm.css';

const VesselForm = ({ vessel, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    imo: '',
    mmsi: '',
    type: '',
    flag: '',
    status: '',
    gross_tonnage: '',
    length: '',
    width: '',
    draft: '',
    built: '',
    latitude: '',
    longitude: '',
    speed: '',
    course: '',
    heading: '',
    destination: '',
    eta: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vessel) {
      setFormData({ ...vessel });
    }
  }, [vessel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.imo) newErrors.imo = 'IMO is required';
    if (!formData.mmsi) newErrors.mmsi = 'MMSI is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.flag) newErrors.flag = 'Flag is required';
    if (!formData.status) newErrors.status = 'Status is required';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="vessel-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="imo">IMO *</label>
            <input
              type="text"
              id="imo"
              name="imo"
              value={formData.imo}
              onChange={handleChange}
              className={errors.imo ? 'error' : ''}
            />
            {errors.imo && <span className="error-text">{errors.imo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mmsi">MMSI *</label>
            <input
              type="text"
              id="mmsi"
              name="mmsi"
              value={formData.mmsi}
              onChange={handleChange}
              className={errors.mmsi ? 'error' : ''}
            />
            {errors.mmsi && <span className="error-text">{errors.mmsi}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? 'error' : ''}
            >
              <option value="">Select type...</option>
              {Object.entries(VESSEL_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.type && <span className="error-text">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="flag">Flag *</label>
            <input
              type="text"
              id="flag"
              name="flag"
              value={formData.flag}
              onChange={handleChange}
              className={errors.flag ? 'error' : ''}
            />
            {errors.flag && <span className="error-text">{errors.flag}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={errors.status ? 'error' : ''}
            >
              <option value="">Select status...</option>
              {Object.entries(VESSEL_STATUS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key.split('_').map(word => 
                    word.charAt(0) + word.slice(1).toLowerCase()
                  ).join(' ')}
                </option>
              ))}
            </select>
            {errors.status && <span className="error-text">{errors.status}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Specifications</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="gross_tonnage">Gross Tonnage</label>
            <input
              type="number"
              id="gross_tonnage"
              name="gross_tonnage"
              value={formData.gross_tonnage}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="length">Length (m)</label>
            <input
              type="number"
              step="0.01"
              id="length"
              name="length"
              value={formData.length}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="width">Width (m)</label>
            <input
              type="number"
              step="0.01"
              id="width"
              name="width"
              value={formData.width}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="draft">Draft (m)</label>
            <input
              type="number"
              step="0.01"
              id="draft"
              name="draft"
              value={formData.draft}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="built">Year Built</label>
            <input
              type="number"
              id="built"
              name="built"
              value={formData.built}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Position & Navigation</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              step="0.000001"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              step="0.000001"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="speed">Speed (knots)</label>
            <input
              type="number"
              step="0.1"
              id="speed"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">Course (degrees)</label>
            <input
              type="number"
              step="0.1"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="heading">Heading (degrees)</label>
            <input
              type="number"
              step="0.1"
              id="heading"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination">Destination</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="eta">ETA</label>
            <input
              type="datetime-local"
              id="eta"
              name="eta"
              value={formData.eta}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {vessel ? 'Update Vessel' : 'Create Vessel'}
        </button>
      </div>
    </form>
  );
};

export default VesselForm;