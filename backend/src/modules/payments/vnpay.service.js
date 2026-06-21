const crypto = require("crypto");
const { getVnpayConfig } = require("../../config/vnpay");

const PAYMENT_EXPIRES_IN_MINUTES = 15;

function formatVnpayDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return [
    valueByType.year,
    valueByType.month,
    valueByType.day,
    valueByType.hour,
    valueByType.minute,
    valueByType.second,
  ].join("");
}

function encodeVnpayValue(value) {
  return encodeURIComponent(String(value)).replace(/%20/g, "+");
}

function buildSignData(params) {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys
    .map((key) => `${encodeVnpayValue(key)}=${encodeVnpayValue(params[key])}`)
    .join("&");
}

function createSecureHash(signData, hashSecret) {
  return crypto
    .createHmac("sha512", hashSecret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

function buildSignedQuery(params, hashSecret) {
  const signData = buildSignData(params);
  const secureHash = createSecureHash(signData, hashSecret);

  return `${signData}&vnp_SecureHash=${secureHash}`;
}

function taoMaGiaoDichVnpayMoi(orderCode) {
  const orderRef = String(orderCode).replace(/[^a-zA-Z0-9]/g, "").slice(0, 50);
  const timeRef = Date.now().toString(36).toUpperCase();
  const randomRef = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `${orderRef}${timeRef}${randomRef}`;
}

function taoLinkThanhToanVnpay({ orderCode, amount, ipAddress, transactionRef }) {
  const config = getVnpayConfig();
  const normalizedTransactionRef = String(transactionRef || orderCode).replace(
    /[^a-zA-Z0-9]/g,
    ""
  );
  const createdAt = new Date();
  const expiresAt = new Date(
    createdAt.getTime() + PAYMENT_EXPIRES_IN_MINUTES * 60 * 1000
  );
  const normalizedIp =
    String(ipAddress || "127.0.0.1")
      .replace(/^::ffff:/, "")
      .replace(/^::1$/, "127.0.0.1");

  const params = {
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_Command: "pay",
    vnp_CreateDate: formatVnpayDate(createdAt),
    vnp_CurrCode: "VND",
    vnp_ExpireDate: formatVnpayDate(expiresAt),
    vnp_IpAddr: normalizedIp,
    vnp_Locale: "vn",
    vnp_OrderInfo: `Thanh toan don hang ${orderCode}`,
    vnp_OrderType: "other",
    vnp_ReturnUrl: config.returnUrl,
    vnp_TmnCode: config.tmnCode,
    vnp_TxnRef: normalizedTransactionRef,
    vnp_Version: "2.1.0",
  };

  return {
    paymentUrl: `${config.paymentUrl}?${buildSignedQuery(params, config.hashSecret)}`,
    expiresAt: expiresAt.toISOString(),
    transactionRef: normalizedTransactionRef,
  };
}

function xacThucPhanHoiVnpay(query) {
  const { hashSecret, tmnCode } = getVnpayConfig();
  const receivedHash = String(query.vnp_SecureHash || "").toLowerCase();
  const paramsToVerify = Object.fromEntries(
    Object.entries(query).filter(
      ([key, value]) =>
        key !== "vnp_SecureHash" &&
        key !== "vnp_SecureHashType" &&
        value !== undefined &&
        value !== null
    )
  );
  const expectedHash = createSecureHash(buildSignData(paramsToVerify), hashSecret);

  if (
    query.vnp_TmnCode !== tmnCode ||
    !receivedHash ||
    receivedHash.length !== expectedHash.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(receivedHash, "utf-8"),
    Buffer.from(expectedHash, "utf-8")
  );
}

module.exports = {
  taoMaGiaoDichVnpayMoi,
  taoLinkThanhToanVnpay,
  xacThucPhanHoiVnpay,
};
