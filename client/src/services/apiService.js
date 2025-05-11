import axios from 'axios';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
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

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
const apiService = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  getCurrentUser: () => api.get('/auth/me'),
  
  // Destinations
  getDestinations: () => api.get('/destinations'),
  getDestinationById: (id) => api.get(`/destinations/${id}`),
  
  // Recommendations
  getRecommendations: () => api.get('/recommendations'),
  
  // Other API methods can be added here
};

export default apiService; 