import apiClient from "../config/api";

const portService = {

  getDashboardPorts: (page = 1, search = "") => {
    return apiClient.get(
      `/api/dashboard/?page=${page}&search=${search}`
    );
  },

};

export default portService;
