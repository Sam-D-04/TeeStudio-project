const DEFAULT_PAYMENT_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

function getVnpayConfig() {
  const config = {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    paymentUrl: process.env.VNPAY_PAYMENT_URL || DEFAULT_PAYMENT_URL,
    returnUrl: process.env.VNPAY_RETURN_URL,
    ipnUrl: process.env.VNPAY_IPN_URL,
  };

  if (!config.tmnCode || !config.hashSecret || !config.returnUrl) {
    const error = new Error(
      "VNPAY chưa được cấu hình. Vui lòng thiết lập VNPAY_TMN_CODE, VNPAY_HASH_SECRET và VNPAY_RETURN_URL."
    );
    error.statusCode = 503;
    throw error;
  }

  return config;
}

module.exports = {
  getVnpayConfig,
};
