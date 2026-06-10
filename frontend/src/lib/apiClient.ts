import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveAuthSession,
} from "@/lib/authStorage";
import type { ApiResponse, AuthSession } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest: Promise<AuthSession> | null = null;

const redirectToLogin = () => {
  if (typeof window === "undefined") return;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (!window.location.pathname.startsWith("/dang-nhap")) {
    window.location.href = `/dang-nhap?redirect=${encodeURIComponent(currentPath)}`;
  }
};

const refreshSession = async () => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await axios.post<ApiResponse<AuthSession>>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
    { timeout: 15000, headers: { "Content-Type": "application/json" } },
  );
  saveAuthSession(response.data.data);
  return response.data.data;
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest = /\/auth\/(login|register|refresh|logout)$/.test(requestUrl);

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ??= refreshSession().finally(() => {
        refreshRequest = null;
      });
      const session = await refreshRequest;
      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
