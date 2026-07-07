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
import type { DesignElement, ShirtType, ShirtView } from "@/store/useDesignStore";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Trạng thái thiết kế khách hàng */
export type TrangThaiThietKe = "cho_kiem_tra" | "can_chinh_sua" | "da_duyet" | "nhap";

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

export type ChiTietThietKe = ThietKe & {
  ghiChu: string | null;
};

/** Dữ liệu canvas trả về khi Admin mở Editor sửa thiết kế */
export type CanvasDataThietKe = {
  id: number;
  maThietKe: string;
  tenThietKe: string;
  mauAo: string;
  tenSanPham: string;
  trangThai: TrangThaiThietKe;
  canvasData: {
    version: number;
    shirtType: ShirtType;
    shirtView: ShirtView;
    logicalCanvas: { width: number; height: number };
    elements: DesignElement[];
  } | null;
};

/** Input cho API sửa thiết kế */
export type SuaThietKeInput = {
  canvasData: {
    version: number;
    shirtType: ShirtType;
    shirtView: ShirtView;
    logicalCanvas: { width: number; height: number };
    elements: DesignElement[];
  };
  previewUrl: string;
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
  design_id?: number;
  tu_khoa?: string;
  trang_thai?: string;
  vi_tri_in?: string;
  tu_ngay?: string;
  den_ngay?: string;
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
  ngayDatDon: string;          // CustomerOrder.createdAt, format DD/MM/YYYY
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

/** Thống kê KPI 4 thẻ đầu trang */
export type ThongKeThietKe = {
  soChoKiemTra: number;
  soCanChinhSua: number;
  soDonChoGuiXuong: number;
  soDangIn: number;
};

export type TaoThietKeChoKhachInput = {
  userId: number;
  name: string;
  shirtType: ShirtType;
  shirtColor: string;
  canvasData: {
    version: number;
    shirtType: ShirtType;
    shirtView: ShirtView;
    logicalCanvas: { width: number; height: number };
    elements: DesignElement[];
  };
  previewUrl: string;
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
 * GET /api/admin/designs?page=1&limit=10&tu_ngay=...&den_ngay=...
 */
export async function layDanhSachThietKe(
  thamSo: ThamSoLocThietKe = {}
): Promise<KetQuaThietKe> {
  // Lọc bỏ các tham số trống trước khi gửi
  const params: Record<string, string | number> = {};
  if (thamSo.page) params.page = thamSo.page;
  if (thamSo.limit) params.limit = thamSo.limit;
  if (thamSo.design_id) params.design_id = thamSo.design_id;
  if (thamSo.trang_thai) params.trang_thai = thamSo.trang_thai;
  if (thamSo.vi_tri_in) params.vi_tri_in = thamSo.vi_tri_in;
  if (thamSo.tu_khoa?.trim()) params.tu_khoa = thamSo.tu_khoa.trim();
  if (thamSo.tu_ngay) params.tu_ngay = thamSo.tu_ngay;
  if (thamSo.den_ngay) params.den_ngay = thamSo.den_ngay;

  const res = await apiClient.get<{ success: boolean; data: KetQuaThietKe }>(
    "/admin/designs",
    { params }
  );
  return res.data.data;
}

/** Lấy chi tiết một thiết kế khách hàng. */
export async function layChiTietThietKe(id: number): Promise<ChiTietThietKe> {
  const res = await apiClient.get<{ success: boolean; data: ChiTietThietKe }>(
    `/admin/designs/${id}`
  );
  return res.data.data;
}

/**
 * Lấy canvasData của thiết kế để load vào Editor khi Admin bấm "Sửa".
 * GET /api/admin/designs/:id/canvas
 */
export async function layCanvasDataThietKe(id: number): Promise<CanvasDataThietKe> {
  const res = await apiClient.get<{ success: boolean; data: CanvasDataThietKe }>(
    `/admin/designs/${id}/canvas`
  );
  return res.data.data;
}

/** Tạo một thiết kế DRAFT và gắn trực tiếp vào tài khoản khách hàng. */
export async function taoThietKeChoKhach(
  payload: TaoThietKeChoKhachInput
): Promise<{ id: number; userId: number; name: string; status: "DRAFT"; previewUrl: string }> {
  const res = await apiClient.post<{
    success: boolean;
    data: { id: number; userId: number; name: string; status: "DRAFT"; previewUrl: string };
  }>("/admin/designs/customer-drafts", payload);
  return res.data.data;
}

/**
 * Admin sửa thiết kế của khách: ghi đè canvasData + previewUrl, tự chuyển APPROVED.
 * PUT /api/admin/designs/:id/sua
 */
export async function suaThietKeChoKhach(
  id: number,
  payload: SuaThietKeInput
): Promise<{ id: number; maThietKe: string; trangThai: TrangThaiThietKe }> {
  const res = await apiClient.put<{
    success: boolean;
    data: { id: number; maThietKe: string; trangThai: TrangThaiThietKe };
  }>(`/admin/designs/${id}/sua`, payload);
  return res.data.data;
}

/** Upload ảnh trước khi đưa vào canvas để JSON không chứa blob URL tạm thời. */
export async function taiAnhThietKe(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
    "/admin/designs/assets",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.data.url;
}

// ─── ĐƠN CẦN IN ────────────────────────────────────────────────────────────

/**
 * Lấy danh sách đơn cần in.
 * GET /api/admin/designs/don-can-in?page=1&limit=10&trang_thai=cho_gui_xuong&tu_ngay=...&den_ngay=...
 */
export async function layDanhSachDonCanIn(
  thamSo: {
    page?: number;
    limit?: number;
    tu_khoa?: string;
    trang_thai?: string;
    tu_ngay?: string;
    den_ngay?: string;
  } = {}
): Promise<KetQuaDonCanIn> {
  const params: Record<string, string | number> = {};
  if (thamSo.page) params.page = thamSo.page;
  if (thamSo.limit) params.limit = thamSo.limit;
  if (thamSo.tu_khoa?.trim()) params.tu_khoa = thamSo.tu_khoa.trim();
  if (thamSo.trang_thai) params.trang_thai = thamSo.trang_thai;
  if (thamSo.tu_ngay) params.tu_ngay = thamSo.tu_ngay;
  if (thamSo.den_ngay) params.den_ngay = thamSo.den_ngay;

  const res = await apiClient.get<{ success: boolean; data: KetQuaDonCanIn }>(
    "/admin/designs/don-can-in",
    { params }
  );
  return res.data.data;
}

/** Cập nhật một bước tiến độ in; backend sẽ chặn bỏ qua hoặc lùi trạng thái. */
export async function capNhatTrangThaiDonIn(
  id: number,
  trangThai: Exclude<TrangThaiDonIn, "cho_gui_xuong">
): Promise<{ id: number; trangThai: TrangThaiDonIn; productionStatus: string }> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { id: number; trangThai: TrangThaiDonIn; productionStatus: string };
  }>(`/admin/designs/don-can-in/${id}/trang-thai`, { trangThai });
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
 * Thêm sticker mới. Backend sẽ upload file ảnh lên Cloudinary.
 * POST /api/admin/designs/stickers
 */
export async function themSticker(payload: {
  ten: string;
  anh: File;
  loai: "logo" | "hinh_ve" | "chu_viet";
}): Promise<Sticker> {
  const formData = new FormData();
  formData.append("ten", payload.ten);
  formData.append("loai", payload.loai);
  formData.append("anh", payload.anh);

  const res = await apiClient.post<{ success: boolean; data: Sticker }>(
    "/admin/designs/stickers",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
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
