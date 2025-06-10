export const API_BASE_URL = "http://localhost:3003";

export const getHeaders = (token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const handleApiResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || "API request failed");
    error.code = data.error?.code;
    error.details = data.error?.details;
    error.status = response.status;
    throw error;
  }

  return data;
};

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      ...getHeaders(options.token),
      ...options.headers,
    },
  };

  delete config.token;

  const response = await fetch(url, config);
  return handleApiResponse(response);
};
