import { axiosClient } from './index';
import type { ApiResponse } from '../types/api.types';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshTokenResponse,
} from '../types/auth.types';

// Sign in
export const signIn = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await axiosClient.post<ApiResponse<LoginResponse>>('/auth/sign-in', data);
  return response.data;
};

// Sign up
export const signUp = async (data: RegisterRequest): Promise<ApiResponse<User>> => {
  const response = await axiosClient.post<ApiResponse<User>>('/auth/sign-up', data);
  return response.data;
};

// Sign out
export const signOut = async (): Promise<ApiResponse<null>> => {
  const response = await axiosClient.post<ApiResponse<null>>('/auth/logout');
  return response.data;
};

// Refresh token
export const refreshToken = async (): Promise<ApiResponse<RefreshTokenResponse>> => {
  const response = await axiosClient.post<ApiResponse<RefreshTokenResponse>>(
    '/auth/refresh-token',
    {},
    { withCredentials: true }
  );
  return response.data;
};

// Forgot password
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ApiResponse<null>> => {
  const response = await axiosClient.post<ApiResponse<null>>('/auth/forgot-password', data);
  return response.data;
};

// Reset password
export const resetPassword = async (data: ResetPasswordRequest): Promise<ApiResponse<null>> => {
  const response = await axiosClient.post<ApiResponse<null>>('/auth/reset-password', data);
  return response.data;
};

// Get profile
export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await axiosClient.get<ApiResponse<User>>('/profile');
  return response.data;
};
