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

function hashesMatch(receivedHash, expectedHash) {
  const received = String(receivedHash || "").toLowerCase();
  return Boolean(received) &&
    received.length === expectedHash.length &&
    crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expectedHash));
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
    transactionDate: params.vnp_CreateDate,
  };
}

function verifyQueryDrResponse(data, config) {
  const signData = [
    data.vnp_ResponseId,
    data.vnp_Command,
    data.vnp_ResponseCode,
    data.vnp_Message,
    data.vnp_TmnCode,
    data.vnp_TxnRef,
    data.vnp_Amount,
    data.vnp_BankCode,
    data.vnp_PayDate,
    data.vnp_TransactionNo,
    data.vnp_TransactionType,
    data.vnp_TransactionStatus,
    data.vnp_OrderInfo,
    data.vnp_PromotionCode,
    data.vnp_PromotionAmount,
  ].map((value) => value ?? "").join("|");

  return data.vnp_TmnCode === config.tmnCode && hashesMatch(
    data.vnp_SecureHash,
    createSecureHash(signData, config.hashSecret)
  );
}

async function truyVanGiaoDichVnpay({ transactionRef, transactionDate }) {
  const config = getVnpayConfig();
  const createdDate = formatVnpayDate(new Date());
  const orderInfo = `Truy van giao dich ${transactionRef}`;
  const body = {
    vnp_RequestId: `${Date.now()}${crypto.randomBytes(6).toString("hex")}`,
    vnp_Version: "2.1.0",
    vnp_Command: "querydr",
    vnp_TmnCode: config.tmnCode,
    vnp_TxnRef: String(transactionRef),
    vnp_OrderInfo: orderInfo,
    vnp_TransactionDate: /^\d{14}$/.test(String(transactionDate || ""))
      ? String(transactionDate)
      : formatVnpayDate(transactionDate),
    vnp_CreateDate: createdDate,
    vnp_IpAddr: config.apiIp,
  };
  const signData = [
    body.vnp_RequestId,
    body.vnp_Version,
    body.vnp_Command,
    body.vnp_TmnCode,
    body.vnp_TxnRef,
    body.vnp_TransactionDate,
    body.vnp_CreateDate,
    body.vnp_IpAddr,
    body.vnp_OrderInfo,
  ].join("|");
  body.vnp_SecureHash = createSecureHash(signData, config.hashSecret);

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`VNPAY QueryDR trả về HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!data.vnp_SecureHash) {
    const responseCode = String(data.vnp_ResponseCode || "N/A");
    const message = responseCode === "94"
      ? "Yêu cầu QueryDR bị trùng trong vòng 5 phút; sẽ thử lại ở chu kỳ sau"
      : String(data.vnp_Message || "Phản hồi không có checksum");
    throw new Error(`VNPAY QueryDR trả về mã ${responseCode}: ${message}`);
  }
  if (data.vnp_TmnCode !== config.tmnCode) {
    throw new Error("Mã website trong phản hồi QueryDR không khớp cấu hình");
  }
  if (!verifyQueryDrResponse(data, config)) {
    throw new Error("Checksum QueryDR từ VNPAY không hợp lệ");
  }

  return data;
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

  return hashesMatch(receivedHash, expectedHash);
}

module.exports = {
  taoMaGiaoDichVnpayMoi,
  taoLinkThanhToanVnpay,
  truyVanGiaoDichVnpay,
  xacThucPhanHoiVnpay,
};
