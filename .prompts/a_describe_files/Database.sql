SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `Account` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`email` VARCHAR(255) NOT NULL,
	`passwordHash` VARCHAR(255) NOT NULL,
	`fullName` VARCHAR(255) NOT NULL,
	`phone` VARCHAR(20) NOT NULL,
	`role` VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
	`status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_account_email` (`email`),
	KEY `idx_account_role_status` (`role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UserToken` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`userId` INT NOT NULL,
	`refreshToken` VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash of refresh token',
	`expiresAt` DATETIME NOT NULL,
	`userAgent` VARCHAR(500) NULL,
	`ipAddress` VARCHAR(45) NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_user_token_refresh_token` (`refreshToken`),
	KEY `idx_user_token_user_id` (`userId`),
	KEY `idx_user_token_expires_at` (`expiresAt`),
	CONSTRAINT `fk_user_token_user`
		FOREIGN KEY (`userId`) REFERENCES `Account` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `UserAddress` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`userId` INT NOT NULL,
	`recipientName` VARCHAR(255) NOT NULL,
	`phone` VARCHAR(20) NOT NULL,
	`addressLine` TEXT NOT NULL,
	`city` VARCHAR(100) NOT NULL,
	`district` VARCHAR(100) NOT NULL,
	`ward` VARCHAR(100) NOT NULL,
	`isDefault` TINYINT NOT NULL DEFAULT 0,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_user_address_user_id` (`userId`),
	CONSTRAINT `fk_user_address_user`
		FOREIGN KEY (`userId`) REFERENCES `Account` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Category` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(200) NOT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Product` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`categoryId` INT NOT NULL,
	`name` VARCHAR(300) NOT NULL,
	`slug` VARCHAR(300) NOT NULL,
	`basePrice` DECIMAL(15,2) NOT NULL,
	`material` VARCHAR(200) NOT NULL,
	`form` VARCHAR(100) NOT NULL COMMENT 'product shape/form',
	`madeIn` VARCHAR(100) NOT NULL,
	`description` TEXT NOT NULL,
	`status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_product_slug` (`slug`),
	KEY `idx_product_category_id` (`categoryId`),
	CONSTRAINT `fk_product_category`
		FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ProductVariant` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`productId` INT NOT NULL,
	`color` VARCHAR(100) NOT NULL,
	`size` VARCHAR(20) NOT NULL,
	`sku` VARCHAR(100) NOT NULL,
	`stockQty` INT NOT NULL DEFAULT 0,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_product_variant_sku` (`sku`),
	UNIQUE KEY `uq_product_variant_product_color_size` (`productId`, `color`, `size`),
	KEY `idx_product_variant_product_id` (`productId`),
	CONSTRAINT `fk_product_variant_product`
		FOREIGN KEY (`productId`) REFERENCES `Product` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `ProductImage` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`productId` INT NOT NULL,
	`variantId` INT NULL,
	`imageUrl` VARCHAR(500) NOT NULL,
	`altText` VARCHAR(300) NOT NULL,
	`sortOrder` INT NOT NULL DEFAULT 0,
	`isPrimary` TINYINT NOT NULL DEFAULT 0,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_product_image_product_id` (`productId`),
	KEY `idx_product_image_variant_id` (`variantId`),
	CONSTRAINT `fk_product_image_product`
		FOREIGN KEY (`productId`) REFERENCES `Product` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `fk_product_image_variant`
		FOREIGN KEY (`variantId`) REFERENCES `ProductVariant` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `BulkPricing` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`productId` INT NOT NULL,
	`minQty` INT NOT NULL,
	`discountPercent` DECIMAL(5,2) NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_bulk_pricing_product_min_qty` (`productId`, `minQty`),
	KEY `idx_bulk_pricing_product_id` (`productId`),
	CONSTRAINT `fk_bulk_pricing_product`
		FOREIGN KEY (`productId`) REFERENCES `Product` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `PrintPosition` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`code` VARCHAR(50) NOT NULL,
	`name` VARCHAR(100) NOT NULL,
	`extraCost` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`maxWidth` DECIMAL(10,2) NULL,
	`maxHeight` DECIMAL(10,2) NULL,
	`printAreaX` DECIMAL(10,2) NULL,
	`printAreaY` DECIMAL(10,2) NULL,
	`printAreaWidth` DECIMAL(10,2) NULL,
	`printAreaHeight` DECIMAL(10,2) NULL,
	`isActive` TINYINT NOT NULL DEFAULT 1,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_print_position_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `PrintMethod` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`code` VARCHAR(50) NOT NULL,
	`name` VARCHAR(100) NOT NULL,
	`extraCost` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`isActive` TINYINT NOT NULL DEFAULT 1,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_print_method_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Sticker` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(200) NOT NULL,
	`category` VARCHAR(100) NOT NULL,
	`imageUrl` VARCHAR(500) NOT NULL,
	`sortOrder` INT NOT NULL DEFAULT 0,
	`isActive` TINYINT NOT NULL DEFAULT 1,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_sticker_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Supplier` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(200) NOT NULL,
	`phone` VARCHAR(20) NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_supplier_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CustomDesign` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`userId` INT NOT NULL,
	`productId` INT NOT NULL,
	`variantId` INT NULL,
	`baseColor` VARCHAR(100) NOT NULL,
	`canvasData` JSON NOT NULL,
	`previewUrl` VARCHAR(500) NOT NULL,
	`designFee` DECIMAL(15,2) NOT NULL DEFAULT 0,
	-- Các giá trị status hợp lệ:
	-- 'DRAFT'          = Khách đang soạn (chưa gửi)
	-- 'PENDING_REVIEW' = Chờ admin kiểm tra
	-- 'NEEDS_REVISION' = Admin yêu cầu khách chỉnh sửa
	-- 'APPROVED'       = Admin đã duyệt
	`status` VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
	`adminNote` TEXT NULL COMMENT 'Ghi chú của admin khi yêu cầu khách chỉnh sửa thiết kế',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_custom_design_user_id` (`userId`),
	KEY `idx_custom_design_product_id` (`productId`),
	KEY `idx_custom_design_variant_id` (`variantId`),
	KEY `idx_custom_design_status` (`status`),
	CONSTRAINT `fk_custom_design_user`
		FOREIGN KEY (`userId`) REFERENCES `Account` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_custom_design_product`
		FOREIGN KEY (`productId`) REFERENCES `Product` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_custom_design_variant`
		FOREIGN KEY (`variantId`) REFERENCES `ProductVariant` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `DesignPrintPosition` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`designId` INT NOT NULL,
	`printPositionId` INT NOT NULL,
	`extraCost` DECIMAL(15,2) NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_design_print_position` (`designId`, `printPositionId`),
	KEY `idx_design_print_position_design_id` (`designId`),
	KEY `idx_design_print_position_position_id` (`printPositionId`),
	CONSTRAINT `fk_design_print_position_design`
		FOREIGN KEY (`designId`) REFERENCES `CustomDesign` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `fk_design_print_position_position`
		FOREIGN KEY (`printPositionId`) REFERENCES `PrintPosition` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `DesignPrintMethod` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`designId` INT NOT NULL,
	`printMethodId` INT NOT NULL,
	`extraCost` DECIMAL(15,2) NOT NULL DEFAULT 0,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_design_print_method` (`designId`, `printMethodId`),
	KEY `idx_design_print_method_design_id` (`designId`),
	KEY `idx_design_print_method_method_id` (`printMethodId`),
	CONSTRAINT `fk_design_print_method_design`
		FOREIGN KEY (`designId`) REFERENCES `CustomDesign` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `fk_design_print_method_method`
		FOREIGN KEY (`printMethodId`) REFERENCES `PrintMethod` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Cart` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`userId` INT NOT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_cart_user_id` (`userId`),
	KEY `idx_cart_user_id` (`userId`),
	CONSTRAINT `fk_cart_user`
		FOREIGN KEY (`userId`) REFERENCES `Account` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CartItem` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`cartId` INT NOT NULL,
	`variantId` INT NOT NULL,
	`designId` INT NULL,
	`quantity` INT NOT NULL DEFAULT 1,
	PRIMARY KEY (`id`),
	KEY `idx_cart_item_cart_id` (`cartId`),
	KEY `idx_cart_item_variant_id` (`variantId`),
	KEY `idx_cart_item_design_id` (`designId`),
	CONSTRAINT `fk_cart_item_cart`
		FOREIGN KEY (`cartId`) REFERENCES `Cart` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `fk_cart_item_variant`
		FOREIGN KEY (`variantId`) REFERENCES `ProductVariant` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_cart_item_design`
		FOREIGN KEY (`designId`) REFERENCES `CustomDesign` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Promotion` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`code` VARCHAR(50) NOT NULL,
	`discountType` VARCHAR(20) NOT NULL,
	`discountValue` DECIMAL(15,2) NOT NULL,
	`minOrderAmount` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`startDate` DATETIME NOT NULL,
	`endDate` DATETIME NOT NULL,
	`usageLimit` INT NOT NULL,
	`usedCount` INT NOT NULL DEFAULT 0,
	`status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_promotion_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `CustomerOrder` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`orderCode` VARCHAR(50) NOT NULL,
	`userId` INT NOT NULL,
	`promotionId` INT NULL,
	`addressId` INT NOT NULL,
	`subtotal` DECIMAL(15,2) NOT NULL,
	`discountAmount` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`shippingFee` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`shippingCarrier` VARCHAR(50) NULL,
	`shippingMethod` VARCHAR(50) NULL,
	`trackingCode` VARCHAR(100) NULL,
	`shippedAt` DATETIME NULL,
	`deliveredAt` DATETIME NULL,
	`cancelReason` TEXT NULL,
	`totalAmount` DECIMAL(15,2) NOT NULL,
	`depositAmount` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`codAmount` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_customer_order_code` (`orderCode`),
	KEY `idx_customer_order_user_id` (`userId`),
	KEY `idx_customer_order_promotion_id` (`promotionId`),
	KEY `idx_customer_order_address_id` (`addressId`),
	CONSTRAINT `fk_customer_order_user`
		FOREIGN KEY (`userId`) REFERENCES `Account` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_customer_order_promotion`
		FOREIGN KEY (`promotionId`) REFERENCES `Promotion` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL,
	CONSTRAINT `fk_customer_order_address`
		FOREIGN KEY (`addressId`) REFERENCES `UserAddress` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `OrderItem` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`orderId` INT NOT NULL,
	`variantId` INT NOT NULL,
	`designId` INT NULL,
	`quantity` INT NOT NULL,
	`unitPrice` DECIMAL(15,2) NOT NULL,
	`designFee` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`lineTotal` DECIMAL(15,2) NOT NULL,
	`productionStatus` VARCHAR(30) NOT NULL DEFAULT 'WAITING_DESIGN_APPROVAL',
	PRIMARY KEY (`id`),
	KEY `idx_order_item_order_id` (`orderId`),
	KEY `idx_order_item_variant_id` (`variantId`),
	KEY `idx_order_item_design_id` (`designId`),
	CONSTRAINT `fk_order_item_order`
		FOREIGN KEY (`orderId`) REFERENCES `CustomerOrder` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `fk_order_item_variant`
		FOREIGN KEY (`variantId`) REFERENCES `ProductVariant` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_order_item_design`
		FOREIGN KEY (`designId`) REFERENCES `CustomDesign` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- CHANGE 2026-06-05:
-- Bổ sung bảng OrderHistory để lưu lịch sử trạng thái thật của đơn hàng.
-- Trước đây backend chỉ dựng timeline từ CustomerOrder.status/updatedAt nên mỗi lần đổi trạng thái
-- sẽ ghi đè mốc hiện tại, không thể hiển thị đầy đủ quá trình xử lý đơn.
-- Quy tắc tạo đơn: mỗi đơn chỉ có một mốc. Khách tạo dùng action='Khách hàng đặt đơn',
-- actorRole='CUSTOMER'; Admin tạo thay khách dùng action='Tạo đơn cho khách', actorRole='ADMIN'.
CREATE TABLE IF NOT EXISTS `OrderHistory` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`orderId` INT NOT NULL,
	`fromStatus` VARCHAR(30) NULL,
	`toStatus` VARCHAR(30) NOT NULL,
	`action` VARCHAR(50) NOT NULL,
	`actorId` INT NULL,
	`actorRole` VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
	`actorName` VARCHAR(255) NOT NULL DEFAULT 'Hệ thống',
	`note` TEXT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_order_history_order_id_created_at` (`orderId`, `createdAt`),
	KEY `idx_order_history_actor_id` (`actorId`),
	CONSTRAINT `fk_order_history_order`
		FOREIGN KEY (`orderId`) REFERENCES `CustomerOrder` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `fk_order_history_actor`
		FOREIGN KEY (`actorId`) REFERENCES `Account` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `OrderProduction` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`orderItemId` INT NOT NULL,
	`designId` INT NULL,
	`status` VARCHAR(30) NOT NULL DEFAULT 'WAITING_DESIGN_APPROVAL',
	`note` TEXT NULL,
	`approvedAt` DATETIME NULL,
	`printedAt` DATETIME NULL,
	`packedAt` DATETIME NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_order_production_order_item_id` (`orderItemId`),
	KEY `idx_order_production_design_id` (`designId`),
	CONSTRAINT `fk_order_production_order_item`
		FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE,
	CONSTRAINT `fk_order_production_design`
		FOREIGN KEY (`designId`) REFERENCES `CustomDesign` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `Payment` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`orderId` INT NOT NULL,
	`amount` DECIMAL(15,2) NOT NULL,
	`paymentMethod` VARCHAR(30) NOT NULL,
	`paymentType` VARCHAR(20) NOT NULL,
	`status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
	`transactionId` VARCHAR(255) NULL,
	`paidAt` DATETIME NULL,
	`gatewayResponse` TEXT NULL,
	`note` TEXT NULL COMMENT 'Ghi chú kế toán của admin',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_payment_transaction_id` (`transactionId`),
	KEY `idx_payment_order_id` (`orderId`),
	CONSTRAINT `fk_payment_order`
		FOREIGN KEY (`orderId`) REFERENCES `CustomerOrder` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `InventoryTransaction` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`variantId` INT NOT NULL,
	`orderId` INT NULL,
	`supplierId` INT NULL,
	`quantityChanged` INT NOT NULL,
	`transactionType` VARCHAR(30) NOT NULL,
	`reason` VARCHAR(300) NOT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_inventory_transaction_variant_id` (`variantId`),
	KEY `idx_inventory_transaction_order_id` (`orderId`),
	KEY `idx_inventory_transaction_supplier_id` (`supplierId`),
	CONSTRAINT `fk_inventory_transaction_variant`
		FOREIGN KEY (`variantId`) REFERENCES `ProductVariant` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_inventory_transaction_order`
		FOREIGN KEY (`orderId`) REFERENCES `CustomerOrder` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL,
	CONSTRAINT `fk_inventory_transaction_supplier`
		FOREIGN KEY (`supplierId`) REFERENCES `Supplier` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `PromotionUsage` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`promotionId` INT NOT NULL,
	`userId` INT NOT NULL,
	`orderId` INT NOT NULL,
	`usedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_promotion_usage_promotion_user` (`promotionId`, `userId`),
	UNIQUE KEY `uq_promotion_usage_order_id` (`orderId`),
	KEY `idx_promotion_usage_promotion_id` (`promotionId`),
	KEY `idx_promotion_usage_user_id` (`userId`),
	CONSTRAINT `fk_promotion_usage_promotion`
		FOREIGN KEY (`promotionId`) REFERENCES `Promotion` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_promotion_usage_user`
		FOREIGN KEY (`userId`) REFERENCES `Account` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_promotion_usage_order`
		FOREIGN KEY (`orderId`) REFERENCES `CustomerOrder` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- MIGRATION: Cập nhật bảng CustomDesign cho luồng Admin duyệt thiết kế
-- Chạy script này nếu bạn đang nâng cấp database đã có
-- (Nếu import database mới từ đầu, các lệnh ALTER này không cần thiết
--  vì CREATE TABLE IF NOT EXISTS ở trên đã bao gồm các cột mới)
-- =====================================================================

-- Bước 1: Mở rộng cột status từ VARCHAR(20) sang VARCHAR(30)
-- ALTER TABLE `CustomDesign` MODIFY COLUMN `status` VARCHAR(30) NOT NULL DEFAULT 'DRAFT';

-- Bước 2: Thêm cột adminNote để lưu ghi chú khi admin yêu cầu chỉnh sửa
-- ALTER TABLE `CustomDesign`
--   ADD COLUMN `adminNote` TEXT NULL COMMENT 'Ghi chú của admin khi yêu cầu khách chỉnh sửa thiết kế'
--   AFTER `status`;

-- Bước 3: Thêm index cho cột status để tăng tốc truy vấn lọc theo trạng thái
-- ALTER TABLE `CustomDesign` ADD KEY `idx_custom_design_status` (`status`);

-- Bước 4: Chuyển các bản ghi DRAFT đang chờ admin sang PENDING_REVIEW (nếu cần)
-- UPDATE `CustomDesign` SET `status` = 'PENDING_REVIEW' WHERE `status` = 'DRAFT';

-- =====================================================================
-- AUTH BOOTSTRAP NOTE
-- Public registration always creates a CUSTOMER account. After registering
-- the first owner account, promote it once with the statement below, then
-- manage all later staff accounts from Admin > Cai dat.
-- UPDATE `Account` SET `role` = 'ADMIN' WHERE `email` = 'owner@example.com';

-- =====================================================================
-- MIGRATION: Thêm cột note vào bảng Payment cho ghi chú kế toán
-- Chạy script này nếu bạn đang nâng cấp database đã có
-- (Nếu import database mới từ đầu, ALTER này không cần thiết
--  vì CREATE TABLE ở trên đã bao gồm cột note)
-- =====================================================================
-- ALTER TABLE `Payment` ADD COLUMN `note` TEXT NULL COMMENT 'Ghi chú kế toán của admin' AFTER `gatewayResponse`;
