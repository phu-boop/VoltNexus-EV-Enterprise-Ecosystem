import axios from "axios";

const apiAdmin = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Lấy token từ sessionStorage và inject headers
apiAdmin.interceptors.request.use((config) => {
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

      // Inject X-User-* headers required by backend
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
      console.error("[API Admin] Failed to decode token:", e);
    }
  }

  return config;
});

// Response interceptor for error handling
apiAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiAdmin;
