const DEFAULT_PAYMENT_URL = "https://test-payment.momo.vn/v2/gateway/api/create";
const DEFAULT_QUERY_URL = "https://test-payment.momo.vn/v2/gateway/api/query";
const DEFAULT_PAYMENT_EXPIRES_IN_MINUTES = 100;

function getMomoConfig() {
  const paymentExpiresInMinutes = Number(
    process.env.MOMO_PAYMENT_EXPIRES_IN_MINUTES ||
      DEFAULT_PAYMENT_EXPIRES_IN_MINUTES
  );
  const config = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    paymentUrl: process.env.MOMO_PAYMENT_URL || DEFAULT_PAYMENT_URL,
    queryUrl: process.env.MOMO_QUERY_URL || DEFAULT_QUERY_URL,
    redirectUrl: process.env.MOMO_REDIRECT_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
    requestType: process.env.MOMO_REQUEST_TYPE || "payWithMethod",
    partnerName: process.env.MOMO_PARTNER_NAME || "TeeStudio",
    storeId: process.env.MOMO_STORE_ID || "TeeStudio",
    paymentExpiresInMinutes,
  };

  if (
    !config.partnerCode ||
    !config.accessKey ||
    !config.secretKey ||
    !config.redirectUrl ||
    !config.ipnUrl
  ) {
    const error = new Error(
      "MoMo chưa được cấu hình. Vui lòng thiết lập MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_REDIRECT_URL và MOMO_IPN_URL."
    );
    error.statusCode = 503;
    throw error;
  }

  if (!new Set(["payWithMethod", "captureWallet"]).has(config.requestType)) {
    const error = new Error(
      "MOMO_REQUEST_TYPE không hợp lệ. Chỉ hỗ trợ payWithMethod hoặc captureWallet."
    );
    error.statusCode = 503;
    throw error;
  }

  if (
    !Number.isSafeInteger(config.paymentExpiresInMinutes) ||
    config.paymentExpiresInMinutes <= 0
  ) {
    const error = new Error(
      "MOMO_PAYMENT_EXPIRES_IN_MINUTES phải là số nguyên dương."
    );
    error.statusCode = 503;
    throw error;
  }

  return config;
}

module.exports = { getMomoConfig };
