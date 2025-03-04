// src/utils/api.js
// Centralized API utility for making HTTP requests

import axios from 'axios';

// Get the backend URL from the injected _env_ variable or fallback to environment variable
// This approach supports both Kubernetes ConfigMap and standard React environment variables
const BASE_URL = window._env_?.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
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
        // Clear session data
        localStorage.removeItem('sessionData');
        // Redirect with message
        window.location.href = '/login?message=Session expired. Please login again.';
      }
    }
    
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/login', credentials),
    signup: (userData) => api.post('/signup', userData),
    logout: () => api.post('/logout').catch(err => {
      console.warn('Logout failed, but continuing client-side logout', err);
      return Promise.resolve({ data: { success: true } });
    }),
    checkAuth: () => api.get('/check'),
  },
  
  // Data endpoints that match the backend routes
  data: {
    getSummaryInsights: () => api.get('/summary-insights'),
    getWarnings: () => api.get('/warnings'),
    getRecentData: () => api.get('/recent-data'),
    getCorrelationData: (location = 'US') => api.get(`/correlation-data?location=${location}`),
    getAllData: () => api.get('/all-data'),
    getData: (params) => api.get('/data', { params }),
    createData: (data) => api.post('/create-data', data),
    updateData: (id, data) => api.put(`/update-data/${id}`, data),
    deleteData: (id) => api.delete(`/delete-data/${id}`),
  },
  
  // Graph endpoints that match the backend routes
  graphs: {
    getGraphData: (params) => api.get('/graph-data', { params }),
    getCompareGraphData: (params) => api.get('/compare-graph-data', { params }),
  },
  
  // Admin endpoints
  admin: {
    getAllData: () => api.get('/all-data'),
    getUsers: () => api.get('/admin/users'),
    addUser: (userData) => api.post('/admin/users', userData),
    updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  },
};

export default apiService;