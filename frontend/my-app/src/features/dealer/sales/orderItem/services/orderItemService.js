import apiConstSaleService from "../../../../../services/apiConstSaleService";

export const orderItemService = {
  /**
   * Tạo mới order item
   * @param {Object} data - Dữ liệu order item
   * @returns {Promise} Promise trả về order item đã tạo
   */
  create: (data) => apiConstSaleService.post("/api/v1/order-items", data),

  /**
   * Cập nhật order item
   * @param {string} orderItemId - ID của order item
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise} Promise trả về order item đã cập nhật
   */
  update: (orderItemId, data) =>
    apiConstSaleService.put(`/api/v1/order-items/${orderItemId}`, data),

  /**
   * Xóa order item
   * @param {string} orderItemId - ID của order item cần xóa
   * @returns {Promise} Promise xác nhận xóa thành công
   */
  delete: (orderItemId) =>
    apiConstSaleService.delete(`/api/v1/order-items/${orderItemId}`),

  /**
   * Lấy order item theo ID
   * @param {string} orderItemId - ID của order item
   * @returns {Promise} Promise trả về order item
   */
  getById: (orderItemId) =>
    apiConstSaleService.get(`/api/v1/order-items/${orderItemId}`),

  /**
   * Lấy tất cả order items theo order ID
   * @param {string} orderId - ID của order
   * @returns {Promise} Promise trả về danh sách order items
   */
  getByOrderId: (orderId) =>
    apiConstSaleService.get(`/api/v1/order-items/order/${orderId}`),

  /**
   * Cập nhật nhiều order items cùng lúc
   * @param {string} orderId - ID của order
   * @param {Array} orderItems - Danh sách order items cần cập nhật
   * @returns {Promise} Promise trả về danh sách order items đã cập nhật
   */
  updateBulk: (orderId, orderItems) =>
    apiConstSaleService.put(
      `/api/v1/order-items/order/${orderId}/bulk`,
      orderItems
    ),

  /**
   * Validate danh sách order items
   * @param {Array} orderItems - Danh sách order items cần validate
   * @returns {Promise} Promise xác nhận validate thành công
   */
  validate: (orderItems) =>
    apiConstSaleService.post("/api/v1/order-items/validate", orderItems),
};
