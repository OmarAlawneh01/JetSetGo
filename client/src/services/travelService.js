import axios from 'axios';
import config from '../config';

// Booking.com API endpoints
const BOOKING_API_BASE_URL = 'https://booking-com15.p.rapidapi.com/api/v1';

// Search for flights
export function searchFlights(destination, returnDestination, departureDate, returnDate, adults) {
  return async function() {
    try {
      const response = await axios.get(`${BOOKING_API_BASE_URL}/flights/search`, {
        params: {
          from: destination,
          to: returnDestination,
          departure_date: departureDate,
          return_date: returnDate,
          adults: adults,
          currency: 'USD',
          locale: 'en-us'
        },
        headers: {
          'X-RapidAPI-Key': config.BOOKING_API_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
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
export function searchHotels(destination, checkInDate, checkOutDate, adults) {
  return async function() {
    try {
      const response = await axios.get(`${BOOKING_API_BASE_URL}/hotels/search`, {
        params: {
          location: destination,
          checkin_date: checkInDate,
          checkout_date: checkOutDate,
          adults_number: adults,
          room_number: '1',
          units: 'metric',
          currency: 'USD',
          locale: 'en-us',
          filter_by_currency: 'USD',
          order_by: 'price'
        },
        headers: {
          'X-RapidAPI-Key': config.BOOKING_API_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
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
      const response = await axios.get(`${BOOKING_API_BASE_URL}/hotels/data`, {
        params: {
          hotel_id: hotelId,
          locale: 'en-us',
          currency: 'USD'
        },
        headers: {
          'X-RapidAPI-Key': config.BOOKING_API_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting hotel details:', error);
      throw error;
    }
  };
} 