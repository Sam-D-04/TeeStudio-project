/**
 * order.routes.js – Đăng ký các route API cho module Đơn hàng Admin.
 *
 * Tất cả route đều đi qua:
 *   1. verifyToken  – xác thực JWT (bypass tạm thời)
 *   2. requireAdmin – kiểm tra quyền ADMIN
 *   3. validate     – kiểm tra dữ liệu đầu vào
 *   4. controller   – xử lý request
 */

const router = require("express").Router();

const { verifyToken, requireAdmin } = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const orderController = require("./order.controller");
const { updateStatusSchema, cancelOrderSchema } = require("./order.validation");

// GET /api/admin/orders/stats – Lấy thống kê KPI
// Đặt trước /:id để tránh bị nhầm thành route chi tiết với id = "stats"
router.get(
  "/stats",
  verifyToken,
  requireAdmin,
  orderController.getThongKe
);

// GET /api/admin/orders – Lấy danh sách đơn hàng
router.get(
  "/",
  verifyToken,
  requireAdmin,
  orderController.getDanhSachDonHang
);

// GET /api/admin/orders/:id – Lấy chi tiết 1 đơn hàng
router.get(
  "/:id",
  verifyToken,
  requireAdmin,
  orderController.getChiTietDonHang
);

// PATCH /api/admin/orders/:id/status – Cập nhật trạng thái đơn
router.patch(
  "/:id/status",
  verifyToken,
  requireAdmin,
  validate(updateStatusSchema),
  orderController.capNhatTrangThai
);

// PATCH /api/admin/orders/:id/cancel – Hủy đơn hàng
router.patch(
  "/:id/cancel",
  verifyToken,
  requireAdmin,
  validate(cancelOrderSchema),
  orderController.huyDonHang
);

module.exports = router;
