const paymentService = require("./payment.service");

const xacThucKetQuaTraVeVnpay = async (req, res, next) => {
  try {
    const data = await paymentService.xacThucKetQuaTraVeVnpay(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const xuLyIpnVnpay = async (req, res, next) => {
  try {
    const result = await paymentService.xuLyIpnVnpay(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  xacThucKetQuaTraVeVnpay,
  xuLyIpnVnpay,
};
