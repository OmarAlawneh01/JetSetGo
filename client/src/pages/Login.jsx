import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { login } from '../store/slices/authSlice';

function Login() {
  var navigate = useNavigate();
  var dispatch = useDispatch();
  var [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  var [error, setError] = useState('');

  function handleChange(event) {
    var name = event.target.name;
    var value = event.target.value;

    setFormData(
      Object.assign({}, formData, {
        [name]: value,
      })
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      var resultAction = await dispatch(login(formData));
      if (login.fulfilled.match(resultAction)) {
        navigate('/');
      } else if (login.rejected.match(resultAction)) {
        setError(resultAction.payload || 'An error occurred during login');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Login to JetSetGo
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;