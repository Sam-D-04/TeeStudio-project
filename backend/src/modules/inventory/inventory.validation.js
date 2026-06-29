/**
 * inventory.validation.js – Schema validate input cho module Kho hàng.
 *
 * Dùng với middleware validate() trong common/middlewares/validate.middleware.js.
 */

/** Schema tạo giao dịch kho (nhập/xuất/điều chỉnh) */
const createInventoryTransactionSchema = {
  body: {
    variantId: {
      label: "Biến thể phôi áo",
      required: true,
      type: "integer",
      min: 1,
    },
    orderId: {
      label: "Đơn hàng",
      type: "integer",
      min: 1,
    },
    supplierId: {
      label: "Nhà cung cấp",
      type: "integer",
      min: 1,
    },
    quantityChanged: {
      label: "Số lượng thay đổi",
      required: true,
      type: "integer",
      custom: (quantityChanged) => {
        return (
          Number(quantityChanged) !== 0 ||
          "Số lượng thay đổi không được bằng 0"
        );
      },
    },
    transactionType: {
      label: "Loại giao dịch",
      required: true,
      type: "string",
      enum: ["IMPORT", "EXPORT", "ADJUSTMENT", "ORDER_EXPORT", "RETURN"],
    },
    reason: {
      label: "Lý do / Ghi chú",
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 300,
    },
  },
};

/** Schema lấy danh sách tồn kho (query params) */
const getDanhSachTonKhoSchema = {
  query: {
    trang: {
      label: "Trang",
      type: "integer",
      min: 1,
    },
    soMoiTrang: {
      label: "Số dòng mỗi trang",
      type: "integer",
      min: 1,
      max: 100,
    },
    variantId: {
      label: "Biến thể phôi áo",
      type: "integer",
      min: 1,
    },
    tuKhoa: {
      label: "Từ khóa tìm kiếm",
      type: "string",
      maxLength: 200,
    },
    boLoc: {
      label: "Bộ lọc",
      type: "string",
      maxLength: 100,
    },
    tuNgay: {
      label: "Từ ngày",
      type: "string",
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
    denNgay: {
      label: "Đến ngày",
      type: "string",
      pattern: /^\d{4}-\d{2}-\d{2}$/,
    },
  },
};

module.exports = {
  createInventoryTransactionSchema,
  getDanhSachTonKhoSchema,
};
