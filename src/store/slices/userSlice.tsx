import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS } from 'utils/endpoints';
// Define the types for the slice state
interface UserState {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
  isLoggedIn: boolean;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Set the initial state for your slice
const initialState: UserState = {
  user: null,
  isLoggedIn: false,
  token: null,
  status: 'idle',
  error: null,
};

// Define the thunk for the login API call
const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.message);
      }

      // Return the user data and token
      return {
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue('Network error');
    }
  }
);

// Create the slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: { id: string; firstName: string; lastName: string; email: string; role: string }; token: string }>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        // Assert the type of action.payload to string
        state.error = action.payload as string; // Now TypeScript knows it's a string
      });
  },
});

// Export actions and reducer
export const { logout } = userSlice.actions;
export default userSlice.reducer;
export { loginUser }; // Export loginUser for use in your component
