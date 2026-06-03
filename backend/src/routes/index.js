const router = require("express").Router();

const pricingRoutes = require("../modules/pricing/pricing.routes");

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "TeeStudio API is healthy",
  });
});

router.use("/pricing", pricingRoutes);

module.exports = router;
