import { useState, useEffect } from 'react';
import { orderTrackingService } from '../services/orderTrackingService';
import { showSuccess, showError } from '../../../../../utils/notification';

/**
 * Hook quản lý order tracking
 * @param {string} orderId - ID của order (optional)
 * @returns {Object} Các phương thức và state quản lý tracking
 */
export const useOrderTracking = (orderId) => {
  const [trackings, setTrackings] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Lấy lịch sử tracking và trạng thái hiện tại
   */
  const fetchTrackings = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [historyResponse, currentResponse] = await Promise.all([
        orderTrackingService.getByOrderId(orderId),
        orderTrackingService.getCurrentStatus(orderId)
      ]);
      
      setTrackings(historyResponse.data?.data || []);
      setCurrentStatus(currentResponse.data?.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      showError(errorMessage || 'Lỗi khi tải lịch sử theo dõi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Thêm tracking record mới
   * @param {Object} trackingData - Dữ liệu tracking
   * @returns {Object} Tracking record đã tạo
   */
  const addTracking = async (trackingData) => {
    try {
      const response = await orderTrackingService.create(trackingData);
      showSuccess('Thêm trạng thái theo dõi thành công');
      await fetchTrackings();
      return response.data?.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      showError(errorMessage || 'Lỗi khi thêm trạng thái theo dõi');
      throw err;
    }
  };

  /**
   * Thêm ghi chú cho tracking
   * @param {string} notes - Nội dung ghi chú
   * @returns {Object} Tracking record đã cập nhật
   */
  const addNote = async (notes) => {
    try {
      const updatedBy = sessionStorage.getItem('profileId');
      const response = await orderTrackingService.addNote(orderId, notes, updatedBy);
      showSuccess('Thêm ghi chú thành công');
      await fetchTrackings();
      return response.data?.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      showError(errorMessage || 'Lỗi khi thêm ghi chú');
      throw err;
    }
  };

  /**
   * Cập nhật tracking record
   * @param {string} trackId - ID của tracking record
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Object} Tracking record đã cập nhật
   */
  const updateTracking = async (trackId, data) => {
    try {
      const response = await orderTrackingService.update(trackId, data);
      showSuccess('Cập nhật theo dõi thành công');
      await fetchTrackings();
      return response.data?.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      showError(errorMessage || 'Lỗi khi cập nhật theo dõi');
      throw err;
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchTrackings();
    }
  }, [orderId]);

  return {
    trackings,
    currentStatus,
    loading,
    error,
    fetchTrackings,
    addTracking,
    addNote,
    updateTracking
  };
};