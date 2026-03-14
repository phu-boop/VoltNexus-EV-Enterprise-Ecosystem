// features/admin/promotions/hooks/usePromotions.js
import { useState, useEffect } from 'react';
import { adminPromotionService } from '../services/adminPromotionService';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminPromotionService.getAll();
      setPromotions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const approvePromotion = async (id) => {
    try {
      const response = await adminPromotionService.authenticPromotion(id);
      setPromotions(prev => prev.map(p => 
        p.promotionId === id ? response.data : p
      ));
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Lỗi khi xác thực khuyến mãi' 
      };
    }
  };

  const deletePromotion = async (id) => {
    try {
      await adminPromotionService.delete(id);
      setPromotions(prev => prev.filter(p => p.promotionId !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Lỗi khi xóa khuyến mãi' 
      };
    }
  };

  const updatePromotion = async (id, data) => {
    try {
      const response = await adminPromotionService.update(id, data);
      setPromotions(prev => prev.map(p => 
        p.promotionId === id ? response.data : p
      ));
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Lỗi khi cập nhật khuyến mãi' 
      };
    }
  };

  const createPromotion = async (data) => {
    try {
      const response = await adminPromotionService.create(data);
      setPromotions(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Lỗi khi tạo khuyến mãi' 
      };
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  return {
    promotions,
    loading,
    error,
    loadPromotions,
    approvePromotion,
    deletePromotion,
    updatePromotion,
    createPromotion,
  };
};