UPDATE Payment p
JOIN CustomerOrder co ON co.id = p.orderId
SET p.transactionId = REGEXP_REPLACE(co.orderCode, '[^a-zA-Z0-9]', '')
WHERE p.paymentMethod = 'VNPAY'
  AND p.transactionId IS NULL;
