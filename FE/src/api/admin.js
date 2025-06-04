import { apiRequest } from './config.js';

// Admin: Get all users
export const getAllUsers = async (token) => {
  return apiRequest('/api/admin/users', {
    method: 'GET',
    token,
  });
};

// Admin: Update user role
export const updateUserRole = async (userId, role, token) => {
  return apiRequest(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
    token,
  });
};

// Admin: Update user status
export const updateUserStatus = async (userId, active, token) => {
  return apiRequest(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
    token,
  });
};

// Admin: Update user
export const updateUser = async (userId, userData, token) => {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
    token,
  });
};

// Admin: Update user password
export const updateUserPassword = async (userId, password, token) => {
  return apiRequest(`/api/admin/users/${userId}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
    token,
  });
};

// Admin: Delete user
export const deleteUser = async (userId, token) => {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    token,
  });
};

// Admin: Get all products
export const getAllProducts = async (token) => {
  return apiRequest('/api/admin/products', {
    method: 'GET',
    token,
  });
};

// Admin: Create product
export const createProduct = async (productData, token) => {
  return apiRequest('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
    token,
  });
};

// Admin: Update product
export const updateProduct = async (productId, productData, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
    token,
  });
};

// Admin: Update product status (active/inactive)
export const updateProductStatus = async (productId, active, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ active }),
    token,
  });
};

// Admin: Update product inventory
export const updateProductInventory = async (productId, inventory, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ inventory }),
    token,
  });
};

// Admin: Delete product
export const deleteProduct = async (productId, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'DELETE',
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
  return apiRequest(`/api/admin/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    token,
  });
};

// Admin: Delete order
export const deleteOrder = async (orderId, token) => {
  return apiRequest(`/api/admin/orders/${orderId}`, {
    method: 'DELETE',
    token,
  });
};
