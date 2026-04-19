// services/quotationService.js
import apiConstSaleService from "../../../../../services/apiConstSaleService";

const BASE_URL = "/api/v1/quotations";

export const getQuotationsByDealer = async (dealerId, filters = {}) => {
  try {
    const response = await apiConstSaleService.get(`${BASE_URL}/dealer/${dealerId}`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách Quotation cho dealer ${dealerId}:`, error);
    throw error;
  }
};

export const getQuotationsByStaff = async (staffId, filters = {}) => {
  try {
    const response = await apiConstSaleService.get(`${BASE_URL}/staff/${staffId}`, {
      params: {
        status: filters.status || '',
        customer: filters.customer || '',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
        search: filters.search || ''
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách Quotation cho staff ${staffId}:`, error);
    throw error;
  }
};

export const getQuotationDetail = async (quotationId) => {
  try {
    const response = await apiConstSaleService.get(`${BASE_URL}/${quotationId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết quotation ${quotationId}:`, error);
    throw error;
  }
};

export const deleteQuotation = async (quotationId) => {
  try {
    const response = await apiConstSaleService.delete(`${BASE_URL}/${quotationId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa Quotation ${quotationId}:`, error);
    throw error;
  }
};

export const convertToSalesOrder = async (quotationId) => {
  try {
    const response = await apiConstSaleService.post(`${BASE_URL}/${quotationId}/convert-to-order`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi chuyển ${quotationId} thành đơn hàng:`, error);
    throw error;
  }
};