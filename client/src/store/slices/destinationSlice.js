import { createSlice } from '@reduxjs/toolkit';

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
    // هاد الـ action ببدأ عملية جلب الـ destinations
    fetchDestinationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // هاد الـ action بيحط الـ destinations في الـ state
    fetchDestinationsSuccess: (state, { payload }) => {
      state.loading = false;
      state.destinations = payload;
    },
    // هاد الـ action بيحط الـ error في الـ state
    fetchDestinationsFailure: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
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