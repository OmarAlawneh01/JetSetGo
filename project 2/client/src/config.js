// API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Third-party API keys
const GOOGLE_PLACES_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const AMADEUS_API_KEY = process.env.REACT_APP_AMADEUS_API_KEY;
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const TRIPADVISOR_API_KEY = process.env.REACT_APP_TRIPADVISOR_API_KEY;

export default {
  API_BASE_URL,
  GOOGLE_PLACES_API_KEY,
  AMADEUS_API_KEY,
  OPENWEATHER_API_KEY,
  TRIPADVISOR_API_KEY,
}; 