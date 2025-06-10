import { apiRequest } from "./config.js";

export const getCart = async (token) => {
  return apiRequest("/api/cart", {
    method: "GET",
    token,
  });
};

export const addToCart = async (productId, quantity, token) => {
  return apiRequest("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
    token,
  });
};

export const updateCartItem = async (itemId, quantity, token) => {
  return apiRequest(`/api/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
    token,
  });
};

export const removeFromCart = async (itemId, token) => {
  return apiRequest(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    token,
  });
};

export const clearCart = async (token) => {
  return apiRequest("/api/cart", {
    method: "DELETE",
    token,
  });
};
