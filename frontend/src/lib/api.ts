import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const STORAGE_KEY_ACCESS = 'uth_access_token';
const STORAGE_KEY_REFRESH = 'uth_refresh_token';

let currentAccessToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ACCESS) : null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(STORAGE_KEY_ACCESS, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACCESS);
    }
  }
};

export const getAccessToken = (): string | null => {
  if (!currentAccessToken && typeof window !== 'undefined') {
    currentAccessToken = localStorage.getItem(STORAGE_KEY_ACCESS);
  }
  return currentAccessToken;
};

export const setRefreshToken = (token: string | null) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(STORAGE_KEY_REFRESH, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_REFRESH);
    }
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY_REFRESH);
  }
  return null;
};

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send HttpOnly cookie for refresh token
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string; detail?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and not retried yet, attempt refresh
    const isAuthError =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh');

    if (isAuthError) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const fallbackRefreshToken = getRefreshToken();
        const refreshRes = await axios.post<{
          data: { access_token: string; refresh_token?: string };
        }>(
          '/api/v1/auth/refresh',
          fallbackRefreshToken ? { refresh_token: fallbackRefreshToken } : {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data.data.access_token;
        setAccessToken(newToken);
        if (refreshRes.data.data.refresh_token) {
          setRefreshToken(refreshRes.data.data.refresh_token);
        }
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        setRefreshToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('uth_has_session');
          localStorage.removeItem('uth_user');
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const formatApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const data = error.response.data as any;
      if (typeof data === 'string') {
        if (!data.includes('<!DOCTYPE') && !data.includes('<html')) return data;
      } else if (typeof data === 'object') {
        if (data.detail) return data.detail;
        if (data.message) return data.message;
        if (data.error) return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        const firstKey = Object.keys(data)[0];
        if (firstKey && Array.isArray(data[firstKey])) {
          return `${data[firstKey][0]}`;
        }
      }
    }
    if (error.message && error.message.includes('Network Error')) {
      return 'Không thể kết nối đến máy chủ backend (Network Error). Vui lòng kiểm tra lại dịch vụ.';
    }
  }
  return 'Đã xảy ra lỗi kết nối đến máy chủ. Vui lòng thử lại sau.';
};

