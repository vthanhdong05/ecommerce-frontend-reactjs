import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// Store configuration
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export actions and types
export * from './slices/authSlice';
