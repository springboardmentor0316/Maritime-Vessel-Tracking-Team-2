import apiClient from '../config/api';

const statsService = {
  getStats: async (params = {}) => {
    return await apiClient.get('/api/stats/', { params });
  },
};

export default statsService;