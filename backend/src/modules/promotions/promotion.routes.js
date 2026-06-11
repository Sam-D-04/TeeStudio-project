const router = require("express").Router();
const { verifyToken, requireAdmin } = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const controller = require("./promotion.controller");
const validation = require("./promotion.validation");

router.use(verifyToken, requireAdmin);

router.get("/stats", controller.layThongKe);
router.get("/bulk-pricing/products", controller.laySanPhamGiaSoLuong);
router.get(
  "/bulk-pricing",
  validate(validation.getBulkPricingSchema),
  controller.layGiaSoLuong
);
router.post(
  "/bulk-pricing",
  validate(validation.createBulkPricingSchema),
  controller.taoGiaSoLuong
);
router.put(
  "/bulk-pricing/:id",
  validate(validation.updateBulkPricingSchema),
  controller.capNhatGiaSoLuong
);
router.delete(
  "/bulk-pricing/:id",
  validate(validation.idSchema),
  controller.xoaGiaSoLuong
);

router.get("/surcharges", controller.layPhuPhi);
router.put(
  "/surcharges/:id",
  validate(validation.updateSurchargeSchema),
  controller.capNhatPhuPhi
);

router.get("/pricing-formula", controller.layCongThucBaoGia);
router.put(
  "/pricing-formula",
  validate(validation.updatePricingFormulaSchema),
  controller.capNhatCongThucBaoGia
);

router.get("/", validate(validation.listPromotionsSchema), controller.layDanhSach);
router.post("/", validate(validation.createPromotionSchema), controller.taoMoi);
router.put("/:id", validate(validation.updatePromotionSchema), controller.capNhat);
router.patch(
  "/:id/status",
  validate(validation.updatePromotionStatusSchema),
  controller.capNhatTrangThai
);
router.delete("/:id", validate(validation.idSchema), controller.xoa);

module.exports = router;
