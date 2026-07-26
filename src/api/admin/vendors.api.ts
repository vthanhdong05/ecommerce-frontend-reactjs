import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Vendor, VendorOption } from '../../types/admin.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetVendorsParams {
  page?: number;
  itemPerPage?: number;
  // Backend `GetVendorsFilterDto` expose `name` cho search (giống `name` ở Roles).
  name?: string;
  status?: 'active' | 'inactive' | 'pending';
  // Server-side sort (whitelist: name|status|totalProducts|totalOrders|createdAt|updatedAt).
  sortBy?: 'name' | 'status' | 'totalProducts' | 'totalOrders' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVendorRequest {
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  logoUrl?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export const getVendors = async (params?: GetVendorsParams): Promise<PaginatedResponse<Vendor>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 20;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<Vendor>>>('/vendors', {
    params: {
      page,
      itemPerPage,
      ...(params?.name && { name: params.name }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    },
  });
  return unwrapList<Vendor>(response.data, page, itemPerPage);
};

export const getVendorById = async (id: string): Promise<Vendor> => {
  const response = await axiosClient.get<ApiResponse<Vendor>>(`/vendors/${id}`);
  if (!response.data.data) throw new Error('Vendor not found');
  return response.data.data;
};

export const createVendor = async (data: CreateVendorRequest): Promise<Vendor> => {
  const response = await axiosClient.post<ApiResponse<Vendor>>('/vendors', data);
  if (!response.data.data) throw new Error(response.data.message || 'Create failed');
  return response.data.data;
};

export const updateVendor = async (id: string, data: UpdateVendorRequest): Promise<Vendor> => {
  const response = await axiosClient.patch<ApiResponse<Vendor>>(`/vendors/${id}`, data);
  if (!response.data.data) throw new Error(response.data.message || 'Update failed');
  return response.data.data;
};

export const deleteVendor = async (id: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`/vendors/${id}`);
};

export const getVendorOptions = async (): Promise<VendorOption[]> => {
  const response = await axiosClient.get<ApiResponse<VendorOption[]>>('/vendors/options');
  return response.data.data ?? [];
};

/**
 * Export vendors as an .xlsx file. Backend streams binary via ExcelResponseInterceptor.
 * `ids` filter theo danh sách cụ thể; truyền rỗng để export tất cả.
 */
export const exportVendors = async (ids: string[] = []): Promise<Blob> => {
  const response = await axiosClient.get('/vendors/export', {
    params: { ids },
    responseType: 'blob',
  });
  return response.data as Blob;
};

/**
 * Import vendors from an .xlsx file (multipart/form-data, field name "file").
 */
export const importVendors = async (file: File): Promise<ApiResponse<unknown>> => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosClient.post<ApiResponse<unknown>>('/vendors/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
