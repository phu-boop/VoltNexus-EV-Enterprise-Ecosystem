// sales/services/optionService.js
import apiConstCustomerService from "../../../../services/apiConstCustomerService";
import apiConstVehicleService from "../../../../services/apiConstVehicleService";
import apiConstSaleService from "../../../../services/apiConstSaleService";

// --- Khai báo các API liên quan đến Khách hàng ---
export const getCustomers = () => {
  return apiConstCustomerService.get("");
};

// --- Khai báo các API liên quan đến Xe (Vehicle Catalog) ---
export const getVehicleModels = () => {
  return apiConstVehicleService.get("/vehicle-catalog/models?size=1000");
};

export const getVehicleVariantsByModelId = (modelId) => {
  return apiConstVehicleService.get(`/vehicle-catalog/models/${modelId}/variants`);
};

// --- Khai báo các API liên quan đến Khuyến mãi ---
export const getActivePromotions = async (dealerId, modelId) => {
  try {
    const response = await apiConstSaleService.get(`/promotions/active`, {
      headers: { "X-Dealer-Id": dealerId },
      params: modelId ? { modelId } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khuyến mãi ACTIVE:", error);
    throw error;
  }
};


/**
 * Xóa Quotation theo ID
 * @param {string} quotationId
 */
export const deleteQuotation = async (quotationId) => {
  try {
    const response = await apiConstSaleService.delete(`${BASE_QUOTATION_URL}/${quotationId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa Quotation ${quotationId}:`, error);
    throw error;
  }
};


/**
 * Lấy modelId từ SalesOrderB2C (thông qua orderId)
 * @param {string} orderId - UUID của SalesOrderB2C
 * @returns {Promise<number>} - Trả về modelId
 */
export const getModelIdBySalesOrderId = async (orderId) => {
  try {
    const response = await apiConstSaleService.get(`/api/v1/sales-orders/b2c/${orderId}/model-id`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy modelId theo SalesOrderB2C ID ${orderId}:`, error);
    throw error;
  }
};

// --- Các hàm lấy dữ liệu từ Session Storage ---
export const getCurrentDealerId = () => {
  return sessionStorage.getItem("dealerId");
};

export const getCurrentStaffId = () => {
  return sessionStorage.getItem("profileId");
};
