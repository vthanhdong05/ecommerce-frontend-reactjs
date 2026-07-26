/**
 * Permission actions that mirror backend's AccessControlGuard.getAction():
 *   GET → read, POST → create, PUT/PATCH → update, DELETE → delete, manage → all
 */
export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage';

/**
 * Normalize a route pattern to the form the backend uses inside permission keys.
 * Backend sorts params by length desc, replaces values with `:key`.
 * For FE we hard-code the expected pattern (most routes are simple).
 */
export type NormalizedRoute = string; // e.g. '/users', '/users/:id'

/**
 * Build a permission key matching backend format: [/route]_[action]
 * Examples:
 *   buildPermissionKey('/users', 'read')        → '[/users]_[read]'
 *   buildPermissionKey('/users/:id', 'update')  → '[/users/:id]_[update]'
 */
export function buildPermissionKey(route: NormalizedRoute, action: PermissionAction): string {
  return `[${route}]_[${action}]`;
}

// Convenience helpers
export const PERM = {
  list: (route: string) => buildPermissionKey(route, 'read'),
  detail: (route: string) => buildPermissionKey(route, 'read'),
  create: (route: string) => buildPermissionKey(route, 'create'),
  update: (route: string) => buildPermissionKey(route, 'update'),
  delete: (route: string) => buildPermissionKey(route, 'delete'),
  manage: (route: string) => buildPermissionKey(route, 'manage'),
};

// Common route patterns used in admin manifest
export const ROUTES = {
  users: '/users',
  userDetail: '/users/:id',
  roles: '/roles',
  roleDetail: '/roles/:id',
  permissions: '/permissions',
  permissionDetail: '/permissions/:id',
  vendors: '/vendors',
  vendorDetail: '/vendors/:id',
  products: '/products',
  productDetail: '/products/:id',
  categories: '/categories',
  categoryDetail: '/categories/:id',
  orders: '/orders',
  orderDetail: '/orders/:id',
  productVariants: '/vendors/:vendorID/products/:productID/variants',
  productVariantDetail: '/vendors/:vendorID/products/:productID/variants/:id',
  productImages: '/vendors/:vendorID/products/:productID/images',
  productImageDetail: '/vendors/:vendorID/products/:productID/images/:id',
} as const;
