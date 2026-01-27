import apiClient from '../config/api';

const eventService = {
  getAllEvents: async (params = {}) => {
    return await apiClient.get('/api/events/', { params });
  },

  getEventById: async (id) => {
    return await apiClient.get('/api/events/' + id + '/');
  },

  createEvent: async (eventData) => {
    return await apiClient.post('/api/events/', eventData);
  },

  updateEvent: async (id, eventData) => {
    return await apiClient.put('/api/events/' + id + '/', eventData);
  },

  deleteEvent: async (id) => {
    return await apiClient.delete('/api/events/' + id + '/');
  },
};

export default eventService;