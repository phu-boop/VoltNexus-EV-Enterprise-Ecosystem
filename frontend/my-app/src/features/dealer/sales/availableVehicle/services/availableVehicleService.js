import apiConstInventoryService from "../../../../../services/apiConstInventoryService";
import apiConstVehicleService from "../../../../../services/apiConstVehicleService";

/**
 * Lấy tồn kho của chính đại lý đang đăng nhập.
 * API này gọi từ service 'inventory' nhưng phục vụ cho nghiệp vụ 'sales'.
 * @param {object} params - { search: '...' }
 */
export const getAvailableStock = (params) => {
  // API này gọi GET /inventory/my-stock
  return apiConstInventoryService.get("/my-stock", {
    params,
  });
};

/**
 * Lấy chi tiết thông số kỹ thuật của một phiên bản xe cụ thể.
 * @param {number | string} variantId - ID của phiên bản.
 */
export const getVehicleDetails = (variantId) => {
  return apiConstVehicleService.get(`/vehicle-catalog/variants/${variantId}`);
};

/**
 * Lấy dữ liệu so sánh xe
 * @param {number[]} variantIds - Mảng các ID của phiên bản
 * @param {string} dealerId - ID của đại lý (lấy từ user)
 */
export const getComparisonDetails = (variantIds, dealerId) => {
  return apiConstVehicleService.post("/vehicle-catalog/compare", variantIds, {
    headers: {
      "X-User-ProfileId": dealerId,
    },
  });
};

/**
 * Lấy chi tiết của nhiều phiên bản (bao gồm cả hình ảnh)
 * @param {Array<number|string>} ids - Mảng các variantId.
 */
export const getVariantDetailsByIds = (ids) => {
  return apiConstVehicleService.post(
    "/vehicle-catalog/variants/details-by-ids",
    ids
  );
};
