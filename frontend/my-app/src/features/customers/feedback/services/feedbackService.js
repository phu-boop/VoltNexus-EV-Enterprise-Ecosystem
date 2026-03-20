// Import axios instance từ services dùng chung
import apiConstTestDrive from '../../../../services/apiConstTestDrive';
import { 
  FiShoppingBag, FiMail, FiGlobe, FiPhone, FiShare2, FiMessageCircle,
  FiTruck, FiSmile, FiClipboard, FiDollarSign, FiPackage, FiTool, FiShield, FiFileText
} from 'react-icons/fi';

// ==================== Complaint/Feedback Management ====================

/**
 * Tạo phản hồi/khiếu nại mới
 */
export const createComplaint = async (data) => {
  const response = await apiConstTestDrive.post('/api/complaints', data);
  return response.data;
};

/**
 * Lấy chi tiết phản hồi
 */
export const getComplaintById = async (id) => {
  const response = await apiConstTestDrive.get(`/api/complaints/${id}`);
  return response.data;
};

/**
 * Lấy danh sách phản hồi theo dealer
 */
export const getComplaintsByDealer = async (dealerId) => {
  const response = await apiConstTestDrive.get(`/api/complaints/dealer/${dealerId}`);
  return response.data;
};

/**
 * Filter phản hồi theo nhiều tiêu chí
 * Hỗ trợ pagination, sorting, filtering
 */
export const filterComplaints = async (filter) => {
  const response = await apiConstTestDrive.post('/api/complaints/filter', filter);
  return response.data;
};

/**
 * Phân công xử lý phản hồi (Manager only)
 */
export const assignComplaint = async (id, assignData) => {
  const response = await apiConstTestDrive.put(`/api/complaints/${id}/assign`, assignData);
  return response.data;
};

/**
 * Thêm cập nhật tiến độ xử lý
 */
export const addProgressUpdate = async (id, update) => {
  const response = await apiConstTestDrive.post(`/api/complaints/${id}/progress`, update);
  return response.data;
};

/**
 * Đánh dấu phản hồi đã giải quyết
 */
export const resolveComplaint = async (id, resolution) => {
  const response = await apiConstTestDrive.put(`/api/complaints/${id}/resolve`, resolution);
  return response.data;
};

/**
 * Đóng phản hồi (Manager only)
 */
export const closeComplaint = async (id) => {
  const response = await apiConstTestDrive.put(`/api/complaints/${id}/close`);
  return response.data;
};

/**
 * Gửi thông báo kết quả xử lý đến khách hàng
 */
export const sendNotificationToCustomer = async (id) => {
  const response = await apiConstTestDrive.post(`/api/complaints/${id}/send-notification`);
  return response.data;
};

/**
 * Lấy thống kê phản hồi
 */
export const getComplaintStatistics = async (dealerId, startDate, endDate) => {
  const params = { dealerId };
  // Format dates to ISO DateTime format (backend expects LocalDateTime)
  if (startDate) params.startDate = `${startDate}T00:00:00`;
  if (endDate) params.endDate = `${endDate}T23:59:59`;
  
  const response = await apiConstTestDrive.get('/api/complaints/statistics', { params });
  return response.data;
};

// ==================== Constants ====================

export const COMPLAINT_TYPES = {
  VEHICLE_QUALITY: { value: 'VEHICLE_QUALITY', label: 'Chất lượng xe', icon: FiPackage },
  SERVICE_ATTITUDE: { value: 'SERVICE_ATTITUDE', label: 'Thái độ phục vụ', icon: FiSmile },
  SALES_PROCESS: { value: 'SALES_PROCESS', label: 'Quy trình bán hàng', icon: FiClipboard },
  PRICING: { value: 'PRICING', label: 'Giá cả và chính sách', icon: FiDollarSign },
  DELIVERY: { value: 'DELIVERY', label: 'Giao xe', icon: FiTruck },
  AFTER_SALES: { value: 'AFTER_SALES', label: 'Dịch vụ sau bán hàng', icon: FiTool },
  WARRANTY: { value: 'WARRANTY', label: 'Bảo hành', icon: FiShield },
  OTHER: { value: 'OTHER', label: 'Khác', icon: FiFileText }
};

export const COMPLAINT_SEVERITIES = {
  LOW: { value: 'LOW', label: 'Thấp', color: 'bg-blue-100 text-blue-800', priority: 3, icon: '🟦' },
  MEDIUM: { value: 'MEDIUM', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800', priority: 2, icon: '🟨' },
  HIGH: { value: 'HIGH', label: 'Cao', color: 'bg-orange-100 text-orange-800', priority: 1, icon: '🟧' },
  CRITICAL: { value: 'CRITICAL', label: 'Khẩn cấp', color: 'bg-red-100 text-red-800', priority: 0, icon: '🟥' }
};

export const COMPLAINT_STATUSES = {
  NEW: { value: 'NEW', label: 'Mới nhận', color: 'bg-blue-100 text-blue-800', icon: '' },
  IN_PROGRESS: { value: 'IN_PROGRESS', label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800', icon: '' },
  RESOLVED: { value: 'RESOLVED', label: 'Đã giải quyết', color: 'bg-green-100 text-green-800', icon: '' },
  CLOSED: { value: 'CLOSED', label: 'Đã đóng', color: 'bg-gray-100 text-gray-800', icon: '' }
};

export const COMPLAINT_CHANNELS = {
  IN_STORE: { value: 'IN_STORE', label: 'Tại đại lý', icon: FiShoppingBag },
  EMAIL: { value: 'EMAIL', label: 'Qua email', icon: FiMail },
  WEBSITE: { value: 'WEBSITE', label: 'Qua website', icon: FiGlobe },
  PHONE: { value: 'PHONE', label: 'Qua điện thoại', icon: FiPhone },
  SOCIAL_MEDIA: { value: 'SOCIAL_MEDIA', label: 'Mạng xã hội', icon: FiShare2 },
  OTHER: { value: 'OTHER', label: 'Khác', icon: FiMessageCircle }
};
