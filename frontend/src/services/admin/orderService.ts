/**
 * orderService.ts – Service gọi API đơn hàng Admin.
 *
 * Tất cả gọi API liên quan đến đơn hàng đều tập trung ở đây.
 * Component không được gọi axios trực tiếp – phải đi qua service này.
 *
 * Dùng kết hợp với React Query:
 *   const { data } = useQuery({ queryKey: ["orders"], queryFn: orderService.layDanhSachDonHang })
 */

import apiClient from "@/lib/apiClient";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Thông tin thanh toán trong đơn hàng */
export type ThanhToanInfo = {
  phuongThuc: string;
  loai?: string;
  soTienVnd?: number;
  daThanh: boolean;
  status?: string | null;
  paidAt?: string | null;
  transactionId?: string | null;
  paymentUrl?: string | null;
  expiresAt?: string | null;
};

/** Thông tin sản phẩm tóm tắt (dùng trong bảng) */
export type SanPhamTomTat = {
  ten: string;
  loai: "custom_design" | "ao_mau";
  sizes: string;
  anhUrl: string | null;
  soSanPhamKhac?: number;
  tongSoLuong?: number;
};

/** Một dòng sản phẩm trong chi tiết đơn hàng */
export type ChiTietDonHangItem = {
  id: number;
  productId: number;
  variantId: number;
  designId: number | null;
  tenSanPham: string;
  mauSac: string;
  kichCo: string;
  sku: string;
  soLuong: number;
  donGiaVnd: number;
  phiThietKeVnd: number;
  thanhTienVnd: number;
  loai: "custom_design" | "ao_mau";
  anhUrl: string | null;
  anhXemTruocThietKe: string | null;
  viTriIn: string | null;
  phuongPhapIn: string | null;
};

/** Một đơn hàng trong danh sách */
export type DonHang = {
  id: number;
  maDonHang: string;
  ngayTao: string;
  tenKhachHang: string;
  sdtKhachHang: string;
  sanPham: SanPhamTomTat;
  tongTienVnd: number;
  thanhToan: ThanhToanInfo;
  trangThai: string;
  daXuatThongSoIn: boolean;
};

/** Một bước trong timeline lịch sử xử lý đơn */
export type BuocTimeline = {
  moTa: string;
  thoiGian: string;
  nguoiThucHien: string;
  laDangHienTai: boolean;
};

/** Chi tiết đầy đủ của 1 đơn hàng (dùng cho Drawer) */
export type ChiTietDonHang = DonHang & {
  items: ChiTietDonHangItem[];
  emailKhachHang: string;
  tamTinhVnd: number;
  phiThietKeVnd: number;
  phiVanChuyenVnd: number;
  giamGiaVnd: number;
  tienCocVnd: number;
  tienThuHoCodVnd: number;
  diaChiGiaoHang: string;
  donViVanChuyen: string;
  maVanDon: string | null;
  lyDoHuy: string | null;
  viTriIn: string | null;
  phuongPhapIn: string | null;
  anhXemTruocThietKe: string | null;
  thoiGianXuLy: BuocTimeline[];
};

/** Dữ liệu 4 thẻ KPI thống kê */
export type ThongKeDonHang = {
  donMoi: number;
  dangXuLyIn: number;
  choThanhToan: number;
  hoanTatHomNay: number;
};

/** Kết quả trả về khi lấy danh sách */
export type KetQuaDanhSach = {
  danhSach: DonHang[];
  tongSo: number;
  trang: number;
  soMoiTrang: number;
  tongSoTrang: number;
};

/** Tham số lọc khi lấy danh sách */
export type ThamSoLocDonHang = {
  trang?: number;
  soMoiTrang?: number;
  trangThai?: string;
  thanhToan?: string;
  thoiGian?: string;
  tuNgay?: string;
  denNgay?: string;
  loai?: string;
  tuKhoa?: string;
};

// =====================================================================
// CÁC HÀM GỌI API
// =====================================================================

/**
 * Lấy thống kê KPI (4 thẻ đầu trang).
 * GET /api/admin/orders/stats
 */
export async function layThongKeDonHang(): Promise<ThongKeDonHang> {
  const res = await apiClient.get<{ success: boolean; data: ThongKeDonHang }>(
    "/admin/orders/stats"
  );
  return res.data.data;
}

