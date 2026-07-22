import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type { Product, ProductDetail } from '../types/product.types';
import axiosClient from './axiosClient';

export interface GetProductsParams {
  page?: number;
  itemPerPage?: number;
  search?: string;
  categoryID?: string;
  vendorID?: string;
  status?: 'active' | 'inactive' | 'draft';
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

// Lấy danh sách sản phẩm (phân trang)
export const getProducts = async (
  params?: GetProductsParams
): Promise<PaginatedResponse<Product>> => {
  const response = await axiosClient.get<PaginatedResponse<Product>>('/products', {
    params: {
      page: params?.page ?? 1,
      itemPerPage: params?.itemPerPage ?? 12,
      ...(params?.search && { search: params.search }),
      ...(params?.categoryID && { categoryID: params.categoryID }),
      ...(params?.vendorID && { vendorID: params.vendorID }),
      ...(params?.status && { status: params.status }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      ...(params?.minPrice !== undefined && { minPrice: params.minPrice }),
      ...(params?.maxPrice !== undefined && { maxPrice: params.maxPrice }),
    },
  });
  return response.data;
};

// Lấy sản phẩm nổi bật (cho trang chủ)
export const getFeaturedProducts = async (itemPerPage: number = 12): Promise<Product[]> => {
  const response = await axiosClient.get<
    ApiResponse<{ list: Product[]; totalPages: number; totalItems: number }>
  >('/products', {
    params: {
      page: 1,
      itemPerPage,
      status: 'draft',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  });
  return response.data.data?.list ?? [];
};

// Lấy sản phẩm theo slug
export const getProductBySlug = async (slug: string): Promise<ProductDetail> => {
  const response = await axiosClient.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
  if (!response.data.data) {
    throw new Error('Product not found');
  }
  return response.data.data;
};

// Lấy sản phẩm theo ID
export const getProductById = async (id: string): Promise<ProductDetail> => {
  const response = await axiosClient.get<ApiResponse<ProductDetail>>(`/products/id/${id}`);
  if (!response.data.data) {
    throw new Error('Product not found');
  }
  return response.data.data;
};

// Lấy sản phẩm liên quan (cùng category)
export const getRelatedProducts = async (
  productId: string,
  categoryID: string,
  itemPerPage: number = 6
): Promise<Product[]> => {
  const response = await axiosClient.get<
    ApiResponse<{ list: Product[]; totalPages: number; totalItems: number }>
  >('/products', {
    params: {
      page: 1,
      itemPerPage,
      categoryID,
      status: 'active',
      excludeID: productId,
    },
  });
  return response.data.data?.list ?? [];
};
