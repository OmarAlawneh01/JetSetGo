// API configuration
const config = {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api',
    GOOGLE_PLACES_API_KEY: process.env.REACT_APP_GOOGLE_PLACES_API_KEY,
    BOOKING_API_KEY: process.env.REACT_APP_BOOKING_API_KEY,
    OPENWEATHER_API_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY
};

export default config;