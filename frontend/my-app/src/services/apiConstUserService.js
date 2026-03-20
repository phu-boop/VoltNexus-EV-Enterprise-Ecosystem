// export default moved to the end of the file to avoid duplicate default exports
import axios from "axios";

const apiConstUserService = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Lấy token từ sessionStorage
apiConstUserService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý khi token hết hạn
apiConstUserService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi 401 và chưa retry
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

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

        // Cập nhật token trong header của request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Gửi lại request cũ với token mới
        error.config.headers["Authorization"] = `Bearer ${newToken}`;
        return apiConstUserService(error.config);
      } catch (refreshError) {
        // Clear toàn bộ session
        sessionStorage.clear();

        // Chuyển về trang login
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    // Nếu lỗi 401 và không thể refresh, log ra nhưng không auto redirect
    if (error.response && error.response.status === 401) {
      // Không tự động redirect trong development để debug dễ hơn
      // sessionStorage.clear();
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default apiConstUserService;
