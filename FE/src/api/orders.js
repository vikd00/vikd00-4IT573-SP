import { apiRequest } from "./config.js";

export const createOrder = async (shippingAddress, token) => {
  return apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
    token,
  });
};

export const getUserOrders = async (token) => {
  return apiRequest("/api/orders", {
    method: "GET",
    token,
  });
};

export const getOrderById = async (orderId, token) => {
  return apiRequest(`/api/orders/${orderId}`, {
    method: "GET",
    token,
  });
};

export const getAllOrders = async (token) => {
  return apiRequest("/api/admin/orders", {
    method: "GET",
    token,
  });
};

export const updateOrderStatus = async (orderId, status, token) => {
  return apiRequest(`/api/admin/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
    token,
  });
};

export const getDashboardStats = async (token) => {
  return apiRequest("/api/admin/dashboard/stats", {
    method: "GET",
    token,
  });
};
