import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import axios from 'axios';
import config from '../config';

const Recommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { selectedCategories, budgetRange } = location.state || {};
        
        if (!selectedCategories || !budgetRange) {
          setError('Please select categories and budget first');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to get recommendations');
          setLoading(false);
          return;
        }

        const response = await axios.post(
          `${config.API_BASE_URL}/recommendations/personalized`,
          {
            categories: selectedCategories,
            budget: budgetRange[1]
          },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (!response.data?.recommendations) {
          throw new Error('Invalid response format from server');
        }

        setRecommendations(response.data.recommendations);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.response?.status === 401 
          ? 'Please log in to get recommendations'
          : 'Failed to load recommendations. Please try again.'
        );
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [location.state]);

  const handleDestinationClick = destination => {
    navigate('/travel-search', {
      state: { destination: `${destination.city}, ${destination.country}` }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!recommendations?.length) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>
          No recommendations available. Please try different preferences.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Your Personalized Recommendations
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {recommendations.map((recommendation, index) => {
          if (!recommendation) return null;

          const photoUrl = recommendation.photoUrl || 
            `https://source.unsplash.com/800x600/?${encodeURIComponent(recommendation.city || 'travel')},${encodeURIComponent(recommendation.country || 'destination')}`;
          const city = recommendation.city || 'Unknown City';
          const country = recommendation.country || 'Unknown Country';

          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => handleDestinationClick(recommendation)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={photoUrl}
                  alt={`${city}, ${country}`}
                />
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {city}, {country}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {recommendation.reason || 'No reason provided'}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={`Cost: ${recommendation.cost || 'Not available'}`}
                      color="primary"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={`Best Time: ${recommendation.bestTime || 'Not available'}`}
                      color="secondary"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={e => {
                      e.stopPropagation();
                      handleDestinationClick(recommendation);
                    }}
                  >
                    View Hotels & Flights
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Recommendations;