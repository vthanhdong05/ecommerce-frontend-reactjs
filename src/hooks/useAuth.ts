import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, logout, register, fetchProfile, clearError } from '../store/slices/authSlice';
import type { LoginResponse, User, RegisterRequest } from '../types/auth.types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, roleType, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

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
