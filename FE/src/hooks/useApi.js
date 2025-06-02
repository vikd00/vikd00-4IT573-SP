import { useState, useEffect } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const config = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      };

      // TODO: Replace with actual API base URL
      const baseUrl = 'http://localhost:3000/api';
      const response = await fetch(`${baseUrl}${url}`, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return { data, error: null };
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const get = (url) => makeRequest(url, { method: 'GET' });
  
  const post = (url, data) => makeRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  const put = (url, data) => makeRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  const del = (url) => makeRequest(url, { method: 'DELETE' });

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    makeRequest
  };
};
