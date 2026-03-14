import axios from "axios";

const apiConstInventoryService = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/inventory/`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiConstInventoryService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiConstInventoryService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.data.accessToken;
        sessionStorage.setItem("token", newToken);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiConstInventoryService(error.config);
      } catch (refreshError) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiConstInventoryService;
