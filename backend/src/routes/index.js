const router = require("express").Router();

const pricingRoutes = require("../modules/pricing/pricing.routes");
const adminOrderRoutes = require("../modules/orders/order.routes");
const adminDesignRoutes = require("../modules/designs/design.routes");

// Import controller cho 2 public endpoints (vi-tri-in, stickers dành cho Design Studio)
const designController = require("../modules/designs/design.controller");

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "TeeStudio API is healthy",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Route công khai – dành cho giao diện khách hàng (Design Studio)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/vi-tri-in → chỉ trả các vị trí in đang bật
router.get("/vi-tri-in", designController.getDanhSachViTriInCongKhai);

// GET /api/stickers → chỉ trả sticker đang bật
router.get("/stickers", designController.getDanhSachSticker);

// ─────────────────────────────────────────────────────────────────────────────
// Route dành cho Admin
// ─────────────────────────────────────────────────────────────────────────────

// Route dành cho tính giá (không yêu cầu auth)
router.use("/pricing", pricingRoutes);

// Quản lý đơn hàng – /api/admin/orders/...
router.use("/admin/orders", adminOrderRoutes);

// Quản lý thiết kế & in ấn – /api/admin/designs/...
router.use("/admin/designs", adminDesignRoutes);

module.exports = router;
