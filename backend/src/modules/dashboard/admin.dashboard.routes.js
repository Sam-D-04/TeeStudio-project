/**
 * admin.dashboard.routes.js – Đăng ký các route API cho module Tổng quan vận hành.
 *
 * Tất cả route đều đi qua:
 *   1. verifyToken  – xác thực JWT
 *   2. requireAdmin – kiểm tra quyền ADMIN
 *   3. controller   – xử lý request
 *
 * Prefix khi đăng ký tại routes/index.js: /api/admin/dashboard
 */

"use strict";

const router = require("express").Router();

const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");
const dashboardController = require("./admin.dashboard.controller");

const requireAdmin = requireRoles(ROLES.ADMIN, ROLES.PRODUCTION);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/tong-quan
// Trả về 7 chỉ số tổng quan vận hành theo khoảng thời gian.
// Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/tong-quan",
  verifyToken,
  requireAdmin,
  dashboardController.getTongQuanChiSo
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/bieu-do-doanh-thu
// Trả về dữ liệu biểu đồ doanh thu theo ngày trong khoảng thời gian.
// Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/bieu-do-doanh-thu",
  verifyToken,
  requireAdmin,
  dashboardController.getBieuDoDoanhThu
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/thiet-ke-can-xu-ly
// Trả về tối đa 5 thiết kế cần xử lý (PENDING_REVIEW / NEEDS_REVISION).
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/thiet-ke-can-xu-ly",
  verifyToken,
  requireAdmin,
  dashboardController.getThietKeCanXuLy
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/ton-kho-canh-bao
// Trả về danh sách variant tồn kho thấp.
// Query params: nguong (mặc định 15), limit (mặc định 10)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/ton-kho-canh-bao",
  verifyToken,
  requireAdmin,
  dashboardController.getTonKhoCanhBao
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/san-pham-ban-chay
// Trả về top sản phẩm bán chạy nhất theo doanh thu.
// Query params: tuNgay, denNgay, limit (mặc định 3)
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/san-pham-ban-chay",
  verifyToken,
  requireAdmin,
  dashboardController.getSanPhamBanChay
);

module.exports = router;
