import apiConstSaleService from "../../../../../services/apiConstSaleService";

export const orderTrackingService = {
  create: (data) => 
    apiConstSaleService.post('/api/v1/order-tracking', data),

  update: (trackId, data) => 
    apiConstSaleService.put(`/api/v1/order-tracking/${trackId}`, data),

  delete: (trackId) => 
    apiConstSaleService.delete(`/api/v1/order-tracking/${trackId}`),

  getById: (trackId) => 
    apiConstSaleService.get(`/api/v1/order-tracking/${trackId}`),

  getByOrderId: (orderId) => 
    apiConstSaleService.get(`/api/v1/order-tracking/order/${orderId}`),

  getCurrentStatus: (orderId) => 
    apiConstSaleService.get(`/api/v1/order-tracking/order/${orderId}/current`),

  getByStatus: (status) => 
    apiConstSaleService.get(`/api/v1/order-tracking/status/${status}`),

  addNote: (orderId, notes, updatedBy) => 
    apiConstSaleService.post(`/api/v1/order-tracking/order/${orderId}/note?notes=${encodeURIComponent(notes)}&updatedBy=${updatedBy}`)
};

import { useState, useEffect } from 'react';
import { showSuccess, showError } from '../../../../../utils/notification';

export const useOrderTracking = (orderId) => {
  const [trackings, setTrackings] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrackings = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [historyResponse, currentResponse] = await Promise.all([
        orderTrackingService.getByOrderId(orderId),
        orderTrackingService.getCurrentStatus(orderId)
      ]);
      
      setTrackings(historyResponse.data || []);
      setCurrentStatus(currentResponse.data);
    } catch (err) {
      setError(err.message);
      showError('Lỗi khi tải lịch sử theo dõi');
    } finally {
      setLoading(false);
    }
  };

  const addTracking = async (trackingData) => {
    try {
      const response = await orderTrackingService.create(trackingData);
      showSuccess('Thêm trạng thái theo dõi thành công');
      await fetchTrackings();
      return response.data;
    } catch (err) {
      showError('Lỗi khi thêm trạng thái theo dõi');
      throw err;
    }
  };

  const addNote = async (notes) => {
    try {
      const updatedBy = sessionStorage.getItem('profileId');
      const response = await orderTrackingService.addNote(orderId, notes, updatedBy);
      showSuccess('Thêm ghi chú thành công');
      await fetchTrackings();
      return response.data;
    } catch (err) {
      showError('Lỗi khi thêm ghi chú');
      throw err;
    }
  };

  const updateTracking = async (trackId, data) => {
    try {
      const response = await orderTrackingService.update(trackId, data);
      showSuccess('Cập nhật theo dõi thành công');
      await fetchTrackings();
      return response.data;
    } catch (err) {
      showError('Lỗi khi cập nhật theo dõi');
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