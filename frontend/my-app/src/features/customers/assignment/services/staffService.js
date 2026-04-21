// Service để lấy thông tin nhân viên từ User Service
import apiConstUserService from "../../../../services/apiConstUserService";

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );

const resolveStaffId = (staff) => {
  // Ưu tiên userId thực để tương thích endpoint assign của customer-service.
  const candidates = [
    staff.id_user,
    staff.id,
    staff.userId,
    staff.memberId,
    staff.staffId,
  ];
  const preferred = candidates.find((candidate) => isUuid(candidate));
  return preferred ? String(preferred) : "";
};

const normalizeStaffList = (rawList) => {
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList.map((staff) => ({
    ...staff,
    staffId: resolveStaffId(staff),
  })).filter((staff) => !!staff.staffId);
};

const getActiveStaff = (staffList) =>
  staffList.filter((staff) => !staff.status || staff.status === "ACTIVE");

const resolveDealerId = async (dealerId) => {
  if (dealerId) {
    return dealerId;
  }

  const fallbackId =
    sessionStorage.getItem("dealerId") || sessionStorage.getItem("profileId");

  if (!fallbackId) {
    throw new Error("Thiếu dealerId để tải danh sách nhân viên");
  }

  // Khi chỉ có profileId (memberId), gọi API để lấy dealerId thật.
  if (!sessionStorage.getItem("dealerId")) {
    try {
      const response = await apiConstUserService.post("/users/profile/idDealer", {
        idDealer: fallbackId,
      });
      return response?.data?.data || fallbackId;
    } catch {
      return fallbackId;
    }
  }

  return fallbackId;
};

const staffService = {
  /**
   * Lấy danh sách nhân viên theo dealerId
   * @param {string} dealerId - UUID của dealer
   * @returns {Promise<Array>} Danh sách nhân viên với staffId (UUID)
   */
  async getStaffByDealerId(dealerId) {
    try {
      const resolvedDealerId = await resolveDealerId(dealerId);

      try {
        // Ưu tiên endpoint này vì trả id (userId) ổn định cho flow phân công.
        const response = await apiConstUserService.get("/users/dealer-staffs", {
          params: { dealerId: resolvedDealerId },
        });
        const staffList = normalizeStaffList(response?.data?.data || []);
        return getActiveStaff(staffList);
      } catch {
        // Fallback: giữ tương thích endpoint profile cũ.
        const response = await apiConstUserService.get(
          `/users/profile/${resolvedDealerId}`
        );
        const staffList = normalizeStaffList(response?.data?.data || []);
        return getActiveStaff(staffList);
      }
    } catch (error) {
      console.error("Error fetching staff list:", error);
      console.error("Error details:", error.response?.data);
      throw error;
    }
  },
};

export default staffService;
