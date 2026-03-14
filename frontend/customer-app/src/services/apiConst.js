import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const apiConst = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Đính kèm JWT từ sessionStorage
apiConst.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động refresh token nếu access token hết hạn (401)
apiConst.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          sessionStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiConst(originalRequest);
        }
      } catch (refreshError) {
        // Chỉ redirect đến login nếu user đang ở trang yêu cầu authentication
        // Không redirect nếu đang ở trang public như trang chủ
        const publicPaths = ['/', '/login', '/register'];
        const currentPath = window.location.pathname;

        if (!publicPaths.includes(currentPath)) {
          sessionStorage.clear();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiConst;
