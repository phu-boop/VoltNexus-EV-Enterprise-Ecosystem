// Service để lấy thông tin nhân viên từ User Service
import apiConstUserService from "../../../../services/apiConstUserService";

const staffService = {
  /**
   * Lấy danh sách nhân viên theo dealerId
   * @param {string} dealerId - UUID của dealer
   * @returns {Promise<Array>} Danh sách nhân viên với staffId (UUID)
   */
  async getStaffByDealerId(dealerId) {
    try {
      const response = await apiConstUserService.get(
        `/users/profile/${dealerId}`
      );

      const staffList = response.data.data || [];

      // Filter only ACTIVE staff
      const activeStaff = staffList.filter(
        (staff) => staff.status === "ACTIVE"
      );

      return activeStaff;
    } catch (error) {
      console.error("Error fetching staff list:", error);
      console.error("Error details:", error.response?.data);
      throw error;
    }
  },
};

export default staffService;
