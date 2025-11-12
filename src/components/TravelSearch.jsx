import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Chip,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { searchFlights, searchHotels, getDestinationId } from '../services/travelService';
import axios from 'axios';
import config from '../config';

function TravelSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [destination, setDestination] = useState('');
  
  // Hotel search state
  const [hotelCheckIn, setHotelCheckIn] = useState(null);
  const [hotelCheckOut, setHotelCheckOut] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [numRooms, setNumRooms] = useState(1);
  
  // Flight search state
  const [departureCity, setDepartureCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [flightDeparture, setFlightDeparture] = useState(null);
  const [flightReturn, setFlightReturn] = useState(null);
  const [flights, setFlights] = useState([]);
  
  // Autocomplete state for city suggestions
  const [fromCityOptions, setFromCityOptions] = useState([]);
  const [toCityOptions, setToCityOptions] = useState([]);
  const [selectedFromCity, setSelectedFromCity] = useState(null);
  const [selectedToCity, setSelectedToCity] = useState(null);
  const [fromCityLoading, setFromCityLoading] = useState(false);
  const [toCityLoading, setToCityLoading] = useState(false);

  // Store destination IDs
  const [fromCityId, setFromCityId] = useState(null);
  const [toCityId, setToCityId] = useState(null);

  // Debounce helpers
  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  }

  const debouncedDepartureCity = useDebounce(departureCity, 400);
  const debouncedDestinationCity = useDebounce(destinationCity, 400);

  useEffect(() => {
    if (location.state?.destination) {
      setDestination(location.state.destination);
      setDestinationCity(location.state.destination);
    }
  }, [location.state]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Helper function to show city selection status
  const getCitySelectionStatus = (cityId, selectedCity, inputValue) => {
    if (cityId && selectedCity) {
      return { isValid: true, message: `✓ ${selectedCity.city_name} selected` };
    } else if (inputValue && inputValue.length > 0) {
      return { isValid: false, message: 'Please select from dropdown' };
    }
    return { isValid: false, message: '' };
  };

  const handleHotelSearch = async () => {
    if (!destination) {
      setError('Please enter a destination');
      return;
    }

    if (!hotelCheckIn || !hotelCheckOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Format dates to YYYY-MM-DD
      const checkIn = hotelCheckIn.toISOString().split('T')[0];
      const checkOut = hotelCheckOut.toISOString().split('T')[0];
      
      console.log('Searching hotels with params:', {
        destination,
        checkIn,
        checkOut,
        numAdults,
        numChildren,
        numRooms
      });
      
      const result = await searchHotels(
        destination,
        checkIn,
        checkOut,
        numAdults,
        numChildren,
        numRooms
      )();
      
      console.log('Hotel search API response:', result);
      
      if (result.data && result.data.hotels) {
        console.log('First hotel data:', result.data.hotels[0]);
        setHotels(result.data.hotels);
      } else {
        setHotels([]);
        setError('No hotels found for the selected criteria.');
      }
    } catch (err) {
      console.error('Error searching hotels:', err);
      setError(err.message || 'Failed to search hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to search cities using getDestinationId and return formatted options
  const searchCities = async (query) => {
    console.log('searchCities called with query:', query);
    
    if (!query || query.length < 2) {
      console.log('Query too short, returning empty array');
      return [];
    }
    
    try {
      console.log('Making API request to:', 'https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination');
      console.log('API Key exists:', !!config.BOOKING_API_KEY);
      console.log('Query params:', { query });
      
      const response = await axios.get('https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination', {
        params: { query },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
        },
      });

      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);

      if (response.data?.data) {
        const filteredData = response.data.data
          .filter(item => {
            // Check for the actual API structure: cityName and id
            const isValid = (item.cityName || item.city_name) && (item.id || item.dest_id);
            if (!isValid) {
              console.log('Filtered out invalid item:', item);
            }
            return isValid;
          })
          .map(item => ({
            // Map to consistent structure, handling both possible formats
            city_name: item.cityName || item.city_name,
            country_name: item.countryName || item.country_name,
            dest_id: item.id || item.dest_id,
            label: `${item.cityName || item.city_name}${(item.countryName || item.country_name) ? ', ' + (item.countryName || item.country_name) : ''}`,
            type: item.type,
            // Store original data for debugging
            original: item
          }));
        
        console.log('Processed cities:', filteredData);
        return filteredData;
      } else {
        console.log('No data in response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error searching cities - Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      return [];
    }
  };

  // Search for departure cities
  useEffect(() => {
    console.log('FROM city effect triggered:', { 
      debouncedDepartureCity, 
      length: debouncedDepartureCity?.length 
    });
    
    if (!debouncedDepartureCity || debouncedDepartureCity.length < 2) {
      console.log('FROM city: clearing options - query too short');
      setFromCityOptions([]);
      return;
    }
    
    console.log('FROM city: starting search for:', debouncedDepartureCity);
    setFromCityLoading(true);
    
    searchCities(debouncedDepartureCity)
      .then(options => {
        console.log('FROM city search completed:', options);
        setFromCityOptions(options);
      })
      .catch(error => {
        console.error('FROM city search error:', error);
        setFromCityOptions([]);
      })
      .finally(() => {
        console.log('FROM city search finished');
        setFromCityLoading(false);
      });
  }, [debouncedDepartureCity]);

  // Search for destination cities  
  useEffect(() => {
    console.log('TO city effect triggered:', { 
      debouncedDestinationCity, 
      length: debouncedDestinationCity?.length 
    });
    
    if (!debouncedDestinationCity || debouncedDestinationCity.length < 2) {
      console.log('TO city: clearing options - query too short');
      setToCityOptions([]);
      return;
    }
    
    console.log('TO city: starting search for:', debouncedDestinationCity);
    setToCityLoading(true);
    
    searchCities(debouncedDestinationCity)
      .then(options => {
        console.log('TO city search completed:', options);
        setToCityOptions(options);
      })
      .catch(error => {
        console.error('TO city search error:', error);
        setToCityOptions([]);
      })
      .finally(() => {
        console.log('TO city search finished');
        setToCityLoading(false);
      });
  }, [debouncedDestinationCity]);

  // Enhanced flight search function using stored IDs
  const handleFlightSearch = async () => {
    console.log('Flight search initiated with:', {
      fromCityId,
      toCityId,
      selectedFromCity,
      selectedToCity,
      departureCity,
      destinationCity
    });

    // Validate that we have both city IDs
    if (!fromCityId || !selectedFromCity) {
      setError(`Please select a valid departure city from the dropdown suggestions. Current input: "${departureCity}"`);
      return;
    }
    
    if (!toCityId || !selectedToCity) {
      setError(`Please select a valid destination city from the dropdown suggestions. Current input: "${destinationCity}"`);
      return;
    }

    if (!flightDeparture) {
      setError('Please select departure date');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching flights with validated IDs:', {
        fromId: fromCityId,
        toId: toCityId,
        fromCity: selectedFromCity.city_name,
        toCity: selectedToCity.city_name,
        departure: flightDeparture.toISOString().split('T')[0],
        return: flightReturn ? flightReturn.toISOString().split('T')[0] : undefined,
        adults: numAdults
      });

      const result = await searchFlights(
        fromCityId,
        toCityId,
        flightDeparture.toISOString().split('T')[0],
        flightReturn ? flightReturn.toISOString().split('T')[0] : undefined,
        numAdults
      );
      
      console.log('Flight search result:', result);
      
      // Handle the actual API response structure
      if (result?.data?.flightOffers && result.data.flightOffers.length > 0) {
        console.log('First flight offer structure:', JSON.stringify(result.data.flightOffers[0], null, 2));
        const processedFlights = result.data.flightOffers.map((offer, index) => {
          console.log(`Processing flight offer ${index}:`, offer);
          const segments = offer.segments || [];
          console.log(`Flight ${index} segments:`, segments);

          // Defensive: skip if no segments
          if (!segments.length) return null;

          // First and last segment for overall info
          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1];

          // Departure/arrival info
          const departureTime = firstSegment.departureTime || 'N/A';
          const arrivalTime = lastSegment.arrivalTime || 'N/A';
          const departureAirport = firstSegment.departureAirport?.code || 'N/A';
          const departureCity = firstSegment.departureAirport?.cityName || firstSegment.departureAirport?.city || 'N/A';
          const arrivalAirport = lastSegment.arrivalAirport?.code || 'N/A';
          const arrivalCity = lastSegment.arrivalAirport?.cityName || lastSegment.arrivalAirport?.city || 'N/A';

          // Price
          let price = offer.priceBreakdown?.total?.units || (offer.travellerPrices?.[0]?.price?.units) || offer.price || 'N/A';

          // Duration (sum of all segment totalTime)
          let totalSeconds = 0;
          segments.forEach(seg => { totalSeconds += seg.totalTime || 0; });
          let duration = 'N/A';
          if (totalSeconds > 0) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            duration = `${hours}h ${minutes}m`;
          }

          // Stops
          const stops = segments.length - 1;

          // Airline: get from first leg's carriersData if available
          let airline = 'Unknown Airline';
          let airlineLogo = '';
          let flightNumber = '';
          if (firstSegment.legs && firstSegment.legs.length > 0) {
            const leg = firstSegment.legs[0];
            if (leg.carriersData && leg.carriersData.length > 0) {
              airline = leg.carriersData[0].name || 'Unknown Airline';
              airlineLogo = leg.carriersData[0].logo || '';
            }
            if (leg.flightInfo?.flightNumber) {
              flightNumber = leg.flightInfo.flightNumber;
            }
          }

          // Build segments details for display
          const processedSegments = segments.map((seg, i) => {
            let segAirline = 'Unknown Airline';
            let segFlightNumber = '';
            let segLogo = '';
            if (seg.legs && seg.legs.length > 0) {
              const leg = seg.legs[0];
              if (leg.carriersData && leg.carriersData.length > 0) {
                segAirline = leg.carriersData[0].name || 'Unknown Airline';
                segLogo = leg.carriersData[0].logo || '';
              }
              if (leg.flightInfo?.flightNumber) {
                segFlightNumber = leg.flightInfo.flightNumber;
              }
            }
            // Segment duration
            let segDuration = 'N/A';
            if (seg.totalTime) {
              const h = Math.floor(seg.totalTime / 3600);
              const m = Math.floor((seg.totalTime % 3600) / 60);
              segDuration = `${h}h ${m}m`;
            }
            return {
              airline: segAirline,
              airlineLogo: segLogo,
              flight_number: segFlightNumber,
              departure: {
                airport: seg.departureAirport?.code || '',
                time: seg.departureTime || '',
                city: seg.departureAirport?.cityName || seg.departureAirport?.city || ''
              },
              arrival: {
                airport: seg.arrivalAirport?.code || '',
                time: seg.arrivalTime || '',
                city: seg.arrivalAirport?.cityName || seg.arrivalAirport?.city || ''
              },
              duration: segDuration
            };
          });

          return {
            airline,
            airlineLogo,
            flight_number: flightNumber,
            departure_time: departureTime,
            arrival_time: arrivalTime,
            departure_airport: departureAirport,
            departure_city: departureCity,
            arrival_airport: arrivalAirport,
            arrival_city: arrivalCity,
            duration,
            price,
            stops,
            booking_url: offer.bookingUrl || '#',
            token: offer.token,
            segments: processedSegments
          };
        }).filter(f => f !== null); // Remove nulls
        console.log('Processed flights:', processedFlights);
        setFlights(processedFlights);
      } else {
        console.log('No flight offers found in response');
        setFlights([]);
        setError('No flights found for the selected criteria.');
      }
    } catch (err) {
      console.error('Error searching flights:', err);
      setError(err.message || 'Failed to search flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHotelCard = (hotel) => {
    console.log('Rendering hotel card with data:', hotel);

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={hotel.photo_url}
          alt={hotel.hotel_name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {hotel.hotel_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {hotel.address}
          </Typography>
          {hotel.description && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {hotel.description}
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`Rating: ${hotel.review_score} (${hotel.review_score_word})`}
              color="primary"
              size="small"
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip
              label={`Price: $${hotel.price}`}
              color="secondary"
              size="small"
              sx={{ mr: 1, mb: 1 }}
            />
            {hotel.star_rating !== 'N/A' && (
              <Chip
                label={`${hotel.star_rating} Stars`}
                color="info"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            )}
            {hotel.review_count > 0 && (
              <Chip
                label={`${hotel.review_count} Reviews`}
                color="success"
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            )}
          </Box>
          {hotel.amenities && hotel.amenities.length > 0 && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Amenities:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {hotel.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    label={amenity}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            href={hotel.url}
            target="_blank"
          >
            Book Now
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderFlightCard = (flight) => {
    // Format the price with commas and currency symbol
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(flight.price);

    // Format the dates to be more readable
    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr || dateTimeStr === 'N/A') return 'N/A';
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Format duration from ISO format (e.g., "PT2H30M" to "2h 30m")
    const formatDuration = (duration) => {
      if (!duration || duration === 'N/A') return 'N/A';
      if (duration.includes('PT')) {
        const hours = duration.match(/(\d+)H/)?.[1] || '0';
        const minutes = duration.match(/(\d+)M/)?.[1] || '0';
        return `${hours}h ${minutes}m`;
      }
      return duration;
    };

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {flight.airline}
            </Typography>
            <Chip
              label={formattedPrice}
              color="primary"
              size="small"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Departure
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formatDateTime(flight.departure_time)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {flight.segments[0]?.departure?.airport} ({flight.segments[0]?.departure?.city})
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', mx: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {formatDuration(flight.duration)}
              </Typography>
              <Box sx={{ 
                width: '100px', 
                height: '2px', 
                bgcolor: 'primary.main',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  top: '-4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  bgcolor: 'primary.main'
                }
              }} />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Arrival
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formatDateTime(flight.arrival_time)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {flight.segments[flight.segments.length - 1]?.arrival?.airport} ({flight.segments[flight.segments.length - 1]?.arrival?.city})
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
              color="secondary"
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              label={`Flight Duration: ${formatDuration(flight.duration)}`}
              color="info"
              size="small"
            />
          </Box>

          {flight.segments.length > 1 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Flight Details:
              </Typography>
              {flight.segments.map((segment, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {segment.airline} {segment.flight_number}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(segment.departure.time)} - {segment.departure.airport}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(segment.arrival.time)} - {segment.arrival.airport}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Duration: {formatDuration(segment.duration)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            href={flight.booking_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Flight
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Travel Options for {destination}
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Hotels" />
          <Tab label="Flights" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 ? (
            // Hotels Tab
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Hotels
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Check-in Date"
                      value={hotelCheckIn}
                      onChange={setHotelCheckIn}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Check-out Date"
                      value={hotelCheckOut}
                      onChange={setHotelCheckOut}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={hotelCheckIn || new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Adults"
                    type="number"
                    value={numAdults}
                    onChange={e => setNumAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Children"
                    type="number"
                    value={numChildren}
                    onChange={e => setNumChildren(Math.max(0, parseInt(e.target.value) || 0))}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Rooms"
                    type="number"
                    value={numRooms}
                    onChange={e => setNumRooms(Math.max(1, parseInt(e.target.value) || 1))}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={handleHotelSearch}
                disabled={loading}
              >
                Search Hotels
              </Button>
            </Box>
          ) : (
            // Flights Tab
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Flights
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo={false}
                    options={fromCityOptions}
                    getOptionLabel={option =>
                      option && typeof option === 'object'
                        ? option.label || option.city_name || ''
                        : ''
                    }
                    inputValue={departureCity}
                    value={selectedFromCity}
                    loading={fromCityLoading}
                    onInputChange={(event, newInputValue, reason) => {
                      console.log('FROM input change:', { newInputValue, reason, event });
                      
                      if (reason === 'input') {
                        console.log('Setting departure city to:', newInputValue);
                        setDepartureCity(newInputValue);
                        // Clear the selected city and ID when user starts typing
                        if (selectedFromCity) {
                          setSelectedFromCity(null);
                          setFromCityId(null);
                          console.log('FROM city selection cleared due to manual input');
                        }
                      } else if (reason === 'clear') {
                        console.log('Clearing FROM city input');
                        setDepartureCity('');
                        setSelectedFromCity(null);
                        setFromCityId(null);
                      }
                    }}
                    onChange={(event, newValue) => {
                      console.log('FROM city selected:', newValue);
                      setSelectedFromCity(newValue);
                      
                      if (newValue && typeof newValue === 'object') {
                        // User selected a city from dropdown
                        setDepartureCity(newValue.label || newValue.city_name || '');
                        setFromCityId(newValue.dest_id);
                        console.log('FROM city ID saved:', newValue.dest_id);
                      } else {
                        // User cleared the selection or typed custom text
                        setDepartureCity('');
                        setFromCityId(null);
                        console.log('FROM city ID cleared');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="From (City)" 
                        fullWidth 
                        placeholder="Enter departure city" 
                        sx={{ mb: 2 }}
                        helperText={getCitySelectionStatus(fromCityId, selectedFromCity, departureCity).message}
                        error={!getCitySelectionStatus(fromCityId, selectedFromCity, departureCity).isValid && departureCity.length > 0}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {fromCityLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.dest_id || option.label || option.city_name}>
                        <Box>
                          <Typography variant="body1">{option.city_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.country_name}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo={false}
                    options={toCityOptions}
                    getOptionLabel={option =>
                      option && typeof option === 'object'
                        ? option.label || option.city_name || ''
                        : ''
                    }
                    inputValue={destinationCity}
                    value={selectedToCity}
                    loading={toCityLoading}
                    onInputChange={(event, newInputValue, reason) => {
                      console.log('TO input change:', { newInputValue, reason, event });
                      
                      if (reason === 'input') {
                        console.log('Setting destination city to:', newInputValue);
                        setDestinationCity(newInputValue);
                        // Clear the selected city and ID when user starts typing
                        if (selectedToCity) {
                          setSelectedToCity(null);
                          setToCityId(null);
                          console.log('TO city selection cleared due to manual input');
                        }
                      } else if (reason === 'clear') {
                        console.log('Clearing TO city input');
                        setDestinationCity('');
                        setSelectedToCity(null);
                        setToCityId(null);
                      }
                    }}
                    onChange={(event, newValue) => {
                      console.log('TO city selected:', newValue);
                      setSelectedToCity(newValue);
                      
                      if (newValue && typeof newValue === 'object') {
                        // User selected a city from dropdown
                        setDestinationCity(newValue.label || newValue.city_name || '');
                        setToCityId(newValue.dest_id);
                        console.log('TO city ID saved:', newValue.dest_id);
                      } else {
                        // User cleared the selection or typed custom text
                        setDestinationCity('');
                        setToCityId(null);
                        console.log('TO city ID cleared');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="To (City)" 
                        fullWidth 
                        placeholder="Enter destination city" 
                        sx={{ mb: 2 }}
                        helperText={getCitySelectionStatus(toCityId, selectedToCity, destinationCity).message}
                        error={!getCitySelectionStatus(toCityId, selectedToCity, destinationCity).isValid && destinationCity.length > 0}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {toCityLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.dest_id || option.label || option.city_name}>
                        <Box>
                          <Typography variant="body1">{option.city_name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.country_name}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Departure Date"
                      value={flightDeparture}
                      onChange={setFlightDeparture}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Return Date"
                      value={flightReturn}
                      onChange={setFlightReturn}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={flightDeparture || new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFlightSearch}
                disabled={loading}
              >
                Search Flights
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {activeTab === 0
            ? hotels.map((hotel, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  {renderHotelCard(hotel)}
                </Grid>
              ))
            : flights.map((flight, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  {renderFlightCard(flight)}
                </Grid>
              ))}
        </Grid>
      )}
    </Container>
  );
}

export default TravelSearch;
