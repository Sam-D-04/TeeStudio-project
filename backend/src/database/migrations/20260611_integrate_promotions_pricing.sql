-- Tích hợp trang quản trị Khuyến mãi & Báo giá với dữ liệu thật.

ALTER TABLE `Promotion`
  MODIFY COLUMN `discountType` VARCHAR(30) NOT NULL COMMENT 'PERCENT, FIXED, FREE_SHIPPING',
  MODIFY COLUMN `discountValue` DECIMAL(15,2) NOT NULL DEFAULT 0,
  MODIFY COLUMN `endDate` DATETIME NULL,
  MODIFY COLUMN `usageLimit` INT NULL,
  ADD COLUMN `isNewCustomerOnly` TINYINT NOT NULL DEFAULT 0 AFTER `usedCount`,
  ADD COLUMN `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`,
  ADD COLUMN `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `createdAt`,
  ADD KEY `idx_promotion_status_dates` (`status`, `startDate`, `endDate`);

CREATE TABLE IF NOT EXISTS `PricingConfiguration` (
  `id` INT NOT NULL,
  `roundingUnit` INT NOT NULL DEFAULT 1000,
  `defaultShippingFee` DECIMAL(15,2) NOT NULL DEFAULT 30000,
  `freeShippingThreshold` DECIMAL(15,2) NOT NULL DEFAULT 500000,
  `vatPercent` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `PricingConfiguration`
  (`id`, `roundingUnit`, `defaultShippingFee`, `freeShippingThreshold`, `vatPercent`)
VALUES (1, 1000, 30000, 500000, 0)
ON DUPLICATE KEY UPDATE `id` = `id`;
