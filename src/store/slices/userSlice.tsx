import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ENDPOINTS } from 'utils/endpoints';
import { User, PaymentDetail } from 'utils/interfaces';

export interface UserState {
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

// Define the expected response type for login
type LoginResponse =
  | {
      user: User;
      token: string;
    }
  | {
      success: boolean;
      message: string;
      twoFA?: {
        userId: string;
        enabled: boolean;
      };
    };

// Type guard to check if the response is a 2FA response
const isTwoFAResponse = (
  response: LoginResponse
): response is { success: boolean; message: string; twoFA?: { userId: string; enabled: boolean } } => {
  return 'success' in response && 'message' in response;
};

export const loginUser = createAsyncThunk(
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
        return thunkAPI.rejectWithValue(data.message || 'Login failed');
      }

      // Store token in localStorage regardless, as it might be needed later
      if ('token' in data && data.token) {
        localStorage.setItem('token', data.token);
      }

      return data as LoginResponse;
    } catch (error) {
      return thunkAPI.rejectWithValue('Network error');
    }
  }
);

// Define payload for updateTwoFA
interface TwoFAPayload {
  enabled: boolean;
  secret?: string;
}

// Define payload for updating user after 2FA
interface UpdateUserPayload {
  user: User;
  token?: string;
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.token = null;
      localStorage.removeItem('token');
      window.location.href = 'https://247activetrading.com';
    },
    addPaymentDetail: (state, action: PayloadAction<PaymentDetail>) => {
      if (state.user) {
        state.user.paymentDetails = [...(state.user.paymentDetails || []), action.payload];
      }
    },
    updateTwoFA: (state, action: PayloadAction<TwoFAPayload>) => {
      if (state.user) {
        state.user.twoFA = {
          enabled: action.payload.enabled,
          secret: action.payload.secret || '',
        };
      }
    },
    updateUserAfter2FA: (state, action: PayloadAction<UpdateUserPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token || state.token; // Use existing token if none provided
      state.isLoggedIn = !!action.payload.user;
      state.status = 'succeeded';
      state.error = null;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token); // Update token in localStorage if provided
      }
    },
    deletePaymentDetail: (state, action: PayloadAction<string>) => {
      if (state.user && state.user.paymentDetails) {
        state.user.paymentDetails = state.user.paymentDetails.filter(
          (detail) => detail._id !== action.payload
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.status = 'succeeded';
        const response = action.payload;

        // Only update user and token in Redux if 2FA is not required
        if (!isTwoFAResponse(response) || response.message !== '2FA required') {
          state.user = 'user' in response ? response.user : null;
          state.token = 'token' in response ? response.token : null;
          state.isLoggedIn = !!state.user;
        }
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, addPaymentDetail, updateTwoFA, updateUserAfter2FA, deletePaymentDetail } =
  userSlice.actions;
export default userSlice.reducer;