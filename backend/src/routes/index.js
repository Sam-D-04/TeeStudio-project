const router = require("express").Router();

const authRoutes = require("../modules/auth/auth.api.routes");
const userRoutes = require("../modules/users/admin.user.api.routes");
const userDesignRoutes = require("../modules/users/user.design.routes");
const pricingRoutes = require("../modules/pricing/admin.pricing.routes");
const adminOrderRoutes = require("../modules/orders/admin.order.routes");
const customerOrderRoutes = require("../modules/orders/customer.order.routes");
const cartRoutes = require("../modules/cart/cart.routes");
const adminDesignRoutes = require("../modules/designs/admin.design.routes");
const paymentRoutes = require("../modules/payments/admin.payment.routes");
const adminPaymentRoutes = require("../modules/payments/admin.payment.routes").adminRouter;
const adminProductRoutes = require("../modules/products/admin.product.routes");
const adminInventoryRoutes = require("../modules/inventory/admin.inventory.routes");
const adminPromotionRoutes = require("../modules/promotions/admin.promotion.routes");

// Import controller cho 2 public endpoints (vi-tri-in, stickers dành cho Design Studio)
const designController = require("../modules/designs/admin.design.controller");

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

// ── Kho thiết kế cá nhân (user phải đăng nhập) ─────────────────────────────
// GET/POST /api/users/me/designs  →  danh sách + tạo mới
// PUT/DELETE /api/users/me/designs/:id  →  cập nhật + xóa
router.use("/users/me/designs", userDesignRoutes);

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

// GET /api/public/products/:id → chi tiết 1 sản phẩm (cho Product Detail Page)
router.get("/public/products/:id", publicController.getChiTietSanPhamCongKhai);

// Xác thực Return URL và nhận IPN từ VNPAY.
router.use("/payments", paymentRoutes);

// ── Giỏ hàng (yêu cầu đăng nhập) ───────────────────────────────────────────
// GET    /api/cart           → lấy giỏ hàng
// POST   /api/cart/items     → thêm sản phẩm
// PUT    /api/cart/items/:id → cập nhật số lượng
// DELETE /api/cart/items/:id → xóa 1 sản phẩm
// DELETE /api/cart           → xóa toàn bộ
// POST   /api/cart/sync      → đồng bộ localStorage → DB khi đăng nhập
router.use("/cart", cartRoutes);

// ── Customer đặt hàng ────────────────────────────────────────────────────────
// POST /api/orders  → Khách đặt đơn (yêu cầu đăng nhập, role CUSTOMER)
router.use("/orders", customerOrderRoutes);

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

// Quản lý thanh toán – /api/admin/payments/...
router.use("/admin/payments", adminPaymentRoutes);

module.exports = router;
