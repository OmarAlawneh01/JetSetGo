import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, CircularProgress, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchRecommendationsStart, 
  fetchPersonalizedRecommendationsSuccess, 
  fetchRecommendationsFailure 
} from '../store/slices/recommendationSlice';
import axios from 'axios';
import config from '../config';

const Recommendations = () => {
  const dispatch = useDispatch();
  const { personalizedRecommendations, loading, error } = useSelector((state) => state.recommendations);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated) {
        setRecommendations([]);
        return;
      }

      try {
        dispatch(fetchRecommendationsStart());
        const response = await axios.get(`${config.API_BASE_URL}/recommendations/personalized`);
        dispatch(fetchPersonalizedRecommendationsSuccess(response.data));
        setRecommendations(response.data);
      } catch (err) {
        dispatch(fetchRecommendationsFailure(err.message || 'Failed to fetch recommendations'));
      }
    };

    fetchRecommendations();
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Travel Recommendations
        </Typography>
        <Alert severity="info">
          Please log in to view personalized travel recommendations.
        </Alert>
      </Container>
    );
  }

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
        <Typography variant="h4" component="h1" gutterBottom>
          Travel Recommendations
        </Typography>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Personalized Travel Recommendations
      </Typography>
      
      {recommendations.length === 0 ? (
        <Alert severity="info">
          No recommendations available yet. Complete your profile to get personalized recommendations.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {recommendations.map((recommendation) => (
            <Grid item xs={12} sm={6} md={4} key={recommendation.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={recommendation.image || 'https://source.unsplash.com/random/300x200/?travel'}
                  alt={recommendation.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {recommendation.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recommendation.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Recommendations; 