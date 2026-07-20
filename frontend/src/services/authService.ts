import apiClient from "@/lib/apiClient";
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
    // Refresh token đi kèm tự động qua cookie HttpOnly, backend tự đọc và xoá.
    await apiClient.post("/auth/logout");
  },

  logoutAll: async () => {
    await apiClient.post("/auth/logout-all");
  },

  getProfile: async () => {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    return response.data.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post<ApiResponse<null>>("/auth/verify-email", {
      token,
    });
    return response.data.message;
  },

  resendVerification: async () => {
    const response = await apiClient.post<ApiResponse<null>>(
      "/auth/resend-verification",
    );
    return response.data.message;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", {
      email,
    });
    return response.data.message;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post<ApiResponse<null>>("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data.message;
  },
};
