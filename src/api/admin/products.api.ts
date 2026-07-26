import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Product, ProductDetail, ProductStatusType } from '../../types/product.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetAdminProductsParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
  status?: ProductStatusType;
  vendorID?: string;
  categoryID?: string;
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stockQuantity: number;
  status?: ProductStatusType;
  vendorID: string;
  categoryIDs?: string[];
  imageUrls?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  stockQuantity?: number;
  status?: ProductStatusType;
  categoryIDs?: string[];
  imageUrls?: string[];
}

export const getAdminProducts = async (
  params?: GetAdminProductsParams
): Promise<PaginatedResponse<Product>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 20;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<Product>>>('/products', {
    params: {
      page,
      itemPerPage,
      ...(params?.search && { search: params.search }),
      ...(params?.status && { status: params.status }),
      ...(params?.vendorID && { vendorID: params.vendorID }),
      ...(params?.categoryID && { categoryID: params.categoryID }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    },
  });
  return unwrapList<Product>(response.data, page, itemPerPage);
};

export const getAdminProductById = async (id: string): Promise<ProductDetail> => {
  const response = await axiosClient.get<ApiResponse<ProductDetail>>(`/products/${id}`);
  if (!response.data.data) throw new Error('Product not found');
  return response.data.data;
};

export const createProduct = async (data: CreateProductRequest): Promise<Product> => {
  const response = await axiosClient.post<ApiResponse<Product>>('/products', data);
  if (!response.data.data) throw new Error(response.data.message || 'Create failed');
  return response.data.data;
};

export const updateProduct = async (id: string, data: UpdateProductRequest): Promise<Product> => {
  const response = await axiosClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
  if (!response.data.data) throw new Error(response.data.message || 'Update failed');
  return response.data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`/products/${id}`);
};

/**
 * Export products as an .xlsx file. Backend streams binary via ExcelResponseInterceptor.
 * `ids` filter theo danh sách cụ thể; truyền rỗng để export tất cả.
 */
export const exportProducts = async (ids: string[] = []): Promise<Blob> => {
  const response = await axiosClient.get('/products/export', {
    params: { ids },
    responseType: 'blob',
  });
  return response.data as Blob;
};

/**
 * Import products from an .xlsx file (multipart/form-data, field name "file").
 */
export const importProducts = async (file: File): Promise<ApiResponse<unknown>> => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosClient.post<ApiResponse<unknown>>('/products/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
