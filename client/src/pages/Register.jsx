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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { login } from '../store/slices/authSlice';
import axios from 'axios';
import config from '../config';

// هاد الـ array بيعرف خطوات التسجيل
const steps = ['Account Information', 'Review'];

// هاد الـ component بيعمل صفحة التسجيل
const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // هاد الـ state variables بتخزن معلومات المستخدم
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  // هاد الـ function بتغير قيم الـ form
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // هاد الـ functions بتتحكم في خطوات التسجيل
  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  // هاد الـ function بتعمل عملية التسجيل
  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/register`, formData);
      if (response.data) {
        const resultAction = await dispatch(login({
          email: formData.email,
          password: formData.password
        }));
        if (login.fulfilled.match(resultAction)) {
          navigate('/');
        } else if (login.rejected.match(resultAction)) {
          setError(resultAction.payload || 'Registration successful but login failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    }
  };

  // هاد الـ function بتعرض محتوى كل خطوة
  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Typography>Username: {formData.username}</Typography>
            <Typography>Email: {formData.email}</Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography component="h1" variant="h5">
            Create your JetSetGo account
          </Typography>

          <Stepper activeStep={activeStep} sx={{ width: '100%', mt: 4 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button type="submit" variant="contained">
                    Create Account
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 