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
} from '@mui/icons-material';
import { getPlaceDetails } from '../services/placesService';

const DestinationDetails = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinationDetails = async () => {
      try {
        setLoading(true);
        const placeDetails = await getPlaceDetails(id);
        setDestination(placeDetails);
      } catch (err) {
        console.error('Error fetching destination details:', err);
        setError('Failed to load destination details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDestinationDetails();
  }, [id]);

  if (loading) return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    </Container>
  );

  if (error) return (
    <Container>
      <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
    </Container>
  );

  if (!destination) return (
    <Container>
      <Alert severity="info" sx={{ mt: 4 }}>Destination not found.</Alert>
    </Container>
  );

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {destination.name}
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={destination.photos?.[0]?.getUrl() || `https://source.unsplash.com/800x600/?${encodeURIComponent(destination.name)}`}
                alt={destination.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About {destination.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  {destination.formatted_address}
                </Typography>
                {destination.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Star sx={{ color: 'gold', mr: 1 }} />
                    <Typography variant="body1">
                      {destination.rating} ({destination.user_ratings_total} reviews)
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>Location Details</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><LocationOn /></ListItemIcon>
                  <ListItemText 
                    primary="Address" 
                    secondary={destination.formatted_address} 
                  />
                </ListItem>
                {destination.opening_hours && (
                  <ListItem>
                    <ListItemIcon><AttachMoney /></ListItemIcon>
                    <ListItemText 
                      primary="Opening Hours" 
                      secondary={destination.opening_hours.isOpen() ? 'Open Now' : 'Closed'} 
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DestinationDetails; 