"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { PAYMENT_STATUS } = require("../src/common/constants/paymentStatus");
const {
  createMomoReconciliationStrategy,
} = require("../src/modules/payments/reconciliation/momo-reconciliation.strategy");

test("MoMo 1005 không có amount được đối soát thành FAILED với đúng thông báo cổng", async () => {
  const gatewayResult = {
    partnerCode: "MOMO",
    orderId: "TS-1005",
    resultCode: 1005,
    message: "Giao dịch đã hết hạn hoặc không tồn tại.",
  };
  const strategy = createMomoReconciliationStrategy({
    queryTransaction: async () => gatewayResult,
  });

  const outcome = await strategy.reconcile({
    transactionId: "TS-1005",
    amount: 250000,
  });

  assert.equal(outcome.nextStatus, PAYMENT_STATUS.FAILED);
  assert.deepEqual(outcome.gatewayResult, gatewayResult);
});

test("MoMo thành công nhưng thiếu amount vẫn bị xem là phản hồi không hợp lệ", async () => {
  const strategy = createMomoReconciliationStrategy({
    queryTransaction: async () => ({
      orderId: "TS-SUCCESS",
      resultCode: 0,
      message: "Thành công",
    }),
  });

  await assert.rejects(
    strategy.reconcile({ transactionId: "TS-SUCCESS", amount: 250000 }),
    /thiếu số tiền giao dịch/
  );
});

test("VNPAY diễn giải lỗi TLS dễ hiểu và vẫn giữ mã kỹ thuật", async () => {
  const originalFetch = global.fetch;
  const originalEnv = {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    returnUrl: process.env.VNPAY_RETURN_URL,
  };

  process.env.VNPAY_TMN_CODE = "TEST";
  process.env.VNPAY_HASH_SECRET = "secret";
  process.env.VNPAY_RETURN_URL = "http://localhost/return";
  global.fetch = async () => {
    const error = new TypeError("fetch failed");
    error.cause = Object.assign(
      new Error("unable to get local issuer certificate"),
      { code: "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" }
    );
    throw error;
  };

  try {
    const { truyVanGiaoDichVnpay } = require("../src/modules/payments/vnpay.service");
    await assert.rejects(
      truyVanGiaoDichVnpay({
        transactionRef: "TS-TLS",
        transactionDate: "20260701120000",
      }),
      (error) => {
        assert.match(error.message, /không xác thực được chứng chỉ bảo mật/);
        assert.match(error.message, /không phải thông báo giao dịch đã hết hạn/);
        assert.match(error.message, /chưa thể xác định giao dịch/);
        assert.match(error.message, /--use-system-ca/);
        assert.match(error.message, /UNABLE_TO_GET_ISSUER_CERT_LOCALLY/);
        assert.doesNotMatch(error.message, /fetch failed/);
        return true;
      }
    );
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries({
      VNPAY_TMN_CODE: originalEnv.tmnCode,
      VNPAY_HASH_SECRET: originalEnv.hashSecret,
      VNPAY_RETURN_URL: originalEnv.returnUrl,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
