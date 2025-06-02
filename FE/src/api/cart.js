import { apiRequest } from './config.js';

// Get user's cart
export const getCart = async (token) => {
  return apiRequest('/api/cart', {
    method: 'GET',
    token,
  });
};

// Add item to cart
export const addToCart = async (productId, quantity, token) => {
  return apiRequest('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
    token,
  });
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity, token) => {
  return apiRequest(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
    token,
  });
};

// Remove item from cart
export const removeFromCart = async (itemId, token) => {
  return apiRequest(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    token,
  });
};

// Clear cart
export const clearCart = async (token) => {
  return apiRequest('/api/cart', {
    method: 'DELETE',
    token,
  });
};
