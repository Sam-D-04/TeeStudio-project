-- Lưu mã màu thực tế cùng biến thể để màu do Admin tự tạo không bị mất sau khi tải lại.
SET @has_color_hex = (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = DATABASE()
    AND `TABLE_NAME` = 'ProductVariant'
    AND `COLUMN_NAME` = 'colorHex'
);

SET @add_color_hex_sql = IF(
  @has_color_hex = 0,
  'ALTER TABLE `ProductVariant` ADD COLUMN `colorHex` CHAR(7) NOT NULL DEFAULT ''#94a3b8'' AFTER `color`',
  'SELECT 1'
);
PREPARE color_hex_statement FROM @add_color_hex_sql;
EXECUTE color_hex_statement;
DEALLOCATE PREPARE color_hex_statement;

-- Khôi phục màu cho dữ liệu cũ; các tên màu chưa biết giữ màu xám trung tính.
UPDATE `ProductVariant`
SET `colorHex` = CASE LOWER(TRIM(`color`))
  WHEN 'đen' THEN '#1a1a1a'
  WHEN 'trắng' THEN '#ffffff'
  WHEN 'trắng sữa' THEN '#f8f5f0'
  WHEN 'xám' THEN '#6b7280'
  WHEN 'xám nhạt' THEN '#d1d5db'
  WHEN 'xám tiêu' THEN '#737373'
  WHEN 'navy' THEN '#1e3a8a'
  WHEN 'xanh navy' THEN '#1e3a8a'
  WHEN 'xanh hải quân' THEN '#1e3a8a'
  WHEN 'xanh dương' THEN '#2563eb'
  WHEN 'xanh lá' THEN '#16a34a'
  WHEN 'xanh rêu' THEN '#4d7c0f'
  WHEN 'đỏ' THEN '#dc2626'
  WHEN 'cam' THEN '#ea580c'
  WHEN 'vàng' THEN '#ca8a04'
  WHEN 'hồng' THEN '#ec4899'
  WHEN 'tím' THEN '#7c3aed'
  WHEN 'nâu' THEN '#92400e'
  WHEN 'be' THEN '#d4b896'
  ELSE COALESCE(NULLIF(`colorHex`, ''), '#94a3b8')
END
WHERE `colorHex` IS NULL
   OR `colorHex` = ''
   OR `colorHex` = '#94a3b8';
