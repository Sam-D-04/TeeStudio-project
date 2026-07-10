/**
 * statisticsService.ts – Service gọi API trang Theo dõi & Thống kê (Admin).
 *
 * Tất cả gọi API thống kê đều tập trung ở đây.
 * Component không được gọi axios trực tiếp – phải đi qua service này.
 *
 * Dùng kết hợp với React Query:
 *   const { data } = useQuery({
 *     queryKey: ["statistics/chi-so", tuNgay, denNgay],
 *     queryFn: () => statisticsService.layChiSo(tuNgay, denNgay),
 *   });
 */

import apiClient from "@/lib/apiClient";
import { downloadExcelReport } from "@/lib/downloadExcelReport";

// =====================================================================
// KIỂU DỮ LIỆU – khớp với response từ Backend
// =====================================================================

/** Khoảng thời gian dùng cho query */
export type KhoangThoiGian = {
  tuNgay: string;
  denNgay: string;
};

/** Thay đổi so sánh với kỳ trước (đơn vị: %) */
export type SoSanhKyTruoc = {
  doanhThuPhanTram: number;
  soDonPhanTram: number;
  soSanPhamPhanTram: number;
  giaTriTBDonPhanTram: number;
};

/** 4 thẻ chỉ số tổng hợp */
export type ChiSoTongHop = {
  doanhThuVnd: number;
  soDonHang: number;
  soSanPhamBanRa: number;
  giaTriTrungBinhDonVnd: number;
  soSanhKyTruoc: SoSanhKyTruoc;
  doiSoatBaoCao?: {
    doanhThuGhiNhanVnd: number;
    tienDaThuTrongKyVnd: number;
    dongTienCodDangTreoVnd: number;
    tongGiaTriDonHangVnd: number;
    soDonHoanTat: number;
    soDonDaThanhToanDu: number;
    soDonChoDoiSoatCod: number;
    tyLeHuyDon: number;
  };
  khoangThoiGian: KhoangThoiGian;
};

/** Một điểm dữ liệu trên biểu đồ doanh thu */
export type DiemBieuDoThongKe = {
  nhan: string;
  doanhThuVnd: number;
  soDon: number;
};

/** Đơn vị nhóm biểu đồ */
export type StatisticsGroupBy = "day" | "month";

/** Dữ liệu biểu đồ doanh thu */
export type DuLieuBieuDoThongKe = {
  danhSach: DiemBieuDoThongKe[];
  groupBy: StatisticsGroupBy;
  khoangThoiGian: KhoangThoiGian;
};

/** Một sản phẩm bán chạy */
export type SanPhamThongKe = {
  productId: number;
  name: string;
  imageUrl: string | null;
  bienThePhoBien: string;
  tongDoanhThu: number;
  tongSoLuong: number;
};

/** Một mục phân bổ (dùng cho DistributionPanel) */
export type PhanBoItem = {
  label: string;
  value: number;
  displayValue: string;
  color: string;
};

/** Phân bổ trạng thái đơn hàng và tình trạng thanh toán */
export type PhanBoTrangThai = {
  trangThaiDon: PhanBoItem[];
  trangThaiThanhToan: PhanBoItem[];
  khoangThoiGian: KhoangThoiGian;
};

// =====================================================================
// CÁC HÀM GỌI API
// =====================================================================

/**
 * Lấy 4 thẻ chỉ số tổng hợp + so sánh kỳ trước.
 * GET /api/admin/statistics/chi-so
 */
export async function layChiSo(
  tuNgay?: string,
  denNgay?: string
): Promise<ChiSoTongHop> {
  const params: Record<string, string> = {};
  if (tuNgay) params.tuNgay = tuNgay;
  if (denNgay) params.denNgay = denNgay;

  const res = await apiClient.get<{ success: boolean; data: ChiSoTongHop }>(
    "/admin/statistics/chi-so",
    { params }
  );
  return res.data.data;
}

/**
 * Lấy dữ liệu biểu đồ doanh thu.
 * Backend tự chọn nhóm theo ngày hoặc tháng.
 * GET /api/admin/statistics/bieu-do
 */
export async function layBieuDo(
  tuNgay?: string,
  denNgay?: string
): Promise<DuLieuBieuDoThongKe> {
  const params: Record<string, string> = {};
  if (tuNgay) params.tuNgay = tuNgay;
  if (denNgay) params.denNgay = denNgay;

  const res = await apiClient.get<{ success: boolean; data: DuLieuBieuDoThongKe }>(
    "/admin/statistics/bieu-do",
    { params }
  );
  return res.data.data;
}

/**
 * Lấy top sản phẩm bán chạy kèm ảnh thumbnail.
 * GET /api/admin/statistics/top-san-pham
 */
export async function layTopSanPham(
  tuNgay?: string,
  denNgay?: string,
  limit = 5
): Promise<SanPhamThongKe[]> {
  const params: Record<string, string | number> = { limit };
  if (tuNgay) params.tuNgay = tuNgay;
  if (denNgay) params.denNgay = denNgay;

  const res = await apiClient.get<{ success: boolean; data: SanPhamThongKe[] }>(
    "/admin/statistics/top-san-pham",
    { params }
  );
  return res.data.data;
}

/**
 * Lấy phân bổ trạng thái đơn hàng VÀ tình trạng thanh toán (1 lần gọi).
 * GET /api/admin/statistics/phan-bo
 */
export async function layPhanBoTrangThai(
  tuNgay?: string,
  denNgay?: string
): Promise<PhanBoTrangThai> {
  const params: Record<string, string> = {};
  if (tuNgay) params.tuNgay = tuNgay;
  if (denNgay) params.denNgay = denNgay;

  const res = await apiClient.get<{ success: boolean; data: PhanBoTrangThai }>(
    "/admin/statistics/phan-bo",
    { params }
  );
  return res.data.data;
}

/**
 * Xuất báo cáo tổng hợp theo khoảng thời gian đang xem ở trang Thống kê.
 *
 * GET /api/admin/statistics/xuat-bao-cao
 */
export async function xuatBaoCaoThongKe(
  tuNgay: string,
  denNgay: string
): Promise<string> {
  return downloadExcelReport(
    "/admin/statistics/xuat-bao-cao",
    { tuNgay, denNgay },
    `bao-cao-thong-ke-${tuNgay}-den-${denNgay}.xlsx`
  );
}
