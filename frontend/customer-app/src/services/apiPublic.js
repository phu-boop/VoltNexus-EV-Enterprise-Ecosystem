import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

// API instance cho các endpoint public (không cần authentication)
const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // Không gửi cookies
});

// Không thêm token vào request
apiPublic.interceptors.request.use((config) => {
  return config;
});

// Không redirect khi gặp lỗi 401
apiPublic.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Chỉ log lỗi, không redirect
    console.error("Public API error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiPublic;
