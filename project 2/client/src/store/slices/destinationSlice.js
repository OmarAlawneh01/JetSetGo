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
    fetchDestinationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDestinationsSuccess: (state, action) => {
      state.loading = false;
      state.destinations = action.payload;
    },
    fetchDestinationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addDestination: (state, action) => {
      state.destinations.push(action.payload);
    },
    updateDestination: (state, action) => {
      const index = state.destinations.findIndex(dest => dest.id === action.payload.id);
      if (index !== -1) {
        state.destinations[index] = action.payload;
      }
    },
    deleteDestination: (state, action) => {
      state.destinations = state.destinations.filter(dest => dest.id !== action.payload);
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