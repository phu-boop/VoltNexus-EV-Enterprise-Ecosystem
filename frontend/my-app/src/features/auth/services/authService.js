import apiConst from "../../../services/apiConst.js";

export const registerUser = (userData) =>
    apiConst.post("users/register", userData).then((res) => res.data);

export const loginUser = (credentials) =>
    apiConst.post("auth/login", credentials).then((res) => res.data);

export const logout = () =>
    apiConst.post("auth/logout").then((res) => res.data);

export const getInforMe = () =>
    apiConst.get("auth/me").then((res) => res.data);

export const forgotPassword = (email) =>
  apiConst
    .post(`auth/forgot-password?email=${email}`)
    .then((res) => res.data);

export const resetPassword = (email, otp, newPassword) =>
  apiConst
    .post(
      `auth/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`
    )
    .then((res) => res.data);

    
export const registerFCMToken = (userId, fcmToken) =>
    apiConst.post(`users/${userId}/fcm-token`, { fcmToken })
        .then((res) => res.data);

export const getIddealerByIdMember = (idDealer) =>
    apiConst.post(`users/profile/idDealer`, { idDealer })
        .then((res) => res.data);
