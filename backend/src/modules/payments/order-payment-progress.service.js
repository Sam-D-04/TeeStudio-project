const ORDER_PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
});

/**
 * Đồng bộ tiến độ thanh toán tổng của đơn từ các giao dịch đã hoàn tất.
 * paymentType của CustomerOrder không xuất hiện trong câu UPDATE này vì đó là
 * chính sách bất biến được chốt một lần khi tạo đơn.
 */
async function syncOrderPaymentStatus(executor, orderId) {
  await executor.query(
    `UPDATE CustomerOrder co
     SET co.paymentStatus = CASE
       WHEN COALESCE((
         SELECT SUM(p.amount)
         FROM Payment p
         WHERE p.orderId = co.id
           AND p.status = 'COMPLETED'
       ), 0) >= co.totalAmount THEN 'PAID'
       WHEN COALESCE((
         SELECT SUM(p.amount)
         FROM Payment p
         WHERE p.orderId = co.id
           AND p.status = 'COMPLETED'
       ), 0) > 0 THEN 'PARTIALLY_PAID'
       ELSE 'PENDING'
     END
     WHERE co.id = ?`,
    [orderId]
  );
}

module.exports = {
  ORDER_PAYMENT_STATUS,
  syncOrderPaymentStatus,
};
