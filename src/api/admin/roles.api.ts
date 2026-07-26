import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Role, RoleOption, SystemRoleType } from '../../types/admin.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetRolesParams {
  page?: number;
  itemPerPage?: number;
  // Backend `PartialType(Role)` chỉ expose field `name` cho search.
  name?: string;
  roleType?: SystemRoleType;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  roleType: SystemRoleType;
  permissionIDs?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  roleType?: SystemRoleType;
  permissionIDs?: string[];
}

export const getRoles = async (params?: GetRolesParams): Promise<PaginatedResponse<Role>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 20;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<Role>>>('/roles', {
    params: {
      page,
      itemPerPage,
      ...(params?.name && { name: params.name }),
      ...(params?.roleType && { roleType: params.roleType }),
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

/**
 * Export roles as an .xlsx file. Backend streams binary via ExcelResponseInterceptor.
 * Returns a Blob so the caller can trigger download.
 */
export const exportRoles = async (): Promise<Blob> => {
  const response = await axiosClient.get('/roles/export', {
    responseType: 'blob',
  });
  return response.data as Blob;
};

/**
 * Import roles from an .xlsx file (multipart/form-data, field name "file").
 * Backend reads the worksheet (sheet name = Role) and bulk-inserts via createMany.
 */
export const importRoles = async (file: File): Promise<ApiResponse<unknown>> => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosClient.post<ApiResponse<unknown>>('/roles/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
