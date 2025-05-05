import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Slider,
  Paper,
  Checkbox,
} from '@mui/material';
import { TrendingUp as TrendingIcon } from '@mui/icons-material';

// Import images
import beachImage from '../images/Beach pic.jpg';
import mountainImage from '../images/mountain pic.jpg';
import cityImage from '../images/city pic.jpg';
import countrysideImage from '../images/Countryside pic.jpg';
import historicalImage from '../images/Historical pic.jpg';
import adventureImage from '../images/Adventure pic.jpg';
import culturalImage from '../images/Cultural pic.jpg';
import modernImage from '../images/tokyo pic.jpg'; // Using Tokyo image for Modern
import islandImage from '../images/Island pic.jpg';
import desertImage from '../images/Desert pic.jpg';
import arcticImage from '../images/Arctic pic.jpg';
import rainforestImage from '../images/Rainforest pic.jpg';

// Mock data for destinations
const mockDestinations = [
  {
    id: 1,
    name: 'Paris',
    city: 'Paris',
    country: 'France',
    description: 'The City of Light',
    price: 1500,
    rating: 4.8,
    category: 'City',
    image: '../images/paris pic.jpg'
  },
  {
    id: 2,
    name: 'Tokyo',
    city: 'Tokyo',
    country: 'Japan',
    description: 'A blend of modern and traditional',
    price: 2000,
    rating: 4.9,
    category: 'Modern',
    image: '../images/tokyo pic.jpg'
  },
  {
    id: 3,
    name: 'New York',
    city: 'New York',
    country: 'USA',
    description: 'The city that never sleeps',
    price: 1800,
    rating: 4.7,
    category: 'City',
    image: '../images/newyork pic.jpg'
  }
];

const Destinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState(mockDestinations);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCardClick = (category) => {
    handleCategoryClick(category);
  };

  const handleBudgetChange = (event, newValue) => {
    setBudgetRange(newValue);
  };

  const filteredDestinations = destinations.filter((destination) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(destination.category);
    const matchesBudget =
      destination.price >= budgetRange[0] && destination.price <= budgetRange[1];
    return matchesCategory && matchesBudget;
  });

  const categories = [
    {
      name: 'Beach',
      image: beachImage,
      description: 'Relax on beautiful beaches around the world'
    },
    {
      name: 'Mountain',
      image: mountainImage,
      description: 'Explore majestic mountain ranges'
    },
    {
      name: 'City',
      image: cityImage,
      description: 'Experience vibrant city life'
    },
    {
      name: 'Countryside',
      image: countrysideImage,
      description: 'Discover peaceful rural landscapes'
    },
    {
      name: 'Historical',
      image: historicalImage,
      description: 'Visit ancient monuments and historical sites'
    },
    {
      name: 'Adventure',
      image: adventureImage,
      description: 'Seek thrilling adventures'
    },
    {
      name: 'Cultural',
      image: culturalImage,
      description: 'Immerse in local traditions and arts'
    },
    {
      name: 'Modern',
      image: modernImage,
      description: 'Explore contemporary architecture and design'
    },
    {
      name: 'Island',
      image: islandImage,
      description: 'Discover tropical island paradises'
    },
    {
      name: 'Desert',
      image: desertImage,
      description: 'Experience vast desert landscapes'
    },
    {
      name: 'Arctic',
      image: arcticImage,
      description: 'Witness the beauty of polar regions'
    },
    {
      name: 'Rainforest',
      image: rainforestImage,
      description: 'Explore lush rainforest ecosystems'
    }
  ];

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #87CEEB 0%, #1E90FF 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ py: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              color: 'white',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              mb: 4,
            }}
          >
            Explore Destinations
          </Typography>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#1E90FF' }}>
              Budget Range
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={budgetRange}
                onChange={handleBudgetChange}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={100}
                marks={[
                  { value: 0, label: '$0' },
                  { value: 5000, label: '$5000' },
                  { value: 10000, label: '$10000' },
                ]}
                sx={{
                  color: '#1E90FF',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#1E90FF',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#1E90FF',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: '#e0e0e0',
                  },
                  '& .MuiSlider-mark': {
                    backgroundColor: '#1E90FF',
                  },
                  '& .MuiSlider-markLabel': {
                    color: '#1E90FF',
                  },
                  '& .MuiSlider-valueLabel': {
                    backgroundColor: '#1E90FF',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Min: ${budgetRange[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max: ${budgetRange[1]}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={4}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.name}>
                <Card
                  onClick={() => handleCardClick(category.name)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedCategories.includes(category.name) 
                      ? '3px solid #1E90FF' 
                      : '3px solid transparent',
                    boxShadow: selectedCategories.includes(category.name)
                      ? '0 8px 16px rgba(30, 144, 255, 0.3)'
                      : '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="280"
                    image={category.image}
                    alt={category.name}
                    sx={{
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        color: 'white',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        mb: 1,
                        fontWeight: 'bold',
                      }}
                    >
                      {category.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'white',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        fontSize: '1rem',
                      }}
                    >
                      {category.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1,
                    }}
                  >
                    <Checkbox
                      checked={selectedCategories.includes(category.name)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCategoryClick(category.name);
                      }}
                      sx={{
                        color: 'white',
                        '&.Mui-checked': {
                          color: '#1E90FF',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        width: 40,
                        height: 40,
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<TrendingIcon />}
              onClick={() => navigate('/recommendations')}
              sx={{
                backgroundColor: 'white',
                color: '#1E90FF',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
                px: 4,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              Get Personalized Recommendations
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Destinations; 