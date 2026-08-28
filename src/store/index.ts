import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import groupReducer from './groupSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    group: groupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
