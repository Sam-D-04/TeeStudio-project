"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  PAYMENT_STATUS,
  mapStatusToFrontend,
} = require("../src/common/constants/paymentStatus");
const {
  taoBoLocThanhToan,
} = require("../src/modules/payments/payment-filter.util");

test("COD PENDING vẫn là chờ thanh toán, chưa phải chờ đối soát", () => {
  assert.equal(mapStatusToFrontend("PENDING", "COD", "COD_FINAL"), "cho_thanh_toan");
});

test("chỉ PENDING_RECONCILIATION được hiển thị là cần đối soát", () => {
  assert.equal(
    mapStatusToFrontend(PAYMENT_STATUS.PENDING_RECONCILIATION, "COD", "COD_FINAL"),
    "can_doi_soat"
  );

  const filter = taoBoLocThanhToan({ trangThai: "can_doi_soat" });
  assert.match(filter.whereClause, /p\.status = 'PENDING_RECONCILIATION'/);
  assert.match(filter.whereClause, /p\.paymentMethod = 'COD'/);
});

test("bộ lọc đã thanh toán loại tiền cọc khỏi doanh thu đủ", () => {
  const filter = taoBoLocThanhToan({ trangThai: "da_thanh_toan" });
  assert.match(filter.whereClause, /p\.status = 'COMPLETED'/);
  assert.match(filter.whereClause, /p\.paymentType <> 'DEPOSIT'/);
});
