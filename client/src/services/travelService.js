import axios from 'axios';
import config from '../config';

// Booking.com API endpoints
const BOOKING_API_BASE_URL = 'https://booking-com15.p.rapidapi.com/api/v1';

// Search for flights
export function searchFlights(fromCity, toCity, departureDate, returnDate, adults = 1) {
  return async function() {
    try {
      // Log the API key (first few characters only for security)
      const apiKey = config.BOOKING_API_KEY;
      console.log('API Key available:', apiKey ? `Yes (${apiKey.substring(0, 5)}...)` : 'No');

      // Log the request parameters
      console.log('Flight search parameters:', {
        fromCity,
        toCity,
        departureDate,
        returnDate,
        adults
      });

      // Check if API key is available
      if (!config.BOOKING_API_KEY) {
        throw new Error('Booking.com API key is not configured. Please check your environment variables.');
      }

      const options = {
        method: 'GET',
        url: `${BOOKING_API_BASE_URL}/flights/searchFlights`,
        params: {
          fromId: fromCity,
          toId: toCity,
          stops: 'none',
          pageNo: '1',
          adults: adults.toString(),
          children: '0,17',
          sort: 'BEST',
          cabinClass: 'ECONOMY',
          currency_code: 'USD',
          departDate: departureDate,
          returnDate: returnDate
        },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      };

      // Log the full request configuration
      console.log('Making API request with options:', {
        url: options.url,
        params: options.params,
        headers: {
          ...options.headers,
          'x-rapidapi-key': '***' // Hide the actual key in logs
        }
      });

      const response = await axios.request(options);
      
      // Log the API response
      console.log('Flight search API response status:', response.status);
      console.log('Flight search API response headers:', response.headers);
      console.log('Flight search API response data:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from the API');
      }

      return response.data;
    } catch (error) {
      // Log detailed error information
      console.error('Flight search error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          params: error.config?.params,
          headers: {
            ...error.config?.headers,
            'x-rapidapi-key': '***' // Hide the actual key in logs
          }
        }
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Booking.com API key.');
      } else if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid search parameters. Please check your input.');
      }

      throw error;
    }
  };
}

// Search for hotels
export function searchHotels(destination, checkInDate, checkOutDate, adults = 1) {
  return async function() {
    try {
      // Log the API key (first few characters only for security)
      const apiKey = config.BOOKING_API_KEY;
      console.log('API Key available:', apiKey ? `Yes (${apiKey.substring(0, 5)}...)` : 'No');

      const options = {
        method: 'GET',
        url: `${BOOKING_API_BASE_URL}/hotels/searchHotels`,
        params: {
          dest_id: destination,
          search_type: 'city',
          arrival_date: checkInDate,
          departure_date: checkOutDate,
          adults: adults.toString(),
          room_qty: '1',
          page_number: '1',
          units: 'metric',
          currency_code: 'USD',
          locale: 'en-us',
          sort: 'BEST',
          filter_by_currency: 'USD',
          categories_filter_ids: 'class::2,class::4,free_cancellation::1',
          page_size: '25'
        },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      };

      // Log the full request configuration
      console.log('Making API request with options:', {
        url: options.url,
        params: options.params,
        headers: {
          ...options.headers,
          'x-rapidapi-key': '***' // Hide the actual key in logs
        }
      });

      const response = await axios.request(options);
      
      // Log the API response
      console.log('Hotel search API response status:', response.status);
      console.log('Hotel search API response headers:', response.headers);
      console.log('Hotel search API response data:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from the API');
      }

      return response.data;
    } catch (error) {
      console.error('Hotel search error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          params: error.config?.params,
          headers: {
            ...error.config?.headers,
            'x-rapidapi-key': '***' // Hide the actual key in logs
          }
        }
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Booking.com API key.');
      } else if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid search parameters. Please check your input.');
      }

      throw error;
    }
  };
}

// Get hotel details
export function getHotelDetails(hotelId) {
  return async function() {
    try {
      // Log the API key (first few characters only for security)
      const apiKey = config.BOOKING_API_KEY;
      console.log('API Key available:', apiKey ? `Yes (${apiKey.substring(0, 5)}...)` : 'No');

      const options = {
        method: 'GET',
        url: `${BOOKING_API_BASE_URL}/hotels/getHotelDetails`,
        params: {
          hotel_id: hotelId,
          locale: 'en-us',
          currency_code: 'USD',
          checkin_date: new Date().toISOString().split('T')[0],
          checkout_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          adults: '1',
          children: '0,17',
          room_qty: '1'
        },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      };

      // Log the full request configuration
      console.log('Making API request with options:', {
        url: options.url,
        params: options.params,
        headers: {
          ...options.headers,
          'x-rapidapi-key': '***' // Hide the actual key in logs
        }
      });

      const response = await axios.request(options);
      
      // Log the API response
      console.log('Hotel details API response status:', response.status);
      console.log('Hotel details API response headers:', response.headers);
      console.log('Hotel details API response data:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from the API');
      }

      return response.data;
    } catch (error) {
      console.error('Hotel details error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          params: error.config?.params,
          headers: {
            ...error.config?.headers,
            'x-rapidapi-key': '***' // Hide the actual key in logs
          }
        }
      });

      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Booking.com API key.');
      } else if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid search parameters. Please check your input.');
      }

      throw error;
    }
  };
} 