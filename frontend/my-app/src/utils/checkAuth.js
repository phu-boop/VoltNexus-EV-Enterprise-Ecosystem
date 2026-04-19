// Utility để kiểm tra authentication status
export const isAuthenticated = () => {
  const token = sessionStorage.getItem("token");
  return !!token;
};

export const getToken = () => {
  return sessionStorage.getItem("token");
};

export const clearAuth = () => {
  sessionStorage.clear();
};
