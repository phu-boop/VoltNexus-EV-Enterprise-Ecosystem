import api from './api';

/**
 * Admin Vehicle Service
 * API methods for admin vehicle management (CRUD operations)
 */

// Get all vehicles with pagination and filters
export const getVehiclesAdmin = async (params) => {
  try {
    const response = await api.get('/vehicles/vehicle-catalog/variants/paginated', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

// Get vehicle detail by variant ID
export const getVehicleDetailAdmin = async (variantId) => {
  try {
    const response = await api.get(`/vehicles/vehicle-catalog/variants/${variantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle detail:', error);
    throw error;
  }
};

// Create new vehicle variant
export const createVehicle = async (modelId, vehicleData) => {
  try {
    const response = await api.post(`/vehicles/vehicle-catalog/models/${modelId}/variants`, vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    throw error;
  }
};

// Update vehicle variant
export const updateVehicle = async (variantId, vehicleData) => {
  try {
    const response = await api.put(`/vehicles/vehicle-catalog/variants/${variantId}`, vehicleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete vehicle variant
export const deleteVehicle = async (variantId) => {
  try {
    const response = await api.delete(`/vehicles/vehicle-catalog/variants/${variantId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

// Update vehicle stock/inventory
export const updateVehicleStock = async (variantId, stockData) => {
  try {
    const response = await api.patch(`/vehicles/vehicle-catalog/variants/${variantId}/stock`, stockData);
    return response.data;
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
};

// Get all models (for dropdown)
export const getAllModels = async () => {
  try {
    const response = await api.get('/vehicles/vehicle-catalog/models');
    return response.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

// Get all features (for form)
export const getAllFeatures = async () => {
  try {
    const response = await api.get('/vehicles/vehicle-catalog/features');
    return response.data;
  } catch (error) {
    console.error('Error fetching features:', error);
    throw error;
  }
};

// Upload vehicle image
export const uploadVehicleImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // Use the correct endpoint for variant images
    const response = await api.post('/vehicles/vehicle-catalog/images/variants', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Search vehicles
export const searchVehiclesAdmin = async (keyword) => {
  try {
    // Use the paginated endpoint which supports search
    const response = await api.get('/vehicles/vehicle-catalog/variants/paginated', {
      params: {
        search: keyword,
        page: 0,
        size: 100 // Get reasonable amount for search results
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching vehicles:', error);
    throw error;
  }
};

export default {
  getVehiclesAdmin,
  getVehicleDetailAdmin,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStock,
  getAllModels,
  getAllFeatures,
  uploadVehicleImage,
  searchVehiclesAdmin
};
