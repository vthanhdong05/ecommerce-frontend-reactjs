import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { PermissionDeniedScreen } from '../components/admin/PermissionDeniedScreen';
import type { RoleType } from '../types/auth.types';

/**
 * Yêu cầu đăng nhập. Nếu chưa, redirect về /login và lưu location để quay lại.
 */
export function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    // Show nothing — App.tsx's SessionGate will render a full-screen spinner
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

interface RequireRoleProps {
  roles: RoleType[];
}

/**
 * Yêu cầu roleType nằm trong danh sách. Hiển thị PermissionDeniedScreen nếu không đủ.
 */
export function RequireRole({ roles }: RequireRoleProps) {
  const { roleType, isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  if (roleType && roles.includes(roleType)) {
    return <Outlet />;
  }
  return <PermissionDeniedScreen />;
}

interface RequirePermissionProps {
  permissionKey: string;
}

/**
 * Yêu cầu permission key. SUPER_ADMIN bypass.
 */
export function RequirePermission({ permissionKey }: RequirePermissionProps) {
  const allowed = usePermission(permissionKey);
  const location = useLocation();
  if (allowed) return <Outlet />;
  return <PermissionDeniedScreen from={location.pathname} />;
}
