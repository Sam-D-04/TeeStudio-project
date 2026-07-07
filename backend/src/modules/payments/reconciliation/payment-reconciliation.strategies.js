const { momoReconciliationStrategy } = require("./momo-reconciliation.strategy");
const { vnpayReconciliationStrategy } = require("./vnpay-reconciliation.strategy");

// Registry là điểm mở rộng duy nhất khi tích hợp thêm cổng thanh toán.
// Mỗi strategy chỉ cần khai báo paymentMethod và hàm reconcile(payment).
const PAYMENT_RECONCILIATION_STRATEGIES = Object.freeze({
  [vnpayReconciliationStrategy.paymentMethod]: vnpayReconciliationStrategy,
  [momoReconciliationStrategy.paymentMethod]: momoReconciliationStrategy,
});

module.exports = { PAYMENT_RECONCILIATION_STRATEGIES };
