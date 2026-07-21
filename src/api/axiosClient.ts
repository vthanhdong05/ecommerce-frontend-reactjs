import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Gửi cookie refreshToken tự động
});

// Token keys
const ACCESS_TOKEN_KEY = 'accessToken';

// Lấy accessToken từ localStorage
export const getAccessToken = (): string | null => {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Lưu accessToken vào localStorage
export const setAccessToken = (token: string): void => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

// Xóa tokens (logout)
export const clearTokens = (): void => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};

// ===== Request Interceptor =====
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ===== Response Interceptor =====
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh, queue request lại
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh token endpoint
        // Cookie refreshToken sẽ được gửi tự động nhờ withCredentials: true
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        const { accessToken } = response.data;

        // Lưu accessToken mới
        setAccessToken(accessToken);

        // Retry các request đang chờ
        processQueue(null, accessToken);

        // Retry request ban đầu
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại
        processQueue(refreshError as AxiosError, null);
        clearTokens();

        // Redirect về login
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
