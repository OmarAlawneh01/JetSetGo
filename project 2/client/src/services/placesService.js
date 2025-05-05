import axios from 'axios';
import config from '../config';

// Load Google Places API script
const loadGooglePlacesScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
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
};

// Search for places
export const searchPlaces = async (query, type = 'tourist_attraction') => {
  try {
    const maps = await loadGooglePlacesScript();
    
    return new Promise((resolve, reject) => {
      const service = new maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        query,
        type,
      };
      
      service.textSearch(request, (results, status) => {
        if (status === maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
};

// Get place details
export const getPlaceDetails = async (placeId) => {
  try {
    const maps = await loadGooglePlacesScript();
    
    return new Promise((resolve, reject) => {
      const service = new maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        placeId,
        fields: ['name', 'formatted_address', 'geometry', 'photos', 'rating', 'reviews', 'website', 'opening_hours', 'price_level'],
      };
      
      service.getDetails(request, (place, status) => {
        if (status === maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
};

// Get nearby places
export const getNearbyPlaces = async (location, radius, type = 'tourist_attraction') => {
  try {
    const maps = await loadGooglePlacesScript();
    
    return new Promise((resolve, reject) => {
      const service = new maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        location,
        radius,
        type,
      };
      
      service.nearbySearch(request, (results, status) => {
        if (status === maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(new Error(`Nearby search failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error getting nearby places:', error);
    throw error;
  }
}; 