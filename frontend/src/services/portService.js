import apiClient from '../config/api';

const portService = {
  getAllPorts: async (params = {}) => {
    return await apiClient.get('/api/ports/', { params });
  },

  getPortById: async (id) => {
    return await apiClient.get('/api/ports/' + id + '/');
  },

  createPort: async (portData) => {
    return await apiClient.post('/api/ports/', portData);
  },

  updatePort: async (id, portData) => {
    return await apiClient.put('/api/ports/' + id + '/', portData);
  },

  deletePort: async (id) => {
    return await apiClient.delete('/api/ports/' + id + '/');
  },
};

export default portService;