import axiosClient from '../axiosClient';
import type { ApiResponse } from '../../types/api.types';
import type { ProductImage } from '../../types/product.types';

const BASE_PATH = (vendorID: string, productID: string) =>
  `/vendors/${vendorID}/products/${productID}/images`;

/** Body cho PATCH /vendors/:vendorID/products/:productID/images/:id */
export interface UpdateImageRequest {
  name?: string;
  description?: string | null;
  sortOrder?: number;
}

/**
 * Upload file lên Cloudinary qua backend.
 * BE dùng @FileInterceptor('file') → phải gửi field tên 'file' dạng multipart.
 * Trả về ProductImage (BE upsert + lấy secure_url).
 */
export const uploadProductImage = async (
  vendorID: string,
  productID: string,
  file: File
): Promise<ProductImage> => {
  const form = new FormData();
  form.append('file', file);
  const response = await axiosClient.post<ApiResponse<ProductImage>>(
    `${BASE_PATH(vendorID, productID)}/upload`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  if (!response.data.data) throw new Error(response.data.message || 'Upload failed');
  return response.data.data;
};

export const getProductImages = async (
  vendorID: string,
  productID: string
): Promise<ProductImage[]> => {
  const response = await axiosClient.get<ApiResponse<ProductImage[]>>(
    BASE_PATH(vendorID, productID)
  );
  return response.data.data ?? [];
};

export const updateProductImage = async (
  vendorID: string,
  productID: string,
  imageID: string,
  data: UpdateImageRequest
): Promise<ProductImage> => {
  const response = await axiosClient.patch<ApiResponse<ProductImage>>(
    `${BASE_PATH(vendorID, productID)}/${imageID}`,
    data
  );
  if (!response.data.data) throw new Error(response.data.message || 'Update image failed');
  return response.data.data;
};

export const deleteProductImage = async (
  vendorID: string,
  productID: string,
  imageID: string
): Promise<void> => {
  await axiosClient.delete<ApiResponse<null>>(`${BASE_PATH(vendorID, productID)}/${imageID}`);
};
