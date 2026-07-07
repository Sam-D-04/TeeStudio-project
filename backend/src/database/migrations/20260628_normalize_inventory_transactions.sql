-- Chuẩn hóa lịch sử kho cho các SKU có số dư nhưng chưa từng có giao dịch.
-- Không ghi lùi createdAt vì không thể khôi phục chính xác thời điểm
-- phát sinh tồn kho của dữ liệu cũ.
INSERT INTO `InventoryTransaction`
  (`variantId`, `orderId`, `supplierId`, `quantityChanged`, `transactionType`, `reason`, `createdAt`)
SELECT
  pv.`id`,
  NULL,
  NULL,
  pv.`stockQty`,
  'ADJUSTMENT',
  'Số dư đầu kỳ khi chuẩn hóa lịch sử kho',
  CURRENT_TIMESTAMP
FROM `ProductVariant` pv
WHERE pv.`stockQty` <> 0
  AND NOT EXISTS (
    SELECT 1
    FROM `InventoryTransaction` inventory_transaction
    WHERE inventory_transaction.`variantId` = pv.`id`
  );

-- Phục vụ truy vấn "SKU có biến động trong khoảng" theo variant + createdAt.
-- Các lệnh DDL bên dưới có thể chạy lại an toàn trên cả schema cũ lẫn schema mới.
SET @has_old_inventory_index = (
  SELECT COUNT(*)
  FROM `information_schema`.`STATISTICS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'InventoryTransaction'
    AND `INDEX_NAME` = 'idx_inventory_transaction_variant_id'
);
SET @drop_old_inventory_index_sql = IF(
  @has_old_inventory_index > 0,
  'ALTER TABLE `InventoryTransaction` DROP INDEX `idx_inventory_transaction_variant_id`',
  'SELECT 1'
);
PREPARE inventory_index_statement FROM @drop_old_inventory_index_sql;
EXECUTE inventory_index_statement;
DEALLOCATE PREPARE inventory_index_statement;

SET @has_new_inventory_index = (
  SELECT COUNT(*)
  FROM `information_schema`.`STATISTICS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'InventoryTransaction'
    AND `INDEX_NAME` = 'idx_inventory_transaction_variant_created_at'
);
SET @add_new_inventory_index_sql = IF(
  @has_new_inventory_index = 0,
  'ALTER TABLE `InventoryTransaction` ADD KEY `idx_inventory_transaction_variant_created_at` (`variantId`, `createdAt`)',
  'SELECT 1'
);
PREPARE inventory_index_statement FROM @add_new_inventory_index_sql;
EXECUTE inventory_index_statement;
DEALLOCATE PREPARE inventory_index_statement;
