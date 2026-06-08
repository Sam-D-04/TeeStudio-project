/**
 * order.routes.js – Đăng ký các route API cho module Đơn hàng Admin.
 *
 * Tất cả route đều đi qua:
 *   1. verifyToken  – xác thực JWT (bypass tạm thời)
 *   2. requireAdmin – kiểm tra quyền ADMIN
 *   3. validate     – kiểm tra dữ liệu đầu vào (nếu có)
 *   4. controller   – xử lý request
 *
 * LƯU Ý THỨ TỰ ROUTE:
 *   - Các route /search/... và /promotions phải đặt TRƯỚC /:id
 *     để tránh Express nhầm "search" hoặc "promotions" là :id.
 */

const router = require("express").Router();

const { verifyToken, requireAdmin } = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const orderController = require("./order.controller");
const {
  updateStatusSchema,
  cancelOrderSchema,
  createOrderSchema,
  updateShippingAddressSchema,
} = require("./order.validation");

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HỖ TRỢ FORM TẠO ĐƠN MỚI
// (Đặt trước /:id để tránh bị Express hiểu nhầm path segment)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/orders/search/customers?q=<keyword>
router.get(
  "/search/customers",
  verifyToken,
  requireAdmin,
  orderController.timKhachHang
);

// GET /api/admin/orders/customers/:userId/addresses
router.get(
  "/customers/:userId/addresses",
  verifyToken,
  requireAdmin,
  orderController.layDiaChi
);

// GET /api/admin/orders/search/products?q=<keyword>
router.get(
  "/search/products",
  verifyToken,
  requireAdmin,
  orderController.timSanPham
);

// GET /api/admin/orders/search/designs?userId=<id>&q=<keyword>
router.get(
  "/search/designs",
  verifyToken,
  requireAdmin,
  orderController.timThietKe
);

// GET /api/admin/orders/promotions
router.get(
  "/promotions",
  verifyToken,
  requireAdmin,
  orderController.layKhuyenMai
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE DANH SÁCH / THỐNG KÊ / TẠO ĐƠN
// ─────────────────────────────────────────────────────────────────────────────

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

// POST /api/admin/orders – Tạo đơn hàng mới
router.post(
  "/",
  verifyToken,
  requireAdmin,
  validate(createOrderSchema),
  orderController.taoMoiDonHang
);

// POST /api/admin/orders/:id/vnpay/recreate – Tạo lại mã VNPAY đã hết hạn
router.post(
  "/:id/vnpay/recreate",
  verifyToken,
  requireAdmin,
  orderController.taoLaiMaThanhToanVnpay
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE CHI TIẾT / CẬP NHẬT (có :id)
// ─────────────────────────────────────────────────────────────────────────────

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

// PATCH /api/admin/orders/:id/shipping-address – Cập nhật địa chỉ giao hàng
router.patch(
  "/:id/shipping-address",
  verifyToken,
  requireAdmin,
  validate(updateShippingAddressSchema),
  orderController.capNhatDiaChiGiaoHang
);

module.exports = router;
