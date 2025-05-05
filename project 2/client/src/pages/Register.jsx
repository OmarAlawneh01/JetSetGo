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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { login } from '../store/slices/authSlice';
import axios from 'axios';
import config from '../config';

const steps = ['Account Information', 'Travel Preferences', 'Review'];

const travelStyles = [
  'Adventure',
  'Relaxation',
  'Cultural',
  'Luxury',
  'Budget',
  'Family',
  'Solo',
  'Romantic',
];

const interests = [
  'Beaches',
  'Mountains',
  'Cities',
  'History',
  'Food',
  'Nature',
  'Shopping',
  'Nightlife',
  'Museums',
  'Sports',
];

const dietaryRestrictions = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'None',
];

const accessibilityOptions = [
  'Wheelchair Accessible',
  'Limited Mobility',
  'Visual Impairment',
  'Hearing Impairment',
  'None',
];

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    travelStyle: [],
    budget: {
      min: 0,
      max: 10000,
    },
    interests: [],
    dietaryRestrictions: [],
    accessibility: [],
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/register`, formData);
      if (response.data) {
        // After successful registration, log the user in
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

  const getStepContent = (step) => {
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
            <FormControl fullWidth margin="normal">
              <InputLabel>Travel Style</InputLabel>
              <Select
                multiple
                value={formData.travelStyle}
                onChange={handleSelectChange}
                name="travelStyle"
                input={<OutlinedInput label="Travel Style" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {travelStyles.map((style) => (
                  <MenuItem key={style} value={style}>
                    {style}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Interests</InputLabel>
              <Select
                multiple
                value={formData.interests}
                onChange={handleSelectChange}
                name="interests"
                input={<OutlinedInput label="Interests" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {interests.map((interest) => (
                  <MenuItem key={interest} value={interest}>
                    {interest}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Dietary Restrictions</InputLabel>
              <Select
                multiple
                value={formData.dietaryRestrictions}
                onChange={handleSelectChange}
                name="dietaryRestrictions"
                input={<OutlinedInput label="Dietary Restrictions" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {dietaryRestrictions.map((restriction) => (
                  <MenuItem key={restriction} value={restriction}>
                    {restriction}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Accessibility Requirements</InputLabel>
              <Select
                multiple
                value={formData.accessibility}
                onChange={handleSelectChange}
                name="accessibility"
                input={<OutlinedInput label="Accessibility Requirements" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {accessibilityOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Typography>Username: {formData.username}</Typography>
            <Typography>Email: {formData.email}</Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Travel Preferences
            </Typography>
            <Typography>Travel Style: {formData.travelStyle.join(', ')}</Typography>
            <Typography>Interests: {formData.interests.join(', ')}</Typography>
            <Typography>
              Dietary Restrictions: {formData.dietaryRestrictions.join(', ')}
            </Typography>
            <Typography>
              Accessibility Requirements: {formData.accessibility.join(', ')}
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Create your JetSetGo account
          </Typography>

          <Stepper activeStep={activeStep} sx={{ width: '100%', mt: 4 }}>
            {steps.map((label) => (
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
                  <Button
                    type="submit"
                    variant="contained"
                  >
                    Create Account
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
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
}

export default Register; 