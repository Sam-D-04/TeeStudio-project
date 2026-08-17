import apiClient from "@/lib/apiClient";
import { getApiErrorMessage } from "@/lib/getApiErrorMessage";

const DESIGNS_PATH = "/users/me/designs";

/** Khớp với các giá trị CustomDesign.status trong DB. */
export type DesignStatus = "DRAFT" | "PENDING_REVIEW" | "NEEDS_REVISION" | "APPROVED";

export interface SavedDesign {
  id: number;
  name: string;
  productId: number;
  baseColor: string;
  canvasData: any;
  previewUrl: string;
  /** Ảnh in print-ready (Cloudinary) đã lưu từ lần đặt hàng gần nhất - chỉ có
   *  sau khi thiết kế này được đặt hàng ít nhất 1 lần, mặt nào không thiết kế
   *  thì null. Chưa từng đặt hàng thì cả 2 đều null - dùng previewUrl. */
  printFileUrlFront: string | null;
  printFileUrlBack: string | null;
  status: DesignStatus;
  /** Ghi chú của admin khi yêu cầu chỉnh sửa (chỉ có ý nghĩa khi status = NEEDS_REVISION). */
  adminNote: string | null;
  updatedAt: string;
}

/*
 * Dùng apiClient thay cho fetch thô để:
 *  - Luôn gắn access token mới nhất từ storage (interceptor request).
 *  - Tự động refresh token khi gặp 401 rồi retry (interceptor response).
 * Tham số `token` được giữ lại cho tương thích chỗ gọi cũ nhưng không cần dùng
 */
export const userDesignService = {
  getMyDesigns: async (_token?: string): Promise<SavedDesign[]> => {
    try {
      const res = await apiClient.get(DESIGNS_PATH);
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Lỗi khi tải danh sách thiết kế"));
    }
  },

  createDesign: async (_token: string | undefined, payload: any): Promise<SavedDesign> => {
    try {
      // Timeout dài hơn vì có upload ảnh preview lên Cloudinary
      const res = await apiClient.post(DESIGNS_PATH, payload, { timeout: 60000 });
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Lỗi khi lưu thiết kế"));
    }
  },

  updateDesign: async (
    _token: string | undefined,
    id: number,
    payload: any
  ): Promise<SavedDesign> => {
    try {
      const res = await apiClient.put(`${DESIGNS_PATH}/${id}`, payload, { timeout: 60000 });
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Lỗi khi cập nhật thiết kế"));
    }
  },

  deleteDesign: async (_token: string | undefined, id: number): Promise<void> => {
    try {
      await apiClient.delete(`${DESIGNS_PATH}/${id}`);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Lỗi khi xoá thiết kế"));
    }
  },

  /**
   * Gán 1 biến thể sản phẩm thật (variantId, có color/size/stock trong DB) cho thiết kế.
   * Gọi khi khách thêm thiết kế vào giỏ hàng và chọn size — nếu không gọi, backend không
   * có cách nào so khớp màu thiết kế (chỉ có mã hex tự chọn) với biến thể lúc tạo đơn.
   */
  attachVariant: async (id: number, variantId: number): Promise<{ id: number; variantId: number }> => {
    try {
      const res = await apiClient.patch(`${DESIGNS_PATH}/${id}/variant`, { variantId });
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Lỗi khi gán biến thể cho thiết kế"));
    }
  },

  /** Gửi thiết kế (DRAFT hoặc NEEDS_REVISION) cho admin duyệt → chuyển sang PENDING_REVIEW. */
  submitForReview: async (
    _token: string | undefined,
    id: number
  ): Promise<{ id: number; status: DesignStatus }> => {
    try {
      const res = await apiClient.patch(`${DESIGNS_PATH}/${id}/submitForReview`);
      return res.data.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err, "Lỗi khi gửi thiết kế để duyệt"));
    }
  },
};
