import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Vendor, VendorOption } from '../../types/admin.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetVendorsParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'pending';
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
      ...(params?.search && { search: params.search }),
      ...(params?.status && { status: params.status }),
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
