import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  LocationOn,
  Star,
  AttachMoney,
  WbSunny,
  Cloud,
  Opacity,
  Air,
} from '@mui/icons-material';
import { getPlaceDetails } from '../services/placesService';
import { getCurrentWeather, getForecast } from '../services/weatherService';

const DestinationDetails = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinationDetails = async () => {
      try {
        setLoading(true);
        
        // Get place details from Google Places API
        const placeDetails = await getPlaceDetails(id);
        setDestination(placeDetails);
        
        // Get weather information if we have coordinates
        if (placeDetails.geometry && placeDetails.geometry.location) {
          const { lat, lng } = placeDetails.geometry.location;
          
          // Get current weather
          const currentWeather = await getCurrentWeather(lat, lng);
          setWeather(currentWeather);
          
          // Get 5-day forecast
          const weatherForecast = await getForecast(lat, lng);
          setForecast(weatherForecast);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching destination details:', err);
        setError('Failed to load destination details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchDestinationDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!destination) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>
          Destination not found.
        </Alert>
      </Container>
    );
  }

  // Format weather data
  const formatTemperature = (temp) => `${Math.round(temp)}°C`;
  const formatDate = (dateString) => {
    const date = new Date(dateString * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {destination.name}
        </Typography>
        
        <Grid container spacing={4}>
          {/* Destination Image */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={destination.photos && destination.photos[0] ? 
                  destination.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 }) : 
                  'https://source.unsplash.com/random/800x600/?travel'}
                alt={destination.name}
              />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {destination.formatted_address}
                  </Typography>
                </Box>
                
                {destination.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star sx={{ mr: 1, color: 'gold' }} />
                    <Typography variant="body1">
                      {destination.rating} ({destination.reviews?.length || 0} reviews)
                    </Typography>
                  </Box>
                )}
                
                {destination.price_level && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {'$'.repeat(destination.price_level)} (Price Level)
                    </Typography>
                  </Box>
                )}
                
                {destination.website && (
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    <a href={destination.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Weather Information */}
          <Grid item xs={12} md={6}>
            {weather && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Current Weather
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WbSunny sx={{ fontSize: 40, mr: 2, color: 'orange' }} />
                  <Typography variant="h4">
                    {formatTemperature(weather.main.temp)}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ListItem>
                      <ListItemIcon>
                        <Cloud />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Condition" 
                        secondary={weather.weather[0].description} 
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                      <ListItemIcon>
                        <Opacity />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Humidity" 
                        secondary={`${weather.main.humidity}%`} 
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                      <ListItemIcon>
                        <Air />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Wind" 
                        secondary={`${weather.wind.speed} m/s`} 
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={6}>
                    <ListItem>
                      <ListItemIcon>
                        <WbSunny />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Feels Like" 
                        secondary={formatTemperature(weather.main.feels_like)} 
                      />
                    </ListItem>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            {/* 5-Day Forecast */}
            {forecast && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  5-Day Forecast
                </Typography>
                <Grid container spacing={2}>
                  {forecast.list.filter((item, index) => index % 8 === 0).map((day, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {formatDate(day.dt)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <WbSunny sx={{ mr: 1, color: 'orange' }} />
                            <Typography variant="body1">
                              {formatTemperature(day.main.temp)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {day.weather[0].description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>
        
        {/* Reviews */}
        {destination.reviews && destination.reviews.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Reviews
            </Typography>
            <List>
              {destination.reviews.map((review, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="span">
                            {review.author_name}
                          </Typography>
                          <Box sx={{ ml: 1, display: 'flex' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                sx={{ 
                                  fontSize: 16, 
                                  color: i < review.rating ? 'gold' : 'grey.300' 
                                }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {review.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.time * 1000).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < destination.reviews.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default DestinationDetails; 