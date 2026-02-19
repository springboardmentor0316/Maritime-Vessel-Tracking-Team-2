import apiClient from '../config/api';

const eventService = {
  getAllEvents: async () => {
    return await apiClient.get('/api/events/');
  },
  createEvent: async (data) => {
    return await apiClient.post('/api/events/', data);
  },
  updateEvent: async (id, data) => {
    return await apiClient.patch(`/api/events/${id}/`, data);
  },
  deleteEvent: async (id) => {
    return await apiClient.delete(`/api/events/${id}/`);
  },
};

export default eventService;
