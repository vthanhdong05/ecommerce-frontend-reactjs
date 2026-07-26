import { useAppSelector } from '../store/hooks';

export function useIsAdmin(): boolean {
  const roleType = useAppSelector((s) => s.auth.roleType);
  return roleType === 'SUPER_ADMIN' || roleType === 'SYSTEM';
}
