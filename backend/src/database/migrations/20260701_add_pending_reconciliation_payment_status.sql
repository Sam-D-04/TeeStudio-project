-- Cho phép lưu trạng thái trung gian của tiền COD sau khi giao hàng nhưng
-- trước khi admin/kế toán thực nhận tiền từ đơn vị vận chuyển.
ALTER TABLE `Payment`
  MODIFY COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING';

-- Sửa dữ liệu cũ: đơn COD đã hoàn tất nhưng vẫn đang PENDING phải chờ đối soát,
-- không còn được hiểu là một giao dịch đang chờ khách thanh toán.
UPDATE `Payment` p
JOIN `CustomerOrder` co ON co.id = p.orderId
SET p.status = 'PENDING_RECONCILIATION'
WHERE p.paymentMethod = 'COD'
  AND p.status = 'PENDING'
  AND co.status = 'COMPLETED';

-- Với dữ liệu cũ đã hoàn tất sau khi thanh toán cọc online, tạo giao dịch COD
-- riêng cho phần còn lại để không làm mất lịch sử giao dịch đặt cọc.
INSERT INTO `Payment`
  (`orderId`, `amount`, `paymentMethod`, `paymentType`, `status`, `note`)
SELECT
  co.id,
  co.codAmount,
  'COD',
  'COD_FINAL',
  'PENDING_RECONCILIATION',
  'Backfill khoản COD còn lại của đơn đã hoàn tất'
FROM `CustomerOrder` co
WHERE co.status = 'COMPLETED'
  AND co.codAmount > 0
  AND EXISTS (
    SELECT 1
    FROM `Payment` pDeposit
    WHERE pDeposit.orderId = co.id
      AND pDeposit.paymentType = 'DEPOSIT'
      AND pDeposit.status = 'COMPLETED'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM `Payment` pCod
    WHERE pCod.orderId = co.id
      AND pCod.paymentMethod = 'COD'
      AND pCod.paymentType <> 'DEPOSIT'
  );
