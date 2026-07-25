import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { User } from '../../types/auth.types';
import type { RoleOption } from '../../types/admin.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetUsersParams {
  page?: number;
  itemPerPage?: number;
  email?: string;
  roleType?: 'USER' | 'VENDOR' | 'SYSTEM' | 'SUPER_ADMIN';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  fullAddress?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  fullAddress?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  password?: string;
}

export const getUsers = async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 20;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<User>>>('/users', {
    params: {
      page,
      itemPerPage,
      ...(params?.email && { email: params.email }),
      ...(params?.roleType && { roleType: params.roleType }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    },
  });
  return unwrapList<User>(response.data, page, itemPerPage);
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await axiosClient.get<ApiResponse<User>>(`/users/${id}`);
  if (!response.data.data) throw new Error('User not found');
  return response.data.data;
};

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await axiosClient.post<ApiResponse<User>>('/users', data);
  if (!response.data.data) throw new Error(response.data.message || 'Create failed');
  return response.data.data;
};

export const updateUser = async (id: string, data: UpdateUserRequest): Promise<User> => {
  const response = await axiosClient.patch<ApiResponse<User>>(`/users/${id}`, data);
  if (!response.data.data) throw new Error(response.data.message || 'Update failed');
  return response.data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`/users/${id}`);
};

export const getUserOptions = async (): Promise<RoleOption[]> => {
  const response = await axiosClient.get<ApiResponse<RoleOption[]>>('/users/options');
  return response.data.data ?? [];
};

/**
 * Export users as an .xlsx file. Backend streams binary via ExcelResponseInterceptor.
 * Returns a Blob so the caller can trigger download.
 */
export const exportUsers = async (): Promise<Blob> => {
  const response = await axiosClient.get('/users/export', {
    responseType: 'blob',
  });
  return response.data as Blob;
};

/**
 * Import users from an .xlsx file (multipart/form-data, field name "file").
 * Backend reads the worksheet, hashes passwords, bulk-inserts via createMany.
 */
export const importUsers = async (file: File): Promise<ApiResponse<unknown>> => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosClient.post<ApiResponse<unknown>>('/users/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
