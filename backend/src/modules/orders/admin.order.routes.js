/**
 * order.routes.js – Đăng ký các route API cho module Đơn hàng Admin.
 *
 * Tất cả route đều đi qua:
 *   1. verifyToken  – xác thực JWT (bypass tạm thời)
 *   2. requireRoles – kiểm tra quyền theo từng nhóm chức năng
 *   3. validate     – kiểm tra dữ liệu đầu vào (nếu có)
 *   4. controller   – xử lý request
 *
 * LƯU Ý THỨ TỰ ROUTE:
 *   - Các route /search/... và /promotions phải đặt TRƯỚC /:id
 *     để tránh Express nhầm "search" hoặc "promotions" là :id.
 */

const router = require("express").Router();

const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");
const validate = require("../../common/middlewares/validate.middleware");
const orderController = require("./admin.order.controller");
const {
  updateStatusSchema,
  cancelOrderSchema,
  createOrderSchema,
  updateShippingAddressSchema,
  requestDesignRevisionSchema,
} = require("./order.validation");

const requireOrderAccess = requireRoles(ROLES.ADMIN, ROLES.PRODUCTION);
const requireOrderAdmin = requireRoles(ROLES.ADMIN);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HỖ TRỢ FORM TẠO ĐƠN MỚI
// (Đặt trước /:id để tránh bị Express hiểu nhầm path segment)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/orders/search/customers?q=<keyword>
router.get(
  "/search/customers",
  verifyToken,
  requireOrderAdmin,
  orderController.timKhachHang
);

// GET /api/admin/orders/customers/:userId/addresses
router.get(
  "/customers/:userId/addresses",
  verifyToken,
  requireOrderAdmin,
  orderController.layDiaChi
);

// GET /api/admin/orders/search/products?q=<keyword>
router.get(
  "/search/products",
  verifyToken,
  requireOrderAdmin,
  orderController.timSanPham
);

// GET /api/admin/orders/search/designs?userId=<id>&q=<keyword>
router.get(
  "/search/designs",
  verifyToken,
  requireOrderAdmin,
  orderController.timThietKe
);

// GET /api/admin/orders/promotions
router.get(
  "/promotions",
  verifyToken,
  requireOrderAdmin,
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
  requireOrderAccess,
  orderController.getThongKe
);

// GET /api/admin/orders – Lấy danh sách đơn hàng
router.get(
  "/",
  verifyToken,
  requireOrderAccess,
  orderController.getDanhSachDonHang
);

// POST /api/admin/orders – Tạo đơn hàng mới
router.post(
  "/",
  verifyToken,
  requireOrderAdmin,
  validate(createOrderSchema),
  orderController.taoMoiDonHang
);

// POST /api/admin/orders/:id/payment/recreate – Tạo lại mã thanh toán online
router.post(
  "/:id/payment/recreate",
  verifyToken,
  requireOrderAdmin,
  orderController.taoLaiMaThanhToanOnline
);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE CHI TIẾT / CẬP NHẬT (có :id)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/orders/:id – Lấy chi tiết 1 đơn hàng
router.get(
  "/:id",
  verifyToken,
  requireOrderAccess,
  orderController.getChiTietDonHang
);

// PATCH /api/admin/orders/:id/status – Cập nhật trạng thái đơn
router.patch(
  "/:id/status",
  verifyToken,
  requireOrderAccess,
  validate(updateStatusSchema),
  orderController.capNhatTrangThai
);

// PATCH /api/admin/orders/:id/design-revision – Yêu cầu khách sửa thiết kế
router.patch(
  "/:id/design-revision",
  verifyToken,
  requireOrderAdmin,
  validate(requestDesignRevisionSchema),
  orderController.yeuCauChinhSuaThietKe
);

// PATCH /api/admin/orders/:id/cancel – Hủy đơn hàng
router.patch(
  "/:id/cancel",
  verifyToken,
  requireOrderAdmin,
  validate(cancelOrderSchema),
  orderController.huyDonHang
);

// PATCH /api/admin/orders/:id/shipping-address – Cập nhật địa chỉ giao hàng
router.patch(
  "/:id/shipping-address",
  verifyToken,
  requireOrderAdmin,
  validate(updateShippingAddressSchema),
  orderController.capNhatDiaChiGiaoHang
);

module.exports = router;
