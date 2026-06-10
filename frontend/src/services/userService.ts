import apiClient from "@/lib/apiClient";
import type { AccountStatus, ApiResponse, AuthUser, UserRole } from "@/types/auth";

export interface StaffList {
  items: AuthUser[];
  total: number;
}

export interface CreateStaffPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: Exclude<UserRole, "CUSTOMER">;
}

export interface UpdateStaffPayload {
  role?: Exclude<UserRole, "CUSTOMER">;
  status?: AccountStatus;
}

export const userService = {
  listStaff: async () => {
    const response = await apiClient.get<ApiResponse<StaffList>>("/users/staff");
    return response.data.data;
  },

  createStaff: async (data: CreateStaffPayload) => {
    const response = await apiClient.post<ApiResponse<AuthUser>>("/users/staff", data);
    return response.data.data;
  },

  updateStaff: async (id: number, data: UpdateStaffPayload) => {
    const response = await apiClient.patch<ApiResponse<AuthUser>>(
      `/users/staff/${id}`,
      data,
    );
    return response.data.data;
  },
};
