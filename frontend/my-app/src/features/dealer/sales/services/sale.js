import apiConstCustomerService from "../../../../services/apiConstCustomerService";
import apiConstVehicleService from "../../../../services/apiConstVehicleService";

// --- Khai báo các API liên quan đến Khách hàng ---

/**
 * @description Lấy danh sách Khách hàng (Endpoint: GET /customers)
 * @returns {Promise<any>}
 */
export const getCustomers = () => {
  return apiConstCustomerService.get("");
};

// --- Khai báo các API liên quan đến Xe (Vehicle Catalog) ---

/**
 * @description Lấy danh sách Dòng xe (Model) (Endpoint: GET /vehicle-catalog/models)
 * @returns {Promise<any>}
 */
export const getVehicleModels = () => {
  return apiConstVehicleService.get("/vehicle-catalog/models?size=1000");
};

/**
 * @description Lấy danh sách Phiên bản (Variant) theo Model ID (Endpoint: GET /vehicle-catalog/models/{modelId}/variants)
 * @param {string} modelId - ID của dòng xe
 * @returns {Promise<any>}
 */
export const getVehicleVariantsByModelId = (modelId) => {
  return apiConstVehicleService.get(
    `/vehicle-catalog/models/${modelId}/variants`
  );
};
// --- Các hàm lấy dữ liệu từ Session Storage (Giữ nguyên) ---

/**
 * @description Lấy Đại lý hiện tại
 * @returns {string | null}
 */
export const getCurrentDealerId = () => {
  return sessionStorage.getItem("dealerId");
};

/**
 * @description Lấy Nhân viên Bán hàng hiện tại
 * @returns {string | null}
 */
export const getCurrentStaffId = () => {
  return sessionStorage.getItem("staffId");
};
