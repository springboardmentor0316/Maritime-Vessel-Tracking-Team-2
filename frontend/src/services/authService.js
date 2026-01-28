import apiClient from '../config/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login/', {
        email,
        password,
      });

      const data = response.data; // 🔑 THIS IS THE FIX

      if (data?.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('access', data.access);
      }

      if (data?.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('refresh', data.refresh);
      }

      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.clear();
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access');
  },

  getStoredUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
