import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  Paper,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { FlightTakeoff } from '@mui/icons-material';
import parisImage from '../images/paris pic.jpg';
import tokyoImage from '../images/tokyo pic.jpg';
import newYorkImage from '../images/newyork pic.jpg';

// هاد الـ array بيعرف الوجهات المميزة
const featuredDestinations = [
  {
    id: '1',
    name: 'Paris, France',
    image: parisImage,
    description: 'The City of Light beckons with its iconic landmarks and romantic atmosphere.',
  },
  {
    id: '2',
    name: 'Tokyo, Japan',
    image: tokyoImage,
    description: "Experience the perfect blend of tradition and innovation in Japan's capital.",
  },
  {
    id: '3',
    name: 'New York, USA',
    image: newYorkImage,
    description: 'The city that never sleeps offers endless opportunities for adventure.',
  },
];

// هاد الـ component بيعمل الصفحة الرئيسية
const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  // هاد الـ useEffect بيعمل log للمعلومات عند تحميل الصفحة
  useEffect(() => {
    console.log('Home component mounted');
    console.log('Authentication status:', isAuthenticated);
    console.log('Images loaded:', { parisImage, tokyoImage, newYorkImage });
  }, [isAuthenticated]);

  return (
    <Box>
      {/* هاد القسم بيعرض الصورة الرئيسية */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          position: 'relative',
          backgroundImage: 'url(https://source.unsplash.com/random/1920x1080/?travel)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="white"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Explore the World in your way
          </Typography>
          <Typography variant="h5" align="center" color="white" paragraph>
            Let JetSetGo help you plan the perfect trip with AI-powered recommendations
            tailored to your preferences.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'white',
                transition: 'all 0.3s ease',
                padding: '12px 32px',
                fontSize: '1.1rem',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: '#1E90FF',
                  color: 'white',
                  borderColor: '#1E90FF',
                  boxShadow: '0 8px 16px rgba(30, 144, 255, 0.3)',
                },
              }}
              onClick={() => navigate('/destinations')}
            >
              Explore Destinations
            </Button>
          </Box>
        </Container>
      </Box>

      {/* هاد القسم بيعرض الوجهات المميزة */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          component="h2"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Featured Destinations
        </Typography>
        <Grid container spacing={4}>
          {featuredDestinations.map(destination => (
            <Grid item xs={12} sm={6} md={4} key={destination.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/destinations/${destination.id}`)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={destination.image}
                    alt={destination.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {destination.name}
                    </Typography>
                    <Typography sx={{ mb: 2 }}>{destination.description}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<FlightTakeoff />}
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/travel-search', {
                          state: { destination: destination.name }
                        });
                      }}
                      fullWidth
                    >
                      Search Flights & Hotels
                    </Button>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* هاد القسم بيعرض مميزات التطبيق */}
        <Box sx={{ bgcolor: 'background.paper', py: 8, mt: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                AI-Powered Recommendations
              </Typography>
              <Typography color="text.secondary">
                Get personalized travel suggestions based on your preferences and travel history.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Real-time Information
                </Typography>
                <Typography variant="body1">
                  Access up-to-date information about destinations and travel conditions.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Comprehensive Planning
              </Typography>
              <Typography color="text.secondary">
                Plan your entire trip from accommodations to activities in one place.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;