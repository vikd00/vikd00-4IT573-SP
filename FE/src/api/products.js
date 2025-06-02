import { apiRequest } from './config.js';

// Get all products (public)
export const getProducts = async () => {
  return apiRequest('/api/products', {
    method: 'GET',
  });
};

// Get product by ID (public)
export const getProductById = async (productId) => {
  return apiRequest(`/api/products/${productId}`, {
    method: 'GET',
  });
};

// Create product (admin only)
export const createProduct = async (productData, token) => {
  return apiRequest('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
    token,
  });
};

// Update product (admin only)
export const updateProduct = async (productId, productData, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
    token,
  });
};

// Delete product (admin only)
export const deleteProduct = async (productId, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: 'DELETE',
    token,
  });
};
