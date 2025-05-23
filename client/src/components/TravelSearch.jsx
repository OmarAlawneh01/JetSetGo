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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { searchFlights, searchHotels } from '../services/travelService';

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
  
  // Flight search state
  const [flightDeparture, setFlightDeparture] = useState(null);
  const [flightReturn, setFlightReturn] = useState(null);
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    if (location.state?.destination) {
      setDestination(location.state.destination);
    }
  }, [location.state]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleHotelSearch = async () => {
    if (!hotelCheckIn || !hotelCheckOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await searchHotels(
        destination,
        hotelCheckIn.toISOString().split('T')[0],
        hotelCheckOut.toISOString().split('T')[0],
        1
      )();
      
      setHotels(result.result || []);
      setLoading(false);
    } catch (err) {
      console.error('Error searching hotels:', err);
      setError('Failed to search hotels. Please try again.');
      setLoading(false);
    }
  };

  const handleFlightSearch = async () => {
    if (!flightDeparture || !flightReturn) {
      setError('Please select departure and return dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await searchFlights(
        destination,
        destination,
        flightDeparture.toISOString().split('T')[0],
        flightReturn.toISOString().split('T')[0],
        1
      )();
      
      setFlights(result.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error searching flights:', err);
      setError('Failed to search flights. Please try again.');
      setLoading(false);
    }
  };

  const renderHotelCard = (hotel) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={hotel.main_photo_url || 'https://source.unsplash.com/800x600/?hotel'}
        alt={hotel.hotel_name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {hotel.hotel_name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {hotel.address}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Rating: ${hotel.review_score || 'N/A'}`}
            color="primary"
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label={`Price: $${hotel.min_total_price || 'N/A'}`}
            color="secondary"
            size="small"
          />
        </Box>
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

  const renderFlightCard = (flight) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {flight.airline || 'Flight'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body1">
            {flight.departure_time}
          </Typography>
          <Typography variant="body1">
            {flight.arrival_time}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          Duration: {flight.duration}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip
            label={`Price: $${flight.price || 'N/A'}`}
            color="primary"
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          href={flight.booking_url}
          target="_blank"
        >
          Book Flight
        </Button>
      </CardContent>
    </Card>
  );

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