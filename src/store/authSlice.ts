import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../api/auth/authApi';
import { saveToken, clearToken } from '../utils/secureStorage';
import { getGoogleIdToken } from '../utils/googleAuth';
import { getFriendlyError } from '../utils/getFriendlyError';
import type { User, MessageResponse } from '../types/auth';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: '',
};

export const checkAuth = createAsyncThunk<User | null, void>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.checkAuth();
      return response.user;
    } catch (error) {
      await clearToken();
      return rejectWithValue(getFriendlyError(error));
    }
  },
);

export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(
      credentials.email,
      credentials.password,
    );
    await saveToken(response.token);
    return response.user;
  } catch (error) {
    return rejectWithValue(getFriendlyError(error));
  }
});

export const registerUser = createAsyncThunk<
  MessageResponse,
  { fullName: string; email: string; password: string }
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await authAPI.register(
      userData.fullName,
      userData.email,
      userData.password,
    );
    return response;
  } catch (error) {
    return rejectWithValue(getFriendlyError(error));
  }
});

export const googleLogin = createAsyncThunk<User, void>(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      const idToken = await getGoogleIdToken();
      const response = await authAPI.googleLogin(idToken);
      await saveToken(response.token);
      return response.user;
    } catch (error) {
      return rejectWithValue(getFriendlyError(error));
    }
  },
);

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      await clearToken();
    } catch (error) {
      return rejectWithValue(getFriendlyError(error));
    }
  },
);

export const verifyEmail = createAsyncThunk<
  MessageResponse,
  { email: string; otp: string }
>('auth/verifyEmail', async (data, { rejectWithValue }) => {
  try {
    const response = await authAPI.verifyEmail(data.email, data.otp);
    return response;
  } catch (error) {
    return rejectWithValue(getFriendlyError(error));
  }
});

export const resendOTP = createAsyncThunk<MessageResponse, string>(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.resendOTP(email);
      return response;
    } catch (error) {
      return rejectWithValue(getFriendlyError(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = '';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(checkAuth.pending, state => {
        state.status = 'loading';
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, state => {
        state.status = 'unauthenticated';
        state.user = null;
      })
      .addCase(loginUser.pending, state => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })
      .addCase(googleLogin.pending, state => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, state => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(registerUser.fulfilled, state => {
        state.status = 'unauthenticated';
        state.error = '';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.status = 'unauthenticated';
        state.user = null;
      })
      .addCase(verifyEmail.pending, state => {
        state.status = 'loading';
        state.error = '';
      })
      .addCase(verifyEmail.fulfilled, state => {
        state.status = 'unauthenticated';
        state.error = '';
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })

      .addCase(resendOTP.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
