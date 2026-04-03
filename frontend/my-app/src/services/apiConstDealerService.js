import axios from "axios";

const apiConstDealerService = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/dealers/`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiConstDealerService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const email = sessionStorage.getItem("email");
  const role = sessionStorage.getItem("roles");
  const roles = sessionStorage.getItem("roles");
  const userId = sessionStorage.getItem("userId") || sessionStorage.getItem("id_user");
  const profileId = sessionStorage.getItem("profileId");
  const dealerId = sessionStorage.getItem("dealerId");

  if (email) config.headers["X-User-Email"] = email;
  if (role) config.headers["X-User-Role"] = role;
  if (roles) config.headers["X-User-Roles"] = roles;
  if (userId) config.headers["X-User-Id"] = userId;
  if (profileId) config.headers["X-User-ProfileId"] = profileId;
  if (dealerId) config.headers["X-User-DealerId"] = dealerId;

  return config;
});

apiConstDealerService.interceptors.response.use(
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
        return apiConstDealerService(error.config);
      } catch (refreshError) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiConstDealerService;
