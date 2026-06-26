/**
 * accountService.ts – Service gọi API quản lý tài khoản khách hàng (Admin).
 *
 * Tất cả gọi API liên quan đến tài khoản khách hàng đều tập trung ở đây.
 * Component không được gọi axios trực tiếp – phải đi qua service này.
 *
 * Dùng kết hợp với React Query:
 *   const { data } = useQuery({ queryKey: ["accounts"], queryFn: () => accountService.layDanhSachTaiKhoan() })
 */

import apiClient from "@/lib/apiClient";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Trạng thái tài khoản */
export type TrangThaiTaiKhoan = "ACTIVE" | "INACTIVE" | "SUSPENDED";

/** Một tài khoản khách hàng */
export type TaiKhoanKhachHang = {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: "CUSTOMER";
  status: TrangThaiTaiKhoan;
  createdAt: string;
  updatedAt: string;
};

/** Kết quả danh sách tài khoản (phân trang) */
export type KetQuaDanhSachTaiKhoan = {
  items: TaiKhoanKhachHang[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statTotal?: number;
  statActive?: number;
  statInactive?: number;
};

/** Tham số lọc danh sách tài khoản */
export type ThamSoLocTaiKhoan = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

/** Payload tạo tài khoản khách hàng mới */
export type TaoTaiKhoanInput = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

/** Payload cập nhật thông tin khách hàng (không có password, không có role) */
export type CapNhatTaiKhoanInput = {
  fullName?: string;
  phone?: string;
  status?: TrangThaiTaiKhoan;
};

// =====================================================================
// CÁC HÀM GỌI API
// =====================================================================

/**
 * Lấy danh sách tài khoản khách hàng (phân trang + lọc).
 * GET /api/users/admin/customers?page=1&limit=20&search=...&status=...
 */
export async function layDanhSachTaiKhoan(
  thamSo: ThamSoLocTaiKhoan = {}
): Promise<KetQuaDanhSachTaiKhoan> {
  const params: Record<string, string | number> = {};

  if (thamSo.page) params.page = thamSo.page;
  if (thamSo.limit) params.limit = thamSo.limit;
  if (thamSo.search?.trim()) params.search = thamSo.search.trim();
  if (thamSo.status && thamSo.status !== "tat_ca") params.status = thamSo.status;

  const res = await apiClient.get<{ success: boolean; data: KetQuaDanhSachTaiKhoan }>(
    "/users/admin/customers",
    { params }
  );
  return res.data.data;
}

/**
 * Tạo tài khoản khách hàng mới.
 * POST /api/users/admin/customers
 */
export async function taoTaiKhoan(
  payload: TaoTaiKhoanInput
): Promise<TaiKhoanKhachHang> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TaiKhoanKhachHang;
  }>("/users/admin/customers", payload);
  return res.data.data;
}

/**
 * Cập nhật thông tin khách hàng (không cho phép đổi password/role).
 * PATCH /api/users/admin/customers/:id
 */
export async function capNhatTaiKhoan(
  id: number,
  payload: CapNhatTaiKhoanInput
): Promise<TaiKhoanKhachHang> {
  const res = await apiClient.patch<{
    success: boolean;
    message: string;
    data: TaiKhoanKhachHang;
  }>(`/users/admin/customers/${id}`, payload);
  return res.data.data;
}

/**
 * Soft-delete: vô hiệu hóa tài khoản (đổi status sang INACTIVE hoặc SUSPENDED).
 * PATCH /api/users/admin/customers/:id/deactivate
 */
export async function voHieuHoaTaiKhoan(
  id: number,
  targetStatus: "INACTIVE" | "SUSPENDED" = "INACTIVE"
): Promise<TaiKhoanKhachHang> {
  const res = await apiClient.patch<{
    success: boolean;
    message: string;
    data: TaiKhoanKhachHang;
  }>(`/users/admin/customers/${id}/deactivate`, { targetStatus });
  return res.data.data;
}
