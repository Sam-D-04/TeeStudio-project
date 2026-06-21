/**
 * designService.ts – Service gọi API Thiết kế & In ấn Admin.
 *
 * Tất cả gọi API liên quan đến thiết kế đều tập trung ở đây.
 * Component không được gọi axios trực tiếp – phải đi qua service này.
 *
 * Dùng kết hợp với React Query:
 *   const { data } = useQuery({ queryKey: ["thiet-ke"], queryFn: designService.layDanhSachThietKe })
 */

import apiClient from "@/lib/apiClient";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Trạng thái thiết kế khách hàng */
export type TrangThaiThietKe = "cho_kiem_tra" | "can_chinh_sua" | "da_duyet";

/** Một thiết kế trong bảng danh sách */
export type ThietKe = {
  id: number;
  maThietKe: string;           // Dạng "TK-0001"
  urlPreview: string | null;   // URL ảnh preview trên Cloudinary (null nếu chưa có)
  mauAo: string;               // Mã hex màu áo, ví dụ "#000000"
  tenKhachHang: string;
  soDienThoai: string | null;
  tenSanPham: string;
  tenMauAo: string;
  viTriIn: string;
  trangThai: TrangThaiThietKe;
  ngayGui: string;             // Format DD/MM/YYYY
};

/** Kết quả danh sách thiết kế có phân trang */
export type KetQuaThietKe = {
  danhSach: ThietKe[];
  tongSo: number;
  trang: number;
  soTrangMoiTrang: number;
  tongSoTrang: number;
};

/** Tham số lọc bảng thiết kế */
export type ThamSoLocThietKe = {
  page?: number;
  limit?: number;
  tu_khoa?: string;
  trang_thai?: string;
  vi_tri_in?: string;
};

/** Trạng thái đơn cần in */
export type TrangThaiDonIn = "cho_gui_xuong" | "dang_in" | "da_in_xong";

/** Một đơn cần in trong bảng */
export type DonCanIn = {
  id: number;
  maDon: string;
  maThietKe: string;
  urlPreview: string | null;
  mauAo: string;
  tenKhachHang: string;
  soLuong: number;
  viTriIn: string;
  trangThai: TrangThaiDonIn;
  ngayTao: string;
};

/** Kết quả danh sách đơn cần in có phân trang */
export type KetQuaDonCanIn = {
  danhSach: DonCanIn[];
  tongSo: number;
  trang: number;
  soTrangMoiTrang: number;
  tongSoTrang: number;
};

/** Một sticker */
export type Sticker = {
  id: number;
  ten: string;
  urlAnh: string;
  loai: "logo" | "hinh_ve" | "chu_viet";
};

/** Một vị trí in */
export type ViTriIn = {
  id: number;
  ten: string;
  moTa: string;
  dangHoatDong: boolean;
};

/** Thống kê KPI 4 thẻ đầu trang */
export type ThongKeThietKe = {
  soChoKiemTra: number;
  soCanChinhSua: number;
  soDonChoGuiXuong: number;
  soDangIn: number;
};

// =====================================================================
// CÁC HÀM GỌI API
// =====================================================================

// ─── KPI ────────────────────────────────────────────────────────────────────

/**
 * Lấy thống kê KPI (4 thẻ đầu trang).
 * GET /api/admin/designs/stats
 */
export async function layThongKeThietKe(): Promise<ThongKeThietKe> {
  const res = await apiClient.get<{ success: boolean; data: ThongKeThietKe }>(
    "/admin/designs/stats"
  );
  return res.data.data;
}

// ─── THIẾT KẾ KHÁCH HÀNG ───────────────────────────────────────────────────

/**
 * Lấy danh sách thiết kế (phân trang + lọc).
 * GET /api/admin/designs?page=1&limit=10&...
 */
export async function layDanhSachThietKe(
  thamSo: ThamSoLocThietKe = {}
): Promise<KetQuaThietKe> {
  // Lọc bỏ các tham số trống trước khi gửi
  const params: Record<string, string | number> = {};
  if (thamSo.page) params.page = thamSo.page;
  if (thamSo.limit) params.limit = thamSo.limit;
  if (thamSo.trang_thai) params.trang_thai = thamSo.trang_thai;
  if (thamSo.vi_tri_in) params.vi_tri_in = thamSo.vi_tri_in;
  if (thamSo.tu_khoa?.trim()) params.tu_khoa = thamSo.tu_khoa.trim();

  const res = await apiClient.get<{ success: boolean; data: KetQuaThietKe }>(
    "/admin/designs",
    { params }
  );
  return res.data.data;
}

/**
 * Duyệt thiết kế (chuyển sang "Đã duyệt").
 * PATCH /api/admin/designs/:id/duyet
 */
