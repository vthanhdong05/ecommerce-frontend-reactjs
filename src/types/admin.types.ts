import type { Product, ProductStatusType } from './product.types';
import type { Category } from './category.types';
import type { User } from './auth.types';

// ===== Roles =====
export type SystemRoleType = 'SUPER_ADMIN' | 'SYSTEM' | 'VENDOR';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  roleType: SystemRoleType;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
  // Single-role endpoint (`GET /roles/:id`) include mapping; list endpoint thì không trả.
  rolePermissions?: { permission: Permission }[];
}

export interface RoleOption {
  id: string;
  name: string;
  roleType: SystemRoleType;
}

// ===== Permissions =====
export interface Permission {
  id: string;
  name: string;
  key: string;
  description: string | null;
  // Backend Prisma field: true = permission dành cho role SYSTEM, false = VENDOR.
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionOption {
  id: string;
  key: string;
}

// ===== Vendors =====
export interface Vendor {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  logoUrl: string | null;
  description: string | null;
  status: 'active' | 'inactive' | 'pending';
  ownerID: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VendorOption {
  id: string;
  name: string;
}

// ===== Orders =====
export type OrderStatus =
  'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'returned';

export interface Order {
  id: string;
  userID: string;
  vendorID: string | null;
  status: OrderStatus;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddressID: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ===== Admin User (re-export to make DTOs explicit) =====
export type AdminUser = User;

// ===== Product/Category admin re-exports =====
export type { Product, ProductStatusType, Category };
