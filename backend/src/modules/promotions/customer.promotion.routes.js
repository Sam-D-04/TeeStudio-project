/**
 * customer.promotion.routes.js – Route khuyến mãi dành cho Customer.
 * POST /api/promotions/validate – Xem trước số tiền giảm của 1 mã trước khi đặt hàng.
 */

const router = require("express").Router();
const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");
const controller = require("./customer.promotion.controller");

router.post("/validate", verifyToken, requireRoles(ROLES.CUSTOMER), controller.validate);

module.exports = router;
