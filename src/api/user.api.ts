import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/auth.types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  fullAddress?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  avatar?: string;
  password?: string;
}

// Lấy thông tin profile user hiện tại
export const getProfile = async (): Promise<User> => {
  const response = await axiosClient.get<ApiResponse<User>>('/profile');
  return response.data.data!;
};

// Cập nhật thông tin profile
export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  const response = await axiosClient.patch<ApiResponse<User>>('/profile', data);
  return response.data.data!;
};
