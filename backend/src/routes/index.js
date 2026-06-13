const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.api.routes");
const userRoutes = require("../modules/users/user.api.routes");
const pricingRoutes = require("../modules/pricing/pricing.routes");
const adminOrderRoutes = require("../modules/orders/order.routes");
const adminDesignRoutes = require("../modules/designs/design.routes");
const paymentRoutes = require("../modules/payments/payment.routes");
const adminProductRoutes = require("../modules/products/product.routes");
const adminInventoryRoutes = require("../modules/inventory/inventory.routes");

// Import controller cho 2 public endpoints (vi-tri-in, stickers dành cho Design Studio)
const designController = require("../modules/designs/design.controller");

// Import controller cho public endpoints trang chủ
const publicController = require("../modules/public/public.controller");

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

// ── Public endpoints cho trang chủ ───────────────────────────────────────────
// GET /api/public/products  → danh sách phôi áo ACTIVE (cho ProductCategories)
router.get("/public/products", publicController.getDanhSachSanPham);

// GET /api/public/products/colors → màu áo nổi bật còn hàng (cho ProductShowcase)
router.get("/public/products/colors", publicController.getMauAoNoiBat);

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

module.exports = router;
