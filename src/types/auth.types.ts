// Role types from JWT payload
export type RoleType = 'SUPER_ADMIN' | 'SYSTEM' | 'VENDOR' | null;

// User type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullAddress?: string;
  phone?: string;
  roleType: RoleType;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response - backend chỉ trả tokens, user phải gọi /profile riêng
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// Register request
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  fullAddress?: string;
  phone?: string;
}

// Forgot password request
export interface ForgotPasswordRequest {
  email?: string;
  phone?: string;
  redirectTo: string;
}

// Reset password request
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// Refresh token response
export interface RefreshTokenResponse {
  accessToken: string;
}

// Auth state for Redux
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  roleType: RoleType;
  isLoading: boolean;
  error: string | null;
}
