/**
 * product.routes.js – Định nghĩa tất cả routes cho module phôi áo (Admin).
 *
 * Base path: /api/admin/products  (đăng ký trong routes/index.js)
 *
 * Danh sách endpoints:
 *  GET    /stats                          – KPI thống kê
 *  GET    /categories                     – Danh sách danh mục (cho dropdown)
 *  GET    /colors                         – Bảng màu biến thể đã sử dụng
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
const multer = require("multer");
const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");
const productController = require("./admin.product.controller");

const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, callback) => {
    const acceptedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!acceptedTypes.includes(file.mimetype)) {
      const error = new Error("Anh phoi ao phai la JPG, PNG, WEBP, GIF hoac SVG");
      error.statusCode = 400;
      return callback(error);
    }

    callback(null, true);
  },
}).array("images", 20);

const uploadProductImages = (req, res, next) => {
  productImageUpload(req, res, (error) => {
    if (!error) return next();

    if (error.code === "LIMIT_FILE_SIZE") {
      error.message = "Anh phoi ao khong duoc vuot qua 5 MB";
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      error.message = "Moi lan chi duoc tai len toi da 20 anh phoi ao";
    }
    error.statusCode = error.statusCode || 400;
    next(error);
  });
};

// ─── Tất cả routes đều yêu cầu đăng nhập + quyền Admin / Warehouse ──────────────
router.use(verifyToken, requireRoles(ROLES.ADMIN, ROLES.WAREHOUSE));

// ─── Thống kê KPI ─────────────────────────────────────────────────────────────
// GET /api/admin/products/stats
router.get("/stats", productController.getThongKe);

// ─── Danh mục (dành cho dropdown filter) ──────────────────────────────────────
// GET /api/admin/products/categories
router.get("/categories", productController.getDanhMuc);

// ─── Quản lý danh mục (CRUD) ──────────────────────────────────────────────────
// GET  /api/admin/products/categories/all  – Danh sách kèm số sản phẩm
router.get("/categories/all", productController.getDanhSachDanhMuc);
// POST /api/admin/products/categories      – Tạo mới
router.post("/categories", productController.taoDanhMuc);
// PUT  /api/admin/products/categories/:categoryId – Cập nhật
router.put("/categories/:categoryId", productController.capNhatDanhMuc);
// DELETE /api/admin/products/categories/:categoryId – Xóa
router.delete("/categories/:categoryId", productController.xoaDanhMuc);

// GET /api/admin/products/colors
router.get("/colors", productController.getBangMau);

// ─── Cảnh báo tồn kho thấp ────────────────────────────────────────────────────
// GET /api/admin/products/inventory-alerts
router.get("/inventory-alerts", productController.getCanhBaoTonKho);

// ─── Danh sách phôi áo (phân trang + lọc) ─────────────────────────────────────
// GET /api/admin/products?trang=1&soMoiTrang=10&tuKhoa=&danhMuc=&trangThai=&tonKho=
router.get("/", productController.getDanhSachSanPham);

// ─── Tạo phôi áo mới ──────────────────────────────────────────────────────────
// POST /api/admin/products
router.post("/", productController.taoSanPham);

router.post("/:id/images", uploadProductImages, productController.taiAnhSanPham);
router.patch("/:id/images/:imageId/primary", productController.datAnhChinh);
router.delete("/:id/images/:imageId", productController.xoaAnhSanPham);

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
