const crypto = require("crypto");
const { getMomoConfig } = require("../../config/momo");

const MOMO_PENDING_RESULT_CODES = new Set([10, 43, 1000, 7000, 7002]);
const MOMO_SUCCESS_RESULT_CODES = new Set([0, 9000]);

function createMomoSignature(rawSignature, secretKey) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(Buffer.from(rawSignature, "utf8"))
    .digest("hex");
}

function signaturesMatch(receivedSignature, expectedSignature) {
  const received = String(receivedSignature || "").toLowerCase();
  const expected = String(expectedSignature || "").toLowerCase();

  return Boolean(received) &&
    received.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

function taoMaGiaoDichMomoMoi(orderCode) {
  const normalizedOrderCode = String(orderCode)
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, 80);
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();

  return `${normalizedOrderCode}.${timestamp}.${random}`;
}

function taoRequestIdMomo() {
  return `REQ${Date.now().toString(36).toUpperCase()}${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
}

function layThoiDiemHetHanMomo(gatewayResponse) {
  let parsedResponse = gatewayResponse;
  if (typeof parsedResponse === "string") {
    try {
      parsedResponse = JSON.parse(parsedResponse);
    } catch {
      return null;
    }
  }

  if (!parsedResponse || typeof parsedResponse !== "object") return null;

  const config = getMomoConfig();
  const storedMinutes = Number(parsedResponse.expiresInMinutes);
  const expiresInMinutes =
    Number.isSafeInteger(storedMinutes) && storedMinutes > 0
      ? storedMinutes
      : config.paymentExpiresInMinutes;
  const responseTime = Number(
    parsedResponse.gatewayCreateResponse?.responseTime
  );

  if (Number.isFinite(responseTime) && responseTime > 0) {
    const calculatedExpiresAt = new Date(
      responseTime + expiresInMinutes * 60 * 1000
    );
    if (!Number.isNaN(calculatedExpiresAt.getTime())) {
      return calculatedExpiresAt.toISOString();
    }
  }

  const fallbackExpiresAt = Date.parse(parsedResponse.expiresAt || "");
  return Number.isFinite(fallbackExpiresAt)
    ? new Date(fallbackExpiresAt).toISOString()
    : null;
}

function taoChuKyTaoThanhToan(params, accessKey) {
  return [
    ["accessKey", accessKey],
    ["amount", params.amount],
    ["extraData", params.extraData],
    ["ipnUrl", params.ipnUrl],
    ["orderId", params.orderId],
    ["orderInfo", params.orderInfo],
    ["partnerCode", params.partnerCode],
    ["redirectUrl", params.redirectUrl],
    ["requestId", params.requestId],
    ["requestType", params.requestType],
  ]
    .map(([key, value]) => `${key}=${value ?? ""}`)
    .join("&");
}

function taoChuKyKetQuaThanhToan(payload, accessKey) {
  return [
    ["accessKey", accessKey],
    ["amount", payload.amount],
    ["extraData", payload.extraData],
    ["message", payload.message],
    ["orderId", payload.orderId],
    ["orderInfo", payload.orderInfo],
    ["orderType", payload.orderType],
    ["partnerCode", payload.partnerCode],
    ["payType", payload.payType],
    ["requestId", payload.requestId],
    ["responseTime", payload.responseTime],
    ["resultCode", payload.resultCode],
    ["transId", payload.transId],
  ]
    .map(([key, value]) => `${key}=${value ?? ""}`)
    .join("&");
}

function taoChuKyTruyVan({ orderId, partnerCode, requestId }, accessKey) {
  return [
    ["accessKey", accessKey],
    ["orderId", orderId],
    ["partnerCode", partnerCode],
    ["requestId", requestId],
  ]
    .map(([key, value]) => `${key}=${value ?? ""}`)
    .join("&");
}

async function parseMomoResponse(response, operationName) {
  let data;
  try {
    data = await response.json();
  } catch {
    const error = new Error(`${operationName} trả về dữ liệu không hợp lệ`);
    error.statusCode = 502;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      `${operationName} trả về HTTP ${response.status}: ${data.message || "Không có mô tả"}`
    );
    error.statusCode = 502;
    throw error;
  }

  return data;
}

async function taoLinkThanhToanMomo({
  orderCode,
  amount,
  transactionRef,
}) {
  const config = getMomoConfig();
  const normalizedAmount = Math.round(Number(amount));

  if (!Number.isSafeInteger(normalizedAmount) || normalizedAmount < 1000 || normalizedAmount > 50000000) {
    const error = new Error("Số tiền thanh toán MoMo phải từ 1.000₫ đến 50.000.000₫");
    error.statusCode = 400;
    throw error;
  }

  const orderId = String(transactionRef || taoMaGiaoDichMomoMoi(orderCode));
  const requestId = taoRequestIdMomo();
  const requestBody = {
    partnerCode: config.partnerCode,
    partnerName: config.partnerName,
    storeId: config.storeId,
    requestId,
    amount: normalizedAmount,
    orderId,
    orderInfo: `Thanh toan don hang ${orderCode}`.slice(0, 255),
    redirectUrl: config.redirectUrl,
    ipnUrl: config.ipnUrl,
    requestType: config.requestType,
    autoCapture: true,
    orderGroupId: "",
    extraData: Buffer.from(JSON.stringify({ orderCode }), "utf8").toString("base64"),
    lang: "vi",
  };
  requestBody.signature = createMomoSignature(
    taoChuKyTaoThanhToan(requestBody, config.accessKey),
    config.secretKey
  );

  let response;
  try {
    response = await fetch(config.paymentUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000),
    });
  } catch (cause) {
    const error = new Error("Không thể kết nối tới cổng thanh toán MoMo");
    error.statusCode = 502;
    error.cause = cause;
    throw error;
  }

  const data = await parseMomoResponse(response, "MoMo Create Payment");
  if (Number(data.resultCode) !== 0 || !data.payUrl) {
    const error = new Error(
      `MoMo từ chối tạo giao dịch (${data.resultCode ?? "N/A"}): ${data.message || "Không có mô tả"}`
    );
    error.statusCode = 502;
    throw error;
  }
  if (
    String(data.partnerCode || "") !== config.partnerCode ||
    String(data.orderId || "") !== orderId ||
    String(data.requestId || "") !== requestId ||
    Number(data.amount) !== normalizedAmount
  ) {
    const error = new Error("Thông tin trong phản hồi tạo thanh toán MoMo không khớp yêu cầu");
    error.statusCode = 502;
    throw error;
  }

  const expiresAt = layThoiDiemHetHanMomo({
    expiresInMinutes: config.paymentExpiresInMinutes,
    gatewayCreateResponse: data,
  });

  return {
    paymentUrl: data.payUrl,
    // Collection Link trả về payUrl HTTPS. Dùng chính URL này để QR có thể
    // được mở bởi camera/Zalo và dẫn tới trang chọn Ví MoMo/ATM/thẻ.
    qrCodeValue:
      config.requestType === "payWithMethod"
        ? data.payUrl
        : data.qrCodeUrl || data.payUrl,
    providerQrCodeValue: data.qrCodeUrl || null,
    deeplink: data.deeplink || null,
    requestType: config.requestType,
    expiresInMinutes: config.paymentExpiresInMinutes,
    expiresAt,
    transactionRef: orderId,
    requestId,
    gatewayCreateResponse: data,
  };
}

function xacThucPhanHoiMomo(payload) {
  const config = getMomoConfig();
  if (String(payload.partnerCode || "") !== config.partnerCode) return false;

  const expectedSignature = createMomoSignature(
    taoChuKyKetQuaThanhToan(payload, config.accessKey),
    config.secretKey
  );
  return signaturesMatch(payload.signature, expectedSignature);
}

async function truyVanGiaoDichMomo({ transactionRef }) {
  const config = getMomoConfig();
  const body = {
    partnerCode: config.partnerCode,
    requestId: taoRequestIdMomo(),
    orderId: String(transactionRef),
    lang: "vi",
  };
  body.signature = createMomoSignature(
    taoChuKyTruyVan(body, config.accessKey),
    config.secretKey
  );

  let response;
  try {
    response = await fetch(config.queryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
  } catch (cause) {
    const error = new Error("Không thể kết nối tới API truy vấn MoMo");
    error.cause = cause;
    throw error;
  }

  const data = await parseMomoResponse(response, "MoMo Query Transaction");
  if (
    String(data.partnerCode || "") !== config.partnerCode ||
    String(data.orderId || "") !== String(transactionRef)
  ) {
    throw new Error("Thông tin giao dịch trong phản hồi MoMo không khớp yêu cầu");
  }

  return data;
}

function laGiaoDichMomoThanhCong(resultCode) {
  return MOMO_SUCCESS_RESULT_CODES.has(Number(resultCode));
}

function laGiaoDichMomoDangXuLy(resultCode) {
  return MOMO_PENDING_RESULT_CODES.has(Number(resultCode));
}

module.exports = {
  taoMaGiaoDichMomoMoi,
  taoLinkThanhToanMomo,
  layThoiDiemHetHanMomo,
  truyVanGiaoDichMomo,
  xacThucPhanHoiMomo,
  laGiaoDichMomoThanhCong,
  laGiaoDichMomoDangXuLy,
};
