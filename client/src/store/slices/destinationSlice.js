import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config';

// Async thunk for fetching destinations from API
export const fetchDestinations = createAsyncThunk(
  'destinations/fetchDestinations',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/flights/searchDestination`, {
        params: { query },
        headers: {
          'x-rapidapi-key': config.BOOKING_API_KEY,
          'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch destinations');
    }
  }
);

// هاد الـ initialState هو الحالة الأولية للـ destinations
const initialState = {
  destinations: [],
  loading: false,
  error: null,
};

// هاد الـ slice بتحكم في حالة الـ destinations
const destinationSlice = createSlice({
  name: 'destinations',
  initialState,
  reducers: {
    clearDestinations: (state) => {
      state.destinations = [];
      state.error = null;
    },
    // هاد الـ action بيضيف destination جديد للـ state
    addDestination: (state, { payload }) => {
      state.destinations.push(payload);
    },
    // هاد الـ action بيحدث destination موجود في الـ state
    updateDestination: (state, { payload }) => {
      const index = state.destinations.findIndex(dest => dest.id === payload.id);
      if (index !== -1) {
        state.destinations[index] = payload;
      }
    },
    // هاد الـ action بيمسح destination من الـ state
    deleteDestination: (state, { payload }) => {
      state.destinations = state.destinations.filter(dest => dest.id !== payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDestinations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDestinations.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Transform the API data to match our frontend needs
        state.destinations = payload.map(dest => ({
          id: dest.dest_id,
          city: dest.cityName,
          country: dest.countryName,
          type: dest.type,
          label: `${dest.cityName}, ${dest.countryName}`
        }));
      })
      .addCase(fetchDestinations.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  }
});

export const { clearDestinations } = destinationSlice.actions;
export default destinationSlice.reducer; 