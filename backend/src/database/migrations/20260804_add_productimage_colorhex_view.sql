-- Thêm colorHex/view vào ProductImage để Design Studio tra ảnh mockup theo màu
-- trực tiếp từ DB thay vì đoán màu qua bảng hardcode trong code frontend.
SET @has_color_hex = (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'ProductImage'
    AND `COLUMN_NAME` = 'colorHex'
);

SET @add_color_hex_sql = IF(
  @has_color_hex = 0,
  'ALTER TABLE `ProductImage` ADD COLUMN `colorHex` CHAR(7) NULL AFTER `variantId`',
  'SELECT 1'
);
PREPARE color_hex_statement FROM @add_color_hex_sql;
EXECUTE color_hex_statement;
DEALLOCATE PREPARE color_hex_statement;

SET @has_view = (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'ProductImage'
    AND `COLUMN_NAME` = 'view'
);

SET @add_view_sql = IF(
  @has_view = 0,
  'ALTER TABLE `ProductImage` ADD COLUMN `view` ENUM(''front'',''back'') NULL AFTER `colorHex`',
  'SELECT 1'
);
PREPARE view_statement FROM @add_view_sql;
EXECUTE view_statement;
DEALLOCATE PREPARE view_statement;

-- Backfill 22 dòng ảnh mockup hiện có, dựa theo altText dạng "{Color}-{front|back}"
-- (xem backend/scripts/backfill-product-image-colorhex.js để chạy 1 lần, hoặc dùng
-- trực tiếp UPDATE dưới đây nếu altText đã đúng convention và chưa đổi).
UPDATE `ProductImage`
SET
  `colorHex` = CASE
    WHEN `altText` LIKE 'Black-%' THEN '#000000'
    WHEN `altText` LIKE 'White-%' THEN '#FFFFFF'
    WHEN `altText` LIKE 'Navy-%'  THEN '#1E3A8A'
    WHEN `altText` LIKE 'Brown-%' THEN '#8B4513'
    WHEN `altText` LIKE 'Grey-%'  THEN '#9CA3AF'
    WHEN `altText` LIKE 'Beige-%' THEN '#D6B89A'
    ELSE `colorHex`
  END,
  `view` = CASE
    WHEN `altText` LIKE '%-front' THEN 'front'
    WHEN `altText` LIKE '%-back'  THEN 'back'
    ELSE `view`
  END
WHERE `colorHex` IS NULL OR `view` IS NULL;

-- Toàn bộ ProductImage hiện tại đều là ảnh mockup theo màu/mặt — sau backfill
-- không còn dòng NULL nên khoá lại NOT NULL để tránh dữ liệu thiếu về sau.
ALTER TABLE `ProductImage` MODIFY COLUMN `colorHex` CHAR(7) NOT NULL;
ALTER TABLE `ProductImage` MODIFY COLUMN `view` ENUM('front','back') NOT NULL;
