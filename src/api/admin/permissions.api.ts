import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Permission, PermissionOption } from '../../types/admin.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetPermissionsParams {
  page?: number;
  itemPerPage?: number;
  // `PartialType(Permission)` expose `name` + `isSystemPermission` cho filter.
  name?: string;
  isSystemPermission?: boolean;
  // Server-side sort — backend whitelist `PERMISSION_SORTABLE_FIELDS`.
  sortBy?: 'name' | 'key' | 'isSystemPermission' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePermissionRequest {
  name: string;
  key: string;
  description?: string;
  isSystemPermission?: boolean;
}

export interface UpdatePermissionRequest {
  name?: string;
  key?: string;
  description?: string;
  isSystemPermission?: boolean;
}

export const getPermissions = async (
  params?: GetPermissionsParams
): Promise<PaginatedResponse<Permission>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 20;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<Permission>>>(
    '/permissions',
    {
      params: {
        page,
        itemPerPage,
        ...(params?.name && { name: params.name }),
        ...(params?.isSystemPermission !== undefined && {
          isSystemPermission: params.isSystemPermission,
        }),
        ...(params?.sortBy && { sortBy: params.sortBy }),
        ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      },
    }
  );
  return unwrapList<Permission>(response.data, page, itemPerPage);
};

export const getPermissionById = async (id: string): Promise<Permission> => {
  const response = await axiosClient.get<ApiResponse<Permission>>(`/permissions/${id}`);
  if (!response.data.data) throw new Error('Permission not found');
  return response.data.data;
};

export const createPermission = async (data: CreatePermissionRequest): Promise<Permission> => {
  const response = await axiosClient.post<ApiResponse<Permission>>('/permissions', data);
  if (!response.data.data) throw new Error(response.data.message || 'Create failed');
  return response.data.data;
};

export const updatePermission = async (
  id: string,
  data: UpdatePermissionRequest
): Promise<Permission> => {
  const response = await axiosClient.patch<ApiResponse<Permission>>(`/permissions/${id}`, data);
  if (!response.data.data) throw new Error(response.data.message || 'Update failed');
  return response.data.data;
};

export const deletePermission = async (id: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`/permissions/${id}`);
};

export const getPermissionOptions = async (): Promise<PermissionOption[]> => {
  const response = await axiosClient.get<ApiResponse<PermissionOption[]>>('/permissions/options');
  return response.data.data ?? [];
};

/**
 * Export permissions as an .xlsx file. Backend streams binary via ExcelResponseInterceptor.
 * `ids` filter theo danh sách cụ thể; truyền rỗng để export tất cả.
 */
export const exportPermissions = async (ids: string[] = []): Promise<Blob> => {
  const response = await axiosClient.get('/permissions/export', {
    params: { ids },
    responseType: 'blob',
  });
  return response.data as Blob;
};

/**
 * Import permissions from an .xlsx file (multipart/form-data, field name "file").
 */
export const importPermissions = async (file: File): Promise<ApiResponse<unknown>> => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosClient.post<ApiResponse<unknown>>('/permissions/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
