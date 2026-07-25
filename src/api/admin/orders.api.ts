import axiosClient from '../axiosClient';
import type { ApiResponse, PaginatedResponse } from '../../types/api.types';
import type { Order } from '../../types/admin.types';
import { unwrapList, type BackendListEnvelope } from './_unwrap';

export interface GetOrdersParams {
  page?: number;
  itemPerPage?: number;
  status?: string;
  paymentStatus?: string;
}

export const getOrders = async (params?: GetOrdersParams): Promise<PaginatedResponse<Order>> => {
  const page = params?.page ?? 1;
  const itemPerPage = params?.itemPerPage ?? 20;
  const response = await axiosClient.get<ApiResponse<BackendListEnvelope<Order>>>('/orders', {
    params: {
      page,
      itemPerPage,
      ...(params?.status && { status: params.status }),
      ...(params?.paymentStatus && { paymentStatus: params.paymentStatus }),
    },
  });
  return unwrapList<Order>(response.data, page, itemPerPage);
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await axiosClient.get<ApiResponse<Order>>(`/orders/${id}`);
  if (!response.data.data) throw new Error('Order not found');
  return response.data.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await axiosClient.patch<ApiResponse<Order>>(`/orders/cancel/${id}`);
  if (!response.data.data) throw new Error(response.data.message || 'Cancel failed');
  return response.data.data;
};
