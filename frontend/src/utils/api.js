// src/utils/api.js
// Centralized API utility for making HTTP requests

import axios from 'axios';

// Base API URL - use hardcoded fallback if environment variable is not available
const BASE_URL = window._env_?.REACT_APP_BACKEND_URL || 'http://54.88.148.135:5000';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
  // Remove withCredentials as it can cause issues with CORS
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from session storage
    try {
      const sessionData = JSON.parse(localStorage.getItem('sessionData') || '{}');
      if (sessionData.token) {
        config.headers.Authorization = `Bearer ${sessionData.token}`;
      }
    } catch (error) {
      console.error('Error parsing session data:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401) {
      console.warn('Unauthorized access detected. Token may be expired.');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        // Don't clear session here - leave that to AuthContext
        // Just redirect with message
        window.location.href = '/login?message=Session expired. Please login again.';
      }
    }
    
    // Handle CORS errors
    if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
      console.error('CORS or Network Error:', error);
      return Promise.reject({
        message: 'Unable to connect to server. Please check your connection.',
        originalError: error
      });
    }
    
    return Promise.reject(error);
  }
);

// Retry mechanism for failed requests
const retryRequest = async (apiCall, retries = 2, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// API service functions
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/login', credentials),
    signup: (userData) => api.post('/signup', userData),
    logout: () => api.post('/logout').catch(err => {
      console.warn('Logout failed, but continuing client-side logout', err);
      // Return a resolved promise so the client-side logout can still proceed
      return Promise.resolve({ data: { success: true } });
    }),
    checkAuth: () => api.get('/check').catch(err => {
      // For auth check, just pass through the error but log it
      console.warn('Auth check failed:', err);
      return Promise.reject(err);
    }),
  },
  
  // Admin endpoints with special error handling
  admin: {
    getAllData: async () => {
      try {
        // Use direct api call to avoid retry for admin data
        const response = await api.get('/all-data');
        return response.data;
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Provide a more useful error message
        if (error.response?.status === 401) {
          throw new Error('Not authorized to access admin data. Please login again.');
        } else if (error.message?.includes('Network Error')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else {
          throw new Error('Failed to fetch admin data. Please try again.');
        }
      }
    },
    getUsers: () => retryRequest(() => api.get('/admin/users')),
    addUser: (userData) => api.post('/admin/users', userData),
    updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    getSystemStats: () => retryRequest(() => api.get('/admin/stats')),
  },
  
  // Data endpoints
  data: {
    getSummary: (location) => retryRequest(() => api.get(`/data/summary?location=${location}`)),
    getWarnings: () => retryRequest(() => api.get('/data/warnings')),
    getRecentData: (params) => retryRequest(() => api.get('/data/recent', { params })),
    getCorrelationData: (params) => retryRequest(() => api.get('/data/correlation', { params })),
    createData: (data) => api.post('/create-data', data),
    updateData: (id, data) => api.put(`/update-data/${id}`, data),
    deleteData: (id) => api.delete(`/delete-data/${id}`),
  },
  
  // Graph endpoints
  graphs: {
    getGraphData: (params) => retryRequest(() => api.get('/graphs/data', { params })),
    getComparisonData: (params) => retryRequest(() => api.get('/graphs/compare', { params })),
  },
};

export default apiService; 