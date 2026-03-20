// Import axios instance từ services dùng chung
 import apiConstTestDrive from '../../../../services/apiConstTestDrive';

// ==================== Test Drive Appointments ====================

/**
 * Lấy danh sách lịch hẹn theo dealer
 */
export const getTestDrivesByDealer = async (dealerId) => {
  const response = await apiConstTestDrive.get(`/api/test-drives/dealer/${dealerId}`);
  return response.data;
};

/**
 * Lấy chi tiết một lịch hẹn
 */
export const getTestDriveById = async (id) => {
  const response = await apiConstTestDrive.get(`/api/test-drives/${id}`);
  return response.data;
};

/**
 * Tạo lịch hẹn mới
 */
export const createTestDrive = async (data) => {
  const response = await apiConstTestDrive.post('/api/test-drives', data);
  return response.data;
};

/**
 * Cập nhật lịch hẹn
 */
export const updateTestDrive = async (id, data) => {
  const response = await apiConstTestDrive.put(`/api/test-drives/${id}`, data);
  return response.data;
};

/**
 * Hủy lịch hẹn
 */
export const cancelTestDrive = async (id, data) => {
  const response = await apiConstTestDrive.delete(`/api/test-drives/${id}/cancel`, { data });
  return response.data;
};

/**
 * Xác nhận lịch hẹn
 */
export const confirmTestDrive = async (id) => {
  const response = await apiConstTestDrive.put(`/api/test-drives/${id}/confirm`);
  return response.data;
};

/**
 * Hoàn thành lịch hẹn
 */
export const completeTestDrive = async (id) => {
  const response = await apiConstTestDrive.put(`/api/test-drives/${id}/complete`);
  return response.data;
};

/**
 * Filter lịch hẹn
 */
export const filterTestDrives = async (filterData) => {
  const response = await apiConstTestDrive.post('/api/test-drives/filter', filterData);
  return response.data;
};

/**
 * Lấy calendar view
 */
export const getCalendarView = async (dealerId, startDate, endDate) => {
  const response = await apiConstTestDrive.get('/api/test-drives/calendar', {
    params: { dealerId, startDate, endDate }
  });
  return response.data;
};

/**
 * Lấy thống kê
 */
export const getStatistics = async (dealerId, startDate, endDate) => {
  const response = await apiConstTestDrive.get('/api/test-drives/statistics', {
    params: { dealerId, startDate, endDate }
  });
  return response.data;
};

/**
 * Ghi kết quả và phản hồi sau khi hoàn thành lái thử
 */
export const submitFeedback = async (id, feedbackData) => {
  const response = await apiConstTestDrive.post(`/api/test-drives/${id}/feedback`, feedbackData);
  return response.data;
};

/**
 * Lấy danh sách lịch hẹn có feedback
 */
export const getAppointmentsWithFeedback = async (dealerId) => {
  const response = await apiConstTestDrive.get('/api/test-drives/with-feedback', {
    params: { dealerId }
  });
  return response.data;
};

export default {
  getTestDrivesByDealer,
  getTestDriveById,
  createTestDrive,
  updateTestDrive,
  cancelTestDrive,
  confirmTestDrive,
  completeTestDrive,
  filterTestDrives,
  getCalendarView,
  getStatistics,
  submitFeedback,
  getAppointmentsWithFeedback,
};
