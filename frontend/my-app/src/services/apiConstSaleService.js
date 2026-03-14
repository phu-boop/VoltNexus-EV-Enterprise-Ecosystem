import axios from "axios";

const apiConstSaleService = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/sales/`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Lấy token từ sessionStorage
apiConstSaleService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý khi token hết hạn
apiConstSaleService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        // Gọi refresh API
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Lấy accessToken mới
        const newToken = res.data.data.accessToken;
        sessionStorage.setItem("token", newToken);
        // Gửi lại request cũ với token mới
        error.config.headers["Authorization"] = `Bearer ${newToken}`;
        return apiConstSaleService(error.config);
      } catch (refreshError) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiConstSaleService;
