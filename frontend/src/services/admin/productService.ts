/**
 * productService.ts – Service gọi API phôi áo (Admin).
 *
 * Tất cả gọi API liên quan đến phôi áo đều tập trung ở đây.
 * Component không được gọi axios trực tiếp – phải đi qua service này.
 *
 * Dùng kết hợp với React Query:
 *   const { data } = useQuery({ queryKey: ["products"], queryFn: productService.layDanhSachSanPham })
 */

import apiClient from "@/lib/apiClient";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Trạng thái hiển thị của phôi áo */
export type TrangThaiHienThi = "dang_hien_thi" | "dang_an";

/** Trạng thái tồn kho của biến thể */
export type TrangThaiTonKho = "con_hang" | "sap_het" | "het_hang";

/** Một biến thể (màu × size) của phôi áo */
export type BienTheSanPham = {
  id: number;
  /** Tên màu, ví dụ: "Đen", "Trắng" */
  colorName: string;
  /** Mã hex để vẽ chấm màu */
  colorHex: string;
  /** Kích thước, ví dụ: "S", "M", "L", "XL" */
  size: string;
  /** Mã SKU định danh duy nhất */
  sku: string;
  /** Số lượng tồn kho */
  stock: number;
  /** Trạng thái tồn kho tự động tính từ stockQty */
  inventoryStatus: TrangThaiTonKho;
};

/** Một phôi áo (blank product) trong danh sách */
export type SanPham = {
  id: number;
  /** Tên phôi áo */
  name: string;
  /** Slug URL-friendly */
  slug: string;
  /** Tên danh mục */
  category: string;
  /** Chất liệu, ví dụ: "Cotton 100% 250gsm" */
  material: string;
  /** Form dáng, ví dụ: "Oversized fit" */
  fit: string;
  /** Giá nền tính theo VNĐ */
  basePrice: number;
  /** Trạng thái hiển thị trên cửa hàng */
  displayStatus: TrangThaiHienThi;
  /** Danh sách biến thể */
  variants: BienTheSanPham[];
};

/** 4 thẻ KPI thống kê đầu trang */
export type ThongKeSanPham = {
  tongPhoi: number;
  dangHienThi: number;
  tongBienThe: number;
  sapHetHang: number;
};

/** Một danh mục sản phẩm */
export type DanhMuc = {
  id: number;
  ten: string;
};

/** Mức độ cảnh báo tồn kho */
export type MucDoCanhBao = "sap_het" | "het_hang";

/** Một mục trong panel cảnh báo tồn kho */
export type CanhBaoTonKho = {
  id: number;
  productName: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  stock: number;
  severity: MucDoCanhBao;
};

/** Kết quả trả về khi lấy danh sách phân trang */
export type KetQuaDanhSachSanPham = {
  danhSach: SanPham[];
  tongSo: number;
  trang: number;
  soMoiTrang: number;
  tongSoTrang: number;
};

/** Tham số lọc khi lấy danh sách phôi áo */
export type ThamSoLocSanPham = {
  trang?: number;
  soMoiTrang?: number;
  tuKhoa?: string;
  danhMuc?: string;
  trangThai?: string;
  tonKho?: string;
};

/** Payload tạo phôi áo mới */
export type TaoSanPhamInput = {
  categoryId: number;
  name: string;
  basePrice: number;
  material: string;
  form: string;
  madeIn: string;
  description: string;
  slug?: string;
};

/** Payload cập nhật phôi áo */
export type CapNhatSanPhamInput = Partial<TaoSanPhamInput>;

/** Payload thêm biến thể */
export type ThemBienTheInput = {
  color: string;
  size: string;
  sku: string;
  stockQty?: number;
};

/** Payload cập nhật biến thể */
export type CapNhatBienTheInput = Partial<ThemBienTheInput>;

// =====================================================================
// CÁC HÀM GỌI API
// =====================================================================

/**
 * Lấy thống kê KPI (4 thẻ đầu trang).
 * GET /api/admin/products/stats
 */
export async function layThongKeSanPham(): Promise<ThongKeSanPham> {
  const res = await apiClient.get<{ success: boolean; data: ThongKeSanPham }>(
    "/admin/products/stats"
  );
  return res.data.data;
}

/**
 * Lấy danh sách danh mục cho dropdown filter.
 * GET /api/admin/products/categories
 */
export async function layDanhMucSanPham(): Promise<DanhMuc[]> {
  const res = await apiClient.get<{ success: boolean; data: DanhMuc[] }>(
    "/admin/products/categories"
  );
  return res.data.data;
}

