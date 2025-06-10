import axios from 'axios';
import config from '../config';

// هاد الـ API_BASE_URL هو الـ URL الأساسي للـ Google Places API
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// هاد الـ function بتحمل الـ Google Places API
const loadGooglePlacesScript = () => new Promise((resolve, reject) => {
  if (window.google?.maps) {
    resolve(window.google.maps);
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_PLACES_API_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => resolve(window.google.maps);
  script.onerror = () => reject(new Error('Failed to load Google Places API'));
  document.head.appendChild(script);
});

// هاد الـ function بيعمل instance جديد من الـ Places Service
const createPlacesService = () => {
  const div = document.createElement('div');
  return new window.google.maps.places.PlacesService(div);
};

// هاد الـ function بتتعامل مع الأخطاء في الـ Places API
const handlePlacesError = (error, type) => {
  console.error(`Error ${type}:`, error);
  throw error;
};

// هاد الـ function بتنفذ الـ request على الـ Places API
const executePlacesRequest = (service, request, method) => new Promise((resolve, reject) => {
  service[method](request, (results, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
      resolve(results);
    } else {
      reject(new Error(`${method} failed: ${status}`));
    }
  });
});

// هاد الـ function بتجيب معلومات مكان معين
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(`${PLACES_API_BASE_URL}/details/json`, {
      params: {
        place_id: placeId,
        key: config.GOOGLE_MAPS_API_KEY,
        fields: 'name,formatted_address,geometry,photos,rating,reviews,types'
      }
    });
    return response.data;
  } catch (error) {
    console.error('مشكلة في جلب معلومات المكان:', error);
    throw error;
  }
};

// هاد الـ function بتدور على أماكن قريبة
export const searchNearbyPlaces = async (lat, lon, radius = 5000, type = 'tourist_attraction') => {
  try {
    const response = await axios.get(`${PLACES_API_BASE_URL}/nearbysearch/json`, {
      params: {
        location: `${lat},${lon}`,
        radius,
        type,
        key: config.GOOGLE_MAPS_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('مشكلة في البحث عن الأماكن القريبة:', error);
    throw error;
  }
};

// هاد الـ function بتدور على أماكن باستخدام كلمة مفتاحية
export const searchPlaces = async (query, location = null) => {
  try {
    const params = {
      query,
      key: config.GOOGLE_MAPS_API_KEY
    };
    
    if (location) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = 5000;
    }
    
    const response = await axios.get(`${PLACES_API_BASE_URL}/textsearch/json`, { params });
    return response.data;
  } catch (error) {
    console.error('مشكلة في البحث عن الأماكن:', error);
    throw error;
  }
}; 