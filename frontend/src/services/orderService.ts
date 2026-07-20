import type { CartItem } from "@/store/useCartStore";
import apiClient from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

/* ── Request / Response types ── */

/**
 * Payload gửi lên POST /api/orders (Customer đặt hàng).
 * Backend tự tính giá từ DB theo BulkPricing, không tin giá frontend gửi.
 */
export interface CreateOrderPayload {
  recipientName: string;
  phone: string;
  email?: string;
  /** Địa chỉ giao hàng dạng chuỗi đầy đủ (số nhà + phường/xã + tỉnh/thành) */
  addressLine: string;
  /** Tên tỉnh/thành phố đã chọn */
  city?: string;
  /** Tên phường/xã đã chọn */
  ward?: string;
  note?: string;
  /** Phương thức thanh toán: VNPAY, MOMO hoặc COD */
  paymentMethod: "VNPAY" | "MOMO" | "COD";
  /** Loại thanh toán: FULL (toàn bộ) hoặc DEPOSIT (cọc 50%, chỉ áp dụng đơn có thiết kế POD) */
  paymentType?: "FULL" | "DEPOSIT";
  /** Các sản phẩm: dùng variantId (ID trong bảng ProductVariant của DB) */
  items: Array<{
    variantId: number;
    quantity: number;
    /** ID thiết kế POD (tuỳ chọn) */
    designId?: number;
    /** Ảnh in print-ready (base64 PNG) — backend upload Cloudinary rồi lưu vào
     *  printFileUrlFront/printFileUrlBack. Mặt nào khách không thiết kế thì bỏ qua. */
    printImageFront?: string;
    printImageBack?: string;
  }>;
  shippingFee?: number;
  promotionId?: number;
}

export interface CreateOrderResult {
  id: number;
  orderCode: string;
  totalAmount: number;
  depositAmount: number;
  codAmount: number;
  paymentAmount: number;
  /** Chỉ có khi paymentMethod === 'VNPAY' hoặc 'MOMO' */
  paymentUrl?: string | null;
  paymentUrlExpiresAt?: string | null;
}

/**
 * 1 dòng đơn hàng trong danh sách "Đơn hàng của tôi".
 * Khớp với response của GET /api/orders (xem layDanhSachDonHangCuaKhach ở backend).
 */
export interface OrderListItem {
  id: number;
  orderCode: string;
  /** Trạng thái gốc từ DB, vd PENDING/CONFIRMED/... - dùng khi cần so sánh logic */
  status: string;
  /** Nhãn tiếng Việt tương ứng với status, đã dịch sẵn ở backend để hiển thị luôn */
  statusLabel: string;
  paymentStatus: string;
  paymentType: string;
  totalAmount: number;
  depositAmount: number;
  codAmount: number;
  createdAt: string;
  /** Ảnh đại diện của đơn (ảnh thiết kế hoặc ảnh sản phẩm của item đầu tiên) */
  anhDaiDien: string | null;
  tenSanPhamDauTien: string;
  /** Số dòng sản phẩm khác nhau trong đơn (không phải tổng số lượng) */
  soLuongMatHang: number;
  tongSoLuongSanPham: number;
}

/** Kết quả phân trang trả về từ GET /api/orders */
export interface OrderListResult {
  items: OrderListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 1 sản phẩm trong chi tiết đơn hàng */
export interface OrderDetailItem {
  id: number;
  tenSanPham: string;
  mauSac: string;
  kichCo: string;
  sku: string;
  soLuong: number;
  donGiaVnd: number;
  phiThietKeVnd: number;
  thanhTienVnd: number;
  trangThaiSanXuat: string;
  coThietKeRieng: boolean;
  anhSanPham: string | null;
}

/** 1 mốc trong lịch sử thay đổi trạng thái, dùng để vẽ timeline */
export interface OrderHistoryEntry {
  trangThai: string;
  trangThaiLabel: string;
  ghiChu: string | null;
  thoiGian: string;
}

/** 1 lượt thanh toán của đơn (đơn đặt cọc có thể có nhiều hơn 1 lượt) */
export interface OrderPaymentEntry {
  phuongThuc: string;
  loai: string;
  soTienVnd: number;
  trangThai: string;
  thoiGianThanhToan: string | null;
}

/**
 * Chi tiết đầy đủ 1 đơn hàng - khớp với response của GET /api/orders/:id
 * (xem layChiTietDonHangCuaKhach ở backend).
 */
export interface OrderDetail {
  id: number;
  orderCode: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  depositAmount: number;
  codAmount: number;
  paymentType: string;
  paymentStatus: string;
  diaChiGiaoHang: {
    tenNguoiNhan: string;
    soDienThoai: string;
    diaChiChiTiet: string;
    phuongXa: string;
    quanHuyen: string;
    tinhThanh: string;
  };
  donViVanChuyen: string | null;
  maVanDon: string | null;
  lyDoHuy: string | null;
  items: OrderDetailItem[];
  lichSuTrangThai: OrderHistoryEntry[];
  thanhToan: OrderPaymentEntry[];
}

/* ── Service ── */

/**
 * Tạo đơn hàng mới.
 * Route: POST /api/orders (yêu cầu Customer JWT).
 * Dùng apiClient (axios): tự gắn token mới nhất + tự refresh khi 401.
 * Tham số `token` giữ lại cho tương thích chỗ gọi cũ, không cần dùng.
 */
export async function createOrder(
  payload: CreateOrderPayload,
  _token?: string
): Promise<CreateOrderResult> {
  try {
    // Timeout dài hơn mặc định vì đơn có thể kèm upload ảnh in lên Cloudinary
    const res = await apiClient.post("/orders", payload, { timeout: 60000 });
    return res.data.data as CreateOrderResult;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Tạo đơn hàng thất bại"));
  }
}

/**
 * Chuyển danh sách CartItem thành format items của API.
 * Dùng variantId (từ DB) thay vì productId + size + color.
 */
export function cartItemsToOrderItems(
  items: CartItem[]
): CreateOrderPayload["items"] {
  return items.map((i) => ({
    variantId: i.variantId,
    quantity: i.quantity,
    ...(i.designId ? { designId: i.designId } : {}),
    ...(i.printImageFront ? { printImageFront: i.printImageFront } : {}),
    ...(i.printImageBack ? { printImageBack: i.printImageBack } : {}),
  }));
}

/**
 * Lấy danh sách đơn hàng của khách hàng đang đăng nhập, có phân trang.
 * Route: GET /api/orders (yêu cầu Customer JWT, apiClient tự gắn token).
 * Dùng cho trang "Đơn hàng của tôi".
 */
export async function getMyOrders(
  page: number = 1,
  limit: number = 10
): Promise<OrderListResult> {
  try {
    const res = await apiClient.get("/orders", { params: { page, limit } });
    return res.data.data as OrderListResult;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Không tải được danh sách đơn hàng"));
  }
}

/**
 * Lấy chi tiết 1 đơn hàng của khách hàng đang đăng nhập.
 * Route: GET /api/orders/:id (yêu cầu Customer JWT).
 * Backend chỉ trả về đơn thuộc đúng khách đang đăng nhập, đơn của người khác
 * sẽ trả lỗi 404 dù có đoán đúng ID.
 */
export async function getOrderById(orderId: number): Promise<OrderDetail> {
  try {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res.data.data as OrderDetail;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Không tải được chi tiết đơn hàng"));
  }
}
