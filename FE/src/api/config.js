// API configuration
export const API_BASE_URL = 'http://localhost:3003';

// Common headers for API requests
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API responses
export const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Backend returns error in this format: { error: { code, message, details } }
    const error = new Error(data.error?.message || 'API request failed');
    error.code = data.error?.code;
    error.details = data.error?.details;
    error.status = response.status;
    throw error;
  }
  
  return data;
};

// Helper function to make API requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...getHeaders(options.token),
      ...options.headers,
    },
  };
  
  // Remove token from options to avoid sending it in the request body
  delete config.token;
  
  const response = await fetch(url, config);
  return handleApiResponse(response);
};
