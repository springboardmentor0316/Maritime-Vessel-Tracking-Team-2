import apiClient from '../config/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login/', {
        email,
        password,
      });

      if (response.access) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('access', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('refresh', response.refresh);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  isAuthenticated: () => {
    return !!(localStorage.getItem('access_token') || localStorage.getItem('access'));
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;