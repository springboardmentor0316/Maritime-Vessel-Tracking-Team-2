import axios from 'axios';

const eventService = {
  getAllEvents: async () => {
    return await axios.get('/api/events/');
  },
  createEvent: async (data) => {
    return await axios.post('/api/events/', data);
  },
  updateEvent: async (id, data) => {
    return await axios.patch(`/api/events/${id}/`, data);
  },
  deleteEvent: async (id) => {
    return await axios.delete(`/api/events/${id}/`);
  },
};