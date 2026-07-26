import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/auth.types';
import type { Vendor, Role, Permission, Order } from '../types/admin.types';
import type { Product } from '../types/product.types';
import type { Category } from '../types/category.types';

export interface DashboardStats {
  users: number;
  vendors: number;
  products: number;
  categories: number;
  roles: number;
  permissions: number;
  orders: number;
}

/** Backend list envelope inner shape */
interface ListEnvelope<T> {
  list: T[];
  totalPages: number;
  totalItems: number;
}

type ListResponse<T> = ApiResponse<ListEnvelope<T>>;

/**
 * Build dashboard KPIs by calling each list endpoint with itemPerPage=1
 * and reading data.totalItems. Tolerant: if any endpoint fails, that KPI
 * becomes 0 instead of breaking the whole dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const safe = async <T>(p: Promise<{ data: ListResponse<T> }>): Promise<number> => {
    try {
      const { data } = await p;
      return data?.data?.totalItems ?? 0;
    } catch {
      return 0;
    }
  };

  const [users, vendors, products, categories, roles, permissions, orders] = await Promise.all([
    safe<User>(axiosClient.get('/users', { params: { page: 1, itemPerPage: 1 } })),
    safe<Vendor>(axiosClient.get('/vendors', { params: { page: 1, itemPerPage: 1 } })),
    safe<Product>(axiosClient.get('/products', { params: { page: 1, itemPerPage: 1 } })),
    safe<Category>(axiosClient.get('/categories', { params: { page: 1, itemPerPage: 1 } })),
    safe<Role>(axiosClient.get('/roles', { params: { page: 1, itemPerPage: 1 } })),
    safe<Permission>(axiosClient.get('/permissions', { params: { page: 1, itemPerPage: 1 } })),
    safe<Order>(axiosClient.get('/orders', { params: { page: 1, itemPerPage: 1 } })),
  ]);

  return { users, vendors, products, categories, roles, permissions, orders };
}
