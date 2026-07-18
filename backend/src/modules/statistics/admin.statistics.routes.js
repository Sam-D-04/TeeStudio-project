/**
 * admin.statistics.routes.js – Đăng ký các route API cho module Theo dõi & Thống kê.
 *
 * Tất cả route đều đi qua:
 *   1. verifyToken  – xác thực JWT
 *   2. requireAdmin – kiểm tra quyền ADMIN hoặc PRODUCTION
 *   3. controller   – xử lý request
 *
 * Prefix khi đăng ký tại routes/index.js: /api/admin/statistics
 */

"use strict";

const router = require("express").Router();

const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");
const statisticsController = require("./admin.statistics.controller");

const requireAdmin = requireRoles(ROLES.ADMIN, ROLES.PRODUCTION);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/statistics/chi-so
// Trả về 4 thẻ chỉ số tổng hợp + so sánh kỳ trước.
// Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/chi-so",
  verifyToken,
  requireAdmin,
  statisticsController.getChiSoTongHop
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/statistics/bieu-do
// Trả về dữ liệu biểu đồ doanh thu (ngày/tháng tự chọn theo độ dài khoảng).
// Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/bieu-do",
  verifyToken,
  requireAdmin,
  statisticsController.getBieuDoDoanhThu
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/statistics/top-san-pham
// Trả về top sản phẩm bán chạy nhất kèm ảnh thumbnail.
// Query params: tuNgay, denNgay, limit (mặc định 5)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/top-san-pham",
  verifyToken,
  requireAdmin,
  statisticsController.getTopSanPham
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/statistics/phan-bo
// Trả về phân bổ trạng thái đơn hàng VÀ tình trạng thanh toán.
// Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/phan-bo",
  verifyToken,
  requireAdmin,
  statisticsController.getPhanBoTrangThai
);

// =====================================================================
// GET /api/admin/statistics/xuat-bao-cao
// Trả về file Excel thống kê theo khoảng thời gian.
// Query params: tuNgay, denNgay
// =====================================================================
router.get(
  "/xuat-bao-cao",
  verifyToken,
  requireAdmin,
  statisticsController.exportBaoCaoThongKe
);

module.exports = router;
