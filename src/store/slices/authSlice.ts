import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getProfile, signIn, signOut, signUp } from '../../api/auth.api';
import { clearTokens, setAccessToken, getAccessToken } from '../../api/axiosClient';
import type { AuthState, RoleType, User, RegisterRequest } from '../../types/auth.types';
import type { JwtPayload } from '../../types/jwt.types';
import { decodeJwt } from '../../utils/jwt';

// Khởi tạo state từ localStorage (restore session)
const savedToken = getAccessToken();
const initialJwt = savedToken ? decodeJwt(savedToken) : null;

const initialState: AuthState = {
  isAuthenticated: savedToken ? true : false,
  accessToken: savedToken,
  user: null,
  roleType: initialJwt?.roleType ?? null,
  permissions: initialJwt?.permissions ?? [],
  isBootstrapping: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await signIn(credentials);
      if (response.errors && response.errors.length > 0) {
        return rejectWithValue(response.errors[0]);
      }
      if (response.data) {
        // Lưu accessToken vào localStorage (also emits sessionBus → permissions sync)
        setAccessToken(response.data.accessToken);
        // Gọi /profile để lấy thông tin user (backend không trả user trong login)
        const profileResult = await dispatch(fetchProfile());
        if (fetchProfile.fulfilled.match(profileResult)) {
          return { tokens: response.data, user: profileResult.payload };
        }
        // Nếu không lấy được profile, vẫn login thành công
        return { tokens: response.data, user: null };
      }
      return rejectWithValue(response.message || 'Đăng nhập thất bại');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await signUp(data);
      if (response.errors && response.errors.length > 0) {
        return rejectWithValue(response.errors[0]);
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await signOut();
    clearTokens();
    return null;
  } catch {
    clearTokens();
    return rejectWithValue('Đăng xuất thất bại');
  }
});

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfile();
      if (response.errors && response.errors.length > 0) {
        return rejectWithValue(response.errors[0]);
      }
      if (response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Không thể lấy thông tin profile');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Không thể lấy thông tin profile');
    }
  }
);

/**
 * Sync Redux permissions/roleType from a decoded JWT.
 * Called from sessionBus whenever axiosClient sets/clears the access token.
 */
function applyJwtToState(state: AuthState, payload: JwtPayload | null): void {
  if (payload) {
    state.roleType = payload.roleType;
    state.permissions = payload.permissions;
  } else {
    state.roleType = null;
    state.permissions = [];
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Keep roleType from JWT as source of truth; only override if user.roleType set
      state.roleType = action.payload.roleType ?? state.roleType;
      state.isAuthenticated = true;
    },
    setRoleType: (state, action: PayloadAction<RoleType>) => {
      state.roleType = action.payload;
    },
    /**
     * Sync from decoded JWT (driven by sessionBus in useAuthInit).
     */
    setSessionFromJwt: (state, action: PayloadAction<JwtPayload | null>) => {
      applyJwtToState(state, action.payload);
      if (action.payload) {
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
      }
    },
    setBootstrapping: (state, action: PayloadAction<boolean>) => {
      state.isBootstrapping = action.payload;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      state.roleType = null;
      state.permissions = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        const { tokens, user } = action.payload;
        state.accessToken = tokens.accessToken;
        state.user = user;
        // Sync permissions/roleType from the new token (already in localStorage)
        const jwt = decodeJwt(tokens.accessToken);
        applyJwtToState(state, jwt);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
        state.roleType = null;
        state.permissions = [];
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
        state.roleType = null;
        state.permissions = [];
      });

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        // roleType from JWT takes precedence (backend /profile doesn't return roleType)
        if (!state.roleType) {
          state.roleType = action.payload.roleType ?? null;
        }
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setRoleType, setSessionFromJwt, setBootstrapping, clearAuth, clearError } =
  authSlice.actions;
export default authSlice.reducer;
