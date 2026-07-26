import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Category, CategoryOption, CategoryWithChildren } from '../types/category.types';
import axiosClient from './axiosClient';

export interface GetCategoriesParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
  parentID?: string | null;
}

// Lấy danh sách categories (phân trang)
export const getCategories = async (
  params?: GetCategoriesParams
): Promise<PaginatedResponse<Category>> => {
  const response = await axiosClient.get<PaginatedResponse<Category>>('/categories', {
    params: {
      page: params?.page ?? 1,
      itemPerPage: params?.itemPerPage ?? 10,
      ...(params?.search && { search: params.search }),
      ...(params?.parentID !== undefined && { parentID: params.parentID }),
    },
  });
  return response.data;
};

// Lấy categories với children (cho menu/dropdown)
export const getCategoriesWithChildren = async (): Promise<CategoryWithChildren[]> => {
  const response = await axiosClient.get<ApiResponse<CategoryWithChildren[]>>(
    '/categories/options',
    {
      params: { limit: 100 },
    }
  );
  return response.data.data ?? [];
};

// Lấy category theo slug
export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const response = await axiosClient.get<ApiResponse<Category>>(`/categories/${slug}`);
  if (!response.data.data) {
    throw new Error('Category not found');
  }
  return response.data.data;
};

// Lấy category options (id + name) cho dropdown
export const getCategoryOptions = async (): Promise<CategoryOption[]> => {
  const response = await axiosClient.get<ApiResponse<CategoryOption[]>>('/categories/options');
  return response.data.data ?? [];
};
