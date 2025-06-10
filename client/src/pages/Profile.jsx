import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { updateUserPreferences, updateUser } from '../store/slices/authSlice';
import * as apiService from '../services/apiService';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(state => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    travelPreferences: {
      interests: [],
      budget: { min: 0, max: 10000 },
      travelStyle: [],
      dietaryRestrictions: [],
      accessibility: [],
    },
  });
  
  const [newInterest, setNewInterest] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        travelPreferences: {
          interests: user.preferences?.interests || [],
          budget: user.preferences?.budget || { min: 0, max: 10000 },
          travelStyle: user.preferences?.travelStyle || [],
          dietaryRestrictions: user.preferences?.dietaryRestrictions || [],
          accessibility: user.preferences?.accessibility || [],
        },
      });
    }
  }, [user]);
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      travelPreferences: { ...prev.travelPreferences, [field]: value },
    }));
  };
  
  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.travelPreferences.interests.includes(newInterest.trim())) {
      handlePreferenceChange('interests', [...formData.travelPreferences.interests, newInterest.trim()]);
      setNewInterest('');
    }
  };
  
  const handleRemoveInterest = interest => {
    handlePreferenceChange(
      'interests',
      formData.travelPreferences.interests.filter(i => i !== interest)
    );
  };
  
  const handleSave = async () => {
    try {
      const response = await apiService.updateUser(formData);
      dispatch(updateUser(response.data.user));
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };
  
  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        travelPreferences: {
          interests: user.preferences?.interests || [],
          budget: user.preferences?.budget || { min: 0, max: 10000 },
          travelStyle: user.preferences?.travelStyle || [],
          dietaryRestrictions: user.preferences?.dietaryRestrictions || [],
          accessibility: user.preferences?.accessibility || [],
        },
      });
    }
    setIsEditing(false);
  };
  
  const handleViewTripDetails = trip => {
    setSelectedTrip(trip);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTrip(null);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">Please log in to view your profile.</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">My Profile</Typography>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                src={user.avatar}
              />
              <Typography variant="h6">{user.username}</Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Travel Preferences</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Interests</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.travelPreferences.interests.map(interest => (
                <Chip
                  key={interest}
                  label={interest}
                  onDelete={isEditing ? () => handleRemoveInterest(interest) : undefined}
                />
              ))}
            </Box>
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  placeholder="Add new interest"
                  onKeyPress={e => e.key === 'Enter' && handleAddInterest()}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddInterest}
                >
                  Add
                </Button>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Budget Range</Typography>
            <Box sx={{ px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ${formData.travelPreferences.budget.min} - ${formData.travelPreferences.budget.max}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Travel Style</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.travelPreferences.travelStyle.map(style => (
                <Chip
                  key={style}
                  label={style}
                  onDelete={isEditing ? () => handleRemoveInterest(style) : undefined}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>My Trips</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <List>
          {user.trips?.length ? (
            user.trips.map(trip => (
              <ListItem
                key={trip.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleViewTripDetails(trip)}>
                    <EditIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar src={trip.destination?.image} />
                </ListItemAvatar>
                <ListItemText
                  primary={trip.destination?.name}
                  secondary={`${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No trips planned yet.
            </Typography>
          )}
        </List>
      </Paper>
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Trip Details</DialogTitle>
        <DialogContent>
          {selectedTrip && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6">{selectedTrip.destination?.name}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedTrip.destination?.city}, {selectedTrip.destination?.country}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Start Date</Typography>
                  <Typography variant="body2">
                    {new Date(selectedTrip.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">End Date</Typography>
                  <Typography variant="body2">
                    {new Date(selectedTrip.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <Typography variant="body2">
                    {selectedTrip.notes || 'No notes available'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 
//its the fileeeeeeeeeeeeeeeeeeeee