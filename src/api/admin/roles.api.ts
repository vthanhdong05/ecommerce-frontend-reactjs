import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Role, RoleOption, SystemRoleType } from '../../types/admin.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetRolesParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  roleType: SystemRoleType;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  roleType?: SystemRoleType;
}

export const getRoles = async (params?: GetRolesParams): Promise<PaginatedResponse<Role>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 20;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<Role>>>('/roles', {
    params: {
      page,
      itemPerPage,
      ...(params?.search && { search: params.search }),
    },
  });
  return unwrapList<Role>(response.data, page, itemPerPage);
};

export const getRoleById = async (id: string): Promise<Role> => {
  const response = await axiosClient.get<ApiResponse<Role>>(`/roles/${id}`);
  if (!response.data.data) throw new Error('Role not found');
  return response.data.data;
};

export const createRole = async (data: CreateRoleRequest): Promise<Role> => {
  const response = await axiosClient.post<ApiResponse<Role>>('/roles', data);
  if (!response.data.data) throw new Error(response.data.message || 'Create failed');
  return response.data.data;
};

export const updateRole = async (id: string, data: UpdateRoleRequest): Promise<Role> => {
  const response = await axiosClient.patch<ApiResponse<Role>>(`/roles/${id}`, data);
  if (!response.data.data) throw new Error(response.data.message || 'Update failed');
  return response.data.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`/roles/${id}`);
};

export const getRoleOptions = async (): Promise<RoleOption[]> => {
  const response = await axiosClient.get<ApiResponse<RoleOption[]>>('/roles/options');
  return response.data.data ?? [];
};
