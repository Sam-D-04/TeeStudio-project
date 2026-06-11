UPDATE Payment
SET paymentType = 'FULL'
WHERE paymentType IN ('ONLINE', 'OFFLINE');
