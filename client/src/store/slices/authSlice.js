import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/apiService';

// Get token from localStorage
const token = localStorage.getItem('token');

const initialState = {
  user: null,
  token: token || null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

// Add new async thunk to fetch user data
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async function(_, { rejectWithValue }) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await apiService.getCurrentUser();
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async function(credentials, { rejectWithValue }) {
    try {
      const response = await apiService.login(credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: function(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    updateUserPreferences: function(state, action) {
      if (state.user) {
        state.user.preferences = action.payload;
      }
    },
    updateUser: function(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: function(builder) {
    builder
      .addCase(login.pending, function(state) {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, function(state, action) {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, function(state, action) {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserData.pending, function(state) {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, function(state, action) {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchUserData.rejected, function(state, action) {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      });
  },
});

export const {
  logout,
  updateUserPreferences,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer; 