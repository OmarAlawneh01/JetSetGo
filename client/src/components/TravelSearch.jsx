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
import { searchFlights, searchHotels } from '../services/travelService';
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
      
      console.log('Hotel search API response:', result); // Log the full response
      
      if (result.data && result.data.hotels) {
        console.log('First hotel data:', result.data.hotels[0]); // Log the first hotel's data
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

  const handleFlightSearch = async () => {
    const fromCity = selectedFromCity?.city_name || departureCity;
    const toCity = selectedToCity?.city_name || destinationCity;
    if (!fromCity || !toCity) {
      setError('Please enter both departure and destination cities');
      return;
    }
    if (!flightDeparture || !flightReturn) {
      setError('Please select departure and return dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await searchFlights(
        fromCity,
        toCity,
        flightDeparture.toISOString().split('T')[0],
        flightReturn.toISOString().split('T')[0],
        1
      )();
      
      console.log('Flight search result:', result); // Debug log
      
      if (result && result.data && result.data.itineraries) {
        setFlights(result.data.itineraries);
      } else if (result && result.data && result.data.flights) {
        setFlights(result.data.flights);
      } else {
        setFlights([]);
        setError('No flights found for the selected criteria.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error searching flights:', err);
      setError('Failed to search flights. Please try again.');
      setLoading(false);
    }
  };

  // Fetch city suggestions for 'From (City)'
  useEffect(() => {
    if (!debouncedDepartureCity || debouncedDepartureCity.length < 2) {
      setFromCityOptions([]);
      return;
    }
    setFromCityLoading(true);
    axios.get('https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination', {
      params: { query: debouncedDepartureCity },
      headers: {
        'x-rapidapi-key': config.BOOKING_API_KEY,
        'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
      },
    })
      .then(res => {
        console.log('API response for city autocomplete:', res.data);
        const options = (res.data?.data || []).filter(item => item.type === 'city' && item.city_name).map(item => item);
        setFromCityOptions(options);
      })
      .catch(() => setFromCityOptions([]))
      .finally(() => setFromCityLoading(false));
  }, [debouncedDepartureCity]);

  // Fetch city suggestions for 'To (City)'
  useEffect(() => {
    if (!debouncedDestinationCity || debouncedDestinationCity.length < 2) {
      setToCityOptions([]);
      return;
    }
    setToCityLoading(true);
    axios.get('https://booking-com15.p.rapidapi.com/api/v1/flights/searchDestination', {
      params: { query: debouncedDestinationCity },
      headers: {
        'x-rapidapi-key': config.BOOKING_API_KEY,
        'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
      },
    })
      .then(res => {
        console.log('API response for city autocomplete:', res.data);
        const options = (res.data?.data || []).filter(item => item.type === 'city' && item.city_name).map(item => item);
        setToCityOptions(options);
      })
      .catch(() => setToCityOptions([]))
      .finally(() => setToCityLoading(false));
  }, [debouncedDestinationCity]);

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
    // Handle different API response structures
    const airline = flight.airline || flight.carrier?.name || 'Flight';
    const departureTime = flight.departure_time || flight.departure?.time || 'N/A';
    const arrivalTime = flight.arrival_time || flight.arrival?.time || 'N/A';
    const duration = flight.duration || flight.flight_time || 'N/A';
    const price = flight.price?.total_amount || flight.price || 'N/A';
    const bookingUrl = flight.booking_url || flight.url || '#';

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {airline}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                From
              </Typography>
              <Typography variant="body1">
                {departureTime}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                To
              </Typography>
              <Typography variant="body1">
                {arrivalTime}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Duration: {duration}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`Price: $${price}`}
              color="primary"
              size="small"
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            href={bookingUrl}
            target="_blank"
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
                    getOptionLabel={option => option.city_name || ''}
                    inputValue={departureCity}
                    value={selectedFromCity}
                    loading={fromCityLoading}
                    onInputChange={(event, newInputValue) => setDepartureCity(newInputValue)}
                    onChange={(event, newValue) => {
                      setSelectedFromCity(newValue);
                      setDepartureCity(newValue ? newValue.city_name : '');
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="From (City)" fullWidth placeholder="Enter departure city" sx={{ mb: 2 }} />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo={false}
                    options={toCityOptions}
                    getOptionLabel={option => option.city_name || ''}
                    inputValue={destinationCity}
                    value={selectedToCity}
                    loading={toCityLoading}
                    onInputChange={(event, newInputValue) => setDestinationCity(newInputValue)}
                    onChange={(event, newValue) => {
                      setSelectedToCity(newValue);
                      setDestinationCity(newValue ? newValue.city_name : '');
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="To (City)" fullWidth placeholder="Enter destination city" sx={{ mb: 2 }} />
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