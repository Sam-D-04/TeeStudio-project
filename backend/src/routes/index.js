const router = require("express").Router();

const pricingRoutes = require("../modules/pricing/pricing.routes");
const adminOrderRoutes = require("../modules/orders/order.routes");

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "TeeStudio API is healthy",
  });
});

// Route dành cho tính giá (không yêu cầu auth)
router.use("/pricing", pricingRoutes);

// Route quản lý đơn hàng dành cho Admin
// Đầy đủ URL: /api/admin/orders/...
router.use("/admin/orders", adminOrderRoutes);

module.exports = router;
