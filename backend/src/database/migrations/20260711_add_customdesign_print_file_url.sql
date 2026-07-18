-- Lưu link file in print-ready (PNG nền trong suốt, độ phân giải cao) của thiết kế khách.
-- File này do FE export từ canvas rồi API tạo đơn đẩy lên Cloudinary và ghi lại URL.
SET @has_print_file_url = (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'CustomDesign'
    AND `COLUMN_NAME` = 'printFileUrl'
);

SET @add_print_file_url_sql = IF(
  @has_print_file_url = 0,
  'ALTER TABLE `CustomDesign` ADD COLUMN `printFileUrl` VARCHAR(500) NULL AFTER `previewUrl`',
  'SELECT 1'
);
PREPARE print_file_url_statement FROM @add_print_file_url_sql;
EXECUTE print_file_url_statement;
DEALLOCATE PREPARE print_file_url_statement;
