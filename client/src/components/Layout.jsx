import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

function Layout(props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {props.children}
      </Container>
    </Box>
  );
}

export default Layout; 