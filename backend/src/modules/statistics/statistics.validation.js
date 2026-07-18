/**
 * statistics.validation.js – Schema kiểm tra dữ liệu đầu vào cho các API Thống kê.
 *
 * Dùng cùng định dạng schema với các module khác trong dự án.
 */

"use strict";

/**
 * Schema validate query params lọc theo thời gian (dùng chung cho chi-so, bieu-do, phan-bo).
 * GET /api/admin/statistics/chi-so
 * GET /api/admin/statistics/bieu-do
 * GET /api/admin/statistics/phan-bo
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
 * Schema validate query params cho top sản phẩm.
 * GET /api/admin/statistics/top-san-pham
 */
const topSanPhamQuerySchema = {
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
  topSanPhamQuerySchema,
};
