/**
 * design.validation.js
 *
 * Schema validation cho module CustomDesign.
 *
 * Trạng thái hợp lệ của CustomDesign (enum thật đang chạy trong DB):
 *   DRAFT          – Nháp, khách có thể sửa tự do
 *   PENDING_REVIEW – Đã gửi, đang chờ admin duyệt (khoá sửa)
 *   NEEDS_REVISION – Admin yêu cầu sửa lại (mở lại cho khách)
 *   APPROVED       – Đã duyệt (khoá sửa)
 *
 * Lưu ý: SUBMITTED / REJECTED là enum CŨ từ phiên bản trước — ĐÃ XOÁ.
 */

const createDesignSchema = {
  body: {
    productId: {
      required: true,
      type: "integer",
      min: 1,
    },
    baseColor: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 20,
    },
    canvasData: {
      required: true,
      custom: (canvasData) => {
        const isValid =
          typeof canvasData === "object" || typeof canvasData === "string";
        return isValid || "canvasData must be an object or JSON string";
      },
    },
    previewUrl: {
      type: "string",
      maxLength: 500,
    },
    designFee: {
      type: "number",
      min: 0,
    },
  },
};

/**
 * Schema cập nhật trạng thái thiết kế.
 *
 * Chỉ admin mới được gọi endpoint này. Enum phải khớp với:
 *   - admin.design.service.js (TRANG_THAI_MAP, TRANG_THAI_NGUOC)
 *   - tinhQuyenSuaThietKe()  (DRAFT / NEEDS_REVISION → cho phép sửa)
 */
const updateDesignStatusSchema = {
  params: {
    id: {
      required: true,
      type: "integer",
      min: 1,
    },
  },
  body: {
    status: {
      required: true,
      type: "string",
      // Enum thật đang chạy — phải khớp với CustomDesign.status trong DB
      enum: ["DRAFT", "PENDING_REVIEW", "NEEDS_REVISION", "APPROVED"],
    },
  },
};

module.exports = {
  createDesignSchema,
  updateDesignStatusSchema,
};
