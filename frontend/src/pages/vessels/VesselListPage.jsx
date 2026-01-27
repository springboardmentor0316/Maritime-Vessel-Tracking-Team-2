import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vesselService from '../../services/vesselService';
import { useToast } from '../../context/ToastContext';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import './VesselListPage.css';

const VesselListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
  });

  useEffect(() => {
    fetchVessels();
  }, [filters]);

  const fetchVessels = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.type !== 'all') params.vessel_type = filters.type;
      if (filters.status !== 'all') params.status = filters.status;

      const data = await vesselService.getAllVessels(params);
      setVessels(data);
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
      toast.error('Failed to load vessels');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleViewDetails = (vessel) => {
    navigate(`/app/vessels/${vessel.id}`);
  };

  const handleEditVessel = (vessel) => {
    navigate(`/app/vessels/${vessel.id}/edit`);
  };

  const handleDeleteVessel = async (vessel) => {
    if (!window.confirm(`Delete vessel "${vessel.name}"?`)) return;

    try {
      await vesselService.deleteVessel(vessel.id);
      toast.success('Vessel deleted successfully');
      fetchVessels();
    } catch (error) {
      console.error('Failed to delete vessel:', error);
      toast.error('Failed to delete vessel');
    }
  };

  const columns = [
    {
      header: 'Name',
      field: 'name',
      render: (value, row) => (
        <span 
          className="vessel-name-link"
          onClick={() => handleViewDetails(row)}
        >
          {value || 'Unknown'}
        </span>
      ),
    },
    {
      header: 'IMO',
      field: 'imo_number',
      render: (value) => value && value.startsWith('IMO') ? value.substring(3, 12) : value,
    },
    {
      header: 'MMSI',
      field: 'mmsi',
    },
    {
      header: 'Type',
      field: 'vessel_type',
      render: (value) => <Badge text={value || 'Other'} type="default" />,
    },
    {
      header: 'Status',
      field: 'status',
      render: (value) => {
        const types = {
          'active': 'success',
          'Moving': 'success',
          'underway': 'primary',
          'Anchored': 'warning',
          'anchored': 'warning',
          'Docked': 'info',
          'moored': 'info',
          'inactive': 'danger',
        };
        return <Badge text={value} type={types[value] || 'default'} />;
      },
    },
    {
      header: 'Flag',
      field: 'flag',
    },
    {
      header: 'Position',
      field: 'latitude',
      render: (lat, row) => {
        if (!lat || !row.longitude) return 'N/A';
        return `${parseFloat(lat).toFixed(2)}, ${parseFloat(row.longitude).toFixed(2)}`;
      },
    },
    {
      header: 'Actions',
      field: 'id',
      render: (id, row) => (
        <div className="action-buttons">
          <button
            className="btn-icon btn-view"
            onClick={() => handleViewDetails(row)}
            title="View Details"
          >
            👁️
          </button>
          <button
            className="btn-icon btn-edit"
            onClick={() => handleEditVessel(row)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={() => handleDeleteVessel(row)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="vessel-list-page">
      <div className="page-header">
        <h1>🚢 Vessels</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/app/vessels/new')}
        >
          + Add Vessel
        </button>
      </div>

      <div className="filters-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, IMO, or MMSI..."
          value={filters.search}
          onChange={handleSearchChange}
        />

        <select
          className="filter-select"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="all">All Types</option>
          <option value="Cargo">Cargo</option>
          <option value="Tanker">Tanker</option>
          <option value="Passenger">Passenger</option>
          <option value="Fishing">Fishing</option>
          <option value="Sailing">Sailing</option>
          <option value="Tug">Tug</option>
          <option value="Other">Other</option>
        </select>

        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="Moving">Moving</option>
          <option value="underway">Underway</option>
          <option value="Anchored">Anchored</option>
          <option value="Docked">Docked</option>
          <option value="inactive">Inactive</option>
        </select>

        <button className="btn btn-secondary" onClick={fetchVessels}>
          Clear
        </button>
      </div>

      <DataTable
        columns={columns}
        data={vessels}
        onRowClick={handleViewDetails}
        loading={loading}
        emptyMessage="No vessels found. Add a vessel or start AIS streaming."
      />
    </div>
  );
};

export default VesselListPage;