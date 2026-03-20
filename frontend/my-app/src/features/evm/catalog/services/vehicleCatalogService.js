import apiConstVehicleService from "../../../../services/apiConstVehicleService.js";

// ==========================================================
// ============ API CHO MODELS ==============================
// ==========================================================
/**
 * Lấy danh sách tóm tắt tất cả các mẫu xe.
 */
export const getModels = () => {
  return apiConstVehicleService.get("vehicle-catalog/models");
};

/**
 * Lấy chi tiết một mẫu xe theo ID.
 * @param {number | string} modelId - ID của mẫu xe.
 */
export const getModelDetails = (modelId) => {
  return apiConstVehicleService.get(`vehicle-catalog/models/${modelId}`);
};

/**
 * Tạo một mẫu xe mới kèm theo các phiên bản.
 * @param {object} modelData - Dữ liệu của mẫu xe mới.
 */
export const createModelWithVariants = (modelData) => {
  return apiConstVehicleService.post("vehicle-catalog/models", modelData);
};

/**
 * Cập nhật thông tin chung của một mẫu xe.
 * @param {number | string} modelId - ID của mẫu xe cần cập nhật.
 * @param {object} modelData - Dữ liệu cập nhật.
 */
export const updateModel = (modelId, modelData) => {
  return apiConstVehicleService.put(
    `vehicle-catalog/models/${modelId}`,
    modelData
  );
};

/**
 * Ngừng sản xuất (xóa mềm) một mẫu xe.
 * @param {number | string} modelId - ID của mẫu xe.
 */
export const deactivateModel = (modelId) => {
  return apiConstVehicleService.delete(`vehicle-catalog/models/${modelId}`);
};

// ==========================================================
// ============ API CHO VARIANTS ============================
// ==========================================================
/**
 * Tạo một phiên bản xe mới cho một mẫu xe cụ thể.
 * @param {number | string} modelId - ID của mẫu xe cha.
 * @param {object} variantData - Dữ liệu của phiên bản mới.
 */
export const createVariant = (modelId, variantData) => {
  return apiConstVehicleService.post(
    `vehicle-catalog/models/${modelId}/variants`,
    variantData
  );
};

/**
 * Cập nhật thông tin chi tiết của một phiên bản xe.
 * @param {number | string} variantId - ID của phiên bản cần cập nhật.
 * @param {object} variantData - Dữ liệu cập nhật.
 */
export const updateVariant = (variantId, variantData) => {
  return apiConstVehicleService.put(
    `vehicle-catalog/variants/${variantId}`,
    variantData
  );
};

/**
 * Ngừng sản xuất (xóa mềm) một phiên bản xe.
 * @param {number | string} variantId - ID của phiên bản.
 */
export const deactivateVariant = (variantId) => {
  return apiConstVehicleService.delete(`vehicle-catalog/variants/${variantId}`);
};

/**
 * Tìm kiếm các phiên bản xe theo nhiều tiêu chí.
 * @param {object} params - Các tham số tìm kiếm { keyword, color, versionName }.
 */
export const searchVariants = (params) => {
  return apiConstVehicleService.get("vehicle-catalog/variants/search", {
    params,
  });
};

/**
 * Lấy tất cả phiên bản xe (variants)
 * có phân trang và tìm kiếm.
 * @param {object} params - ví dụ: { search: 'VF8', page: 0, size: 10 }
 */
export const getAllVariantsPaginated = (params) => {
  return apiConstVehicleService.get("/vehicle-catalog/variants/paginated", {
    params,
  });
};

/**
 * Lấy chi tiết một phiên bản xe cụ thể.
 * @param {number | string} variantId - ID của phiên bản.
 */
export const getVariantDetails = (variantId) => {
  return apiConstVehicleService.get(`/vehicle-catalog/variants/${variantId}`);
};

/**
 * Lấy chi tiết của nhiều phiên bản dựa trên danh sách ID.
 * @param {Array<number|string>} ids - Mảng các variantId.
 */
export const getVariantDetailsByIds = (ids) => {
  return apiConstVehicleService.post(
    "/vehicle-catalog/variants/details-by-ids",
    ids
  );
};

// ==========================================================
// ============ API CHO TÍNH NĂNG (FEATURES) ================
// ==========================================================

/**
 * Lấy danh sách tất cả các tính năng có sẵn.
 */
export const getAllFeatures = () => {
  return apiConstVehicleService.get("/vehicle-catalog/features");
};

/**
 * Gán một tính năng cho một phiên bản.
 * @param {number|string} variantId ID của phiên bản.
 * @param {object} featureData { featureId, isStandard, additionalCost }
 */
export const assignFeatureToVariant = (variantId, featureData) => {
  return apiConstVehicleService.post(
    `/vehicle-catalog/variants/${variantId}/features`,
    featureData
  );
};

/**
 * Bỏ gán một tính năng khỏi một phiên bản.
 * @param {number|string} variantId ID của phiên bản.
 * @param {number|string} featureId ID của tính năng.
 */
export const unassignFeatureFromVariant = (variantId, featureId) => {
  return apiConstVehicleService.delete(
    `/vehicle-catalog/variants/${variantId}/features/${featureId}`
  );
};

/**
 * Tạo một định nghĩa tính năng mới (trong thư viện).
 * @param {object} featureData { featureName, description, category, featureType }
 */
export const createFeature = (featureData) => {
  return apiConstVehicleService.post("/vehicle-catalog/features", featureData);
};

/**
 * Cập nhật một định nghĩa tính năng.
 * @param {number|string} featureId ID của tính năng.
 * @param {object} featureData Dữ liệu cập nhật.
 */
export const updateFeature = (featureId, featureData) => {
  return apiConstVehicleService.put(
    `/vehicle-catalog/features/${featureId}`,
    featureData
  );
};

/**
 * Xóa một định nghĩa tính năng khỏi thư viện.
 * @param {number|string} featureId ID của tính năng.
 */
export const deleteFeature = (featureId) => {
  return apiConstVehicleService.delete(
    `/vehicle-catalog/features/${featureId}`
  );
};
