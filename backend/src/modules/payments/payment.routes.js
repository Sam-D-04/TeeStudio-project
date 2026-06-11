const router = require("express").Router();
const paymentController = require("./payment.controller");

// Public endpoints được VNPAY và trang kết quả thanh toán gọi trực tiếp.
router.get("/vnpay/return", paymentController.xacThucKetQuaTraVeVnpay);
router.get("/vnpay/ipn", paymentController.xuLyIpnVnpay);

module.exports = router;
