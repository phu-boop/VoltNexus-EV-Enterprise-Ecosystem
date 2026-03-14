import apiConst from '../../../services/apiConst.js';

export const profileService = {
    getProfile: () => apiConst.post(`users/profile`, {id_user: sessionStorage.getItem("id_user")}),
    changePassword: (email, newPassword, oldPassword) => apiConst.post(`auth/change-password`, {
        "email": email,
        "oldPassword": oldPassword,
        "newPassword": newPassword
    }),
    updateProfile: (profileData) => apiConst.put(`users/profile`, profileData)
};

export default profileService;