/**
 * Lấy danh sách đơn hàng (phân trang + lọc).
 * GET /api/admin/orders?trang=1&soMoiTrang=10&...
 */
export async function layDanhSachDonHang(
  thamSo: ThamSoLocDonHang = {}
): Promise<KetQuaDanhSach> {
  // Lọc bỏ các tham số trống/mặc định trước khi gửi lên server
  const params: Record<string, string | number> = {};

  if (thamSo.trang) params.trang = thamSo.trang;
  if (thamSo.soMoiTrang) params.soMoiTrang = thamSo.soMoiTrang;
  if (thamSo.trangThai && thamSo.trangThai !== "tat_ca") params.trangThai = thamSo.trangThai;
  if (thamSo.thanhToan && thamSo.thanhToan !== "tat_ca") params.thanhToan = thamSo.thanhToan;
  if (thamSo.thoiGian && thamSo.thoiGian !== "tat_ca") params.thoiGian = thamSo.thoiGian;
  if (thamSo.tuNgay) params.tuNgay = thamSo.tuNgay;
  if (thamSo.denNgay) params.denNgay = thamSo.denNgay;
  if (thamSo.loai && thamSo.loai !== "tat_ca") params.loai = thamSo.loai;
  if (thamSo.tuKhoa && thamSo.tuKhoa.trim()) params.tuKhoa = thamSo.tuKhoa.trim();

  const res = await apiClient.get<{ success: boolean; data: KetQuaDanhSach }>(
    "/admin/orders",
    { params }
  );
  return res.data.data;
}

/**
 * Lấy chi tiết 1 đơn hàng.
 * GET /api/admin/orders/:id
 */
export async function layChiTietDonHang(id: number): Promise<ChiTietDonHang> {
  const res = await apiClient.get<{ success: boolean; data: ChiTietDonHang }>(
    `/admin/orders/${id}`
  );
  return res.data.data;
}

/**
 * Cập nhật trạng thái đơn hàng.
 * PATCH /api/admin/orders/:id/status
 */
export async function capNhatTrangThaiDonHang(
  id: number,
  trangThai: string
): Promise<{ id: number; trangThai: string }> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { id: number; trangThai: string };
  }>(`/admin/orders/${id}/status`, { trangThai });
  return res.data.data;
}

/**
 * Hủy đơn hàng kèm lý do.
 * PATCH /api/admin/orders/:id/cancel
 */
export async function huyDonHang(
  id: number,
  lyDo: string
): Promise<{ id: number; trangThai: string }> {
  const res = await apiClient.patch<{
    success: boolean;
    data: { id: number; trangThai: string };
  }>(`/admin/orders/${id}/cancel`, { lyDo });
  return res.data.data;
}

export type KetQuaTaoLaiMaVnpay = {
  paymentUrl: string;
  paymentUrlExpiresAt: string;
  transactionId: string;
};

/**
 * Tạo lại mã thanh toán VNPAY đã hết hạn.
 * POST /api/admin/orders/:id/vnpay/recreate
 */
export async function taoLaiMaThanhToanVnpay(
  id: number
): Promise<KetQuaTaoLaiMaVnpay> {
  const res = await apiClient.post<{
    success: boolean;
    data: KetQuaTaoLaiMaVnpay;
  }>(`/admin/orders/${id}/vnpay/recreate`);
  return res.data.data;
}

// =====================================================================
// TYPES & FUNCTIONS CHO FORM TẠO ĐƠN MỚI
// =====================================================================

/** Thông tin khách hàng (kết quả search) */
export type KhachHang = {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string;
};

/** Địa chỉ giao hàng của khách */
export type DiaChiGiaoHang = {
  id: number;
  tenNguoiNhan: string;
  soDienThoai: string;
  diaChiCuThe: string;
  phuong: string;
  quan: string;
  thanhPho: string;
  laMacDinh: boolean;
  diaChiDayDu: string;
};

/** Biến thể sản phẩm (màu, size, tồn kho) */
export type BienTheSanPham = {
  id: number;
  mau: string;
  kichCo: string;
  sku: string;
  tonKho: number;
};

/** Mức giá sỉ (BulkPricing) */
export type MucGiaSi = {
  id: number;
  soLuongToiThieu: number;
  phanTramGiam: number;
  giaPreview: number;
};

