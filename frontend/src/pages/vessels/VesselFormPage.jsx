import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import VesselForm from '../../components/vessels/VesselForm';
import Loading from '../../components/common/Loading';
import './VesselFormPage.css';

const VesselFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [vessel, setVessel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVessel();
    }
  }, [id]);

  const fetchVessel = async () => {
    try {
      setLoading(true);
      const data = await vesselService.getVesselById(id);
      setVessel(data);
    } catch (error) {
      toast.error('Failed to fetch vessel');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      
      if (id) {
        await vesselService.updateVessel(id, formData);
        toast.success('Vessel updated successfully');
      } else {
        await vesselService.createVessel(formData);
        toast.success('Vessel created successfully');
      }
      
      navigate('/vessels');
    } catch (error) {
      toast.error(id ? 'Failed to update vessel' : 'Failed to create vessel');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(id ? `/vessels/${id}` : '/vessels');
  };

  if (loading) return <Loading />;

  return (
    <div className="vessel-form-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/vessels')}>
          ← Back
        </button>
        <h1>{id ? 'Edit Vessel' : 'Add New Vessel'}</h1>
      </div>

      <div className="form-container">
        {submitting && <Loading text="Saving..." />}
        {!submitting && (
          <VesselForm
            vessel={vessel}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default VesselFormPage;