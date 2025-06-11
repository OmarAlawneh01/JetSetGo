import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
      {children}
    </Container>
  </Box>
);

export default Layout; 