import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Permission, PermissionOption } from '../../types/admin.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetPermissionsParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
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
        ...(params?.search && { search: params.search }),
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

export const getPermissionOptions = async (): Promise<PermissionOption[]> => {
  const response = await axiosClient.get<ApiResponse<PermissionOption[]>>('/permissions/options');
  return response.data.data ?? [];
};
