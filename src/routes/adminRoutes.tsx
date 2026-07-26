import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  KeyRound,
  Store,
  Package,
  Tags,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import { PERM, ROUTES } from '../utils/buildPermissionKey';

export interface AdminRouteEntry {
  /** Full path, e.g. "/admin/users". */
  path: string;
  label: string;
  icon: LucideIcon;
  /** Permission key required to even show this entry in the sidebar. */
  readPermission: string;
  /** Children for sub-pages (used by router & sidebar submenu). */
  children?: AdminChildRoute[];
  /** Hide from sidebar (e.g. dashboard). */
  hideInSidebar?: boolean;
}

export interface AdminChildRoute {
  /** Path relative to parent (e.g. "create", ":id/edit"). */
  path: string;
  label: string;
  /** Required permission (OR'd with parent's). Falls back to parent's readPermission. */
  permission?: string;
}

/**
 * Single source of truth for admin routing AND sidebar.
 *
 * Sidebar filters by `readPermission`. Router mounts each child via
 * RequirePermission. SUPER_ADMIN bypasses everything.
 */
export const ADMIN_ROUTES: AdminRouteEntry[] = [
  {
    path: '/admin',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    readPermission: PERM.list('/admin'),
    hideInSidebar: true, // rendered as logo/branding or separate header link
  },
  {
    path: '/admin/users',
    label: 'Người dùng',
    icon: Users,
    readPermission: PERM.list(ROUTES.users),
    children: [
      { path: '', label: 'Danh sách', permission: PERM.list(ROUTES.users) },
      { path: 'create', label: 'Tạo mới', permission: PERM.create(ROUTES.users) },
      { path: ':id', label: 'Chi tiết', permission: PERM.list(ROUTES.users) },
      { path: ':id/edit', label: 'Chỉnh sửa', permission: PERM.update(ROUTES.userDetail) },
    ],
  },
  {
    path: '/admin/roles',
    label: 'Vai trò',
    icon: ShieldCheck,
    readPermission: PERM.list(ROUTES.roles),
    children: [
      { path: '', label: 'Danh sách', permission: PERM.list(ROUTES.roles) },
      { path: 'create', label: 'Tạo mới', permission: PERM.create(ROUTES.roles) },
      { path: ':id', label: 'Chi tiết', permission: PERM.list(ROUTES.roles) },
      { path: ':id/edit', label: 'Chỉnh sửa', permission: PERM.update(ROUTES.roleDetail) },
    ],
  },
  {
    path: '/admin/permissions',
    label: 'Quyền',
    icon: KeyRound,
    readPermission: PERM.list(ROUTES.permissions),
    children: [{ path: '', label: 'Danh sách', permission: PERM.list(ROUTES.permissions) }],
  },
  {
    path: '/admin/vendors',
    label: 'Nhà cung cấp',
    icon: Store,
    readPermission: PERM.list(ROUTES.vendors),
    children: [
      { path: '', label: 'Danh sách', permission: PERM.list(ROUTES.vendors) },
      { path: 'create', label: 'Tạo mới', permission: PERM.create(ROUTES.vendors) },
      { path: ':id', label: 'Chi tiết', permission: PERM.list(ROUTES.vendors) },
      { path: ':id/edit', label: 'Chỉnh sửa', permission: PERM.update(ROUTES.vendorDetail) },
    ],
  },
  {
    path: '/admin/products',
    label: 'Sản phẩm',
    icon: Package,
    readPermission: PERM.list(ROUTES.products),
    children: [
      { path: '', label: 'Danh sách', permission: PERM.list(ROUTES.products) },
      { path: 'create', label: 'Tạo mới', permission: PERM.create(ROUTES.products) },
      { path: ':id', label: 'Chi tiết', permission: PERM.list(ROUTES.products) },
      { path: ':id/edit', label: 'Chỉnh sửa', permission: PERM.update(ROUTES.productDetail) },
    ],
  },
  {
    path: '/admin/categories',
    label: 'Danh mục',
    icon: Tags,
    readPermission: PERM.list(ROUTES.categories),
    children: [
      { path: '', label: 'Danh sách', permission: PERM.list(ROUTES.categories) },
      { path: 'create', label: 'Tạo mới', permission: PERM.create(ROUTES.categories) },
      { path: ':id', label: 'Chi tiết', permission: PERM.list(ROUTES.categories) },
      { path: ':id/edit', label: 'Chỉnh sửa', permission: PERM.update(ROUTES.categoryDetail) },
    ],
  },
  {
    path: '/admin/orders',
    label: 'Đơn hàng',
    icon: ShoppingCart,
    readPermission: PERM.list(ROUTES.orders),
    children: [
      { path: '', label: 'Danh sách', permission: PERM.list(ROUTES.orders) },
      { path: ':id', label: 'Chi tiết', permission: PERM.list(ROUTES.orders) },
    ],
  },
];

/** Helper: find an entry by exact path. */
export function findAdminRoute(path: string): AdminRouteEntry | undefined {
  return ADMIN_ROUTES.find((r) => r.path === path);
}
