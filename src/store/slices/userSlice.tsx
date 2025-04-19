import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS } from 'utils/endpoints';
import { User, PaymentDetail } from 'utils/interfaces';

export interface UserState {  // Exported UserState type
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoggedIn: false,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.message);
      }

      localStorage.setItem('token', data.token);

      return {
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue('Network error');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.token = null;
      localStorage.removeItem('token');
    },
    addPaymentDetail: (state, action: PayloadAction<PaymentDetail>) => {
      if (state.user) {
        state.user.paymentDetails = [...(state.user.paymentDetails || []), action.payload];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User | null; token: string }>) => {
          state.status = 'succeeded';
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isLoggedIn = !!action.payload.user;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, addPaymentDetail } = userSlice.actions;
export default userSlice.reducer;
export { loginUser };
