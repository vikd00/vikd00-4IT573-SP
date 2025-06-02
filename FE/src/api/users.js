import { apiRequest } from './config.js';

// User registration
export const registerUser = async (userData) => {
  return apiRequest('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// User login
export const loginUser = async (credentials) => {
  return apiRequest('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

// Get user profile (requires authentication)
export const getUserProfile = async (token) => {
  return apiRequest('/api/users/profile', {
    method: 'GET',
    token,
  });
};

// Update user profile (requires authentication)
export const updateUserProfile = async (userData, token) => {
  return apiRequest('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
    token,
  });
};
