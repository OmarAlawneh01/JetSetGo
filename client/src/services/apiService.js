import axios from 'axios';
import config from '../config';

// هاد الـ API_BASE_URL هو الـ URL الأساسي للـ API
const API_BASE_URL = config.API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // Use window.location.href for a full page reload
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to make API requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const response = await api({
      method,
      url: endpoint,
      data
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// هاد الـ function بتعمل register للمستخدم الجديد
export const register = async (userData) => {
  const response = await makeRequest('POST', '/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

// هاد الـ function بتعمل login للمستخدم
export const login = async (credentials) => {
  const response = await makeRequest('POST', '/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    // Set default authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  }
  return response;
};

// هاد الـ function بتعمل logout للمستخدم
export const logout = () => {
  localStorage.removeItem('token');
};

// هاد الـ function بتجيب معلومات المستخدم الحالي
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  return makeRequest('GET', '/auth/me');
};

// هاد الـ function بتحدث معلومات المستخدم
export const updateUser = async (userData) => {
  return makeRequest('PUT', '/auth/profile', userData);
};

// هاد الـ function بتحدث preferences المستخدم
export const updatePreferences = async (preferences) => {
  return makeRequest('PUT', '/auth/preferences', preferences);
};

// هاد الـ function بتجيب الـ destinations
export const getDestinations = async () => {
  return makeRequest('GET', '/destinations');
};

// هاد الـ function بتجيب معلومات destination معين
export const getDestinationById = async (id) => {
  return makeRequest('GET', `/destinations/${id}`);
};

// هاد الـ function بتجيب الـ recommendations
export const getRecommendations = async () => {
  return makeRequest('GET', '/recommendations');
};

// هاد الـ function بتجيب الـ personalized recommendations
export const getPersonalizedRecommendations = async () => {
  return makeRequest('GET', '/recommendations/personalized');
};

// هاد الـ function بتجيب الـ seasonal recommendations
export const getSeasonalRecommendations = async () => {
  return makeRequest('GET', '/recommendations/seasonal');
};

// هاد الـ function بتجيب الـ budget recommendations
export const getBudgetRecommendations = async () => {
  return makeRequest('GET', '/recommendations/budget');
};