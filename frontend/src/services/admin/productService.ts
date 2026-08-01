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
import type { ProductColor } from "@/lib/productColors";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Trạng thái hiển thị của phôi áo */
export type TrangThaiHienThi = "dang_hien_thi" | "dang_an";
export type LoaiAoThietKe = "tshirt" | "polo" | "hoodie";

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
  /** Số lượng đang được giữ cho các đơn đang xử lý */
  reserved: number;
  /** Số lượng khả dụng = stock - reserved */
  available: number;
  /** Trạng thái tồn kho tự động tính từ available */
  inventoryStatus: TrangThaiTonKho;
  /** Trạng thái hiển thị (từ DB) */
  status: string;
  /** Đã có giao dịch chưa */
  hasTransactions: boolean;
};

export type AnhSanPham = {
  id: number;
  url: string;
  altText: string;
  sortOrder?: number;
  laChinh: boolean;
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
  /** ID danh mục (chỉ có khi gọi layChiTietSanPham) */
  categoryId?: number;
  /** Loai ao dung cho trang thiet ke tuy chinh */
  shirtType?: LoaiAoThietKe;
  /** Chất liệu, ví dụ: "Cotton 100% 250gsm" */
  material: string;
  /** Form dáng, ví dụ: "Oversized fit" */
  fit: string;
  /** Xuất xứ, ví dụ: "Việt Nam" (chỉ có khi gọi layChiTietSanPham) */
  madeIn?: string;
  /** Mô tả sản phẩm (chỉ có khi gọi layChiTietSanPham) */
  description?: string;
  /** Giá nền tính theo VNĐ */
  basePrice: number;
  /** Trạng thái hiển thị trên cửa hàng */
  displayStatus: TrangThaiHienThi;
  /** Danh sách biến thể */
  variants: BienTheSanPham[];
  /** Anh phoi ao luu trong bang ProductImage */
  images?: AnhSanPham[];
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
  reserved: number;
  available: number;
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
  tonKho?: "tat_ca" | "ban_chay" | "con_hang" | "sap_het" | "het_hang";
};

/** Payload tạo phôi áo mới */
export type TaoSanPhamInput = {
  categoryId: number;
  shirtType: LoaiAoThietKe;
  name: string;
  basePrice: number;
  material: string;
  form: string;
  madeIn: string;
  description: string;
  slug?: string;
};

/** Payload cập nhật phôi áo */
export type CapNhatSanPhamInput = Partial<TaoSanPhamInput> & {
  displayStatus?: TrangThaiHienThi;
  variants?: Array<Partial<ThemBienTheInput> & { id?: number; status?: string }>;
};

/** Payload thêm biến thể */
export type ThemBienTheInput = {
  color: string;
  colorHex: string;
  size: string;
  sku: string;
};

/** Payload cập nhật biến thể */
export type CapNhatBienTheInput = Partial<ThemBienTheInput> & { status?: string };

export type UploadAnhSanPhamInput = {
  file: File;
  colorName: string;
  colorHex: string;
  viewSide: "front" | "back";
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

/** Kết quả thao tác xóa/ẩn phôi áo. */
export type KetQuaXoaSanPham = {
  id: number;
  action: "deleted" | "archived";
  affectedVariants: number;
  message: string;
};

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
 * Xóa/ẩn phôi áo theo ràng buộc nghiệp vụ.
 * DELETE /api/admin/products/:id
 */
export async function xoaSanPham(id: number): Promise<KetQuaXoaSanPham> {
  const res = await apiClient.delete<{
    success: boolean;
    message: string;
    data: Omit<KetQuaXoaSanPham, "message"> & { message?: string };
  }>(`/admin/products/${id}`);
  return {
    ...res.data.data,
    message: res.data.data.message ?? res.data.message,
  };
}

/**
 * Lấy bảng màu đã được sử dụng trong các biến thể sản phẩm.
 * GET /api/admin/products/colors
 */
export async function layBangMauSanPham(): Promise<ProductColor[]> {
  const res = await apiClient.get<{ success: boolean; data: ProductColor[] }>(
    "/admin/products/colors"
  );
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

export async function uploadAnhSanPham(
  productId: number,
  images: UploadAnhSanPhamInput[]
): Promise<AnhSanPham[]> {
  const formData = new FormData();
  const metadata = images.map((image) => ({
    colorName: image.colorName,
    colorHex: image.colorHex,
    viewSide: image.viewSide,
    altText: image.altText,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
  }));

  images.forEach((image) => {
    formData.append("images", image.file);
  });
  formData.append("metadata", JSON.stringify(metadata));

  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: AnhSanPham[];
  }>(`/admin/products/${productId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
  });

  return res.data.data;
}

export async function datAnhChinh(
  productId: number,
  imageId: number
): Promise<{ id: number; productId: number; laChinh: boolean }> {
  const res = await apiClient.patch<{
    success: boolean;
    message: string;
    data: { id: number; productId: number; laChinh: boolean };
  }>(`/admin/products/${productId}/images/${imageId}/primary`);
  return res.data.data;
}

export async function xoaAnhSanPham(
  productId: number,
  imageId: number
): Promise<{ id: number; productId: number }> {
  const res = await apiClient.delete<{
    success: boolean;
    message: string;
    data: { id: number; productId: number };
  }>(`/admin/products/${productId}/images/${imageId}`);
  return res.data.data;
}

// =====================================================================
// CRUD DANH MỤC
// =====================================================================

/** Danh mục kèm số sản phẩm (dùng cho trang quản lý) */
export type DanhMucChiTiet = {
  id: number;
  ten: string;
  soSanPham: number;
  ngayTao: string;
};

/**
 * Lấy danh sách toàn bộ danh mục kèm số sản phẩm.
 * GET /api/admin/products/categories/all
 */
export async function layDanhSachDanhMuc(): Promise<DanhMucChiTiet[]> {
  const res = await apiClient.get<{ success: boolean; data: DanhMucChiTiet[] }>(
    "/admin/products/categories/all"
  );
  return res.data.data;
}

/**
 * Tạo danh mục mới.
 * POST /api/admin/products/categories
 */
export async function taoDanhMuc(
  ten: string
): Promise<DanhMucChiTiet> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: DanhMucChiTiet;
  }>("/admin/products/categories", { ten });
  return res.data.data;
}

/**
 * Cập nhật tên danh mục.
 * PUT /api/admin/products/categories/:id
 */
export async function capNhatDanhMuc(
  id: number,
  ten: string
): Promise<{ id: number; ten: string }> {
  const res = await apiClient.put<{
    success: boolean;
    message: string;
    data: { id: number; ten: string };
  }>(`/admin/products/categories/${id}`, { ten });
  return res.data.data;
}

/**
 * Xóa danh mục.
 * DELETE /api/admin/products/categories/:id
 */
export async function xoaDanhMucService(
  id: number
): Promise<{ id: number }> {
  const res = await apiClient.delete<{
    success: boolean;
    message: string;
    data: { id: number };
  }>(`/admin/products/categories/${id}`);
  return res.data.data;
}

