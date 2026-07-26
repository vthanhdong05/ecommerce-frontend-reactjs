import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, logout, register, fetchProfile, clearError } from '../store/slices/authSlice';
import type { LoginResponse, User, RegisterRequest } from '../types/auth.types';
import { decodeJwt } from '../utils/jwt';

export function useAuth() {
  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    user,
    roleType,
    permissions,
    isBootstrapping,
    isLoading,
    error,
    accessToken,
  } = useAppSelector((state) => state.auth);

  // Derive permissions from current token as a fallback (in case sessionBus
  // hasn't fired yet — e.g. immediately after login)
  const livePermissions = useMemo(() => {
    if (permissions.length > 0) return permissions;
    const jwt = decodeJwt(accessToken);
    return jwt?.permissions ?? [];
  }, [permissions, accessToken]);

  const isAdmin = roleType === 'SUPER_ADMIN' || roleType === 'SYSTEM';

  const handleLogin = useCallback(
    (email: string, password: string) => {
      return dispatch(login({ email, password }));
    },
    [dispatch]
  );

  const handleRegister = useCallback(
    (data: RegisterRequest) => {
      return dispatch(register(data));
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    return dispatch(logout());
  }, [dispatch]);

  const handleFetchProfile = useCallback(() => {
    return dispatch(fetchProfile());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    roleType,
    permissions: livePermissions,
    isAdmin,
    isBootstrapping,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    fetchProfile: handleFetchProfile,
    clearError: handleClearError,
  };
}

// Export types for unwrap usage
export type { LoginResponse, User, RegisterRequest };
