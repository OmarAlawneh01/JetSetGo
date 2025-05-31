import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
} from '@mui/material';
import {
  FlightTakeoff,
  Security,
  Support,
  Speed,
} from '@mui/icons-material';

function About() {
  const features = [
    {
      icon: <FlightTakeoff sx={{ fontSize: 40 }} />,
      title: 'Smart Travel Planning',
      description: 'AI-powered recommendations to help you find the perfect destinations and accommodations.',
    },
    {
      icon: <Support sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you with any travel-related queries.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Fast & Easy',
      description: 'Quick and easy booking process with instant confirmations and updates.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #87CEEB 0%, #1E90FF 100%)',
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            About JetSetGo
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            Your trusted partner in creating unforgettable travel experiences. We combine cutting-edge technology
            with personalized service to make your travel dreams a reality.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#1E90FF',
                    width: 80,
                    height: 80,
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Typography variant="h5" gutterBottom>
            Our Mission
          </Typography>
          <Typography paragraph>
            To make travel planning simple and enjoyable for everyone, helping you discover and book your perfect trip with ease.
          </Typography>
          <Typography variant="h5" gutterBottom>
            Our Vision
          </Typography>
          <Typography>
            To be your go-to platform for all travel needs, making every journey memorable and hassle-free.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default About; 