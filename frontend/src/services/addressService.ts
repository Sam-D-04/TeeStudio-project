import apiClient from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";
import type { ApiResponse } from "@/types/auth";

/** 1 địa chỉ trong sổ địa chỉ giao hàng của khách hàng. */
export interface UserAddress {
  id: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AddressFormPayload {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  ward: string;
  isDefault?: boolean;
}

export const addressService = {
  list: async (): Promise<UserAddress[]> => {
    try {
      const res = await apiClient.get<ApiResponse<UserAddress[]>>("/users/me/addresses");
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Không tải được sổ địa chỉ"));
    }
  },

  create: async (data: AddressFormPayload): Promise<UserAddress> => {
    try {
      const res = await apiClient.post<ApiResponse<UserAddress>>("/users/me/addresses", data);
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Thêm địa chỉ thất bại"));
    }
  },

  update: async (id: number, data: AddressFormPayload): Promise<UserAddress> => {
    try {
      const res = await apiClient.put<ApiResponse<UserAddress>>(
        `/users/me/addresses/${id}`,
        data,
      );
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Cập nhật địa chỉ thất bại"));
    }
  },

  remove: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/users/me/addresses/${id}`);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Xoá địa chỉ thất bại"));
    }
  },

  setDefault: async (id: number): Promise<UserAddress> => {
    try {
      const res = await apiClient.put<ApiResponse<UserAddress>>(
        `/users/me/addresses/${id}/default`,
      );
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Không đặt được làm địa chỉ mặc định"));
    }
  },
};