export async function duyetThietKe(
  id: number
): Promise<{ id: number; maThietKe: string; trangThai: string }> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { id: number; maThietKe: string; trangThai: string };
  }>(`/admin/designs/${id}/duyet`);
  return res.data.data;
}

/**
 * Yêu cầu khách chỉnh sửa thiết kế.
 * PATCH /api/admin/designs/:id/yeu-cau-chinh-sua
 */
export async function yeuCauChinhSua(
  id: number,
  ghiChu?: string
): Promise<{ id: number; trangThai: string }> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { id: number; trangThai: string };
  }>(`/admin/designs/${id}/yeu-cau-chinh-sua`, { ghiChu: ghiChu || "" });
  return res.data.data;
}

// ─── ĐƠN CẦN IN ────────────────────────────────────────────────────────────

/**
 * Lấy danh sách đơn cần in.
 * GET /api/admin/designs/don-can-in?page=1&limit=10&trang_thai=cho_gui_xuong
 */
export async function layDanhSachDonCanIn(
  thamSo: { page?: number; limit?: number; trang_thai?: string } = {}
): Promise<KetQuaDonCanIn> {
  const params: Record<string, string | number> = {};
  if (thamSo.page) params.page = thamSo.page;
  if (thamSo.limit) params.limit = thamSo.limit;
  if (thamSo.trang_thai) params.trang_thai = thamSo.trang_thai;

  const res = await apiClient.get<{ success: boolean; data: KetQuaDonCanIn }>(
    "/admin/designs/don-can-in",
    { params }
  );
  return res.data.data;
}

/**
 * Gửi đơn đến xưởng in.
 * PATCH /api/admin/designs/don-can-in/:id/gui-xuong
 */
export async function guiDonXuongIn(
  id: number
): Promise<{ id: number; trangThai: string; ngayGuiXuong: string }> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { id: number; trangThai: string; ngayGuiXuong: string };
  }>(`/admin/designs/don-can-in/${id}/gui-xuong`);
  return res.data.data;
}

// ─── STICKER ────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách sticker.
 * GET /api/admin/designs/stickers
 */
export async function layDanhSachSticker(): Promise<Sticker[]> {
  const res = await apiClient.get<{ success: boolean; data: Sticker[] }>(
    "/admin/designs/stickers"
  );
  return res.data.data;
}

/**
 * Thêm sticker mới (nhận URL đã upload Cloudinary).
 * POST /api/admin/designs/stickers
 */
export async function themSticker(payload: {
  ten: string;
  urlAnh: string;
  loai: "logo" | "hinh_ve" | "chu_viet";
}): Promise<Sticker> {
  const res = await apiClient.post<{ success: boolean; data: Sticker }>(
    "/admin/designs/stickers",
    payload
  );
  return res.data.data;
}

/**
 * Xóa sticker.
 * DELETE /api/admin/designs/stickers/:id
 */
export async function xoaSticker(id: number): Promise<void> {
  await apiClient.delete(`/admin/designs/stickers/${id}`);
}

// ─── VỊ TRÍ IN ──────────────────────────────────────────────────────────────

/**
 * Lấy danh sách vị trí in (admin – bao gồm cả đã tắt).
 * GET /api/admin/designs/vi-tri-in
 */
export async function layDanhSachViTriIn(): Promise<ViTriIn[]> {
  const res = await apiClient.get<{ success: boolean; data: ViTriIn[] }>(
    "/admin/designs/vi-tri-in"
  );
  return res.data.data;
}

/**
 * Thêm vị trí in mới.
 * POST /api/admin/designs/vi-tri-in
 */
export async function themViTriIn(payload: {
  ten: string;
  moTa?: string;
  dangHoatDong?: boolean;
}): Promise<ViTriIn> {
  const res = await apiClient.post<{ success: boolean; data: ViTriIn }>(
    "/admin/designs/vi-tri-in",
    payload
  );
  return res.data.data;
}

/**
 * Bật/tắt vị trí in.
 * PATCH /api/admin/designs/vi-tri-in/:id
 */
export async function batTatViTriIn(
  id: number,
  dangHoatDong: boolean
): Promise<{ id: number; dangHoatDong: boolean }> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { id: number; dangHoatDong: boolean };
  }>(`/admin/designs/vi-tri-in/${id}`, { dangHoatDong });
  return res.data.data;
}

/**
 * Xóa vị trí in (chỉ khi không có thiết kế nào đang dùng).
 * DELETE /api/admin/designs/vi-tri-in/:id
 */
export async function xoaViTriIn(id: number): Promise<void> {
  await apiClient.delete(`/admin/designs/vi-tri-in/${id}`);
}
