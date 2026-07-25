import { Suspense, lazy, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout, UserLayout, AdminLayout, DeviceGate } from '../components/layout';
import { RequireAuth, RequireRole, RequirePermission } from './ProtectedRoute';
import { PERM } from '../utils/buildPermissionKey';

// Lazy load pages
const HomePage = lazy(() => import('../pages/home/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'));
const AdminRolesPage = lazy(() => import('../pages/admin/AdminRolesPage'));
const AdminPermissionsPage = lazy(() => import('../pages/admin/AdminPermissionsPage'));
const AdminVendorsPage = lazy(() => import('../pages/admin/AdminVendorsPage'));
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'));
const AdminNotFoundPage = lazy(() => import('../pages/admin/AdminNotFoundPage'));

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Đang tải...</p>
      </div>
    </div>
  );
}

// Page wrapper with Suspense
function PageWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-gray-600 mb-6">Trang không tìm thấy</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Về trang chủ
        </a>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes with Layout */}
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <PageWrapper>
              <HomePage />
            </PageWrapper>
          }
        />
      </Route>

      {/* Auth routes - without Layout */}
      <Route
        path="/login"
        element={
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        }
      />
      <Route
        path="/register"
        element={
          <PageWrapper>
            <RegisterPage />
          </PageWrapper>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PageWrapper>
            <ForgotPasswordPage />
          </PageWrapper>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PageWrapper>
            <ResetPasswordPage />
          </PageWrapper>
        }
      />

      {/* User routes - with Layout */}
      <Route element={<UserLayout />}>
        <Route
          path="/profile"
          element={
            <PageWrapper>
              <ProfilePage />
            </PageWrapper>
          }
        />
      </Route>

      {/* Admin routes — RequireAuth > RequireRole > DeviceGate > AdminLayout */}
      <Route element={<RequireAuth />}>
        <Route element={<RequireRole roles={['SYSTEM', 'SUPER_ADMIN']} />}>
          <Route
            element={
              <DeviceGate>
                <AdminLayout />
              </DeviceGate>
            }
          >
            <Route
              path="/admin"
              element={
                <PageWrapper>
                  <AdminDashboardPage />
                </PageWrapper>
              }
            />

            {/* Users */}
            <Route element={<RequirePermission permissionKey={PERM.list('/users')} />}>
              <Route
                path="/admin/users"
                element={
                  <PageWrapper>
                    <AdminUsersPage />
                  </PageWrapper>
                }
              />
            </Route>

            {/* Roles */}
            <Route element={<RequirePermission permissionKey={PERM.list('/roles')} />}>
              <Route
                path="/admin/roles"
                element={
                  <PageWrapper>
                    <AdminRolesPage />
                  </PageWrapper>
                }
              />
            </Route>

            {/* Permissions (read-only) */}
            <Route element={<RequirePermission permissionKey={PERM.list('/permissions')} />}>
              <Route
                path="/admin/permissions"
                element={
                  <PageWrapper>
                    <AdminPermissionsPage />
                  </PageWrapper>
                }
              />
            </Route>

            {/* Vendors */}
            <Route element={<RequirePermission permissionKey={PERM.list('/vendors')} />}>
              <Route
                path="/admin/vendors"
                element={
                  <PageWrapper>
                    <AdminVendorsPage />
                  </PageWrapper>
                }
              />
            </Route>

            {/* Products */}
            <Route element={<RequirePermission permissionKey={PERM.list('/products')} />}>
              <Route
                path="/admin/products"
                element={
                  <PageWrapper>
                    <AdminProductsPage />
                  </PageWrapper>
                }
              />
            </Route>

            {/* Categories */}
            <Route element={<RequirePermission permissionKey={PERM.list('/categories')} />}>
              <Route
                path="/admin/categories"
                element={
                  <PageWrapper>
                    <AdminCategoriesPage />
                  </PageWrapper>
                }
              />
            </Route>

            {/* Orders */}
            <Route element={<RequirePermission permissionKey={PERM.list('/orders')} />}>
              <Route
                path="/admin/orders"
                element={
                  <PageWrapper>
                    <AdminOrdersPage />
                  </PageWrapper>
                }
              />
            </Route>

            {/* Admin 404 — anything else inside /admin/* */}
            <Route
              path="/admin/*"
              element={
                <PageWrapper>
                  <AdminNotFoundPage />
                </PageWrapper>
              }
            />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
