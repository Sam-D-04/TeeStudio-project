ALTER TABLE `Payment`
  MODIFY COLUMN `paymentMethod` VARCHAR(30) NOT NULL
    COMMENT 'Phương thức thanh toán dùng chung: COD, VNPAY, MOMO';

SET @momo_payment_index_exists = (
  SELECT COUNT(*)
  FROM `information_schema`.`statistics`
  WHERE `table_schema` = DATABASE()
    AND `table_name` = 'Payment'
    AND `index_name` = 'idx_payment_method_status_created_at'
);

SET @momo_payment_index_sql = IF(
  @momo_payment_index_exists = 0,
  'ALTER TABLE `Payment` ADD KEY `idx_payment_method_status_created_at` (`paymentMethod`, `status`, `createdAt`)',
  'SELECT 1'
);

PREPARE momo_payment_index_statement FROM @momo_payment_index_sql;
EXECUTE momo_payment_index_statement;
DEALLOCATE PREPARE momo_payment_index_statement;
