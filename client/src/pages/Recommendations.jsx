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

function Recommendations() {
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
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setRecommendations(response.data.recommendations);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        if (err.response?.status === 401) {
          setError('Please log in to get recommendations');
        } else {
          setError('Failed to load recommendations. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [location.state]);

  const handleDestinationClick = (destination) => {
    navigate('/travel-search', {
      state: {
        destination: `${destination.city}, ${destination.country}`
      }
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
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
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
        {recommendations.map((recommendation, index) => (
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
                image={recommendation.photoUrl || `https://source.unsplash.com/800x600/?${recommendation.city},${recommendation.country}`}
                alt={`${recommendation.city}, ${recommendation.country}`}
              />
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {recommendation.city}, {recommendation.country}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {recommendation.reason}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`Cost: ${recommendation.cost}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={`Best Time: ${recommendation.bestTime}`}
                    color="secondary"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                  Key Highlights:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {recommendation.highlights}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Local Culture:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {recommendation.culture}
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDestinationClick(recommendation);
                  }}
                >
                  View Hotels & Flights
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Recommendations;