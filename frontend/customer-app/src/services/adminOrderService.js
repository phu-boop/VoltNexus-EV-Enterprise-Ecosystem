import api from './api';

/**
 * Admin Order Service
 * API methods for admin order management
 */

// Get all orders with pagination and filters  
export const getOrdersAdmin = async (params) => {
  try {
    // Backend endpoint for Admin/Staff to list B2C orders
    // Gateway passes through /api/v1/sales-orders/** without rewriting
    const response = await api.get('/api/v1/sales-orders/b2c', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get order detail by ID
export const getOrderDetailAdmin = async (orderId) => {
  try {
    // Gateway passes through /api/v1/sales-orders/** without rewriting
    const response = await api.get(`/api/v1/sales-orders/b2c/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

// Update order status (B2C)
export const updateOrderStatus = async (orderId, status) => {
  try {
    // Backend B2C status endpoint is PUT and uses @RequestParam
    const response = await api.put(`/api/v1/sales-orders/b2c/${orderId}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId, reason) => {
  try {
    // Backend endpoint for Staff to cancel
    const response = await api.put(`/api/v1/sales-orders/${orderId}/cancel-by-staff`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Confirm order (B2C)
export const confirmOrder = async (orderId, managerId) => {
  try {
    // Backend endpoint for B2C approve requires managerId
    const response = await api.put(`/api/v1/sales-orders/b2c/${orderId}/approve`, null, {
      params: { managerId }
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
};

// Export invoice (PDF)
export const exportInvoice = async (orderId) => {
  try {
    const response = await api.get(`/api/v1/sales-orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting invoice:', error);
    throw error;
  }
};

// Get order statistics
export const getOrderStatistics = async (params) => {
  try {
    const response = await api.get('/api/v1/sales-orders/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

// Search orders
export const searchOrders = async (keyword) => {
  try {
    const response = await api.get('/api/v1/sales-orders/search', {
      params: { keyword }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching orders:', error);
    throw error;
  }
};

export default {
  getOrdersAdmin,
  getOrderDetailAdmin,
  updateOrderStatus,
  cancelOrder,
  confirmOrder,
  exportInvoice,
  getOrderStatistics,
  searchOrders
};
