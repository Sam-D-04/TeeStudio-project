-- Tách CustomDesign.printFileUrl (1 cột dùng chung cho cả 2 mặt) thành 2 cột
-- riêng theo mặt in: printFileUrlFront + printFileUrlBack. Trước Giai đoạn 1-2
-- (tách dữ liệu 2 mặt trong Design Studio + chụp riêng từng mặt), mỗi thiết kế
-- chỉ có 1 ảnh in duy nhất - ảnh đó luôn là ảnh mặt trước (mặt mặc định), nên
-- đổi tên (RENAME) cột cũ thay vì thêm cột mới rồi xoá: giữ nguyên toàn bộ giá
-- trị cũ mà không cần backfill thủ công, dữ liệu cũ tự động được coi là front.
SET @has_print_file_url = (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'CustomDesign'
    AND `COLUMN_NAME` = 'printFileUrl'
);

SET @has_print_file_url_front = (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'CustomDesign'
    AND `COLUMN_NAME` = 'printFileUrlFront'
);

-- Cột cũ "printFileUrl" còn tồn tại và chưa được đổi tên lần nào trước đó →
-- đổi tên nó thành "printFileUrlFront", giữ nguyên dữ liệu (coi là ảnh mặt trước).
SET @rename_print_file_url_sql = IF(
  @has_print_file_url = 1 AND @has_print_file_url_front = 0,
  'ALTER TABLE `CustomDesign` CHANGE COLUMN `printFileUrl` `printFileUrlFront` VARCHAR(500) NULL',
  'SELECT 1'
);
PREPARE rename_print_file_url_statement FROM @rename_print_file_url_sql;
EXECUTE rename_print_file_url_statement;
DEALLOCATE PREPARE rename_print_file_url_statement;

-- DB chưa từng có cả "printFileUrl" lẫn "printFileUrlFront" (vd. tạo mới hoàn
-- toàn, migration 20260711 chưa từng chạy) → thêm thẳng cột "printFileUrlFront".
SET @has_print_file_url_front_now = (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'CustomDesign'
    AND `COLUMN_NAME` = 'printFileUrlFront'
);
SET @add_print_file_url_front_sql = IF(
  @has_print_file_url_front_now = 0,
  'ALTER TABLE `CustomDesign` ADD COLUMN `printFileUrlFront` VARCHAR(500) NULL AFTER `previewUrl`',
  'SELECT 1'
);
PREPARE add_print_file_url_front_statement FROM @add_print_file_url_front_sql;
EXECUTE add_print_file_url_front_statement;
DEALLOCATE PREPARE add_print_file_url_front_statement;

-- Cột mới cho ảnh in mặt sau.
SET @has_print_file_url_back = (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'CustomDesign'
    AND `COLUMN_NAME` = 'printFileUrlBack'
);
SET @add_print_file_url_back_sql = IF(
  @has_print_file_url_back = 0,
  'ALTER TABLE `CustomDesign` ADD COLUMN `printFileUrlBack` VARCHAR(500) NULL AFTER `printFileUrlFront`',
  'SELECT 1'
);
PREPARE add_print_file_url_back_statement FROM @add_print_file_url_back_sql;
EXECUTE add_print_file_url_back_statement;
DEALLOCATE PREPARE add_print_file_url_back_statement;
