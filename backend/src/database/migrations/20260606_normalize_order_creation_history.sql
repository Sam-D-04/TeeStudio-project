-- Mỗi đơn hàng chỉ có một mốc tạo đơn.
-- Chuẩn hóa dữ liệu cũ và bổ sung lịch sử cho các đơn chưa có OrderHistory.

UPDATE OrderHistory
SET
  action = CASE
    WHEN actorRole = 'ADMIN' THEN 'Tạo đơn cho khách'
    ELSE 'Khách hàng đặt đơn'
  END,
  note = CASE
    WHEN actorRole = 'ADMIN' THEN 'Tạo đơn cho khách'
    ELSE 'Khách hàng đặt đơn'
  END
WHERE action = 'CREATED'
   OR (action = 'STATUS_CHANGED' AND fromStatus IS NULL AND toStatus = 'PENDING');

DELETE duplicate_history
FROM OrderHistory duplicate_history
JOIN OrderHistory original_history
  ON original_history.orderId = duplicate_history.orderId
 AND original_history.id < duplicate_history.id
 AND original_history.action IN ('Khách hàng đặt đơn', 'Tạo đơn cho khách')
WHERE duplicate_history.action IN ('Khách hàng đặt đơn', 'Tạo đơn cho khách');

INSERT INTO OrderHistory
  (orderId, fromStatus, toStatus, action, actorId, actorRole, actorName, note, createdAt)
SELECT
  co.id,
  NULL,
  'PENDING',
  'Khách hàng đặt đơn',
  co.userId,
  'CUSTOMER',
  COALESCE(account.fullName, 'Khách hàng'),
  'Khách hàng đặt đơn',
  co.createdAt
FROM CustomerOrder co
LEFT JOIN Account account ON account.id = co.userId
WHERE NOT EXISTS (
  SELECT 1
  FROM OrderHistory history
  WHERE history.orderId = co.id
    AND history.action IN ('CREATED', 'Khách hàng đặt đơn', 'Tạo đơn cho khách')
);

INSERT INTO OrderHistory
  (orderId, fromStatus, toStatus, action, actorId, actorRole, actorName, note, createdAt)
SELECT
  co.id,
  'PENDING',
  co.status,
  CASE WHEN co.status = 'CANCELLED' THEN 'CANCELLED' ELSE 'STATUS_CHANGED' END,
  NULL,
  'SYSTEM',
  'Hệ thống',
  NULL,
  co.updatedAt
FROM CustomerOrder co
WHERE co.status <> 'PENDING'
  AND NOT EXISTS (
    SELECT 1
    FROM OrderHistory history
    WHERE history.orderId = co.id
      AND history.toStatus = co.status
      AND history.action NOT IN ('CREATED', 'Khách hàng đặt đơn', 'Tạo đơn cho khách')
  );
