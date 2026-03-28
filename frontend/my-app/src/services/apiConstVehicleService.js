import axios from "axios";

const apiConstVehicleService = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/vehicles/`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiConstVehicleService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const userEmail = sessionStorage.getItem("email");
  if (userEmail) {
    config.headers["X-User-Email"] = userEmail;
  } else {
    console.warn("X-User-Email is missing from sessionStorage. This may cause 400 errors on protected endpoints.");
  }

  return config;
});

apiConstVehicleService.interceptors.response.use(
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
        return apiConstVehicleService(error.config);
      } catch (refreshError) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const API_BASE_VEHICLE = `${import.meta.env.VITE_API_BASE_URL}/vehicles/`;
export default apiConstVehicleService;
