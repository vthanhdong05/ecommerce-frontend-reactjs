import { Suspense, lazy, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout, UserLayout } from '../components/layout';

// Lazy load pages
const HomePage = lazy(() => import('../pages/home/HomePage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));

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

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
