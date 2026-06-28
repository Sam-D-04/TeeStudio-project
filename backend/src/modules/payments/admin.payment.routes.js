/**
 * payment.routes.js – Đăng ký các route API cho module Thanh toán.
 *
 * Phần 1: Route công khai (VNPAY Return / IPN) – không cần auth
 * Phần 2: Route Admin – yêu cầu verifyToken + requireAdmin
 */

const express = require("express");

const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");
const validate = require("../../common/middlewares/validate.middleware");
const paymentController = require("./admin.payment.controller");
const {
  getDanhSachThanhToanSchema,
} = require("./payment.validation");

// ─────────────────────────────────────────────────────────────────────────────
// PHẦN 1: ROUTE CÔNG KHAI (VNPAY)
// ─────────────────────────────────────────────────────────────────────────────

const publicRouter = express.Router();

// Public endpoints được VNPAY và trang kết quả thanh toán gọi trực tiếp.
publicRouter.get("/vnpay/return", paymentController.xacThucKetQuaTraVeVnpay);
publicRouter.get("/vnpay/ipn", paymentController.xuLyIpnVnpay);

// ─────────────────────────────────────────────────────────────────────────────
// PHẦN 2: ROUTE ADMIN
// ─────────────────────────────────────────────────────────────────────────────

const adminRouter = express.Router();
const requireAdmin = requireRoles(ROLES.ADMIN);

// GET /api/admin/payments/stats – Thống kê KPI
// Đặt trước /:id để tránh bị Express hiểu nhầm "stats" là :id
adminRouter.get(
  "/stats",
  verifyToken,
  requireAdmin,
  paymentController.getThongKeThanhToan
);

adminRouter.get(
  "/xuat-bao-cao",
  verifyToken,
  requireAdmin,
  validate(getDanhSachThanhToanSchema),
  paymentController.exportBaoCaoThanhToan
);

// GET /api/admin/payments – Danh sách giao dịch (phân trang + lọc)
adminRouter.get(
  "/",
  verifyToken,
  requireAdmin,
  validate(getDanhSachThanhToanSchema),
  paymentController.getDanhSachThanhToan
);

// GET /api/admin/payments/:id – Chi tiết 1 giao dịch
adminRouter.get(
  "/:id",
  verifyToken,
  requireAdmin,
  paymentController.getChiTietThanhToan
);

// POST /api/admin/payments/:id/confirm-cod – Xác nhận thu COD
adminRouter.post(
  "/:id/confirm-cod",
  verifyToken,
  requireAdmin,
  paymentController.xacNhanThuCod
);

// PATCH /api/admin/payments/:id/note – Lưu ghi chú kế toán
adminRouter.patch(
  "/:id/note",
  verifyToken,
  requireAdmin,
  paymentController.luuGhiChu
);

module.exports = publicRouter;
module.exports.adminRouter = adminRouter;
