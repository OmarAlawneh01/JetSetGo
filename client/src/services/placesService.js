import axios from 'axios';
import config from '../config';

// Load Google Places API script
function loadGooglePlacesScript() {
  return new Promise(function(resolve, reject) {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = function() {
      resolve(window.google.maps);
    };
    script.onerror = function() {
      reject(new Error('Failed to load Google Places API'));
    };
    document.head.appendChild(script);
  });
}

// Search for places
export function searchPlaces(query, type = 'tourist_attraction') {
  return async function() {
    try {
      const maps = await loadGooglePlacesScript();
      
      return new Promise(function(resolve, reject) {
        const service = new maps.places.PlacesService(document.createElement('div'));
        
        const request = {
          query,
          type,
        };
        
        service.textSearch(request, function(results, status) {
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
}

// Get place details
export function getPlaceDetails(placeId) {
  return async function() {
    try {
      const maps = await loadGooglePlacesScript();
      
      return new Promise(function(resolve, reject) {
        const service = new maps.places.PlacesService(document.createElement('div'));
        
        const request = {
          placeId,
          fields: ['name', 'formatted_address', 'geometry', 'photos', 'rating', 'reviews', 'website', 'opening_hours', 'price_level'],
        };
        
        service.getDetails(request, function(place, status) {
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
}

// Get nearby places
export function getNearbyPlaces(location, radius, type = 'tourist_attraction') {
  return async function() {
    try {
      const maps = await loadGooglePlacesScript();
      
      return new Promise(function(resolve, reject) {
        const service = new maps.places.PlacesService(document.createElement('div'));
        
        const request = {
          location,
          radius,
          type,
        };
        
        service.nearbySearch(request, function(results, status) {
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
} 