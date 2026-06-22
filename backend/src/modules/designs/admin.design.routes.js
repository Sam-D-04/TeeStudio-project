/**
 * design.routes.js – Khai báo tất cả routes cho module Thiết kế & In ấn.
 *
 * Gắn vào app qua index.js:
 *   router.use("/admin/designs", adminDesignRoutes);      ← Dành cho Admin
 *   router.use("/vi-tri-in", publicDesignRoutes.viTriIn); ← Công khai
 *   router.use("/stickers", publicDesignRoutes.sticker);  ← Công khai
 */

const router = require("express").Router();
const controller = require("./admin.design.controller");
const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");

const requireAdmin = requireRoles(ROLES.ADMIN, ROLES.PRODUCTION);

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES DÀNH CHO ADMIN – Yêu cầu xác thực
// Prefix: /api/admin/designs
// ─────────────────────────────────────────────────────────────────────────────

// Thống kê KPI – phải khai báo trước các route có /:id để tránh conflict
router.get("/stats", verifyToken, requireAdmin, controller.getThongKe);

// Danh sách đơn cần in – cũng phải khai báo trước /:id
router.get("/don-can-in", verifyToken, requireAdmin, controller.getDanhSachDonCanIn);
router.patch("/don-can-in/:id/gui-xuong", verifyToken, requireAdmin, controller.guiDonXuongIn);

// Sticker
router.get("/stickers", verifyToken, requireAdmin, controller.getDanhSachSticker);
router.post("/stickers", verifyToken, requireAdmin, controller.themSticker);
router.delete("/stickers/:id", verifyToken, requireAdmin, controller.xoaSticker);

// Vị trí in
router.get("/vi-tri-in", verifyToken, requireAdmin, controller.getDanhSachViTriIn);
router.post("/vi-tri-in", verifyToken, requireAdmin, controller.themViTriIn);
router.patch("/vi-tri-in/:id", verifyToken, requireAdmin, controller.batTatViTriIn);
router.delete("/vi-tri-in/:id", verifyToken, requireAdmin, controller.xoaViTriIn);

// Danh sách thiết kế khách hàng
router.get("/", verifyToken, requireAdmin, controller.getDanhSachThietKe);

// Hành động trên từng thiết kế
router.patch("/:id/duyet", verifyToken, requireAdmin, controller.duyetThietKe);
router.patch("/:id/yeu-cau-chinh-sua", verifyToken, requireAdmin, controller.yeuCauChinhSua);

module.exports = router;
