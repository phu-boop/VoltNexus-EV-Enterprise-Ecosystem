// import apiConst from '../../../../services/apiConst.js';

// export const mngUserService = {
//     getAll: () => apiConst.get('/users'),
//     getAllDealerManager: () => apiConst.get('/users/dealer-managers'),
//     getAllDealerStaff: () => apiConst.get('/users/dealer-staffs'),
//     getById: (id) => apiConst.get(`/users/${id}`),
//     createAmind: (userData) => apiConst.post('/users/register/admin', userData),
//     createDealerStaff: (userData) => apiConst.post('/users/register/dealerStaff', userData),
//     createDealerManager: (userData) => apiConst.post('/users/register/dealerManager', userData),
//     createEvmStaff: (userData) => apiConst.post('/users/register/evmStaff', userData),
//     update: (id, userData) => apiConst.put(`/users/${id}`, userData),
//     delete: (id) => apiConst.delete(`/users/${id}`),
//     getProfile: () => apiConst.post(`/users/profile`, {id_user: sessionStorage.getItem("id_user")}),
//     updateProfile: (profileData) => apiConst.put(`/users/profile`, profileData),
    
//     // New functions for enhanced management
//     bulkUpdate: (userIds, updateData) => apiConst.put('/users/bulk-update', { userIds, updateData }),
//     changeStatus: (userId, status) => apiConst.patch(`/users/${userId}/status`, { status }),
//     getStatistics: () => apiConst.get('/users/statistics'),
//     exportUsers: (filters) => apiConst.post('/users/export', filters, { responseType: 'blob' }),
//     importUsers: (file) => {
//         const formData = new FormData();
//         formData.append('file', file);
//         return apiConst.post('/users/import', formData, {
//             headers: { 'Content-Type': 'multipart/form-data' }
//         });
//     }
// };

// export default mngUserService;


import apiConst from '../../../../services/apiConst.js';

export const mngUserService = {
    // ----- GET -----
    getAll: () => apiConst.get('/users'),
    getAllDealerManager: () => apiConst.get('/users/dealer-managers'),
    getAllDealerStaff: (params) => apiConst.get('/users/dealer-staffs', { params }),

    getById: (id) => apiConst.get(`/users/${id}`),

    // ----- CREATE -----
    createAmind: (userData) => apiConst.post('/users/register/admin', userData),
    createDealerStaff: (userData) => apiConst.post('/users/register/dealerStaff', userData),
    createDealerManager: (userData) => apiConst.post('/users/register/dealerManager', userData),
    createEvmStaff: (userData) => apiConst.post('/users/register/evmStaff', userData),

    // ----- UPDATE -----
    update: (id, userData) => apiConst.put(`/users/${id}`, userData),

     // 🔹 NEW: update riêng từng loại user — ❗ bỏ tham số id vì không dùng
    updateEvmStaff: (userData) => apiConst.put(`/users/update/evmStaff`, userData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateDealerStaff: (userData) => apiConst.put(`/users/update/dealerStaff`, userData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateDealerManager: (userData) => apiConst.put(`/users/update/dealerManager`, userData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateEvmAdmin: (userData) => apiConst.put(`/users/update/admin`, userData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    // ----- DELETE -----
    delete: (id) => apiConst.delete(`/users/${id}`),

    // ----- PROFILE -----
    getProfile: () => apiConst.post(`/users/profile`, { id_user: sessionStorage.getItem("id_user") }),
    updateProfile: (profileData) => apiConst.put(`/users/profile`, profileData),

    // ----- EXTRA -----
    bulkUpdate: (userIds, updateData) => apiConst.put('/users/bulk-update', { userIds, updateData }),
    changeStatus: (userId, status) => apiConst.patch(`/users/${userId}/status`, { status }),
    getStatistics: () => apiConst.get('/users/statistics'),
    exportUsers: (filters) => apiConst.post('/users/export', filters, { responseType: 'blob' }),
    importUsers: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiConst.post('/users/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default mngUserService;
