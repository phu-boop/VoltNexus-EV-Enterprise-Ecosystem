import apiConstSaleService from "../../../../../services/apiConstSaleService"; 

// Tiền tố cho các API liên quan đến quotation
const BASE_URL = "/api/v1/quotations";

/**
 * 1. Tạo Quotation Draft
 * @param {object} data - Dữ liệu tạo Quotation Draft
 * @returns {Promise<object>} Đối tượng response từ API
 */
export const createQuotationDraft = async (data) => {
  try {
    const response = await apiConstSaleService.post(`${BASE_URL}/draft`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo Quotation Draft:", error);
    throw error;
  }
};

/**
 * 2. Tính toán giá Quotation
 * @param {string} quotationId - ID của Quotation cần tính toán
 * @param {object} data - Dữ liệu tính toán (promotionIds, additionalDiscountRate)
 * @returns {Promise<object>} Đối tượng response từ API
 */
export const calculateQuotation = async (quotationId, data) => {
  try {
    const response = await apiConstSaleService.put(`${BASE_URL}/${quotationId}/calculate`, data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi tính toán Quotation ${quotationId}:`, error);
    throw error;
  }
};

/**
 * 3. Gửi Quotation cho khách hàng
 * @param {string} quotationId - ID của Quotation cần gửi
 * @param {object} data - Dữ liệu gửi (validUntil, termsConditions)
 * @returns {Promise<object>} Đối tượng response từ API
 */
export const sendQuotation = async (quotationId, data) => {
  try {
    const response = await apiConstSaleService.put(`${BASE_URL}/${quotationId}/send`, data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi gửi Quotation ${quotationId}:`, error);
    throw error;
  }
};

/**
 * 4. Xử lý phản hồi từ khách hàng
 * @param {string} quotationId - ID của Quotation
 * @param {object} data - Phản hồi của khách hàng (accepted, customerNote)
 * @returns {Promise<object>} Đối tượng response từ API
 */
export const handleCustomerResponse = async (quotationId, data) => {
  try {
    const response = await apiConstSaleService.put(`${BASE_URL}/${quotationId}/customer-response`, data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xử lý phản hồi khách hàng cho Quotation ${quotationId}:`, error);
    throw error;
  }
};

/**
 * 5. Lấy Quotation theo ID
 * @param {string} quotationId - ID của Quotation cần lấy
 * @returns {Promise<object>} Đối tượng response từ API
 */
export const getQuotationById = async (quotationId) => {
  try {
    const response = await apiConstSaleService.get(`${BASE_URL}/${quotationId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy Quotation ${quotationId}:`, error);
    throw error;
  }
};

/**
 * 6. Lấy danh sách Quotations với filter
 * @param {object} params - Các tham số query filter (dealerId, customerId, staffId, status, startDate, endDate)
 * @returns {Promise<object>} Đối tượng response từ API
 */
export const getQuotationList = async (params) => {
  try {
    const response = await apiConstSaleService.get(`${BASE_URL}`, { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Quotations:", error);
    throw error;
  }
};

/**
 * 7. Lấy danh sách khuyến mãi đang ACTIVE cho form Báo giá
 * @param {string} dealerId - ID của đại lý (gửi qua header X-Dealer-Id)
 * @param {number} [modelId] - ID của model (tùy chọn)
 * @returns {Promise<object[]>} Danh sách promotions đang hoạt động
 */
export const getActivePromotions = async (dealerId, modelId) => {
  try {
    const response = await apiConstSaleService.get(`/promotions/active`, {
      headers: { "X-Dealer-Id": dealerId },
      params: modelId ? { modelId } : {}, // chỉ thêm modelId nếu có
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khuyến mãi ACTIVE:", error);
    throw error;
  }
};