/** Sản phẩm kết quả tìm kiếm (gồm biến thể + giá sỉ) */
export type SanPhamTimKiem = {
  id: number;
  ten: string;
  giaGoc: number;
  chatLieu: string;
  dang: string;
  anhUrl: string | null;
  bienThe: BienTheSanPham[];
  bangGiaSi: MucGiaSi[];
};

/** Thiết kế đã APPROVED của khách */
export type ThietKe = {
  id: number;
  productId: number;
  variantId: number | null;
  tenSanPham: string;
  mauNen: string;
  anhXemTruoc: string;
  phiThietKe: number;
  trangThai: string;
  ngayTao: string;
};

/** Mã khuyến mãi còn hiệu lực */
export type KhuyenMai = {
  id: number;
  ma: string;
  loaiGiam: "PERCENT" | "FIXED";
  giaTriGiam: number;
  donHangToiThieu: number;
  ngayKetThuc: string;
  daUsed: number;
  usageLimit: number;
};

/** Một dòng item trong đơn (payload gửi lên backend) */
export type OrderItemInput = {
  variantId: number;
  quantity: number;
  designId?: number | null;
};

/** Payload tạo đơn mới */
export type TaoMoiDonHangInput = {
  userId: number;
  addressId: number;
  items: OrderItemInput[];
  paymentMethod: "COD" | "VNPAY" | "CASH";
  paymentType: "FULL" | "DEPOSIT";
  shippingFee: number;
  promotionId?: number | null;
};

/** Kết quả trả về sau khi tạo đơn thành công */
export type KetQuaTaoMoiDonHang = {
  id: number;
  orderCode: string;
  totalAmount: number;
  depositPercent: number;
  depositAmount: number;
  codAmount: number;
  paymentAmount: number;
  paymentUrl: string | null;
  paymentUrlExpiresAt: string | null;
};

/**
 * Tìm kiếm khách hàng theo tên / SĐT / email.
 * GET /api/admin/orders/search/customers?q=<keyword>
 */
export async function timKiemKhachHang(keyword: string): Promise<KhachHang[]> {
  const res = await apiClient.get<{ success: boolean; data: KhachHang[] }>(
    "/admin/orders/search/customers",
    { params: { q: keyword } }
  );
  return res.data.data;
}

/**
 * Lấy danh sách địa chỉ giao hàng của khách.
 * GET /api/admin/orders/customers/:userId/addresses
 */
export async function layDiaChiKhachHang(userId: number): Promise<DiaChiGiaoHang[]> {
  const res = await apiClient.get<{ success: boolean; data: DiaChiGiaoHang[] }>(
    `/admin/orders/customers/${userId}/addresses`
  );
  return res.data.data;
}

/**
 * Tìm kiếm sản phẩm (kèm biến thể + BulkPricing).
 * GET /api/admin/orders/search/products?q=<keyword>
 */
export async function timKiemSanPham(keyword: string): Promise<SanPhamTimKiem[]> {
  const res = await apiClient.get<{ success: boolean; data: SanPhamTimKiem[] }>(
    "/admin/orders/search/products",
    { params: { q: keyword } }
  );
  return res.data.data;
}

/**
 * Tìm thiết kế APPROVED của khách.
 * GET /api/admin/orders/search/designs?userId=<id>&q=<keyword>
 */
export async function timKiemThietKe(userId: number, keyword?: string): Promise<ThietKe[]> {
  const res = await apiClient.get<{ success: boolean; data: ThietKe[] }>(
    "/admin/orders/search/designs",
    { params: { userId, q: keyword || "" } }
  );
  return res.data.data;
}

/**
 * Lấy danh sách mã khuyến mãi còn hiệu lực.
 * GET /api/admin/orders/promotions
 */
export async function layDanhSachKhuyenMai(): Promise<KhuyenMai[]> {
  const res = await apiClient.get<{ success: boolean; data: KhuyenMai[] }>(
    "/admin/orders/promotions"
  );
  return res.data.data;
}

/**
 * Tạo đơn hàng mới.
 * POST /api/admin/orders
 */
export async function taoMoiDonHang(
  payload: TaoMoiDonHangInput
): Promise<KetQuaTaoMoiDonHang> {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: KetQuaTaoMoiDonHang;
  }>("/admin/orders", payload);
  return res.data.data;
}
