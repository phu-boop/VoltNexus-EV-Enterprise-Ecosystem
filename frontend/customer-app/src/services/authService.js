import api from "./api.js";

export const registerCustomer = (customerData) =>
  api.post("auth/register/customer", customerData).then((res) => res.data);

export const loginUser = (credentials) =>
  api.post("auth/login", credentials).then((res) => res.data);

export const logout = () =>
  api.post("auth/logout").then((res) => res.data);

export const getCurrentUser = () =>
  api.get("auth/me").then((res) => res.data);

export const forgotPassword = (email) =>
  api.post(`auth/forgot-password?email=${email}`).then((res) => res.data);

export const resetPassword = (email, otp, newPassword) =>
  api.post(`auth/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`).then((res) => res.data);

export const handleOAuthCallback = (accessToken) =>
  api.get("auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }).then((res) => res.data);

