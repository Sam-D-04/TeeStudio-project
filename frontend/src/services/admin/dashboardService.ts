/**
 * dashboardService.ts – Service gọi API Tổng quan vận hành (Admin Dashboard).
 *
 * Tất cả gọi API dashboard đều tập trung ở đây.
 * Component không được gọi axios trực tiếp – phải đi qua service này.
 *
 * Dùng kết hợp với React Query:
 *   const { data } = useQuery({ queryKey: ["dashboard/tong-quan", tuNgay, denNgay], queryFn: () => dashboardService.layTongQuanChiSo(tuNgay, denNgay) })
 */

import apiClient from "@/lib/apiClient";

// =====================================================================
// KIỂU DỮ LIỆU (Types) – khớp với response từ Backend
// =====================================================================

/** Khoảng thời gian dùng cho query */
export type KhoangThoiGian = {
  tuNgay: string;
  denNgay: string;
};

/** 7 chỉ số tổng quan vận hành */
export type TongQuanChiSo = {
  doanhThuThangVnd: number;
  doanhThuThietKeVnd: number;
  soDonMoi: number;
  soVariantTonKhoThap: number;
  giaTriTrungBinhDonVnd: number;
  tyLeThanhCongPhanTram: number;
  doanhThuKhacDenBuVnd: number;
  tyLeHuyPhanTram: number;
  khoangThoiGian: KhoangThoiGian;
};

/** Một điểm dữ liệu trên biểu đồ doanh thu */
export type DiemBieuDo = {
  ngay: string;       // Mốc thời gian của điểm dữ liệu
  nhan: string;       // Nhãn hiển thị trên trục X
  doanhThuVnd: number;
  soDonHoanTat: number;
};

export type DashboardGroupBy = "hour" | "day" | "month";

/** Dữ liệu biểu đồ doanh thu */
export type DuLieuBieuDo = {
  danhSach: DiemBieuDo[];
  tongDoanhThuVnd: number;
  tongDonHoanTat: number;
  doanhThuLonNhatVnd: number;
  groupBy: DashboardGroupBy;
  khoangThoiGian: KhoangThoiGian;
};

/** Trạng thái thiết kế hiển thị trên bảng (khớp với StatusBadge) */
export type TrangThaiThietKe = "pending" | "revision";

/** Một thiết kế cần xử lý */
export type ThietKeCanXuLy = {
  designId: number;
  code: string;
  orderId: number | null;
  customerName: string;
  technique: string;
  status: TrangThaiThietKe;
  isUrgent: boolean;
  ngayTao: string | null;
};

/** Một mục tồn kho cảnh báo */
export type TonKhoItem = {
  variantId: number;
  name: string;
  detail: string;
  sku: string;
  quantity: number;
};

/** Một sản phẩm bán chạy */
export type SanPhamBanChay = {
  productId: number;
  name: string;
  variant: string;
  revenue: number;
  soldQty: number;
  thumbnailClassName: string;
};

/** Tham số lọc theo thời gian */
export type ThamSoThoiGian = {
  tuNgay?: string;
  denNgay?: string;
};

export type TepBaoCaoDashboard = {
  blob: Blob;
  fileName: string;
};

// =====================================================================
// CÁC HÀM GỌI API
// =====================================================================

/**
 * Lấy 7 chỉ số tổng quan vận hành.
 * GET /api/admin/dashboard/tong-quan
 */
export async function layTongQuanChiSo(
  tuNgay?: string,
  denNgay?: string
): Promise<TongQuanChiSo> {
  const params: Record<string, string> = {};
  if (tuNgay) params.tuNgay = tuNgay;
  if (denNgay) params.denNgay = denNgay;

  const res = await apiClient.get<{ success: boolean; data: TongQuanChiSo }>(
    "/admin/dashboard/tong-quan",
    { params }
  );
  return res.data.data;
}

/**
 * Lấy dữ liệu biểu đồ doanh thu. Backend tự chọn nhóm theo giờ/ngày/tháng
 * dựa trên độ dài khoảng thời gian.
 * GET /api/admin/dashboard/bieu-do-doanh-thu
 */
export async function layDuLieuBieuDo(
  tuNgay?: string,
  denNgay?: string
): Promise<DuLieuBieuDo> {
  const params: Record<string, string> = {};
  if (tuNgay) params.tuNgay = tuNgay;
  if (denNgay) params.denNgay = denNgay;
  const res = await apiClient.get<{ success: boolean; data: DuLieuBieuDo }>(
    "/admin/dashboard/bieu-do-doanh-thu",
    { params }
  );
  return res.data.data;
}

/**
 * Lấy danh sách thiết kế cần xử lý (tối đa 5).
 * GET /api/admin/dashboard/thiet-ke-can-xu-ly
 */
export async function layThietKeCanXuLy(): Promise<ThietKeCanXuLy[]> {
  const res = await apiClient.get<{ success: boolean; data: ThietKeCanXuLy[] }>(
    "/admin/dashboard/thiet-ke-can-xu-ly"
  );
  return res.data.data;
}

/**
 * Lấy danh sách tồn kho cảnh báo.
 * GET /api/admin/dashboard/ton-kho-canh-bao
 */
export async function layTonKhoCanhBao(
  nguong = 15,
  limit = 10
): Promise<TonKhoItem[]> {
  const res = await apiClient.get<{ success: boolean; data: TonKhoItem[] }>(
    "/admin/dashboard/ton-kho-canh-bao",
    { params: { nguong, limit } }
  );
  return res.data.data;
}

/**
 * Lấy top sản phẩm bán chạy.
 * GET /api/admin/dashboard/san-pham-ban-chay
 */
export async function laySanPhamBanChay(
  tuNgay?: string,
  denNgay?: string,
  limit = 3
): Promise<SanPhamBanChay[]> {
  const params: Record<string, string | number> = { limit };
  if (tuNgay) params.tuNgay = tuNgay;
  if (denNgay) params.denNgay = denNgay;

  const res = await apiClient.get<{ success: boolean; data: SanPhamBanChay[] }>(
    "/admin/dashboard/san-pham-ban-chay",
    { params }
  );
  return res.data.data;
}

function layTenTepTuHeader(
  contentDisposition: string | undefined,
  fallback: string
): string {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return fallback;
    }
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return fileNameMatch?.[1]?.trim() || fallback;
}

/**
 * Xuất dữ liệu thô đơn hàng, chi tiết sản phẩm, tồn kho và thiết kế.
 * GET /api/admin/dashboard/xuat-bao-cao
 */
export async function xuatBaoCaoDashboard(
  tuNgay: string,
  denNgay: string
): Promise<TepBaoCaoDashboard> {
  const fallbackFileName = `bao-cao-dashboard-${tuNgay}-den-${denNgay}.xlsx`;
  const response = await apiClient.get<Blob>(
    "/admin/dashboard/xuat-bao-cao",
    {
      params: { tuNgay, denNgay },
      responseType: "blob",
      timeout: 60_000,
    }
  );

  return {
    blob: response.data,
    fileName: layTenTepTuHeader(
      response.headers["content-disposition"],
      fallbackFileName
    ),
  };
}
