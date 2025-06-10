import { apiRequest } from "./config.js";

export const getDashboardMetrics = async (token) => {
  return apiRequest("/api/admin/dashboard/metrics", {
    method: "GET",
    token,
  });
};

export const getAllUsers = async (token) => {
  return apiRequest("/api/admin/users", {
    method: "GET",
    token,
  });
};

export const createUser = async (userData, token) => {
  return apiRequest("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(userData),
    token,
  });
};

export const updateUserRole = async (userId, role, token) => {
  return apiRequest(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    token,
  });
};

export const updateUserStatus = async (userId, active, token) => {
  return apiRequest(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
    token,
  });
};

export const updateUser = async (userId, userData, token) => {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
    token,
  });
};

export const updateUserPassword = async (userId, password, token) => {
  return apiRequest(`/api/admin/users/${userId}/password`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
    token,
  });
};

export const deleteUser = async (userId, token) => {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: "DELETE",
    token,
  });
};

export const getAllProducts = async (token) => {
  return apiRequest("/api/admin/products", {
    method: "GET",
    token,
  });
};

export const createProduct = async (productData, token) => {
  return apiRequest("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(productData),
    token,
  });
};

export const updateProduct = async (productId, productData, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData),
    token,
  });
};

export const updateProductStatus = async (productId, active, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ active }),
    token,
  });
};

export const updateProductInventory = async (productId, inventory, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ inventory }),
    token,
  });
};

export const deleteProduct = async (productId, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: "DELETE",
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
  return apiRequest(`/api/admin/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
    token,
  });
};

export const deleteOrder = async (orderId, token) => {
  return apiRequest(`/api/admin/orders/${orderId}`, {
    method: "DELETE",
    token,
  });
};
