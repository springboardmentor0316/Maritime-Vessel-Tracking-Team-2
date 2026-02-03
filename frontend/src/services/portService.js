import apiClient from "../config/api";

const getDashboardPorts = (page = 1, search = "") => {
  return apiClient.get("/api/ports/dashboard/", {
    params: { page, search },
  });
};

export default {
  getDashboardPorts,
};
