import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { ProductVariant } from '../../types/product.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetProductVariantsParams {
  page?: number;
  itemPerPage?: number;
}

/** Body cho POST /vendors/:vendorID/products/:productID/variants */
export interface CreateVariantRequest {
  name?: string | null;
  sku?: string | null;
  /** Prisma Decimal → FE gửi number, BE coerce. Schema bắt buộc > 0. */
  price: number;
  stockQuantity?: number;
  /** JSON linh hoạt (size, color, material…). BE nhận Record<string, unknown>. */
  attributes?: Record<string, unknown> | null;
}

export type UpdateVariantRequest = Partial<CreateVariantRequest>;

const BASE_PATH = (vendorID: string, productID: string) =>
  `/vendors/${vendorID}/products/${productID}/variants`;

export const getProductVariants = async (
  vendorID: string,
  productID: string,
  params?: GetProductVariantsParams
): Promise<PaginatedResponse<ProductVariant>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 50;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<ProductVariant>>>(
    BASE_PATH(vendorID, productID),
    {
      params: { page, itemPerPage },
    }
  );
  return unwrapList<ProductVariant>(response.data, page, itemPerPage);
};

export const createProductVariant = async (
  vendorID: string,
  productID: string,
  data: CreateVariantRequest
): Promise<ProductVariant> => {
  const response = await axiosClient.post<ApiResponse<ProductVariant>>(
    BASE_PATH(vendorID, productID),
    data
  );
  if (!response.data.data) throw new Error(response.data.message || 'Create variant failed');
  return response.data.data;
};

export const updateProductVariant = async (
  vendorID: string,
  productID: string,
  variantID: string,
  data: UpdateVariantRequest
): Promise<ProductVariant> => {
  const response = await axiosClient.patch<ApiResponse<ProductVariant>>(
    `${BASE_PATH(vendorID, productID)}/${variantID}`,
    data
  );
  if (!response.data.data) throw new Error(response.data.message || 'Update variant failed');
  return response.data.data;
};

export const deleteProductVariant = async (
  vendorID: string,
  productID: string,
  variantID: string
): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`${BASE_PATH(vendorID, productID)}/${variantID}`);
};
