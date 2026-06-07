/**
 * order.validation.js – Schema kiểm tra dữ liệu đầu vào cho các API Đơn hàng.
 *
 * Tách biệt rõ:
 *   - Schema dành cho Admin (updateStatusSchema, cancelOrderSchema)
 *   - Schema dành cho Customer (checkoutSchema) – giữ lại từ trước
 */

// =====================================================================
// SCHEMA DÀNH CHO ADMIN
// =====================================================================

/**
 * Schema cập nhật trạng thái đơn hàng.
 * PATCH /api/admin/orders/:id/status
 */
const updateStatusSchema = {
  params: {
    id: {
      required: true,
      type: "integer",
      min: 1,
    },
  },
  body: {
    trangThai: {
      required: true,
      type: "string",
      // Danh sách trạng thái hợp lệ phía Frontend gửi lên
      enum: [
        "cho_xac_nhan",
        "da_xac_nhan",
        "dang_xu_ly_in",
        "cho_giao",
        "dang_giao",
        "hoan_tat",
      ],
    },
    shippingCarrier: {
      type: "string",
      required: false,
    },
    trackingCode: {
      type: "string",
      required: false,
    },
  },
};

/**
 * Schema hủy đơn hàng.
 * PATCH /api/admin/orders/:id/cancel
 */
const cancelOrderSchema = {
  params: {
    id: {
      required: true,
      type: "integer",
      min: 1,
    },
  },
  body: {
    lyDo: {
      required: true,
      type: "string",
      minLength: 5,
      maxLength: 500,
    },
  },
};

// =====================================================================
// SCHEMA DÀNH CHO CUSTOMER (giữ lại từ file gốc, không xóa)
// =====================================================================

const checkoutSchema = {
  body: {
    addressId: {
      required: true,
      type: "integer",
      min: 1,
    },
    items: {
      required: true,
      type: "array",
      custom: (items) => {
        return items.length > 0 || "items must contain at least one item";
      },
    },
    paymentMethod: {
      required: true,
      type: "string",
      enum: ["COD", "VNPAY"],
    },
    promotionCode: {
      type: "string",
      maxLength: 50,
    },
  },
};

const updateOrderStatusSchema = {
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
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PRINTING",
        "READY_TO_SHIP",
        "SHIPPING",
        "COMPLETED",
        "CANCELLED",
      ],
    },
  },
};

/**
 * Schema tạo đơn hàng mới (Admin tạo thay cho khách).
 * POST /api/admin/orders
 *
 * Backend sẽ tự tính lại giá từ DB – frontend chỉ gửi variantId, quantity, designId.
 */
const createOrderSchema = {
  body: {
    userId: {
      required: true,
      type: "integer",
      min: 1,
    },
    addressId: {
      required: true,
      type: "integer",
      min: 1,
    },
    items: {
      required: true,
      type: "array",
      custom: (items) => {
        if (!Array.isArray(items) || items.length === 0) {
          return "Đơn hàng phải có ít nhất 1 sản phẩm";
        }
        for (const item of items) {
          if (!item.variantId || typeof item.variantId !== "number" || item.variantId < 1) {
            return "variantId không hợp lệ";
          }
          if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1) {
            return "quantity phải là số nguyên dương";
          }
          if (item.designId !== undefined && item.designId !== null) {
            if (typeof item.designId !== "number" || item.designId < 1) {
              return "designId không hợp lệ";
            }
          }
        }
        return true;
      },
    },
    paymentMethod: {
      required: true,
      type: "string",
      enum: ["COD", "VNPAY", "CASH"],
    },
    paymentType: {
      type: "string",
      enum: ["FULL", "DEPOSIT"],
    },
    shippingFee: {
      type: "number",
      min: 0,
    },
    promotionId: {
      type: "integer",
      min: 1,
    },
  },
};

module.exports = {
  // Admin schemas
  updateStatusSchema,
  cancelOrderSchema,
  createOrderSchema,
  // Customer schemas (giữ lại)
  checkoutSchema,
  updateOrderStatusSchema,
};
