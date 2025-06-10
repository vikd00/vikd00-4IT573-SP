import { apiRequest } from "./config.js";

export const registerUser = async (userData) => {
  return apiRequest("/api/users/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (credentials) => {
  return apiRequest("/api/users/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const getUserProfile = async (token) => {
  return apiRequest("/api/users/profile", {
    method: "GET",
    token,
  });
};

export const updateUserProfile = async (userData, token) => {
  return apiRequest("/api/users/profile", {
    method: "PUT",
    body: JSON.stringify(userData),
    token,
  });
};
