import axios from 'axios';
import config from '../config';

// Booking.com API endpoints
const BOOKING_API_BASE_URL = 'https://booking-com15.p.rapidapi.com/api/v1';

// Search for flights
export function searchFlights(fromCity, toCity, departureDate, returnDate, adults = 1) {
  return async function() {
    try {
      // First, get the destination IDs for both cities
      const fromSearchOptions = {
        method: 'GET',
        url: `${BOOKING_API_BASE_URL}/flights/searchDestination`,
        params: {
          query: fromCity
        },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      };

      const toSearchOptions = {
        method: 'GET',
        url: `${BOOKING_API_BASE_URL}/flights/searchDestination`,
        params: {
          query: toCity
        },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      };

      console.log('Searching for flight destinations:', { fromCity, toCity });
      
      const [fromResponse, toResponse] = await Promise.all([
        axios.request(fromSearchOptions),
        axios.request(toSearchOptions)
      ]);

      console.log('Destination search responses:', {
        from: fromResponse.data,
        to: toResponse.data
      });

      if (!fromResponse.data?.data || fromResponse.data.data.length === 0) {
        throw new Error(`No destinations found for ${fromCity}`);
      }

      if (!toResponse.data?.data || toResponse.data.data.length === 0) {
        throw new Error(`No destinations found for ${toCity}`);
      }

      const fromDest = fromResponse.data.data[0];
      const toDest = toResponse.data.data[0];

      console.log('Found destinations:', {
        from: fromDest,
        to: toDest
      });

      // Now search for flights using the destination IDs
      const options = {
        method: 'GET',
        url: `${BOOKING_API_BASE_URL}/flights/searchFlights`,
        params: {
          fromId: fromDest.dest_id,
          toId: toDest.dest_id,
          departDate: departureDate,
          returnDate: returnDate,
          adults: adults.toString(),
          children: '0,17',
          currency_code: 'USD',
          cabinClass: 'ECONOMY',
          sort: 'BEST',
          pageNo: '1',
          stops: 'none'
        },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      };

      console.log('Making flight search request with params:', {
        fromId: fromDest.dest_id,
        toId: toDest.dest_id,
        departDate: departureDate,
        returnDate: returnDate
      });

      const response = await axios.request(options);
      
      console.log('Flight search response:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from the API');
      }

      if (response.data.status === false) {
        throw new Error(response.data.message?.[0] || 'Failed to search flights');
      }

      return response.data;
    } catch (error) {
      console.error('Flight search error:', error.message);
      throw error;
    }
  };
}

// Search for hotels
export function searchHotels(destination, checkInDate, checkOutDate, adults = 1, children = 0, rooms = 1) {
  return async function() {
    try {
      // Extract city name from destination (handle "City, Country" format)
      const cityName = destination.split(',')[0].trim();
      console.log('Searching for hotels in:', cityName);

      // First, get the destination ID
      const searchOptions = {
        method: 'GET',
        url: `${BOOKING_API_BASE_URL}/hotels/searchDestination`,
        params: {
          query: cityName
        },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      };

      const searchResponse = await axios.request(searchOptions);
      console.log('Destination search response:', searchResponse.data);

      if (!searchResponse.data?.data || searchResponse.data.data.length === 0) {
        throw new Error(`No destinations found for ${cityName}. Please try a different city name.`);
      }

      const destId = searchResponse.data.data[0].dest_id;
      console.log('Found destination ID:', destId);

      // Now search for hotels using the destination ID
      const options = {
        method: 'GET',
        url: `${BOOKING_API_BASE_URL}/hotels/searchHotels`,
        params: {
          dest_id: destId,
          search_type: 'city',
          arrival_date: checkInDate,
          departure_date: checkOutDate,
          adults: adults.toString(),
          room_qty: rooms.toString(),
          children: children > 0 ? Array(children).fill(8).join(',') : '',
          page_number: '1',
          categories_filter_ids: 'class::2,class::4,free_cancellation::1',
          filter_by_currency: 'USD',
          locale: 'en-us',
          units: 'metric',
          sort: 'BEST',
          page_size: '25',
          include_photo: 'true',
          include_amenities: 'true',
          include_description: 'true',
          include_reviews: 'true'
        },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        throw new Error('No data received from the API');
      }

      if (response.data.status === false) {
        throw new Error(response.data.message?.error || 'Failed to search hotels');
      }

      // Check if we have hotels data
      if (!response.data.data?.hotels) {
        console.error('No hotels data in response:', response.data);
        throw new Error('No hotels found in the API response');
      }

      console.log('Number of hotels found:', response.data.data.hotels.length);
      console.log('First hotel raw data:', JSON.stringify(response.data.data.hotels[0], null, 2));

      // Process the hotel data to ensure all required fields are present
      const processedHotels = response.data.data.hotels.map(hotel => {
        console.log('Processing hotel:', JSON.stringify(hotel, null, 2));

        // Get the property data
        const property = hotel.property || {};

        // Extract price information
        const price = property.priceBreakdown?.grossPrice?.value || 
                     property.priceBreakdown?.grossPrice?.value || 
                     'N/A';

        // Extract rating information
        const rating = property.reviewScore || 
                      property.reviewScore || 
                      'N/A';

        // Extract hotel name
        const hotelName = property.name || 
                         'Hotel Name Not Available';

        // Extract address from accessibilityLabel
        const addressMatch = hotel.accessibilityLabel?.match(/•\s*([^•\n]+)/);
        const address = addressMatch ? addressMatch[1].trim() : 'Address Not Available';

        // Extract description from accessibilityLabel
        const description = hotel.accessibilityLabel?.split('\n').slice(0, 3).join(' ') || 
                          'No description available';

        // Extract photo URL
        const photoUrl = property.photoUrls?.[0] || 
                        `https://source.unsplash.com/800x600/?hotel,${encodeURIComponent(hotelName)}`;

        // Extract amenities from accessibilityLabel
        const amenitiesMatch = hotel.accessibilityLabel?.match(/Entire apartment[^•]*|Hotel room[^•]*/);
        const amenities = amenitiesMatch ? [amenitiesMatch[0].trim()] : [];

        // Extract star rating
        const starRating = property.propertyClass || 
                          property.accuratePropertyClass || 
                          'N/A';

        const processedHotel = {
          hotel_name: hotelName,
          address: address,
          review_score: rating,
          price: price,
          photo_url: photoUrl,
          url: `https://www.booking.com/hotel/us/${property.id}.html`,
          amenities: amenities,
          description: description,
          star_rating: starRating,
          review_count: property.reviewCount || 0,
          review_score_word: property.reviewScoreWord || 'N/A'
        };

        console.log('Processed hotel data:', processedHotel);
        return processedHotel;
      });

      console.log('All processed hotels:', processedHotels);

      return {
        data: {
          hotels: processedHotels
        }
      };
    } catch (error) {
      console.error('Hotel search error:', error.message);
      throw error;
    }
  };
}

// Get hotel details
export function getHotelDetails(hotelId) {
  return async function() {
    try {
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

      const response = await axios.request(options);
      
      if (!response.data) {
        throw new Error('No data received from the API');
      }

      return response.data;
    } catch (error) {
      console.error('Hotel details error details:', error);
      throw error;
    }
  };
} 