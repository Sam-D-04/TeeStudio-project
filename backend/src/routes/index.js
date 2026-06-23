const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.api.routes");
const userRoutes = require("../modules/users/admin.user.api.routes");
const pricingRoutes = require("../modules/pricing/admin.pricing.routes");
const adminOrderRoutes = require("../modules/orders/admin.order.routes");
const adminDesignRoutes = require("../modules/designs/admin.design.routes");
const paymentRoutes = require("../modules/payments/admin.payment.routes");
const adminPaymentRoutes = require("../modules/payments/admin.payment.routes").adminRouter;
const adminProductRoutes = require("../modules/products/admin.product.routes");
const adminInventoryRoutes = require("../modules/inventory/admin.inventory.routes");
const adminPromotionRoutes = require("../modules/promotions/admin.promotion.routes");
const adminDashboardRoutes = require("../modules/dashboard/admin.dashboard.routes");

// Import controller cho 2 public endpoints (vi-tri-in, stickers dành cho Design Studio)
const designController = require("../modules/designs/admin.design.controller");

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "TeeStudio API is healthy",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Route công khai – dành cho giao diện khách hàng (Design Studio)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/vi-tri-in → chỉ trả các vị trí in đang bật
router.get("/vi-tri-in", designController.getDanhSachViTriInCongKhai);

// GET /api/stickers → chỉ trả sticker đang bật
router.get("/stickers", designController.getDanhSachSticker);

// Xác thực Return URL và nhận IPN từ VNPAY.
router.use("/payments", paymentRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Route dành cho Admin
// ─────────────────────────────────────────────────────────────────────────────

// Route dành cho tính giá (không yêu cầu auth)
router.use("/pricing", pricingRoutes);

// Quản lý đơn hàng – /api/admin/orders/...
router.use("/admin/orders", adminOrderRoutes);

// Quản lý thiết kế & in ấn – /api/admin/designs/...
router.use("/admin/designs", adminDesignRoutes);

// Quản lý sản phẩm / phôi áo – /api/admin/products/...
router.use("/admin/products", adminProductRoutes);

// Quản lý kho hàng – /api/admin/inventory/...
router.use("/admin/inventory", adminInventoryRoutes);

// Quản lý khuyến mãi và cấu hình báo giá – /api/admin/promotions/...
router.use("/admin/promotions", adminPromotionRoutes);

// Tổng quan vận hành (Dashboard) – /api/admin/dashboard/...
router.use("/admin/dashboard", adminDashboardRoutes);

// Quản lý thanh toán – /api/admin/payments/...
router.use("/admin/payments", adminPaymentRoutes);

module.exports = router;
