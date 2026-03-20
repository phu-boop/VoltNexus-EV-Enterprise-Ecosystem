import api from "./api.js";

/**
 * Order Service
 * Provides API methods for order management
 */

// Get orders by customer
export const getCustomerOrders = (customerId) =>
  api.get(`/api/v1/sales-orders/b2c/customer/${customerId}`).then((res) => res.data);

// Get orders by profileId (UUID from user-service)
export const getOrdersByProfileId = (profileId) =>
  api.get(`/api/v1/sales-orders/b2c/profile/${profileId}`).then((res) => res.data);

// Get order detail by ID
export const getOrderById = (orderId) =>
  api.get(`/api/v1/sales-orders/b2c/${orderId}`).then((res) => res.data);

// Create order (placeholder - will implement after backend ready)
export const createOrder = (orderData) =>
  api.post('/api/v1/sales-orders/b2c/direct', orderData).then((res) => res.data);

// Update order status
export const updateOrderStatus = (orderId, status) =>
  api.put(`/api/v1/sales-orders/b2c/${orderId}/status`, null, { params: { status } }).then((res) => res.data);

// Cancel order (reject)
export const cancelOrder = (orderId, reason) =>
  api.put(`/api/v1/sales-orders/b2c/${orderId}/reject`, null, { params: { reason } }).then((res) => res.data);
