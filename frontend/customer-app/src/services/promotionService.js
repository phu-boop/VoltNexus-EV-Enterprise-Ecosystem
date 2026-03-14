import apiPublic from "./apiPublic";
import api from "./api";

// ==================== PUBLIC API ====================
// B2C: lấy danh sách khuyến mãi đang hoạt động (PUBLIC - không cần auth)
export const getActivePromotions = () =>
  apiPublic
    .get("/sales-orders/promotions/active")
    .then((res) => res.data);

// ==================== ADMIN API ====================
// Lấy tất cả khuyến mãi (Admin)
export const getAllPromotions = () =>
  api
    .get("/sales-orders/promotions")
    .then((res) => res.data);

// Lấy chi tiết một khuyến mãi theo ID
export const getPromotionById = (id) =>
  api
    .get(`/sales-orders/promotions/${id}`)
    .then((res) => res.data);

// Lọc khuyến mãi theo trạng thái
export const getPromotionsByStatus = (status) =>
  api
    .get(`/sales-orders/promotions/status/${status}`)
    .then((res) => res.data);

// Tạo khuyến mãi mới
export const createPromotion = (promotionData) =>
  api
    .post("/sales-orders/promotions", promotionData)
    .then((res) => res.data);

// Cập nhật khuyến mãi
export const updatePromotion = (id, promotionData) =>
  api
    .put(`/sales-orders/promotions/${id}`, promotionData)
    .then((res) => res.data);

// Duyệt khuyến mãi (chuyển DRAFT -> NEAR)
export const approvePromotion = (id) =>
  api
    .put(`/sales-orders/promotions/authentic/${id}`)
    .then((res) => res.data);

// Xóa mềm khuyến mãi (chuyển status -> DELETED)
export const deletePromotion = (id) =>
  api
    .delete(`/sales-orders/promotions/${id}`)
    .then((res) => res.data);


