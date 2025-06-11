import { createSlice } from '@reduxjs/toolkit';

// هاد الـ initialState هو الحالة الأولية للـ recommendations
const initialState = {
  personalizedRecommendations: [],
  seasonalRecommendations: [],
  budgetRecommendations: [],
  loading: false,
  error: null,
};

// هاد الـ slice بتحكم في حالة الـ recommendations
const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    // هاد الـ action ببدأ عملية جلب الـ recommendations
    fetchRecommendationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    // هاد الـ action بيحط الـ personalized recommendations في الـ state
    fetchPersonalizedRecommendationsSuccess: (state, { payload }) => {
      state.loading = false;
      state.personalizedRecommendations = payload;
    },
    // هاد الـ action بيحط الـ seasonal recommendations في الـ state
    fetchSeasonalRecommendationsSuccess: (state, { payload }) => {
      state.loading = false;
      state.seasonalRecommendations = payload;
    },
    // هاد الـ action بيحط الـ budget recommendations في الـ state
    fetchBudgetRecommendationsSuccess: (state, { payload }) => {
      state.loading = false;
      state.budgetRecommendations = payload;
    },
    // هاد الـ action بيحط الـ error في الـ state
    fetchRecommendationsFailure: (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    },
    // هاد الـ action بيمسح كل الـ recommendations من الـ state
    clearRecommendations: (state) => {
      Object.assign(state, {
        ...initialState,
        loading: state.loading,
        error: state.error
      });
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