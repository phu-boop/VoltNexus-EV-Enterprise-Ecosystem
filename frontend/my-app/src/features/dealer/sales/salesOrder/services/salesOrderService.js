import apiConstSaleService from "../../../../../services/apiConstSaleService";

export const salesOrderB2CApi = {
  /**
   * Tạo sales order từ quotation
   * @param {string} quotationId - ID của quotation
   * @returns {Promise} Promise trả về sales order đã tạo
   */
  createFromQuotation: (quotationId) =>
    apiConstSaleService.post(
      `/api/v1/sales-orders/b2c/from-quotation/${quotationId}`
    ),

  /**
   * Lấy sales order theo ID
   * @param {string} orderId - ID của sales order
   * @returns {Promise} Promise trả về sales order
   */
  getById: (orderId) =>
    apiConstSaleService.get(`/api/v1/sales-orders/b2c/${orderId}`),

  /**
   * Lấy sales orders theo dealer
   * @param {string} dealerId - ID của dealer
   * @returns {Promise} Promise trả về danh sách sales orders
   */
  getByDealer: (dealerId) =>
    apiConstSaleService.get(`/api/v1/sales-orders/b2c/dealer/${dealerId}`),

  /**
   * Lấy sales orders theo customer
   * @param {number} customerId - ID của customer (Long)
   * @returns {Promise} Promise trả về danh sách sales orders
   */
  getByCustomer: (customerId) =>
    apiConstSaleService.get(`/api/v1/sales-orders/b2c/customer/${customerId}`),

  /**
   * Cập nhật trạng thái sales order
   * @param {string} orderId - ID của sales order
   * @param {string} status - Trạng thái mới
   * @returns {Promise} Promise trả về sales order đã cập nhật
   */
  updateStatus: (orderId, status) =>
    apiConstSaleService.put(
      `/api/v1/sales-orders/b2c/${orderId}/status?status=${status}`
    ),

  /**
   * Duyệt sales order
   * @param {string} orderId - ID của sales order
   * @param {string} managerId - ID của manager
   * @returns {Promise} Promise trả về sales order đã duyệt
   */
  approve: (orderId, managerId) =>
    apiConstSaleService.put(
      `/api/v1/sales-orders/b2c/${orderId}/approve?managerId=${managerId}`
    ),
  /**
   * Thêm hoặc recalculating order items
   * @param {string} orderId - ID của sales order
   * @returns {Promise} ApiRespond<SalesOrderB2CResponse>
   */
  addOrderItemsToSalesOrder: (orderId) =>
    apiConstSaleService.put(`/api/v1/sales-orders/b2c/${orderId}/order-items`),
  /**
   * Chuyển trạng thái đơn hàng sang EDITED
   * @param {string} orderId - ID của sales order
   * @param {string} staffId - ID nhân viên thao tác
   * @returns {Promise} ApiRespond<SalesOrderB2CResponse>
   */
  markAsEdited: (orderId, staffId) =>
    apiConstSaleService.put(
      `/api/v1/sales-orders/b2c/${orderId}/mark-edited?staffId=${staffId}`
    ),
};

export const salesOrderService = {
  ...salesOrderB2CApi,

  /**
   * Lấy danh sách sales orders của dealer hiện tại
   * @param {Object} params - Tham số tìm kiếm (optional)
   * @returns {Promise} Promise trả về danh sách sales orders
   */
  getList: async (params = {}) => {
    const dealerId = sessionStorage.getItem("dealerId");
    const response = await salesOrderB2CApi.getByDealer(dealerId);
    return response.data || [];
  },

  /**
   * Tạo sales order từ quotation
   * @param {string} quotationId - ID của quotation
   * @param {Object} orderData - Dữ liệu order (optional)
   * @returns {Promise} Promise trả về sales order đã tạo
   */
  createOrder: async (quotationId, orderData) => {
    const response = await salesOrderB2CApi.createFromQuotation(quotationId);
    return response.data?.data;
  },

  /**
   * Cập nhật trạng thái sales order
   * @param {string} orderId - ID của sales order
   * @param {string} status - Trạng thái mới
   * @param {string} reason - Lý do (optional)
   * @returns {Promise} Promise trả về sales order đã cập nhật
   */
  updateOrderStatus: async (orderId, status, reason = "") => {
    const response = await salesOrderB2CApi.updateStatus(orderId, status);
    return response.data?.data;
  },

  /**
   * Thêm hoặc recalculating order items
   * @param {string} orderId - ID của sales order
   * @returns {Promise} ApiRespond<SalesOrderB2CResponse>
   */
  recalcOrderItems: async (orderId) => {
    const response = await salesOrderB2CApi.addOrderItemsToSalesOrder(orderId);
    return response.data.data;
  },
  /**
   * Chuyển trạng thái đơn hàng sang EDITED
   * @param {string} orderId - ID của sales order
   * @param {string} staffId - ID nhân viên thao tác
   * @returns {Promise} ApiRespond<SalesOrderB2CResponse>
   */
  markOrderAsEdited: async (orderId, staffId) => {
    const response = await salesOrderB2CApi.markAsEdited(orderId, staffId);
    return response.data?.data;
  },
  /**
   * Gửi đơn hàng đi duyệt
   * @param {string} orderId - ID của sales order
   * @returns {Promise} Promise trả về sales order đã gửi duyệt
   */
  sendForApproval: async (orderId, dealerId) => {
    const response = await salesOrderB2CApi.markAsEdited(orderId, dealerId);
    return response.data?.data;
  },
};
