import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  fetchProfile,
  clearAuth,
  setBootstrapping,
  setSessionFromJwt,
} from '../store/slices/authSlice';
import { getAccessToken, clearTokens } from '../api/axiosClient';
import { sessionBus } from '../api/sessionBus';
import { decodeJwt } from '../utils/jwt';

/**
 * Khởi tạo auth state từ localStorage + lắng nghe sessionBus.
 *
 * - Mount: nếu có token, verify qua /profile + set isBootstrapping để UI
 *   không flicker menu admin/user.
 * - Mỗi lần axiosClient đổi token (login, refresh, logout) → sync
 *   permissions/roleType vào Redux qua setSessionFromJwt.
 */
export function useAuthInit() {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Subscribe to token changes (login, refresh, logout)
    const unsubscribe = sessionBus.subscribe((token) => {
      const jwt = decodeJwt(token);
      dispatch(setSessionFromJwt(jwt));
    });

    const verifyToken = async () => {
      const token = getAccessToken();

      if (!token) {
        // Không có token, user chưa đăng nhập
        dispatch(setBootstrapping(false));
        return;
      }

      // Có token, gọi API verify ở background
      dispatch(setBootstrapping(true));
      try {
        const result = await dispatch(fetchProfile());
        // Nếu fail (401 hoặc lỗi), clear tokens
        if (fetchProfile.rejected.match(result)) {
          clearTokens();
          dispatch(clearAuth());
        }
        // Nếu thành công, state đã được update trong fetchProfile.fulfilled
      } catch {
        clearTokens();
        dispatch(clearAuth());
      } finally {
        dispatch(setBootstrapping(false));
      }
    };

    verifyToken();

    return () => {
      unsubscribe();
    };
  }, [dispatch]);
}
