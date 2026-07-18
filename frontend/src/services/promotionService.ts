import apiClient from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

/** Kết quả xem trước 1 mã khuyến mãi hợp lệ - khớp response backend (customer.promotion.controller.js) */
export interface PromotionPreview {
  promotionId: number;
  code: string;
  discountType: "PERCENT" | "FIXED" | "FREE_SHIPPING";
  discountValue: number;
  /** Số tiền được giảm (đã tính sẵn, làm tròn 2 chữ số) - 0 nếu discountType là FREE_SHIPPING */
  discountAmount: number;
  /** true nếu mã miễn phí vận chuyển - FE tự trừ phí ship khi hiển thị tổng kết */
  mienPhiVanChuyen: boolean;
}

/**
 * Xem trước 1 mã khuyến mãi trước khi đặt hàng thật.
 * POST /api/promotions/validate
 * Ném lỗi kèm thông báo tiếng Việt (đã dịch sẵn ở backend) nếu mã không áp
 * dụng được - component gọi hàm này tự bắt lỗi để hiển thị cho khách.
 */
export async function validatePromotionCode(
  code: string,
  orderAmount: number
): Promise<PromotionPreview> {
  try {
    const res = await apiClient.post("/promotions/validate", { code, orderAmount });
    return res.data.data as PromotionPreview;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, "Không áp dụng được mã khuyến mãi"));
  }
}
