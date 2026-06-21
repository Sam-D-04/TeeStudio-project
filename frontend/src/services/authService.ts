import apiClient from "@/lib/apiClient";
import { getStoredRefreshToken } from "@/lib/authStorage";
import type {
  ApiResponse,
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const authService = {
  login: async (data: LoginPayload) => {
    const response = await apiClient.post<ApiResponse<AuthSession>>("/auth/login", data);
    return response.data.data;
  },

  register: async (data: RegisterPayload) => {
    const response = await apiClient.post<ApiResponse<AuthSession>>(
      "/auth/register",
      data,
    );
    return response.data.data;
  },

  logout: async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return;
    await apiClient.post("/auth/logout", { refreshToken });
  },

  logoutAll: async () => {
    await apiClient.post("/auth/logout-all");
  },

  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    return response.data.data;
  },
};
