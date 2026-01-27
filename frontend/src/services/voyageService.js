import apiClient from '../config/api';

const voyageService = {
  getAllVoyages: async (params = {}) => {
    return await apiClient.get('/api/voyages/', { params });
  },

  getVoyageById: async (id) => {
    return await apiClient.get('/api/voyages/' + id + '/');
  },

  createVoyage: async (voyageData) => {
    return await apiClient.post('/api/voyages/', voyageData);
  },

  updateVoyage: async (id, voyageData) => {
    return await apiClient.put('/api/voyages/' + id + '/', voyageData);
  },

  deleteVoyage: async (id) => {
    return await apiClient.delete('/api/voyages/' + id + '/');
  },
};

export default voyageService;