import type { CartItem } from "@/store/useCartStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/* ── Request / Response types ── */

/**
 * Payload gửi lên POST /api/orders (Customer đặt hàng).
 * Backend tự tính giá từ DB theo BulkPricing, không tin giá frontend gửi.
 */
export interface CreateOrderPayload {
  recipientName: string;
  phone: string;
  email?: string;
  /** Địa chỉ giao hàng dạng chuỗi đầy đủ */
  addressLine: string;
  note?: string;
  /** Phương thức thanh toán: VNPAY hoặc COD */
  paymentMethod: "VNPAY" | "COD";
  /** Các sản phẩm: dùng variantId (ID trong bảng ProductVariant của DB) */
  items: Array<{
    variantId: number;
    quantity: number;
    /** ID thiết kế POD (tuỳ chọn) */
    designId?: number;
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
  /** Chỉ có khi paymentMethod === 'VNPAY' */
  paymentUrl?: string | null;
  paymentUrlExpiresAt?: string | null;
}

/* ── Service ── */

/**
 * Tạo đơn hàng mới.
 * Route: POST /api/orders (yêu cầu Customer JWT).
 */
export async function createOrder(
  payload: CreateOrderPayload,
  token: string
): Promise<CreateOrderResult> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || "Tạo đơn hàng thất bại"
    );
  }

  const json = (await response.json()) as {
    success: boolean;
    data: CreateOrderResult;
  };
  return json.data;
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
  }));
}
