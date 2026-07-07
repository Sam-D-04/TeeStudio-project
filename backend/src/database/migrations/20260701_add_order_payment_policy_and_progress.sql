-- paymentType trên CustomerOrder là quyết định ban đầu, bất biến của khách.
-- Payment.paymentType tiếp tục mô tả loại của từng giao dịch (cọc/toàn bộ/COD còn lại).
ALTER TABLE `CustomerOrder`
  ADD COLUMN `paymentType` VARCHAR(20) NULL
    COMMENT 'Chính sách thanh toán ban đầu, bất biến: FULL hoặc DEPOSIT'
    AFTER `codAmount`,
  ADD COLUMN `paymentStatus` VARCHAR(30) NOT NULL DEFAULT 'PENDING'
    COMMENT 'Tiến độ thanh toán tổng của đơn: PENDING, PARTIALLY_PAID, PAID'
    AFTER `paymentType`;

-- Khôi phục chính sách ban đầu cho dữ liệu cũ. Chỉ cần từng có giao dịch DEPOSIT
-- thì đơn đó vốn được khách chọn chính sách đặt cọc.
UPDATE `CustomerOrder` co
SET co.paymentType = CASE
  WHEN EXISTS (
    SELECT 1
    FROM `Payment` p
    WHERE p.orderId = co.id
      AND p.paymentType = 'DEPOSIT'
  ) THEN 'DEPOSIT'
  ELSE 'FULL'
END;

-- Tiến độ tổng được tính bằng tổng các giao dịch đã hoàn tất, không suy ra từ
-- giao dịch mới nhất (vì giao dịch mới nhất có thể là COD_FINAL).
UPDATE `CustomerOrder` co
SET co.paymentStatus = CASE
  WHEN COALESCE((
    SELECT SUM(p.amount)
    FROM `Payment` p
    WHERE p.orderId = co.id AND p.status = 'COMPLETED'
  ), 0) >= co.totalAmount THEN 'PAID'
  WHEN COALESCE((
    SELECT SUM(p.amount)
    FROM `Payment` p
    WHERE p.orderId = co.id AND p.status = 'COMPLETED'
  ), 0) > 0 THEN 'PARTIALLY_PAID'
  ELSE 'PENDING'
END;

ALTER TABLE `CustomerOrder`
  MODIFY COLUMN `paymentType` VARCHAR(20) NOT NULL
    COMMENT 'Chính sách thanh toán ban đầu, bất biến: FULL hoặc DEPOSIT',
  ADD KEY `idx_customer_order_payment_type_status` (`paymentType`, `paymentStatus`);

-- Chốt tính bất biến ngay tại DB: mọi UPDATE cố thay paymentType đều bị từ chối.
DROP TRIGGER IF EXISTS `trg_customer_order_payment_type_immutable`;
DELIMITER $$
CREATE TRIGGER `trg_customer_order_payment_type_immutable`
BEFORE UPDATE ON `CustomerOrder`
FOR EACH ROW
BEGIN
  IF NOT (NEW.paymentType <=> OLD.paymentType) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'CustomerOrder.paymentType is immutable';
  END IF;
END$$
DELIMITER ;
