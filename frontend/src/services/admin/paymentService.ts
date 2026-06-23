/**
 * paymentService.ts – Service gọi API thanh toán Admin.
 *
 * Tất cả gọi API liên quan đến thanh toán đều tập trung ở đây.
 * Component không được gọi axios trực tiếp – phải đi qua service này.
 *
 * Dùng kết hợp với React Query:
 *   const { data } = useQuery({ queryKey: ["admin-payments"], queryFn: () => layDanhSachGiaoDich(params) })
 */

import apiClient from "@/lib/apiClient";
import type { PaymentStatus } from "@/components/admin/payment/PaymentStatusBadge";
import type { PaymentType } from "@/components/admin/payment/PaymentTable";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Thống kê KPI cho 3 thẻ đầu trang */
export type ThongKeThanhToan = {
  tongTienHomNay: number;
  phanTramThayDoi: number;
  choThanhToan: number;
  canDoiSoat: number;
  thatBai: number;
};

/** Số lượng giao dịch cho các tab pill */
export type TabCounts = {
  tat_ca: number;
  cho_thanh_toan: number;
  da_thanh_toan: number;
  that_bai: number;
  can_doi_soat: number;
};

/** Một giao dịch trong danh sách */
export type GiaoDich = {
  id: number;
  payCode: string;
  orderCode: string;
  customerName: string;
  amountVnd: number;
  paymentType: PaymentType;
  method: "VNPAY" | "COD";
  status: PaymentStatus;
  gatewayCode: string;
  paidAt?: string;
  createdAt?: string;
};

/** Chi tiết giao dịch (dùng cho Drawer) */
export type ChiTietGiaoDich = GiaoDich & {
  customerPhone?: string;
  note: string;
  ipnHistory: {
    description: string;
    time: string;
    note?: string;
    isSuccess: boolean;
  }[];
};

/** Kết quả trả về khi lấy danh sách */
export type KetQuaDanhSachGiaoDich = {
  danhSach: GiaoDich[];
  tongSo: number;
  trang: number;
  soMoiTrang: number;
  tongSoTrang: number;
  tabCounts: TabCounts;
};

/** Tham số lọc khi lấy danh sách */
export type ThamSoLocGiaoDich = {
  trang?: number;
  soMoiTrang?: number;
  trangThai?: string;
  phuongThuc?: string;
  tuKhoa?: string;
  tab?: string;
};

// =====================================================================
// CÁC HÀM GỌI API
// =====================================================================

/**
 * Lấy thống kê KPI (3 thẻ đầu trang).
 * GET /api/admin/payments/stats
 */
export async function layThongKeThanhToan(): Promise<ThongKeThanhToan> {
  const res = await apiClient.get<{ success: boolean; data: ThongKeThanhToan }>(
    "/admin/payments/stats"
  );
  return res.data.data;
}

/**
 * Lấy danh sách giao dịch (phân trang + lọc).
 * GET /api/admin/payments?trang=1&soMoiTrang=10&...
 */
export async function layDanhSachGiaoDich(
  thamSo: ThamSoLocGiaoDich = {}
): Promise<KetQuaDanhSachGiaoDich> {
  const params: Record<string, string | number> = {};

  if (thamSo.trang) params.trang = thamSo.trang;
  if (thamSo.soMoiTrang) params.soMoiTrang = thamSo.soMoiTrang;
  if (thamSo.trangThai && thamSo.trangThai !== "tat_ca") params.trangThai = thamSo.trangThai;
  if (thamSo.phuongThuc && thamSo.phuongThuc !== "tat_ca") params.phuongThuc = thamSo.phuongThuc;
  if (thamSo.tuKhoa && thamSo.tuKhoa.trim()) params.tuKhoa = thamSo.tuKhoa.trim();
  if (thamSo.tab && thamSo.tab !== "tat_ca") params.tab = thamSo.tab;

  const res = await apiClient.get<{ success: boolean; data: KetQuaDanhSachGiaoDich }>(
    "/admin/payments",
    { params }
  );
  return res.data.data;
}

/**
 * Lấy chi tiết 1 giao dịch.
 * GET /api/admin/payments/:id
 */
export async function layChiTietGiaoDich(id: number): Promise<ChiTietGiaoDich> {
  const res = await apiClient.get<{ success: boolean; data: ChiTietGiaoDich }>(
    `/admin/payments/${id}`
  );
  return res.data.data;
}

/**
 * Xác nhận đã thu tiền COD.
 * POST /api/admin/payments/:id/confirm-cod
 */
export async function xacNhanThuCod(id: number): Promise<{ id: number; trangThai: string }> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: { id: number; trangThai: string };
  }>(`/admin/payments/${id}/confirm-cod`);
  return res.data.data;
}

/**
 * Đồng bộ lại trạng thái từ VNPAY.
 * POST /api/admin/payments/:id/sync-vnpay
 */
export async function dongBoLaiVnpay(
  id: number
): Promise<{ id: number; trangThai: string; dbStatus: string; transactionId: string; thongBao: string }> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: { id: number; trangThai: string; dbStatus: string; transactionId: string; thongBao: string };
  }>(`/admin/payments/${id}/sync-vnpay`);
  return res.data.data;
}

/**
 * Hoàn tiền giao dịch.
 * POST /api/admin/payments/:id/refund
 */
export async function hoanTienGiaoDich(id: number): Promise<{ id: number; trangThai: string }> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: { id: number; trangThai: string };
  }>(`/admin/payments/${id}/refund`);
  return res.data.data;
}

/**
 * Lưu ghi chú kế toán.
 * PATCH /api/admin/payments/:id/note
 */
export async function luuGhiChu(
  id: number,
  note: string
): Promise<{ id: number; note: string }> {
  const res = await apiClient.patch<{
    success: boolean;
    message: string;
    data: { id: number; note: string };
  }>(`/admin/payments/${id}/note`, { note });
  return res.data.data;
}
