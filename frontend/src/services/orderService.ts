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
  /** Các sản phẩm: dùng variantId (ID trong bảng ProductVariant của DB) */
  items: Array<{
    variantId: number;
    quantity: number;
    /** ID thiết kế POD (tuỳ chọn) */
    designId?: number;
    /** Ảnh in print-ready (base64 PNG) — backend upload Cloudinary rồi lưu printFileUrl */
    printImage?: string;
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
    ...(i.printImage ? { printImage: i.printImage } : {}),
  }));
}
