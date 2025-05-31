import axios from 'axios';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add retry logic
api.interceptors.response.use(null, async (error) => {
  const { config: requestConfig } = error;
  
  // If no config or no retry count, initialize it
  if (!requestConfig || !requestConfig.__retryCount) {
    requestConfig.__retryCount = 0;
  }

  // Check if we should retry
  if (requestConfig.__retryCount < 3) { // 3 retry attempts
    requestConfig.__retryCount += 1;
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    // Retry the request
    return api(requestConfig);
  }

  return Promise.reject(error);
});

// Add request interceptor for authentication
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
  getAIRecommendations: (preferences) => api.post('/recommendations/ai', { preferences }),
  getPersonalizedRecommendations: (data) => api.post('/recommendations/personalized', data),
  
  // Other API methods can be added here
};

export default apiService;