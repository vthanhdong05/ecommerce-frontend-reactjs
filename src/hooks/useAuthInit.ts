import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../store/hooks';
import { fetchProfile, clearAuth } from '../store/slices/authSlice';
import { getAccessToken, clearTokens } from '../api/axiosClient';

/**
 * Hook để khởi tạo auth state từ localStorage
 * - Restore UI ngay từ localStorage (không chờ API)
 * - Gọi API verify token ở background
 * - Nếu token hết hạn → clear state
 */
export function useAuthInit() {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const verifyToken = async () => {
      const token = getAccessToken();

      if (!token) {
        // Không có token, user chưa đăng nhập
        return;
      }

      // Có token, gọi API verify ở background
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
      }
    };

    verifyToken();
  }, [dispatch]);
}
