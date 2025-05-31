import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
} from '@mui/material';
import {
  Email,
  Phone,
} from '@mui/icons-material';

function Contact() {
  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 40 }} />,
      title: 'Email',
      details: [
        'omaralawneh01@gmail.com',
        'mohhal111222@gmail.com',
        'harounselawi12@gmail.com'
      ],
    },
    {
      icon: <Phone sx={{ fontSize: 40 }} />,
      title: 'Phone',
      details: ['0792545136'],
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
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            color: 'white',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            mb: 6,
          }}
        >
          Contact Us
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ color: '#1E90FF', mb: 3 }}>
            Get in Touch
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Have questions or need assistance? We're here to help! Feel free to reach out to us.
          </Typography>
          
          {contactInfo.map((info, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ color: '#1E90FF', mr: 2 }}>{info.icon}</Box>
                <Typography variant="h6" sx={{ color: '#1E90FF' }}>
                  {info.title}
                </Typography>
              </Box>
              {info.details.map((detail, detailIndex) => (
                <Typography
                  key={detailIndex}
                  variant="body1"
                  sx={{
                    ml: 7,
                    mb: 1,
                    color: '#333',
                    '&:hover': {
                      color: '#1E90FF',
                      cursor: 'pointer',
                    },
                  }}
                >
                  {detail}
                </Typography>
              ))}
            </Box>
          ))}
        </Paper>
      </Container>
    </Box>
  );
}

export default Contact; 