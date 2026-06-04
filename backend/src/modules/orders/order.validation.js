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
        "dang_san_xuat",
        "dang_in",
        "cho_giao",
        "dang_giao",
        "hoan_tat",
        "da_huy",
      ],
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

module.exports = {
  // Admin schemas
  updateStatusSchema,
  cancelOrderSchema,
  // Customer schemas (giữ lại)
  checkoutSchema,
  updateOrderStatusSchema,
};
