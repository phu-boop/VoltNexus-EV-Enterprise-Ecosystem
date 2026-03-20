import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Lấy token từ sessionStorage
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    // Decode JWT to check expiry and extract user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;

      if (isExpired) {
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(new Error("Token expired"));
      }

      // Inject X-User-Email header required by backend
      if (payload.sub) {
        config.headers['X-User-Email'] = payload.sub;
      }
      if (payload.scope) {
        config.headers['X-User-Role'] = payload.scope;
      }
      if (payload.jti) {
        config.headers['X-User-Id'] = payload.jti;
      }
      if (payload.profileId) {
        config.headers['X-User-ProfileId'] = payload.profileId;
      }

    } catch (e) {
      console.error("[API] Failed to decode token:", e);
    }
  }

  return config;
});

// Xử lý khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ngăn trình duyệt hiện popup Basic Auth
    if (error.response && error.response.status === 401) {
      // Xóa WWW-Authenticate header để tránh popup
      delete error.response.headers['www-authenticate'];
      
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Chỉ redirect đến login nếu user đang ở trang yêu cầu authentication
        // Không redirect nếu đang ở trang public như trang chủ
        const publicPaths = ['/', '/login', '/register', '/vehicles'];
        const currentPath = window.location.pathname;

        if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/admin')) {
          // Redirect to login chỉ khi không ở trang public
          sessionStorage.clear();
          window.location.href = "/login";
        }
      }
      
      // Return rejected promise mà không throw error để tránh popup
      return Promise.resolve({ data: { data: [] } });
    }

    return Promise.reject(error);
  }
);

export default api;

