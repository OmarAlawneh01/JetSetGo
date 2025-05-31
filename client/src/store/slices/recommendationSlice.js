import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  personalizedRecommendations: [],
  seasonalRecommendations: [],
  budgetRecommendations: [],
  loading: false,
  error: null,
};

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    fetchRecommendationsStart: function(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPersonalizedRecommendationsSuccess: function(state, action) {
      state.loading = false;
      state.personalizedRecommendations = action.payload;
    },
    fetchSeasonalRecommendationsSuccess: function(state, action) {
      state.loading = false;
      state.seasonalRecommendations = action.payload;
    },
    fetchBudgetRecommendationsSuccess: function(state, action) {
      state.loading = false;
      state.budgetRecommendations = action.payload;
    },
    fetchRecommendationsFailure: function(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearRecommendations: function(state) {
      state.personalizedRecommendations = [];
      state.seasonalRecommendations = [];
      state.budgetRecommendations = [];
    },
  },
});

export const {
  fetchRecommendationsStart,
  fetchPersonalizedRecommendationsSuccess,
  fetchSeasonalRecommendationsSuccess,
  fetchBudgetRecommendationsSuccess,
  fetchRecommendationsFailure,
  clearRecommendations,
} = recommendationSlice.actions;

export default recommendationSlice.reducer; 