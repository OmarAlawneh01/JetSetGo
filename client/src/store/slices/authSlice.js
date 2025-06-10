import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as apiService from '../../services/apiService';

// Get initial token from localStorage
const token = localStorage.getItem('token');

// Add token validation function
const validateToken = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Update initial state with token validation
const initialState = {
  user: null,
  token: validateToken(token) ? token : null,
  isAuthenticated: validateToken(token),
  loading: false,
  error: null,
};

// هاد الـ function بتتعامل مع الـ errors
const handleAsyncError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  return error.response?.data?.message || defaultMessage;
};

// Fetch user data thunk
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiService.getCurrentUser();
      return data;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(handleAsyncError(error, 'Failed to fetch user data'));
    }
  }
);

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await apiService.login(credentials);
      return data;
    } catch (error) {
      return rejectWithValue(handleAsyncError(error, 'Login failed'));
    }
  }
);

// هاد الـ slice بتحكم في حالة الـ auth
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // هاد الـ action بعمل logout للمستخدم
    logout: (state) => {
      Object.assign(state, {
        ...initialState,
        token: null,
        isAuthenticated: false
      });
      localStorage.removeItem('token');
    },
    // هاد الـ action بيحدث preferences المستخدم
    updateUserPreferences: (state, { payload }) => {
      if (state.user) {
        state.user.preferences = payload;
      }
    },
    // هاد الـ action بيحدث معلومات المستخدم
    updateUser: (state, { payload }) => {
      state.user = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = payload.user;
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Fetch user data cases
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = payload;
        state.token = localStorage.getItem('token');
      })
      .addCase(fetchUserData.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
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