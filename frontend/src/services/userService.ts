import apiClient from "@/lib/apiClient";
import type { AccountStatus, ApiResponse, AuthUser, UserRole } from "@/types/auth";

export interface StaffList {
  items: AuthUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateStaffPayload {
  email: string;
  fullName: string;
  phone: string;
  role: Exclude<UserRole, "CUSTOMER">;
}

export interface UpdateStaffPayload {
  role?: Exclude<UserRole, "CUSTOMER">;
  status?: AccountStatus;
}

export const userService = {
  listStaff: async (params?: StaffListParams) => {
    const response = await apiClient.get<ApiResponse<StaffList>>("/users/admin/staff", {
      params,
    });
    return response.data.data;
  },

  createStaff: async (data: CreateStaffPayload) => {
    const response = await apiClient.post<ApiResponse<AuthUser>>(
      "/users/admin/staff",
      data,
    );
    return response.data.data;
  },

  updateStaff: async (id: number, data: UpdateStaffPayload) => {
    const response = await apiClient.patch<ApiResponse<AuthUser>>(
      `/users/admin/staff/${id}`,
      data,
    );
    return response.data.data;
  },
};
