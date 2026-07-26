import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Category, CategoryOption } from '../../types/category.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetAdminCategoriesParams {
  page?: number;
  itemPerPage?: number;
  // Backend PartialType(Category) + GetCategoriesFilterDto expose `name` cho search
  // (case-insensitive contains). Đổi `search` cũ → `name` để khớp backend filter.
  name?: string;
  parentID?: string | null;
  // Server-side sort (whitelist: name|slug|createdAt|updatedAt).
  sortBy?: 'name' | 'slug' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentID?: string | null;
  imageUrl?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentID?: string | null;
  imageUrl?: string;
}

export const getAdminCategories = async (
  params?: GetAdminCategoriesParams
): Promise<PaginatedResponse<Category>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 50;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<Category>>>(
    '/categories',
    {
      params: {
        page,
        itemPerPage,
        ...(params?.name && { name: params.name }),
        ...(params?.parentID !== undefined && { parentID: params.parentID }),
        ...(params?.sortBy && { sortBy: params.sortBy }),
        ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      },
    }
  );
  return unwrapList<Category>(response.data, page, itemPerPage);
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await axiosClient.get<ApiResponse<Category>>(`/categories/${id}`);
  if (!response.data.data) throw new Error('Category not found');
  return response.data.data;
};

export const createCategory = async (data: CreateCategoryRequest): Promise<Category> => {
  const response = await axiosClient.post<ApiResponse<Category>>('/categories', data);
  if (!response.data.data) throw new Error(response.data.message || 'Create failed');
  return response.data.data;
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryRequest
): Promise<Category> => {
  const response = await axiosClient.patch<ApiResponse<Category>>(`/categories/${id}`, data);
  if (!response.data.data) throw new Error(response.data.message || 'Update failed');
  return response.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`/categories/${id}`);
};

export const getCategoryOptions = async (): Promise<CategoryOption[]> => {
  const response = await axiosClient.get<ApiResponse<CategoryOption[]>>('/categories/options');
  return response.data.data ?? [];
};

/**
 * Export categories as an .xlsx file. Backend streams binary via ExcelResponseInterceptor.
 * `ids` filter theo danh sách cụ thể; truyền rỗng để export tất cả.
 */
export const exportCategories = async (ids: string[] = []): Promise<Blob> => {
  const response = await axiosClient.get('/categories/export', {
    params: { ids },
    responseType: 'blob',
  });
  return response.data as Blob;
};

/**
 * Import categories from an .xlsx file (multipart/form-data, field name "file").
 */
export const importCategories = async (file: File): Promise<ApiResponse<unknown>> => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosClient.post<ApiResponse<unknown>>('/categories/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
