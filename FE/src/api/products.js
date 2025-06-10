import { apiRequest } from "./config.js";

export const getProducts = async () => {
  return apiRequest("/api/products", {
    method: "GET",
  });
};

export const getProductById = async (productId) => {
  return apiRequest(`/api/products/${productId}`, {
    method: "GET",
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

export const deleteProduct = async (productId, token) => {
  return apiRequest(`/api/admin/products/${productId}`, {
    method: "DELETE",
    token,
  });
};
