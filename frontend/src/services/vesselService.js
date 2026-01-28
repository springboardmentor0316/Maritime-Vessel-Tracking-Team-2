import apiClient from '../config/api';

const vesselService = {
  // Get all vessels
  getAllVessels: async (params = {}) => {
    return await apiClient.get('/api/vessels/', { params });
  },

  // Get vessel by ID
  getVesselById: async (id) => {
    return await apiClient.get(`/api/vessels/${id}/`);
  },

  // Create vessel
  createVessel: async (vesselData) => {
    return await apiClient.post('/api/vessels/', vesselData);
  },

  // Update vessel (use PATCH for partial updates)
updateVessel: async (id, vesselData) => {
  return await apiClient.patch(`/api/vessels/${id}/`, vesselData);
},

  // Delete vessel
  deleteVessel: async (id) => {
    return await apiClient.delete(`/api/vessels/${id}/`);
  },

  // ========== NEW: AIS ENDPOINTS ==========

  // Get live vessels for map (optimized)
  getLiveVessels: async (hours = 1) => {
    return await apiClient.get('/api/vessels/map-view/', {
      params: { hours }
    });
  },

  // Get vessel route
  getVesselRoute: async (id, hours = 24) => {
    return await apiClient.get(`/api/vessels/${id}/route/`, {
      params: { hours }
    });
  },

  // Get statistics
  getStatistics: async () => {
    return await apiClient.get('/api/vessels/statistics/');
  },
};

export default vesselService;