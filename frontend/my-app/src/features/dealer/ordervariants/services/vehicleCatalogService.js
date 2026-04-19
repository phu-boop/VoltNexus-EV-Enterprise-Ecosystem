import apiConstVehicleService from "../../../../services/apiConstVehicleService.js";

/**
 * Lấy tất cả phiên bản xe (variants)
 * có phân trang và tìm kiếm (để hiển thị danh mục).
 * @param {object} params - ví dụ: { search: 'VF8', page: 0, size: 10 }
 */
export const getAllVariantsPaginated = (params) => {
  return apiConstVehicleService.get("/vehicle-catalog/variants/paginated", {
    params,
  });
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
      // Token (Authorization) đã được tự động thêm bởi interceptor
    },
  });
};

/**
 * Lấy chi tiết của nhiều phiên bản dựa trên danh sách ID.
 * (Bạn có thể cũng sẽ cần hàm này)
 * @param {Array<number|string>} ids - Mảng các variantId.
 */
export const getVariantDetailsByIds = (ids) => {
  return apiConstVehicleService.post(
    "/vehicle-catalog/variants/details-by-ids",
    ids
  );
};

/**
 * Lấy chi tiết một phiên bản xe cụ thể.
 * @param {number | string} variantId - ID của phiên bản.
 */
export const getVariantDetails = (variantId) => {
  return apiConstVehicleService.get(`/vehicle-catalog/variants/${variantId}`);
};
