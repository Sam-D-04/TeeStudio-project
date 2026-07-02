"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ORDER_PAYMENT_STATUS,
  syncOrderPaymentStatus,
} = require("../src/modules/payments/order-payment-progress.service");

test("tiến độ thanh toán cấp đơn có ba trạng thái tách biệt", () => {
  assert.deepEqual(ORDER_PAYMENT_STATUS, {
    PENDING: "PENDING",
    PARTIALLY_PAID: "PARTIALLY_PAID",
    PAID: "PAID",
  });
});

test("đồng bộ tiến độ chỉ cập nhật paymentStatus, không ghi đè paymentType", async () => {
  const calls = [];
  const executor = {
    query: async (sql, params) => {
      calls.push({ sql, params });
      return [{ affectedRows: 1 }];
    },
  };

  await syncOrderPaymentStatus(executor, 42);

  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /SET co\.paymentStatus = CASE/);
  assert.match(calls[0].sql, /THEN 'PAID'/);
  assert.match(calls[0].sql, /THEN 'PARTIALLY_PAID'/);
  assert.doesNotMatch(calls[0].sql, /SET\s+co\.paymentType/i);
  assert.deepEqual(calls[0].params, [42]);
});
