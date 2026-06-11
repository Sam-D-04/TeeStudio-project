/**
 * inventoryService.ts – Service gọi API Kho hàng (Admin).
 *
 * Tất cả gọi API liên quan đến kho hàng đều tập trung ở đây.
 * Component không được gọi axios trực tiếp – phải đi qua service này.
 *
 * Dùng kết hợp với React Query:
 *   const { data } = useQuery({ queryKey: ["inventory", "stats"], queryFn: inventoryService.layThongKeKho })
 */

import apiClient from "@/lib/apiClient";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Trạng thái tồn kho của một biến thể phôi áo */
export type TrangThaiTonKho = "con_hang" | "sap_het" | "het_hang";

/** Một biến thể phôi áo trong danh sách kho hàng */
export type MucTonKho = {
  id: number;
  /** Tên phôi áo, ví dụ: "Basic Cotton Tee" */
  ten: string;
  /** Màu sắc, ví dụ: "Trắng" */
  mau: string;
  /** Mã màu hex, ví dụ: "#ffffff" */
  mauHex?: string;
  /** Kích thước, ví dụ: "M" */
  size: string;
  /** Mã SKU duy nhất */
  sku: string;
  /** Tổng số áo đang có trong kho */
  tonHienTai: number;
  /** Số áo đang bị giữ cho đơn hàng đang xử lý */
  daGiu: number;
  /** Số áo khả dụng = tonHienTai - daGiu */
  khaDung: number;
  /** Trạng thái tồn kho */
  trangThai: TrangThaiTonKho;
};

/** 4 thẻ KPI thống kê đầu trang kho hàng */
export type ThongKeKho = {
  /** Tổng số phôi áo còn tồn kho */
  tongPhoi: number;
  /** Số biến thể sắp hết hàng */
  sapHet: number;
  /** Số áo đang bị giữ cho đơn hàng */
  daGiu: number;
  /** Số áo đã nhập kho trong tháng này */
  nhapThang: number;
};

/** Kết quả trả về khi lấy danh sách tồn kho phân trang */
export type KetQuaDanhSachTonKho = {
  danhSach: MucTonKho[];
  tongSo: number;
  trang: number;
  soMoiTrang: number;
  tongSoTrang: number;
};

/** Tham số lọc khi lấy danh sách tồn kho */
export type ThamSoLocTonKho = {
  trang?: number;
  soMoiTrang?: number;
  tuKhoa?: string;
  boLoc?: string;
};

/** Một đơn hàng đang chờ xuất phôi áo */
export type DonChoXuat = {
  id: string;
  soLuong: number;
};

/** Loại biến động trong lịch sử kho */
export type LoaiBienDong = "nhap" | "xuat" | "giu";

/** Một mục trong lịch sử biến động tồn kho */
export type LichSuBienDong = {
  id: number;
  moTa: string;
  thoiGian: string;
  loai: LoaiBienDong;
};

/** Loại giao dịch kho */
export type LoaiGiaoDich =
  | "IMPORT"
  | "EXPORT"
  | "ADJUSTMENT"
  | "ORDER_EXPORT"
  | "RETURN";

/** Payload ghi giao dịch kho */
export type GhiGiaoDichInput = {
  variantId: number;
  quantityChanged: number;
  transactionType: LoaiGiaoDich;
  reason: string;
  orderId?: number;
  supplierId?: number;
};

/** Kết quả sau khi ghi giao dịch kho thành công */
export type KetQuaGhiGiaoDich = {
  transactionId: number;
  variantId: number;
  soLuongTruoc: number;
  soLuongSau: number;
  quantityChanged: number;
  transactionType: LoaiGiaoDich;
};

// =====================================================================
// CÁC HÀM GỌI API
// =====================================================================

/**
 * Lấy 4 thẻ thống kê KPI đầu trang kho hàng.
 * GET /api/admin/inventory/stats
 */
export async function layThongKeKho(): Promise<ThongKeKho> {
  const res = await apiClient.get<{ success: boolean; data: ThongKeKho }>(
    "/admin/inventory/stats"
  );
  return res.data.data;
}

/**
 * Lấy danh sách tồn kho có phân trang, tìm kiếm và lọc.
 * GET /api/admin/inventory
 */
export async function layDanhSachTonKho(
  thamSo: ThamSoLocTonKho = {}
): Promise<KetQuaDanhSachTonKho> {
  const params: Record<string, string | number> = {};

  if (thamSo.trang) params.trang = thamSo.trang;
  if (thamSo.soMoiTrang) params.soMoiTrang = thamSo.soMoiTrang;
  if (thamSo.tuKhoa && thamSo.tuKhoa.trim()) params.tuKhoa = thamSo.tuKhoa.trim();
  if (thamSo.boLoc && thamSo.boLoc !== "tat_ca") params.boLoc = thamSo.boLoc;

  const res = await apiClient.get<{
    success: boolean;
    data: KetQuaDanhSachTonKho;
  }>("/admin/inventory", { params });
  return res.data.data;
}

/**
 * Lấy chi tiết tồn kho của một biến thể.
 * GET /api/admin/inventory/variants/:variantId
 */
export async function layChiTietBienThe(variantId: number): Promise<MucTonKho> {
  const res = await apiClient.get<{ success: boolean; data: MucTonKho }>(
    `/admin/inventory/variants/${variantId}`
  );
  return res.data.data;
}

/**
 * Lấy danh sách đơn hàng đang chờ xuất phôi áo cho biến thể.
 * GET /api/admin/inventory/variants/:variantId/pending-orders
 */
export async function layDonChoXuat(variantId: number): Promise<DonChoXuat[]> {
  const res = await apiClient.get<{ success: boolean; data: DonChoXuat[] }>(
    `/admin/inventory/variants/${variantId}/pending-orders`
  );
  return res.data.data;
}

/**
 * Lấy lịch sử biến động tồn kho gần đây của biến thể.
 * GET /api/admin/inventory/variants/:variantId/history
 */
export async function layLichSuBienDong(
  variantId: number
): Promise<LichSuBienDong[]> {
  const res = await apiClient.get<{ success: boolean; data: LichSuBienDong[] }>(
    `/admin/inventory/variants/${variantId}/history`
  );
  return res.data.data;
}

/**
 * Ghi nhận giao dịch nhập/xuất/điều chỉnh kho.
 * POST /api/admin/inventory/transactions
 */
export async function ghiGiaoDichKho(
  payload: GhiGiaoDichInput
): Promise<KetQuaGhiGiaoDich> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: KetQuaGhiGiaoDich;
  }>("/admin/inventory/transactions", payload);
  return res.data.data;
}
