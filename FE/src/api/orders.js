import { apiRequest } from './config.js';

// Create order from cart
export const createOrder = async (shippingAddress, token) => {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ shippingAddress }),
    token,
  });
};

// Get user's orders
export const getUserOrders = async (token) => {
  return apiRequest('/api/orders', {
    method: 'GET',
    token,
  });
};

// Get order by ID
export const getOrderById = async (orderId, token) => {
  return apiRequest(`/api/orders/${orderId}`, {
    method: 'GET',
    token,
  });
};

// Admin: Get all orders
export const getAllOrders = async (token) => {
  return apiRequest('/api/admin/orders', {
    method: 'GET',
    token,
  });
};

// Admin: Update order status
export const updateOrderStatus = async (orderId, status, token) => {
  return apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    token,
  });
};

// Admin: Get dashboard stats
export const getDashboardStats = async (token) => {
  return apiRequest('/api/admin/dashboard/stats', {
    method: 'GET',
    token,
  });
};
