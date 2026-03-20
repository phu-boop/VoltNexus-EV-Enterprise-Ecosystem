import apiConstReportService from "../../../../services/apiConstReportService"; // Hoặc đường dẫn đúng đến file axios của bạn

/**
 * Lấy Báo cáo Doanh số (Sales Summary).
 * Tương ứng với: GET /reports/sales
 *
 * @param {object} filters - Đối tượng chứa các filter (region, dealershipId, modelId, variantId)
 */
export const getSalesSummary = (filters) => {
  return apiConstReportService.get("/reports/sales", {
    params: filters,
  });
};

/**
 * Lấy Báo cáo Tồn kho & Tốc độ tiêu thụ (Inventory Velocity).
 * Tương ứng với: GET /reports/inventory-velocity
 *
 * @param {object} filters - Đối tượng chứa các filter (region, modelId, variantId)
 */
export const getInventoryVelocity = (filters) => {
  return apiConstReportService.get("/reports/inventory-velocity", {
    params: filters,
  });
};

/**
 * LVIC (Nếu bạn vẫn muốn gọi API tồn kho riêng)
 * Tương ứng với: GET /reports/inventory
 *
 */
export const getInventorySummary = (filters) => {
  return apiConstReportService.get("/reports/inventory", {
    params: filters,
  });
};

/**
 * Lấy Báo cáo Tồn kho Trung tâm (Central Inventory Summary).
 * Tương ứng với: GET /reports/central-inventory
 *
 * @param {object} filters - Đối tượng chứa các filter (modelId, variantId)
 */
export const getCentralInventory = (filters) => {
  return apiConstReportService.get("/reports/central-inventory", {
    params: filters,
  });
};

/**
 * Lấy Lịch sử giao dịch kho trung tâm.
 * Tương ứng với: GET /reports/central-inventory/transactions
 *
 * @param {object} filters - Đối tượng chứa các filter (transactionType, variantId)
 */
export const getCentralTransactionHistory = (filters) => {
  return apiConstReportService.get("/reports/central-inventory/transactions", {
    params: filters,
  });
};
