/**
 * design.routes.js – Khai báo các route Admin cho module Thiết kế & In ấn.
 *
 * Gắn vào app qua index.js:
 *   router.use("/admin/designs", adminDesignRoutes);
 */

const router = require("express").Router();
const multer = require("multer");
const controller = require("./admin.design.controller");
const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");

const requireAdmin = requireRoles(ROLES.ADMIN, ROLES.PRODUCTION);
const requireDesignCreator = requireRoles(ROLES.ADMIN);

const stickerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const acceptedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (!acceptedTypes.includes(file.mimetype)) {
      const error = new Error("Ảnh sticker phải là JPG, PNG, WEBP, GIF hoặc SVG");
      error.statusCode = 400;
      return callback(error);
    }

    callback(null, true);
  },
}).single("anh");

const uploadSticker = (req, res, next) => {
  stickerUpload(req, res, (error) => {
    if (!error) return next();

    if (error.code === "LIMIT_FILE_SIZE") {
      error.message = "Ảnh sticker không được vượt quá 5 MB";
    }
    error.statusCode = error.statusCode || 400;
    next(error);
  });
};

const designAssetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!acceptedTypes.includes(file.mimetype)) {
      const error = new Error("Ảnh thiết kế phải là JPG, PNG, WEBP, GIF hoặc SVG");
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  },
}).single("image");

const uploadDesignAsset = (req, res, next) => {
  designAssetUpload(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      error.message = "Ảnh thiết kế không được vượt quá 5 MB";
    }
    error.statusCode = error.statusCode || 400;
    next(error);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES DÀNH CHO ADMIN – Yêu cầu xác thực
// Prefix: /api/admin/designs
// ─────────────────────────────────────────────────────────────────────────────

// Thống kê KPI – phải khai báo trước các route có /:id để tránh conflict
router.get("/stats", verifyToken, requireAdmin, controller.getThongKe);

// Danh sách đơn cần in – cũng phải khai báo trước /:id
router.get("/don-can-in", verifyToken, requireAdmin, controller.getDanhSachDonCanIn);
router.patch("/don-can-in/:id/trang-thai", verifyToken, requireAdmin, controller.capNhatTrangThaiDonIn);

// Sticker
router.get("/stickers", verifyToken, requireAdmin, controller.getDanhSachSticker);
router.post("/stickers", verifyToken, requireAdmin, uploadSticker, controller.themSticker);
router.delete("/stickers/:id", verifyToken, requireAdmin, controller.xoaSticker);

// Upload ảnh canvas asset & tạo thiết kế mới cho khách
router.post("/assets", verifyToken, requireDesignCreator, uploadDesignAsset, controller.taiAnhThietKe);
router.get("/customer-draft-variants", verifyToken, requireDesignCreator, controller.getBienTheTaoThietKe);
router.post("/customer-drafts", verifyToken, requireDesignCreator, controller.taoThietKeChoKhach);

// Danh sách thiết kế khách hàng
router.get("/", verifyToken, requireAdmin, controller.getDanhSachThietKe);

// Hành động trên từng thiết kế
// Lưu ý: /:id/canvas và /:id/sua phải khai báo TRƯỚC /:id để tránh conflict routing
router.get("/:id/canvas", verifyToken, requireDesignCreator, controller.getCanvasDataThietKe);
router.put("/:id/sua", verifyToken, requireDesignCreator, controller.suaThietKeChoKhach);
router.patch("/:id/duyet", verifyToken, requireAdmin, controller.duyetThietKe);
router.patch("/:id/yeu-cau-chinh-sua", verifyToken, requireAdmin, controller.yeuCauChinhSua);
router.get("/:id", verifyToken, requireAdmin, controller.getChiTietThietKe);

module.exports = router;
