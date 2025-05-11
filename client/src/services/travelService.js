import axios from 'axios';
import config from '../config';

// Amadeus API endpoints
const AMADEUS_API_BASE_URL = 'https://test.api.amadeus.com/v2';
const AMADEUS_AUTH_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token';

// Get Amadeus access token
function getAmadeusToken() {
  return async function() {
    try {
      const response = await axios.post(AMADEUS_AUTH_URL, 
        'grant_type=client_credentials&client_id=YOUR_AMADEUS_CLIENT_ID&client_secret=YOUR_AMADEUS_CLIENT_SECRET',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting Amadeus token:', error);
      throw error;
    }
  };
}

// Search for flights
export function searchFlights(originCode, destinationCode, departureDate, returnDate, adults) {
  return async function() {
    try {
      const token = await getAmadeusToken()();
      
      const response = await axios.get(`${AMADEUS_API_BASE_URL}/shopping/flight-offers`, {
        params: {
          originLocationCode: originCode,
          destinationLocationCode: destinationCode,
          departureDate,
          returnDate,
          adults,
          max: 20
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  };
}

// Search for hotels
export function searchHotels(cityCode, checkInDate, checkOutDate, adults) {
  return async function() {
    try {
      const token = await getAmadeusToken()();
      
      const response = await axios.get(`${AMADEUS_API_BASE_URL}/shopping/hotel-offers`, {
        params: {
          cityCode,
          checkInDate,
          checkOutDate,
          adults,
          radius: 5,
          radiusUnit: 'KM',
          paymentPolicy: 'NONE',
          includeClosed: false,
          bestRateOnly: true,
          view: 'FULL',
          sort: 'PRICE'
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  };
}

// Get hotel details
export function getHotelDetails(hotelId) {
  return async function() {
    try {
      const token = await getAmadeusToken()();
      
      const response = await axios.get(`${AMADEUS_API_BASE_URL}/shopping/hotel-offers/${hotelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting hotel details:', error);
      throw error;
    }
  };
} 