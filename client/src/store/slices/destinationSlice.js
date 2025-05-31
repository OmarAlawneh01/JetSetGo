import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  destinations: [],
  loading: false,
  error: null,
};

const destinationSlice = createSlice({
  name: 'destinations',
  initialState,
  reducers: {
    fetchDestinationsStart: function(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDestinationsSuccess: function(state, action) {
      state.loading = false;
      state.destinations = action.payload;
    },
    fetchDestinationsFailure: function(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addDestination: function(state, action) {
      state.destinations.push(action.payload);
    },
    updateDestination: function(state, action) {
      const index = state.destinations.findIndex(function(dest) {
        return dest.id === action.payload.id;
      });
      if (index !== -1) {
        state.destinations[index] = action.payload;
      }
    },
    deleteDestination: function(state, action) {
      state.destinations = state.destinations.filter(function(dest) {
        return dest.id !== action.payload;
      });
    },
  },
});

export const {
  fetchDestinationsStart,
  fetchDestinationsSuccess,
  fetchDestinationsFailure,
  addDestination,
  updateDestination,
  deleteDestination,
} = destinationSlice.actions;

export default destinationSlice.reducer; 