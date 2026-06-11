/**
 * inventory.routes.js – Định nghĩa routes cho module Kho hàng.
 *
 * Tất cả routes đều yêu cầu xác thực JWT và quyền ADMIN.
 *
 * Base path: /api/admin/inventory
 *
 * Danh sách endpoints:
 *   GET  /stats                              → Thống kê KPI
 *   GET  /                                   → Danh sách tồn kho (phân trang + lọc)
 *   GET  /history                            → Lịch sử toàn kho (phân trang + lọc loại GD + tìm kiếm)
 *   GET  /products-with-variants             → Danh sách sản phẩm + biến thể (phục vụ trang nhập kho)
 *   GET  /suppliers                          → Danh sách nhà cung cấp (phục vụ trang nhập kho)
 *   GET  /variants/:variantId                → Chi tiết biến thể
 *   GET  /variants/:variantId/pending-orders → Đơn hàng chờ xuất phôi
 *   GET  /variants/:variantId/history        → Lịch sử biến động theo biến thể
 *   POST /transactions                       → Ghi giao dịch nhập/xuất/điều chỉnh
 */

const router = require("express").Router();
const { verifyToken, requireAdmin } = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const {
  createInventoryTransactionSchema,
} = require("./inventory.validation");
const {
  getThongKeKho,
  getDanhSachTonKho,
  getChiTietBienThe,
  getDonChoXuat,
  getLichSuBienDong,
  getLichSuKho,
  ghiGiaoDich,
  getDanhSachSanPhamVaBienThe,
  getDanhSachNhaCungCap,
} = require("./inventory.controller");

// Áp dụng xác thực JWT + quyền Admin cho toàn bộ routes này
router.use(verifyToken, requireAdmin);

// ─── Thống kê KPI ──────────────────────────────────────────────────────────
router.get("/stats", getThongKeKho);

// ─── Danh sách sản phẩm + biến thể (phục vụ trang nhập kho) ──────────────
router.get("/products-with-variants", getDanhSachSanPhamVaBienThe);

// ─── Danh sách nhà cung cấp (phục vụ trang nhập kho) ──────────────────────
router.get("/suppliers", getDanhSachNhaCungCap);

// ─── Lịch sử toàn kho (phân trang + lọc loại GD + tìm kiếm) ───────────
router.get("/history", getLichSuKho);

// ─── Danh sách tồn kho ────────────────────────────────────────────────────
router.get("/", getDanhSachTonKho);

// ─── Chi tiết biến thể ───────────────────────────────────────────────────
router.get("/variants/:variantId", getChiTietBienThe);

// ─── Đơn hàng chờ xuất phôi ──────────────────────────────────────────────
router.get("/variants/:variantId/pending-orders", getDonChoXuat);

// ─── Lịch sử biến động ───────────────────────────────────────────────────
router.get("/variants/:variantId/history", getLichSuBienDong);

// ─── Ghi giao dịch kho ───────────────────────────────────────────────────
router.post(
  "/transactions",
  validate(createInventoryTransactionSchema),
  ghiGiaoDich
);

module.exports = router;
