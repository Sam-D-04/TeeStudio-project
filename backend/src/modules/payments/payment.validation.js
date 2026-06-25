/**
 * payment.validation.js – Schema validate cho module Thanh toán Admin.
 */

const createPaymentSchema = {
  body: {
    orderId: {
      required: true,
      type: "integer",
      min: 1,
    },
    amount: {
      required: true,
      type: "number",
      min: 0,
    },
    paymentMethod: {
      required: true,
      type: "string",
      enum: ["COD", "VNPAY"],
    },
    paymentType: {
      required: true,
      type: "string",
      enum: ["FULL_PAYMENT", "DEPOSIT", "COD_FINAL"],
    },
  },
};

const updatePaymentStatusSchema = {
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
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED"],
    },
  },
};

// Schema cho GET /admin/payments (danh sách)
const getDanhSachThanhToanSchema = {
  query: {
    trang: {
      required: false,
      type: "integer",
      min: 1,
    },
    soMoiTrang: {
      required: false,
      type: "integer",
      min: 1,
      max: 100,
    },
    trangThai: {
      required: false,
      type: "string",
      enum: [
        "tat_ca",
        "cho_thanh_toan",
        "da_thanh_toan",
        "that_bai",
        "hoan_tien",
        "can_doi_soat",
      ],
    },
    phuongThuc: {
      required: false,
      type: "string",
      enum: ["tat_ca", "vnpay", "cod"],
    },
    tuKhoa: {
      required: false,
      type: "string",
      maxLength: 200,
    },
    tuNgay: {
      required: false,
      type: "string",
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
    denNgay: {
      required: false,
      type: "string",
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
    kieuNgay: {
      required: false,
      type: "string",
      enum: ["ngay_tao", "ngay_thanh_toan"],
    },
  },
};

// Schema cho params có :id
const paymentIdParamSchema = {
  params: {
    id: {
      required: true,
      type: "integer",
      min: 1,
    },
  },
};

module.exports = {
  createPaymentSchema,
  updatePaymentStatusSchema,
  getDanhSachThanhToanSchema,
  paymentIdParamSchema,
};
