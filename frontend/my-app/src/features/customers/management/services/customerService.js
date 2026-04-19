// Import axios instance for customer API calls
import apiConstCustomerService from "../../../../services/apiConstCustomerService";

// Customer service methods using the axios instance directly
const customerService = {
  /**
   * Lấy danh sách tất cả khách hàng
   * @param {string} search - Từ khóa tìm kiếm (tìm theo tên, email, số điện thoại)
   * @returns {Promise<Array>} Danh sách khách hàng
   */
  async getAllCustomers(search = "") {
    const params = search ? { search: encodeURIComponent(search) } : {};
    const response = await apiConstCustomerService.get("", { params });
    return response.data.data;
  },

  /**
   * Lấy thông tin chi tiết của 1 khách hàng theo ID
   * @param {number} id - Mã khách hàng
   * @returns {Promise<Object>} Thông tin chi tiết khách hàng
   */
  async getCustomerById(id) {
    const response = await apiConstCustomerService.get(`/${id}`);
    return response.data.data;
  },

  /**
   * Tạo mới khách hàng
   * @param {Object} customerData - Thông tin khách hàng cần tạo
   * @param {string} customerData.firstName - Tên
   * @param {string} customerData.lastName - Họ
   * @param {string} customerData.email - Email
   * @param {string} customerData.phone - Số điện thoại
   * @param {string} customerData.address - Địa chỉ
   * @param {string} customerData.customerType - Loại khách hàng (INDIVIDUAL/CORPORATE)
   * @param {string} customerData.status - Trạng thái (NEW/POTENTIAL/PURCHASED/INACTIVE)
   * @returns {Promise<Object>} Thông tin khách hàng vừa tạo
   */
  async createCustomer(customerData) {
    const response = await apiConstCustomerService.post("", customerData);
    return response.data.data;
  },

  /**
   * Cập nhật thông tin khách hàng
   * @param {number} id - Mã khách hàng cần cập nhật
   * @param {Object} customerData - Thông tin khách hàng cần cập nhật
   * @returns {Promise<Object>} Thông tin khách hàng sau khi cập nhật
   */
  async updateCustomer(id, customerData) {
    const modifiedBy = sessionStorage.getItem('email') || sessionStorage.getItem('name') || 'web-ui';
    const response = await apiConstCustomerService.put(`/${id}`, customerData, {
      headers: { 'X-Modified-By': modifiedBy }
    });
    return response.data.data;
  },

  /**
   * Xóa khách hàng
   * @param {number} id - Mã khách hàng cần xóa
   * @returns {Promise<Object>} Kết quả xóa
   */
  async deleteCustomer(id) {
    const response = await apiConstCustomerService.delete(`/${id}`);
    return response.data;
  },

  /**
   * Lấy lịch sử thay đổi của khách hàng (audit log)
   * @param {number} id - Mã khách hàng
   * @returns {Promise<Array>} Danh sách các thay đổi theo thời gian
   */
  async getCustomerAuditHistory(id) {
    const response = await apiConstCustomerService.get(`/${id}/audit-history`);
    return response.data.data;
  },

  /**
   * Lấy danh sách các trạng thái khách hàng có sẵn
   * @returns {Promise<Array>} Danh sách trạng thái (NEW, POTENTIAL, PURCHASED, INACTIVE)
   */
  async getCustomerStatuses() {
    const response = await apiConstCustomerService.get("/enums/statuses");
    return response.data.data;
  },

  /**
   * Lấy danh sách các loại khách hàng có sẵn
   * @returns {Promise<Array>} Danh sách loại khách hàng (INDIVIDUAL, CORPORATE)
   */
  async getCustomerTypes() {
    const response = await apiConstCustomerService.get("/enums/types");
    return response.data.data;
  },

  /**
   * Phân công nhân viên cho khách hàng
   * @param {number} customerId - Mã khách hàng
   * @param {Object} assignData - Dữ liệu phân công
   * @param {string} assignData.staffId - UUID của nhân viên
   * @param {string} assignData.notes - Ghi chú (optional)
   * @returns {Promise<Object>} Thông tin khách hàng sau khi phân công
   */
  async assignStaffToCustomer(customerId, assignData) {
    const response = await apiConstCustomerService.post(`/${customerId}/assign-staff`, assignData);
    return response.data.data;
  },

  /**
   * Hủy phân công nhân viên
   * @param {number} customerId - Mã khách hàng
   * @returns {Promise<Object>} Thông tin khách hàng sau khi hủy phân công
   */
  async unassignStaffFromCustomer(customerId) {
    const response = await apiConstCustomerService.delete(`/${customerId}/assign-staff`);
    return response.data.data;
  }
};

export default customerService;
