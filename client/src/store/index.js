import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import destinationReducer from './slices/destinationSlice';
import recommendationReducer from './slices/recommendationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    destinations: destinationReducer,
    recommendations: recommendationReducer,
  },
}); 