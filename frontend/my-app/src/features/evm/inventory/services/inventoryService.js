import apiConstInventoryService from "../../../../services/apiConstInventoryService.js";

/**
 * Lấy danh sách tồn kho phân trang và có bộ lọc.
 * @param {object} params - { page, size, sort, search, dealerId, status }
 */
export const getAllInventory = (params) => {
  return apiConstInventoryService.get("/inventory", { params });
};

/**
 * Lấy trạng thái tồn kho chi tiết cho một phiên bản.
 * @param {number|string} variantId
 */
export const getInventoryStatus = (variantId) => {
  return apiConstInventoryService.get(`/inventory/${variantId}`);
};

/**
 * Thực hiện một giao dịch kho (nhập, xuất, điều chuyển...).
 * @param {object} transactionData - Dữ liệu giao dịch.
 */
export const executeTransaction = (transactionData) => {
  return apiConstInventoryService.post(
    "/inventory/transactions",
    transactionData
  );
};

/**
 * Cập nhật ngưỡng đặt hàng lại cho kho trung tâm.
 * @param {object} data - { variantId, reorderLevel }
 */
export const updateCentralReorderLevel = (data) => {
  return apiConstInventoryService.put(
    "/inventory/central-stock/reorder-level",
    data
  );
};

/**
 * Lấy lịch sử giao dịch kho phân trang và có bộ lọc.
 * @param {object} params - { page, size, sort, startDate, endDate }
 */
export const getTransactionHistory = (params) => {
  return apiConstInventoryService.get("/inventory/transactions", { params });
};

/**
 * Lấy danh sách các cảnh báo tồn kho đang hoạt động.
 */
export const getActiveAlerts = () => {
  return apiConstInventoryService.get("/inventory/alerts");
};

/**
 * Xuất báo cáo tồn kho.
 * @param {object} params - { startDate, endDate, format }
 */
export const exportInventoryReport = (params) => {
  return apiConstInventoryService.get("/inventory/report/export", {
    params,
    responseType: "blob", // Rất quan trọng để xử lý file download
  });
};

/**
 * Lấy thông tin tồn kho cho một danh sách ID
 * @param {Array<number>} variantIds - Mảng các ID, ví dụ: [4, 5, 6]
 */
export const getInventoryStatusByIds = (variantIds) => {
  return apiConstInventoryService.post("/inventory/status-by-ids", variantIds);
};

/**
 * Kiểm tra một danh sách VINs (read-only)
 * @param {string[]} vins
 * @returns {Promise<ApiRespond<VinValidationResultDto>>}
 */
export const validateVins = (vins) => {
  return apiConstInventoryService.post(
    "/inventory/vehicles/validate-vins",
    vins
  );
};

/**
 * Lấy danh sách VINs khả dụng cho một variant
 * @param {number} variantId
 */
export const getAvailableVins = (variantId) => {
  return apiConstInventoryService.get("/inventory/vehicles/available-vins", {
    params: { variantId },
  });
};
