import api from './api';

/**
 * Category Service - Quản lý danh mục
 * Bao gồm: Brands, Model Types, Features, Tags, etc.
 */

// ==================== BRANDS MANAGEMENT ====================

/**
 * Lấy danh sách tất cả brands từ models
 * Trả về danh sách brands kèm số lượng models
 */
export const getAllBrands = async () => {
  try {
    const response = await api.get('/vehicles/vehicle-catalog/models');
    
    
    // Check response structure - có thể là response.data.data hoặc response.data
    const responseData = response.data;
    
    if (responseData && responseData.code == 1000) {
      // Backend trả về paginated response với structure: { content: [], pageable: {}, ... }
      const paginatedData = responseData.data || {};
      const models = paginatedData.content || paginatedData || [];
      
      
      // Tạo map để đếm số lượng models theo brand
      const brandsMap = {};
      
      models.forEach(model => {
        const brand = model.brand || 'Unknown';
        if (!brandsMap[brand]) {
          brandsMap[brand] = {
            name: brand,
            modelCount: 0,
            models: []
          };
        }
        brandsMap[brand].modelCount++;
        brandsMap[brand].models.push({
          modelId: model.modelId,
          modelName: model.modelName,
          status: model.status
        });
      });
      
      // Chuyển map thành array
      const brands = Object.values(brandsMap).map((brand, index) => ({
        id: index + 1,
        name: brand.name,
        modelCount: brand.modelCount,
        models: brand.models,
        isActive: true
      }));
      
      
      return brands;
    }
    
    console.warn('[getAllBrands] Invalid response code:', responseData?.code);
    return [];
  } catch (error) {
    console.error('[getAllBrands] Error:', error);
    console.error('[getAllBrands] Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một brand
 */
export const getBrandDetail = async (brandName) => {
  try {
    const response = await api.get('/vehicles/vehicle-catalog/models');
    
    const responseData = response.data;
    
    if (responseData && responseData.code == 1000) {
      const paginatedData = responseData.data || {};
      const models = paginatedData.content || paginatedData || [];
      const brandModels = models.filter(m => m.brand === brandName);
      
      return {
        name: brandName,
        modelCount: brandModels.length,
        models: brandModels
      };
    }
    
    return null;
  } catch (error) {
    console.error('[getBrandDetail] Error:', error);
    throw error;
  }
};

/**
 * Lấy tất cả models của một brand
 */
export const getModelsByBrand = async (brandName) => {
  try {
    const response = await api.get('/vehicles/vehicle-catalog/models');
    
    const responseData = response.data;
    
    if (responseData && responseData.code == 1000) {
      const paginatedData = responseData.data || {};
      const models = paginatedData.content || paginatedData || [];
      return models.filter(m => m.brand === brandName);
    }
    
    return [];
  } catch (error) {
    console.error('[getModelsByBrand] Error:', error);
    throw error;
  }
};

/**
 * Thống kê brands
 */
export const getBrandStatistics = async () => {
  try {
    const brands = await getAllBrands();
    
    return {
      totalBrands: brands.length,
      totalModels: brands.reduce((sum, b) => sum + b.modelCount, 0),
      activeBrands: brands.filter(b => b.isActive).length,
      brands: brands
    };
  } catch (error) {
    console.error('Error fetching brand statistics:', error);
    throw error;
  }
};

// ==================== FEATURES MANAGEMENT ====================

/**
 * Lấy danh sách tất cả features
 */
export const getAllFeatures = async () => {
  try {
    const response = await api.get('/vehicles/vehicle-catalog/features');
    return response.data;
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

/**
 * Tạo feature mới
 */
export const createFeature = async (featureData) => {
  try {
    const response = await api.post('/vehicles/vehicle-catalog/features', featureData);
    return response.data;
  } catch (error) {
    console.error('Error creating feature:', error);
    throw error;
  }
};

/**
 * Cập nhật feature
 */
export const updateFeature = async (featureId, featureData) => {
  try {
    const response = await api.put(`/vehicles/vehicle-catalog/features/${featureId}`, featureData);
    return response.data;
  } catch (error) {
    console.error('Error updating feature:', error);
    throw error;
  }
};

/**
 * Xóa feature
 */
export const deleteFeature = async (featureId) => {
  try {
    const response = await api.delete(`/vehicles/vehicle-catalog/features/${featureId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting feature:', error);
    throw error;
  }
};

export default {
  // Brands
  getAllBrands,
  getBrandDetail,
  getModelsByBrand,
  getBrandStatistics,
  
  // Features
  getAllFeatures,
  createFeature,
  updateFeature,
  deleteFeature
};
