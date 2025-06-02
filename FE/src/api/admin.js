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
    method: 'PUT',
    body: JSON.stringify({ role }),
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
