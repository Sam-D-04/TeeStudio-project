/**
 * product.routes.js – Định nghĩa tất cả routes cho module phôi áo (Admin).
 *
 * Base path: /api/admin/products  (đăng ký trong routes/index.js)
 *
 * Danh sách endpoints:
 *  GET    /stats                          – KPI thống kê
 *  GET    /categories                     – Danh sách danh mục (cho dropdown)
 *  GET    /inventory-alerts               – Cảnh báo tồn kho thấp
 *  GET    /                               – Danh sách phôi áo (phân trang + lọc)
 *  POST   /                               – Tạo phôi áo mới
 *  GET    /:id                            – Chi tiết 1 phôi áo
 *  PUT    /:id                            – Cập nhật thông tin phôi áo
 *  PATCH  /:id/status                     – Bật/tắt hiển thị
 *  DELETE /:id                            – Xóa phôi áo
 *  POST   /:id/variants                   – Thêm biến thể
 *  PUT    /:id/variants/:variantId        – Cập nhật biến thể
 */

const router = require("express").Router();
const { verifyToken, requireAdmin } = require("../../common/middlewares/auth.middleware");
const productController = require("./product.controller");

// ─── Tất cả routes đều yêu cầu đăng nhập + quyền Admin ───────────────────────
router.use(verifyToken, requireAdmin);

// ─── Thống kê KPI ─────────────────────────────────────────────────────────────
// GET /api/admin/products/stats
router.get("/stats", productController.getThongKe);

// ─── Danh mục (dành cho dropdown filter) ──────────────────────────────────────
// GET /api/admin/products/categories
router.get("/categories", productController.getDanhMuc);

// ─── Cảnh báo tồn kho thấp ────────────────────────────────────────────────────
// GET /api/admin/products/inventory-alerts
router.get("/inventory-alerts", productController.getCanhBaoTonKho);

// ─── Danh sách phôi áo (phân trang + lọc) ─────────────────────────────────────
// GET /api/admin/products?trang=1&soMoiTrang=10&tuKhoa=&danhMuc=&trangThai=&tonKho=
router.get("/", productController.getDanhSachSanPham);

// ─── Tạo phôi áo mới ──────────────────────────────────────────────────────────
// POST /api/admin/products
router.post("/", productController.taoSanPham);

// ─── Chi tiết 1 phôi áo ───────────────────────────────────────────────────────
// GET /api/admin/products/:id
router.get("/:id", productController.getChiTietSanPham);

// ─── Cập nhật thông tin phôi áo ───────────────────────────────────────────────
// PUT /api/admin/products/:id
router.put("/:id", productController.capNhatSanPham);

// ─── Bật/tắt hiển thị phôi áo ─────────────────────────────────────────────────
// PATCH /api/admin/products/:id/status
router.patch("/:id/status", productController.capNhatTrangThai);

// ─── Thêm biến thể ────────────────────────────────────────────────────────────
// POST /api/admin/products/:id/variants
router.post("/:id/variants", productController.themBienThe);

// ─── Cập nhật biến thể ────────────────────────────────────────────────────────
// PUT /api/admin/products/:id/variants/:variantId
router.put("/:id/variants/:variantId", productController.capNhatBienThe);

// ─── Xóa phôi áo ──────────────────────────────────────────────────────────────
// DELETE /api/admin/products/:id
router.delete("/:id", productController.xoaSanPham);

module.exports = router;
