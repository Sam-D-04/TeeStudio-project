/**
 * dashboard.validation.js – Schema kiểm tra dữ liệu đầu vào cho các API Dashboard.
 *
 * Dùng cùng định dạng schema với các module khác trong dự án (object schema tự viết).
 * Validate middleware sẽ kiểm tra theo trường: required, type, pattern, min, max.
 */

"use strict";

/**
 * Schema validate query params lọc theo thời gian (dùng chung).
 * GET /api/admin/dashboard/tong-quan
 * GET /api/admin/dashboard/bieu-do-doanh-thu
 * GET /api/admin/dashboard/san-pham-ban-chay
 */
const dateRangeQuerySchema = {
  query: {
    tuNgay: {
      required: false,
      type: "string",
    },
    denNgay: {
      required: false,
      type: "string",
    },
  },
};

/**
 * Schema validate query params cho tồn kho cảnh báo.
 * GET /api/admin/dashboard/ton-kho-canh-bao
 */
const inventoryWarningQuerySchema = {
  query: {
    nguong: {
      required: false,
      type: "integer",
      min: 0,
      max: 10000,
    },
    limit: {
      required: false,
      type: "integer",
      min: 1,
      max: 50,
    },
  },
};

/**
 * Schema validate query params cho sản phẩm bán chạy.
 * GET /api/admin/dashboard/san-pham-ban-chay
 */
const bestSellingQuerySchema = {
  query: {
    tuNgay: {
      required: false,
      type: "string",
    },
    denNgay: {
      required: false,
      type: "string",
    },
    limit: {
      required: false,
      type: "integer",
      min: 1,
      max: 20,
    },
  },
};

module.exports = {
  dateRangeQuerySchema,
  inventoryWarningQuerySchema,
  bestSellingQuerySchema,
};
