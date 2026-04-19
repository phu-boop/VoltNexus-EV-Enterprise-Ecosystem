import apiConstSaleService from "../../../../services/apiConstSaleService";

/**
 * [Staff] Lấy danh sách thông báo đã lưu (có phân trang)
 * @param {object} params - ví dụ: { page: 0, size: 10 }
 */
export const getStaffNotifications = (params) => {
  return apiConstSaleService.get("/notifications/staff", { params });
};

/**
 * [Staff] Lấy số lượng thông báo chưa đọc
 */
export const getUnreadNotificationCount = () => {
  return apiConstSaleService.get("/notifications/staff/unread-count");
};

/**
 * [Staff] Đánh dấu một thông báo là đã đọc
 * @param {string} notificationId - UUID của thông báo
 */
export const markNotificationAsRead = (notificationId) => {
  return apiConstSaleService.put(`/notifications/${notificationId}/read`);
};

/**
 * [Staff] Giải quyết một đơn hàng đang bị khiếu nại (DISPUTED)
 * @param {string} orderId - UUID của đơn hàng
 * @param {object} payload - { newStatus: "IN_TRANSIT" | "DELIVERED", notes: "..." }
 */
export const resolveOrderDispute = (orderId, payload) => {
  return apiConstSaleService.put(
    `/api/v1/sales-orders/${orderId}/resolve-dispute`,
    payload
  );
};

/**
 * [Staff] Đánh dấu TẤT CẢ thông báo là đã đọc
 */
export const markAllNotificationsAsRead = () => {
  return apiConstSaleService.put("/notifications/staff/read-all");
};

/**
 * [Staff] Xóa một thông báo
 * @param {string} notificationId - UUID của thông báo
 */
export const deleteNotification = (notificationId) => {
  return apiConstSaleService.delete(`/notifications/${notificationId}`);
};

/**
 * [Staff] Xóa TẤT CẢ thông báo của Staff
 */
export const deleteAllStaffNotifications = () => {
  return apiConstSaleService.delete("/notifications/staff/all");
};

/**
 * [Staff/Admin] Lấy chi tiết một đơn hàng B2B bằng ID
 * @param {string} orderId - UUID của đơn hàng
 */
export const getOrderDetails = (orderId) => {
  return apiConstSaleService.get(`/api/v1/sales-orders/${orderId}`);
};
