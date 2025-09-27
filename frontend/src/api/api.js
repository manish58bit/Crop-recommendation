import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Recommendation API
export const recommendAPI = {
  getRecommendations: (data) => api.post('/recommend', data),
  uploadSoilImage: (formData) => api.post('/recommend/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getRecommendationById: (id) => api.get(`/recommend/${id}`),
};

// History API
export const historyAPI = {
  getHistory: (params = {}) => api.get('/history', { params }),
  getHistoryById: (id) => api.get(`/history/${id}`),
  deleteHistoryItem: (id) => api.delete(`/history/${id}`),
  getUserStats: () => api.get('/history/stats'),
  exportHistory: (format = 'json') => api.get('/history/export', { 
    params: { format },
    responseType: format === 'csv' ? 'blob' : 'json'
  }),
};

// Admin API
export const adminAPI = {
  getAllUsers: (params = {}) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemStats: () => api.get('/admin/stats'),
  getAllRecommendations: (params = {}) => api.get('/admin/recommendations', { params }),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
    };
  }
};

export default api;
