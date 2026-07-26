import { useAppSelector } from '../store/hooks';

/**
 * Check if current user has a specific permission key.
 * Mirrors backend's AccessControlGuard behavior:
 *  - SUPER_ADMIN bypasses ALL permission checks
 *  - Otherwise compares against decoded JWT permissions[]
 */
export function usePermission(permKey: string): boolean {
  const { roleType, permissions } = useAppSelector((s) => s.auth);
  if (roleType === 'SUPER_ADMIN') return true;
  return permissions.includes(permKey);
}

/** True if user has ANY of the supplied keys (OR). */
export function useAnyPermission(...keys: string[]): boolean {
  const { roleType, permissions } = useAppSelector((s) => s.auth);
  if (roleType === 'SUPER_ADMIN') return true;
  return keys.some((k) => permissions.includes(k));
}

/** True if user has ALL of the supplied keys (AND). */
export function useAllPermission(...keys: string[]): boolean {
  const { roleType, permissions } = useAppSelector((s) => s.auth);
  if (roleType === 'SUPER_ADMIN') return true;
  return keys.every((k) => permissions.includes(k));
}
