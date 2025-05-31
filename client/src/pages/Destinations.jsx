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
  Fade,
} from '@mui/material';
import TrendingIcon from '@mui/icons-material/TrendingUp';

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
var mockDestinations = [
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

function Destinations() {
  var navigate = useNavigate();
  var [destinations, setDestinations] = useState(mockDestinations);
  var [selectedCategories, setSelectedCategories] = useState([]);
  var [budgetRange, setBudgetRange] = useState([0, 10000]);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState(null);

  function handleCategoryClick(category) {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(function (c) {
        return c !== category;
      }));
    } else {
      setSelectedCategories(selectedCategories.concat(category));
    }
  }

  function handleCardClick(category) {
    handleCategoryClick(category);
  }

  function handleBudgetChange(event, newValue) {
    setBudgetRange(newValue);
  }

  var filteredDestinations = destinations.filter(function (destination) {
    var matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(destination.category);
    var matchesBudget = destination.price >= budgetRange[0] && destination.price <= budgetRange[1];
    return matchesCategory && matchesBudget;
  });

  var categories = [
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

  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

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
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#1E90FF', fontWeight: 'bold' }}>
              How to Find Your Perfect Destination
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" paragraph>
                1. Set your maximum budget using the slider below
              </Typography>
              <Typography variant="body1" paragraph>
                2. Select one or more categories that interest you (e.g., Beach, Mountain, City)
              </Typography>
              <Typography variant="body1" paragraph>
                3. Click "Get Personalized Recommendations" to see destinations that match your preferences
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ color: '#1E90FF', fontWeight: 'bold' }}>
              Budget Range
            </Typography>
            <Box sx={{ px: 2 }}>
              <Slider
                value={budgetRange[1]}
                onChange={(e, newValue) => {
                  setBudgetRange([0, newValue]);
                }}
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
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                backgroundColor: 'rgba(30, 144, 255, 0.1)', 
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body1" sx={{ color: '#1E90FF', fontWeight: 'medium' }}>
                  Maximum Budget: ${budgetRange[1]}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Grid container spacing={2} sx={{ margin: 0, padding: 2 }}>
            {categories.map(function (category) {
              return (
                <Grid item xs={6} sm={4} md={3} key={category.name} sx={{ padding: 1 }}>
                  <Fade in={true}>
                    <Card
                      className='h-100'
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: selectedCategories.includes(category.name)
                          ? '3px solid #1E90FF'
                          : '3px solid transparent',
                        boxShadow: selectedCategories.includes(category.name)
                          ? '0 8px 16px rgba(30, 144, 255, 0.3)'
                          : '0 4px 8px rgba(0,0,0,0.1)',
                        margin: 0,
                        padding: 0,
                        borderRadius: '12px',
                        aspectRatio: '1/1',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.2)',
                        },
                        position: 'relative',
                      }}
                      onClick={function () {
                        handleCardClick(category.name);
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="100%"
                        image={category.image}
                        alt={category.name}
                        sx={{
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
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
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            fontWeight: 'bold',
                            margin: 0,
                            padding: 0,
                            fontSize: '1.5rem',
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                            margin: '8px 0 0 0',
                            padding: 0,
                            fontSize: '1rem',
                            opacity: 0.9,
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
                          onChange={function (e) {
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
                  </Fade>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<TrendingIcon />}
              onClick={function () {
                navigate('/recommendations', {
                  state: {
                    selectedCategories,
                    budgetRange
                  }
                });
              }}
              sx={{
                backgroundColor: 'white',
                color: '#1E90FF',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                padding: '12px 24px',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              Get Personalized Recommendations
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Destinations;