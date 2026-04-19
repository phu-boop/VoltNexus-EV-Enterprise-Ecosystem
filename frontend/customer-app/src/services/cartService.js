import api from "./api.js";

/**
 * Cart Service
 * Provides API methods for shopping cart operations
 */

// Add item to cart
export const addToCart = (customerId, cartData) =>
  api.post(`/cart/${customerId}`, cartData).then((res) => res.data);

// Get all cart items
export const getCartItems = (customerId) =>
  api.get(`/cart/${customerId}/items`).then((res) => res.data);

// Get cart summary (items + total)
export const getCartSummary = (customerId) =>
  api.get(`/cart/${customerId}/summary`).then((res) => res.data);

// Update cart item
export const updateCartItem = (customerId, cartItemId, updateData) =>
  api.put(`/cart/${customerId}/items/${cartItemId}`, updateData).then((res) => res.data);

// Remove item from cart
export const removeCartItem = (customerId, cartItemId) =>
  api.delete(`/cart/${customerId}/items/${cartItemId}`).then((res) => res.data);

// Clear entire cart
export const clearCart = (customerId) =>
  api.delete(`/cart/${customerId}/clear`).then((res) => res.data);

// Get cart item count
export const getCartItemCount = (customerId) =>
  api.get(`/cart/${customerId}/count`).then((res) => res.data);
