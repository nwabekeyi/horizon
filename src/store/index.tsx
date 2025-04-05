import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice'; // Import your slice reducers

// Define your Redux store
const store = configureStore({
  reducer: {
    user: userReducer, // Add your slices here
  },
});

// Export the store so it can be accessed in other parts of the app
export default store;

// Type for useDispatch and other Redux hooks
export type AppDispatch = typeof store.dispatch;

// Type for the RootState (global state)
export type RootState = ReturnType<typeof store.getState>;
