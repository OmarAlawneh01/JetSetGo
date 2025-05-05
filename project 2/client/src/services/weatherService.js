import axios from 'axios';
import config from '../config';

const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get current weather for a location
export const getCurrentWeather = async (lat, lon) => {
  try {
    const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: config.OPENWEATHER_API_KEY,
        units: 'metric', // Use metric units (Celsius)
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

// Get 5-day forecast for a location
export const getForecast = async (lat, lon) => {
  try {
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: config.OPENWEATHER_API_KEY,
        units: 'metric', // Use metric units (Celsius)
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

// Get weather by city name
export const getWeatherByCity = async (cityName) => {
  try {
    const response = await axios.get(`${WEATHER_API_BASE_URL}/weather`, {
      params: {
        q: cityName,
        appid: config.OPENWEATHER_API_KEY,
        units: 'metric', // Use metric units (Celsius)
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    throw error;
  }
}; 