/**
 * Lấy danh sách cảnh báo tồn kho thấp (panel bên phải).
 * GET /api/admin/products/inventory-alerts
 */
export async function layCanhBaoTonKho(): Promise<CanhBaoTonKho[]> {
  const res = await apiClient.get<{ success: boolean; data: CanhBaoTonKho[] }>(
    "/admin/products/inventory-alerts"
  );
  return res.data.data;
}

/**
 * Lấy danh sách phôi áo (phân trang + lọc).
 * GET /api/admin/products?trang=1&soMoiTrang=10&...
 */
export async function layDanhSachSanPham(
  thamSo: ThamSoLocSanPham = {}
): Promise<KetQuaDanhSachSanPham> {
  const params: Record<string, string | number> = {};

  if (thamSo.trang) params.trang = thamSo.trang;
  if (thamSo.soMoiTrang) params.soMoiTrang = thamSo.soMoiTrang;
  if (thamSo.tuKhoa && thamSo.tuKhoa.trim()) params.tuKhoa = thamSo.tuKhoa.trim();
  if (thamSo.danhMuc && thamSo.danhMuc.trim()) params.danhMuc = thamSo.danhMuc.trim();
  if (thamSo.trangThai && thamSo.trangThai.trim()) params.trangThai = thamSo.trangThai.trim();
  if (thamSo.tonKho && thamSo.tonKho !== "tat_ca") params.tonKho = thamSo.tonKho;

  const res = await apiClient.get<{
    success: boolean;
    data: KetQuaDanhSachSanPham;
  }>("/admin/products", { params });
  return res.data.data;
}

/**
 * Lấy chi tiết 1 phôi áo.
 * GET /api/admin/products/:id
 */
export async function layChiTietSanPham(id: number): Promise<SanPham> {
  const res = await apiClient.get<{ success: boolean; data: SanPham }>(
    `/admin/products/${id}`
  );
  return res.data.data;
}

/**
 * Tạo phôi áo mới.
 * POST /api/admin/products
 */
export async function taoSanPham(
  payload: TaoSanPhamInput
): Promise<{ id: number; name: string; slug: string; trangThai: string }> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: { id: number; name: string; slug: string; trangThai: string };
  }>("/admin/products", payload);
  return res.data.data;
}

/**
 * Cập nhật thông tin phôi áo.
 * PUT /api/admin/products/:id
 */
export async function capNhatSanPham(
  id: number,
  payload: CapNhatSanPhamInput
): Promise<SanPham> {
  const res = await apiClient.put<{ success: boolean; message: string; data: SanPham }>(
    `/admin/products/${id}`,
    payload
  );
  return res.data.data;
}

/**
 * Bật/tắt hiển thị phôi áo trên cửa hàng.
 * PATCH /api/admin/products/:id/status
 */
export async function capNhatTrangThaiSanPham(
  id: number,
  trangThai: TrangThaiHienThi
): Promise<{ id: number; trangThai: TrangThaiHienThi }> {
  const res = await apiClient.patch<{
    success: boolean;
    message: string;
    data: { id: number; trangThai: TrangThaiHienThi };
  }>(`/admin/products/${id}/status`, { trangThai });
  return res.data.data;
}

/**
 * Xóa phôi áo (sẽ lỗi nếu còn đơn hàng).
 * DELETE /api/admin/products/:id
 */
export async function xoaSanPham(id: number): Promise<{ id: number }> {
  const res = await apiClient.delete<{
    success: boolean;
    message: string;
    data: { id: number };
  }>(`/admin/products/${id}`);
  return res.data.data;
}

/**
 * Thêm biến thể mới cho phôi áo.
 * POST /api/admin/products/:id/variants
 */
export async function themBienThe(
  productId: number,
  payload: ThemBienTheInput
): Promise<BienTheSanPham> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: BienTheSanPham;
  }>(`/admin/products/${productId}/variants`, payload);
  return res.data.data;
}

/**
 * Cập nhật biến thể.
 * PUT /api/admin/products/:id/variants/:variantId
 */
export async function capNhatBienThe(
  productId: number,
  variantId: number,
  payload: CapNhatBienTheInput
): Promise<BienTheSanPham> {
  const res = await apiClient.put<{
    success: boolean;
    message: string;
    data: BienTheSanPham;
  }>(`/admin/products/${productId}/variants/${variantId}`, payload);
  return res.data.data;
}
