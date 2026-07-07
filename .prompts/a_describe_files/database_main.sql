-- =====================================================================
-- db_main.sql — TeeStudio Project
-- File database tổng hợp (merge) từ:
--   1. Database.sql       (Admin – Nguyễn Thanh Hiếu)
--   2. db_of_member_teestudio.sql (Customer-web – thành viên còn lại)
--
-- Ngày merge: 2026-07-06
--
-- GHI CHÚ CÁC THAY ĐỔI SO VỚI TỪNG FILE GỐC:
-- [FROM ADMIN]   = cột/tính năng chỉ có trong Database.sql của admin
-- [FROM MEMBER]  = cột/tính năng chỉ có trong db_of_member_teestudio.sql
-- [BOTH]         = giống nhau ở cả 2 file (lấy phiên bản chuẩn nhất)
-- [MERGED]       = kết hợp từ cả 2 file
--
-- ⚠️  LƯU Ý PHÂN BIỆT HOA/THƯỜNG KHI TRIỂN KHAI TRÊN LINUX:
--     File này dùng tên bảng PascalCase (Account, Product, ...) theo
--     chuẩn của backend admin. File member dùng chữ thường (account,
--     product, ...). Trên MySQL Linux với lower_case_table_names=0
--     (mặc định), hai tên này là KHÁC NHAU.
--     → Nếu import vào database của member đang tồn tại: sẽ tạo thêm
--       một bộ bảng PascalCase song song, KHÔNG ghi đè bảng cũ.
--     → Giải pháp an toàn: import vào DATABASE MỚI hoàn toàn rỗng,
--       sau đó cả hai bên (admin & member) đều trỏ backend vào DB mới.
--     → Hoặc: thống nhất cách đặt tên bảng (tất cả PascalCase hoặc
--       tất cả lowercase) trước khi deploy lên Linux server.
-- =====================================================================

SET NAMES utf8mb4;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ============================================================
-- Xóa bảng theo thứ tự ngược (tránh lỗi FK constraint)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `PromotionUsage`;
DROP TABLE IF EXISTS `InventoryTransaction`;
DROP TABLE IF EXISTS `Payment`;
DROP TABLE IF EXISTS `OrderProduction`;
DROP TABLE IF EXISTS `OrderItem`;
DROP TABLE IF EXISTS `OrderHistory`;
DROP TABLE IF EXISTS `CustomerOrder`;
DROP TABLE IF EXISTS `CartItem`;
DROP TABLE IF EXISTS `Cart`;
DROP TABLE IF EXISTS `DesignPrintMethod`;
DROP TABLE IF EXISTS `DesignPrintPosition`;
DROP TABLE IF EXISTS `CustomDesign`;
DROP TABLE IF EXISTS `BulkPricing`;
DROP TABLE IF EXISTS `ProductImage`;
DROP TABLE IF EXISTS `ProductVariant`;
DROP TABLE IF EXISTS `Product`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `Sticker`;
DROP TABLE IF EXISTS `PrintMethod`;
DROP TABLE IF EXISTS `PrintPosition`;
DROP TABLE IF EXISTS `Promotion`;
DROP TABLE IF EXISTS `PricingConfiguration`;
DROP TABLE IF EXISTS `Supplier`;
DROP TABLE IF EXISTS `UserAddress`;
DROP TABLE IF EXISTS `UserToken`;
DROP TABLE IF EXISTS `Account`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Bảng: Account [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `Account` [FROM MEMBER]
--
INSERT INTO `Account` (`id`, `email`, `passwordHash`, `fullName`, `phone`, `role`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'minhanh.nguyen@gmail.com', '$2b$10$hash1', 'Nguyễn Minh Anh', '0901234567', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:00:00', '2026-01-02 08:00:00'),
(2, 'cuong.tran@gmail.com', '$2b$10$hash2', 'Trần Văn Cường', '0987654321', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:01:00', '2026-01-02 08:01:00'),
(3, 'hoa.le@gmail.com', '$2b$10$hash3', 'Lê Thị Hoa', '0912345678', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:02:00', '2026-01-02 08:02:00'),
(4, 'bao.pham@gmail.com', '$2b$10$hash4', 'Phạm Quốc Bảo', '0934567890', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:03:00', '2026-01-02 08:03:00'),
(5, 'lan.nguyen@gmail.com', '$2b$10$hash5', 'Nguyễn Thị Lan', '0978901234', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:04:00', '2026-01-02 08:04:00'),
(6, 'duc.hoang@gmail.com', '$2b$10$hash6', 'Hoàng Văn Đức', '0965432109', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:05:00', '2026-01-02 08:05:00'),
(7, 'thu.vo@gmail.com', '$2b$10$hash7', 'Võ Thị Thu', '0943210987', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:06:00', '2026-01-02 08:06:00'),
(8, 'nam.dinh@gmail.com', '$2b$10$hash8', 'Đinh Văn Nam', '0921098765', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:07:00', '2026-01-02 08:07:00'),
(9, 'admin@teestudio.vn', '$2b$10$hash9', 'Quản Trị Viên', '0909090909', 'ADMIN', 'INACTIVE', '2026-01-02 08:08:00', '2026-06-10 12:47:48'),
(10, 'test.tonkho.customer@teestudio.vn', '$2b$10$seedInventoryCustomerHash', 'Khách Test Tồn Kho', '0900000999', 'CUSTOMER', 'ACTIVE', '2026-01-02 08:09:00', '2026-01-02 08:09:00'),
(11, 'thanhhieu2182004@gmail.com', '$2b$12$dej0jQlYcNB4himKZXnTyO1mAifhTx04Y3kUyy8ot/h5/geo/zOIO', 'Nguyen Thanh Hieu', '0123456789', 'ADMIN', 'ACTIVE', '2026-06-10 11:42:19', '2026-06-10 12:36:53'),
(12, 'thanhhieu282004@gmail.com', '$2b$12$IOC5ktoj07Rk/LELF9OsmOtzDltRyhbI2VEexhx.uzB/bHh.Ql6zu', 'Nguyen Thanh Hieu', '0123456789', 'WAREHOUSE', 'ACTIVE', '2026-06-10 11:46:32', '2026-06-10 13:09:33'),
(13, 'thanhhieu218200@gmail.com', '$2b$12$19oIzOFr0AKZTm8sV8JRXOOU4z2fJLx8ETY6BHS900zSmSYBCLB2W', 'Nguyễn Thanh Hiếu', '0123456789', 'CUSTOMER', 'ACTIVE', '2026-06-10 12:38:47', '2026-06-10 12:38:47'),
(14, 'thanhhieu21820@gmail.com', '$2b$12$DSj/.hYjD1pvRGucdIHzReELpjGJOyIT0FAsUBhoL8OXVD/20kuKm', 'Hiếu', '0900000999', 'PRODUCTION', 'ACTIVE', '2026-06-10 12:46:37', '2026-06-10 12:46:37'),
(15, 'dangcuh2105@gmail.com', '$2b$12$3vzWRYqdZF0WZg/kj2uSv.e7Ot3pwHgbNl06yC5yglXqhWccYB8AW', 'Nguyễn Đăng', '02312312323', 'ADMIN', 'ACTIVE', '2026-06-21 15:54:52', '2026-06-21 15:55:07'),
(16, '1212@gmail.com', '$2b$12$M32aaDqfG3RXEMxe2VCdEupS7.oI7ZW6lpySPRLPBv5/4SEJ3Tr.W', 'abc', '0123456789', 'CUSTOMER', 'ACTIVE', '2026-06-21 16:48:08', '2026-06-21 16:48:08'),
(18, 'admin2@teestudio.vn', '$2b$10$JXB.1D1fQPZJL3EG771ReuQYXggSl/wJS9DiVNbNcgge.8EYOWjuS', 'Admin Chính', '0987654321', 'ADMIN', 'ACTIVE', '2026-06-23 17:02:26', '2026-06-23 17:02:26');


-- ============================================================
-- Bảng: UserToken [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `UserToken` [FROM MEMBER]
--
INSERT INTO `UserToken` (`id`, `userId`, `refreshToken`, `expiresAt`, `userAgent`, `ipAddress`, `createdAt`) VALUES
(42, 16, '87564720a2731df55393029da3a21fb79a57ead94354679b45730726eb5651fd', '2026-07-11 16:30:23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '2026-07-04 16:30:23');


-- ============================================================
-- Bảng: UserAddress [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `UserAddress` [FROM MEMBER]
--
INSERT INTO `UserAddress` (`id`, `userId`, `recipientName`, `phone`, `addressLine`, `city`, `district`, `ward`, `isDefault`, `createdAt`) VALUES
(1, 1, 'Nguyễn Minh Anh', '0901234567', '123 Đường Nguyễn Trãi', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', 1, '2026-01-03 08:00:00'),
(2, 2, 'Trần Văn Cường', '0987654321', '45 Lê Văn Việt', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Phường Hiệp Phú', 1, '2026-01-03 08:01:00'),
(3, 3, 'Lê Thị Hoa', '0912345678', '88 Trần Hưng Đạo', 'Hà Nội', 'Quận Hoàn Kiếm', 'Phường Phan Chu Trinh', 1, '2026-01-03 08:02:00'),
(4, 4, 'Phạm Quốc Bảo', '0934567890', '210 Điện Biên Phủ', 'Đà Nẵng', 'Quận Thanh Khê', 'Phường Thanh Khê Đông', 1, '2026-01-03 08:03:00'),
(5, 5, 'Nguyễn Thị Lan', '0978901234', '15 Võ Thị Sáu', 'TP. Hồ Chí Minh', 'Quận 3', 'Phường 6', 1, '2026-01-03 08:04:00'),
(6, 6, 'Hoàng Văn Đức', '0965432109', '67 Lý Tự Trọng', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 1, '2026-01-03 08:05:00'),
(7, 7, 'Võ Thị Thu', '0943210987', '32 Nguyễn Huệ', 'Cần Thơ', 'Quận Ninh Kiều', 'Phường An Hội', 1, '2026-01-03 08:06:00'),
(8, 8, 'Đinh Văn Nam', '0921098765', '99 Hùng Vương', 'Hải Phòng', 'Quận Hồng Bàng', 'Phường Quán Toan', 1, '2026-01-03 08:07:00'),
(9, 10, 'Khách Test Tồn Kho', '0900000999', '100 Đường Test Tồn Kho', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 1, '2026-01-03 08:08:00');


-- ============================================================
-- Bảng: Category [BOTH]
-- ============================================================

CREATE TABLE IF NOT EXISTS `Category` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(200) NOT NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `Category` [FROM MEMBER]
--
INSERT INTO `Category` (`id`, `name`, `createdAt`) VALUES
(1, 'Áo thun', '2026-01-05 08:00:00'),
(2, 'Áo hoodie', '2026-01-05 08:01:00'),
(3, 'Áo polo', '2026-01-05 08:02:00');


-- ============================================================
-- Bảng: Product [MERGED]
-- Ghi chú:
--   [FROM ADMIN]  Thêm lại cột `slug` và UNIQUE KEY `uq_product_slug`
--                 (member đã xóa slug – admin vẫn dùng)
--   [FROM MEMBER] Thêm cột `shirtType` (chỉ có ở phía customer-web)
-- ============================================================

CREATE TABLE IF NOT EXISTS `Product` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`categoryId` INT NOT NULL,
	`shirtType` VARCHAR(20) NULL COMMENT '[FROM MEMBER] Loại áo dùng cho trang khách hàng (ví dụ: tshirt, hoodie, polo)',
	`name` VARCHAR(300) NOT NULL,
	`slug` VARCHAR(300) NOT NULL COMMENT '[FROM ADMIN] Slug dùng cho URL thân thiện SEO',
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `Product` [FROM MEMBER + bổ sung slug từ ADMIN]
-- Lưu ý: slug được tạo tương ứng với tên sản phẩm
--
INSERT INTO `Product` (`id`, `categoryId`, `shirtType`, `name`, `slug`, `basePrice`, `material`, `form`, `madeIn`, `description`, `status`, `createdAt`) VALUES
(1, 1, 'tshirt', 'Áo Thun Wide Form', 'ao-thun-wide-form', 120000.00, '100% Cotton 180gsm', 'tshirt', 'Việt Nam', 'Áo thun cotton mềm mại, thấm hút tốt, phù hợp in ấn.', 'ACTIVE', '2026-01-06 08:00:00'),
(2, 1, 'tshirt', 'Áo Thun', 'ao-thun', 150000.00, '100% Cotton 200gsm', 'tshirt', 'Việt Nam', 'Dáng rộng thoải mái, form oversize hiện đại.', 'INACTIVE', '2026-01-06 08:05:00'),
(3, 2, 'hoodie', 'Áo Hoodie', 'ao-hoodie', 280000.00, 'Nỉ bông 320gsm', 'hoodie', 'Việt Nam', 'Áo hoodie dày dặn, ấm áp, có mũ và túi kangaroo.', 'ACTIVE', '2026-01-06 08:10:00'),
(4, 3, 'polo', 'Áo Polo', 'ao-polo', 180000.00, 'Cotton pique 220gsm', 'polo', 'Việt Nam', 'Áo polo chuyên nghiệp, phù hợp đồng phục công ty.', 'ACTIVE', '2026-01-06 08:15:00');


-- ============================================================
-- Bảng: ProductVariant [MERGED]
-- Ghi chú:
--   [FROM ADMIN]  Thêm lại cột `colorHex` và `status`
--                 (member đã xóa 2 cột này – admin vẫn dùng)
-- ============================================================

CREATE TABLE IF NOT EXISTS `ProductVariant` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`productId` INT NOT NULL,
	`color` VARCHAR(100) NOT NULL,
	`colorHex` CHAR(7) NOT NULL DEFAULT '#94a3b8' COMMENT '[FROM ADMIN] Mã màu HEX tương ứng với tên màu',
	`size` VARCHAR(20) NOT NULL,
	`sku` VARCHAR(100) NOT NULL,
	`stockQty` INT NOT NULL DEFAULT 0,
	`status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '[FROM ADMIN] Trạng thái variant: ACTIVE / INACTIVE',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_product_variant_sku` (`sku`),
	UNIQUE KEY `uq_product_variant_product_color_size` (`productId`, `color`, `size`),
	KEY `idx_product_variant_product_id` (`productId`),
	CONSTRAINT `fk_product_variant_product`
		FOREIGN KEY (`productId`) REFERENCES `Product` (`id`)
		ON UPDATE NO ACTION ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `ProductVariant` [FROM MEMBER]
--
INSERT INTO `ProductVariant` (`id`, `productId`, `color`, `colorHex`, `size`, `sku`, `stockQty`, `status`, `createdAt`) VALUES
(1, 1, 'Trắng', '#FFFFFF', 'S', 'ATCT-TRANG-S', 150, 'ACTIVE', '2026-01-07 08:00:00'),
(2, 1, 'Trắng', '#FFFFFF', 'M', 'ATCT-TRANG-M', 200, 'ACTIVE', '2026-01-07 08:01:00'),
(3, 1, 'Trắng', '#FFFFFF', 'L', 'ATCT-TRANG-L', 1, 'ACTIVE', '2026-01-07 08:02:00'),
(4, 1, 'Trắng', '#FFFFFF', 'XL', 'ATCT-TRANG-XL', 120, 'ACTIVE', '2026-01-07 08:03:00'),
(5, 1, 'Đen', '#000000', 'S', 'ATCT-DEN-S', 130, 'ACTIVE', '2026-01-07 08:04:00'),
(6, 1, 'Đen', '#000000', 'M', 'ATCT-DEN-M', 190, 'ACTIVE', '2026-01-07 08:05:00'),
(7, 1, 'Đen', '#000000', 'L', 'ATCT-DEN-L', 160, 'ACTIVE', '2026-01-07 08:06:00'),
(8, 1, 'Đen', '#000000', 'XL', 'ATCT-DEN-XL', 100, 'ACTIVE', '2026-01-07 08:07:00'),
(9, 2, 'Trắng', '#FFFFFF', 'M', 'ATOS-TRANG-M', 80, 'ACTIVE', '2026-01-07 08:08:00'),
(10, 2, 'Trắng', '#FFFFFF', 'L', 'ATOS-TRANG-L', 90, 'ACTIVE', '2026-01-07 08:09:00'),
(11, 2, 'Trắng', '#FFFFFF', 'XL', 'ATOS-TRANG-XL', 70, 'ACTIVE', '2026-01-07 08:10:00'),
(12, 2, 'Xám', '#808080', 'M', 'ATOS-XAM-M', 75, 'ACTIVE', '2026-01-07 08:11:00'),
(13, 2, 'Xám', '#808080', 'L', 'ATOS-XAM-L', 85, 'ACTIVE', '2026-01-07 08:12:00'),
(14, 3, 'Đen', '#000000', 'M', 'AHN-DEN-M', 3, 'ACTIVE', '2026-01-07 08:13:00'),
(15, 3, 'Đen', '#000000', 'L', 'AHN-DEN-L', 2, 'ACTIVE', '2026-01-07 08:14:00'),
(16, 3, 'Đen', '#000000', 'XL', 'AHN-DEN-XL', 40, 'ACTIVE', '2026-01-07 08:15:00'),
(17, 3, 'Xanh navy', '#003153', 'M', 'AHN-NAVY-M', 4, 'ACTIVE', '2026-01-07 08:16:00'),
(18, 3, 'Xanh navy', '#003153', 'L', 'AHN-NAVY-L', 2, 'ACTIVE', '2026-01-07 08:17:00'),
(19, 4, 'Trắng', '#FFFFFF', 'S', 'APL-TRANG-S', 60, 'ACTIVE', '2026-01-07 08:18:00'),
(20, 4, 'Trắng', '#FFFFFF', 'M', 'APL-TRANG-M', 80, 'ACTIVE', '2026-01-07 08:19:00'),
(21, 4, 'Trắng', '#FFFFFF', 'L', 'APL-TRANG-L', 8, 'ACTIVE', '2026-01-07 08:20:00'),
(22, 4, 'Xanh dương', '#0066CC', 'M', 'APL-XDUONG-M', 70, 'ACTIVE', '2026-01-07 08:21:00'),
(23, 4, 'Xanh dương', '#0066CC', 'L', 'APL-XDUONG-L', 0, 'ACTIVE', '2026-01-07 08:22:00'),
(24, 4, 'Xanh dương', '#0066CC', 'XL', 'APL-XDUONG-XL', 0, 'ACTIVE', '2026-01-07 08:23:00');


-- ============================================================
-- Bảng: ProductImage [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `ProductImage` [FROM MEMBER]
--
INSERT INTO `ProductImage` (`id`, `productId`, `variantId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `createdAt`) VALUES
(5, 1, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026489/TShirt-White-Front_sjhjg8.png', 'White-front', 0, 1, '2026-06-21 14:43:01'),
(6, 1, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-White-Back_w0ezzy.png', 'White-back', 0, 0, '2026-06-21 14:43:01'),
(7, 1, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-Navy-Front_wc2lhf.png', 'Navy-front', 0, 0, '2026-06-21 14:43:01'),
(8, 1, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/TShirt-Navy-Back_phdkvi.png', 'Navy-back', 0, 0, '2026-06-21 14:43:01'),
(9, 1, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026483/TShirt-Black-Front_f0ljkq.png', 'Black-front', 0, 0, '2026-06-21 14:43:01'),
(10, 1, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/TShirt-Black-Back_bc88nk.png', 'Black-back', 0, 0, '2026-06-21 14:43:01'),
(11, 2, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026483/TShirt-Black-Front_f0ljkq.png', 'Black-front', 0, 1, '2026-06-21 14:43:01'),
(12, 2, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/TShirt-Black-Back_bc88nk.png', 'Black-back', 0, 0, '2026-06-21 14:43:01'),
(13, 2, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026489/TShirt-White-Front_sjhjg8.png', 'White-front', 0, 0, '2026-06-21 14:43:01'),
(14, 2, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-White-Back_w0ezzy.png', 'White-back', 0, 0, '2026-06-21 14:43:01'),
(15, 2, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-Navy-Front_wc2lhf.png', 'Navy-front', 0, 0, '2026-06-21 14:43:01'),
(16, 2, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/TShirt-Navy-Back_phdkvi.png', 'Navy-back', 0, 0, '2026-06-21 14:43:01'),
(18, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Front_b11fvx.png', 'White-front', 0, 1, '2026-06-21 14:43:01'),
(19, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Back_vr6uas.png', 'White-back', 0, 0, '2026-06-21 14:43:01'),
(20, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/Polo-Beige-Front_ulxjri.png', 'Beige-front', 0, 0, '2026-06-21 14:43:01'),
(21, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Beige-Back_d4sp14.png', 'Beige-back', 0, 0, '2026-06-21 14:43:01'),
(22, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Front_rc2pvr.png', 'Navy-front', 0, 0, '2026-06-21 14:43:01'),
(23, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Backt_uvfyjg.png', 'Navy-back', 0, 0, '2026-06-21 14:43:01'),
(24, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209405/Hoodie-Grey-Front_boebdz.png', 'Grey-front', 1, 1, '2026-06-23 17:14:16'),
(25, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209405/Hoodie-Grey-Back_ntgcoc.png', 'Grey-back', 2, 0, '2026-06-23 17:14:16'),
(26, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209409/Hoodie-Brown-Front_ab4bha.png', 'Brown-front', 3, 0, '2026-06-23 17:14:16'),
(27, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209411/Hoodie-Brown-Back_echgn5.png', 'Brown-back', 4, 0, '2026-06-23 17:14:16');


-- ============================================================
-- Bảng: BulkPricing [BOTH]
-- ============================================================

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

--
-- Dữ liệu mẫu cho bảng `BulkPricing`
-- Các ngưỡng đều lớn hơn số lượng của đơn mẫu hiện tại để không làm sai lệch
-- đơn giá lịch sử; có thể dùng trực tiếp để kiểm thử tính giá số lượng lớn.
--
INSERT INTO `BulkPricing` (`id`, `productId`, `minQty`, `discountPercent`) VALUES
(1, 1, 10, 5.00),
(2, 1, 30, 10.00),
(3, 1, 100, 15.00),
(4, 2, 10, 5.00),
(5, 2, 30, 9.00),
(6, 2, 100, 14.00),
(7, 3, 10, 4.00),
(8, 3, 30, 8.00),
(9, 3, 100, 13.00),
(10, 4, 10, 5.00),
(11, 4, 30, 9.00),
(12, 4, 100, 13.00);


-- ============================================================
-- Bảng: PrintPosition [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `PrintPosition` [FROM MEMBER]
--
INSERT INTO `PrintPosition` (`id`, `code`, `name`, `extraCost`, `maxWidth`, `maxHeight`, `printAreaX`, `printAreaY`, `printAreaWidth`, `printAreaHeight`, `isActive`) VALUES
(1, 'MAT_TRUOC', 'Mặt trước (Ngực giữa)', 0.00, 30.00, 40.00, NULL, NULL, NULL, NULL, 1),
(2, 'MAT_SAU', 'Mặt sau (Lưng giữa)', 20000.00, 35.00, 45.00, NULL, NULL, NULL, NULL, 1),
(3, 'TRAI', 'Ngực trái (Logo nhỏ)', 15000.00, 10.00, 10.00, NULL, NULL, NULL, NULL, 0);


-- ============================================================
-- Bảng: PrintMethod [BOTH]
-- ============================================================

CREATE TABLE IF NOT EXISTS `PrintMethod` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`code` VARCHAR(50) NOT NULL,
	`name` VARCHAR(100) NOT NULL,
	`extraCost` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`isActive` TINYINT NOT NULL DEFAULT 1,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_print_method_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `PrintMethod` [FROM MEMBER]
--
INSERT INTO `PrintMethod` (`id`, `code`, `name`, `extraCost`, `isActive`, `createdAt`) VALUES
(1, 'DTG', 'In DTG (Direct-to-Garment)', 0.00, 1, '2026-01-08 08:00:00'),
(2, 'IN_LUOI', 'In lụa (Silk Screen)', 30000.00, 1, '2026-01-08 08:01:00'),
(3, 'THEU', 'Thêu vi tính', 50000.00, 1, '2026-01-08 08:02:00'),
(4, 'VINYL', 'In cắt decal nhiệt', 20000.00, 1, '2026-01-08 08:03:00');


-- ============================================================
-- Bảng: Sticker [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `Sticker` [FROM MEMBER]
--
INSERT INTO `Sticker` (`id`, `name`, `category`, `imageUrl`, `sortOrder`, `isActive`, `createdAt`) VALUES
(6, 'image-from-rawpixel-id-6011494-png_xwfrjv', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png', 0, 1, '2026-06-21 13:59:11'),
(7, 'image-from-rawpixel-id-6103560-png_enpz6a', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6103560-png_enpz6a.png', 1, 1, '2026-06-21 13:59:11'),
(8, 'image-from-rawpixel-id-18345112-png_umdppj', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png', 2, 1, '2026-06-21 13:59:11'),
(9, 'image-from-rawpixel-id-3902197-png_xk1kxf', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782024674/image-from-rawpixel-id-3902197-png_xk1kxf.png', 3, 1, '2026-06-21 13:59:11'),
(10, 'image-from-rawpixel-id-2034649-png_p9rd1b', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782024674/image-from-rawpixel-id-2034649-png_p9rd1b.png', 4, 1, '2026-06-21 13:59:11'),
(11, 'planner 8512483 u5u7mb', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png', 0, 1, '2026-06-21 16:42:39'),
(12, 'today 14356090 s4nfxf', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png', 0, 1, '2026-06-21 16:42:39'),
(13, 'movie ticket 6426920 vrksf0', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033341/movie-ticket_6426920_vrksf0.png', 0, 1, '2026-06-21 16:42:39'),
(14, 'thank you 7328366 q8e2f3', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033314/thank-you_7328366_q8e2f3.png', 0, 1, '2026-06-21 16:42:39'),
(15, 'have a good day 6122874 hroodz', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033308/have-a-good-day_6122874_hroodz.png', 0, 1, '2026-06-21 16:42:39'),
(16, 'stay positive 7590154 ed97wm', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033307/stay-positive_7590154_ed97wm.png', 0, 1, '2026-06-21 16:42:39'),
(17, 'star 6427746 qf9rwm', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033259/star_6427746_qf9rwm.png', 0, 1, '2026-06-21 16:42:39'),
(18, 'social distancing 7143864 gxzpup', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033249/social-distancing_7143864_gxzpup.png', 0, 1, '2026-06-21 16:42:39'),
(19, 'keep your distance 7001168 uqa90c', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033248/keep-your-distance_7001168_uqa90c.png', 0, 1, '2026-06-21 16:42:39'),
(20, 'social distancing 7143871 v5aj2f', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033248/social-distancing_7143871_v5aj2f.png', 0, 1, '2026-06-21 16:42:39'),
(21, 'planner', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218686/planner_8512483_nyptrl.png', 1, 1, '2026-06-23 19:49:53'),
(22, 'today', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218685/today_14356090_bcx2ca.png', 2, 1, '2026-06-23 19:49:53'),
(23, 'movie-ticket', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218684/movie-ticket_6426920_jtbg6j.png', 3, 1, '2026-06-23 19:49:53'),
(24, 'thank-you', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218680/thank-you_7328366_tktmqh.png', 4, 1, '2026-06-23 19:49:53'),
(25, 'have-a-good-day', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218680/have-a-good-day_6122874_yrdyci.png', 5, 1, '2026-06-23 19:49:53'),
(26, 'stay-positive', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218674/stay-positive_7590154_tuym3c.png', 6, 1, '2026-06-23 19:49:53'),
(27, 'star', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218673/star_6427746_xedbqp.png', 7, 1, '2026-06-23 19:49:53'),
(28, 'keep-your-distance', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218673/keep-your-distance_7001168_jitfgh.png', 8, 1, '2026-06-23 19:49:53'),
(29, 'social-distancing-1', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218672/social-distancing_7143864_tlw9om.png', 9, 1, '2026-06-23 19:49:53'),
(30, 'social-distancing-2', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218667/social-distancing_7143871_a4nd4d.png', 10, 1, '2026-06-23 19:49:53'),
(31, 'social-distancing-3', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218666/social-distancing_7143889_szlzzi.png', 11, 1, '2026-06-23 19:49:53'),
(32, 'star-2', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218666/star_10163302_p8sqzn.png', 12, 1, '2026-06-23 19:49:53'),
(33, 'id-card', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218665/id-card_11946298_uanc7j.png', 13, 1, '2026-06-23 19:49:53'),
(34, 'shell', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218653/shell_5965357_lehztw.png', 14, 1, '2026-06-23 19:49:53'),
(35, 'juice-box', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218642/juice-box_10294413_cxqbrs.png', 15, 1, '2026-06-23 19:49:53'),
(36, 'reading', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218625/reading_10139481_fbkofa.png', 16, 1, '2026-06-23 19:49:53');


-- ============================================================
-- Bảng: Supplier [BOTH]
-- ============================================================

CREATE TABLE IF NOT EXISTS `Supplier` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(200) NOT NULL,
	`phone` VARCHAR(20) NULL,
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY `idx_supplier_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu mẫu cho bảng `Supplier`
--
INSERT INTO `Supplier` (`id`, `name`, `phone`, `createdAt`) VALUES
(1, 'Công ty Dệt May Thành Công', '0901234501', '2026-05-01 08:00:00'),
(2, 'Xưởng Phôi Áo Việt Tiến', '0901234502', '2026-05-01 08:05:00'),
(3, 'Công ty Vải Thun Phú Sang', '0908123456', '2026-05-01 08:10:00'),
(4, 'Nhà cung cấp Phụ liệu Minh Châu', '0917456789', '2026-05-01 08:15:00');


-- ============================================================
-- Bảng: CustomDesign [MERGED]
-- Ghi chú:
--   [FROM MEMBER] Thêm cột `name VARCHAR(255)` lưu tên thiết kế
--                 (chỉ có ở phía customer-web)
-- ============================================================

CREATE TABLE IF NOT EXISTS `CustomDesign` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`userId` INT NOT NULL,
	`productId` INT NOT NULL,
	`variantId` INT NULL,
	`name` VARCHAR(255) NULL DEFAULT 'Thiết kế chưa đặt tên' COMMENT '[FROM MEMBER] Tên thiết kế do khách đặt',
	`baseColor` VARCHAR(100) NOT NULL,
	`canvasData` JSON NOT NULL,
	`previewUrl` VARCHAR(500) NOT NULL,
	`designFee` DECIMAL(15,2) NOT NULL DEFAULT 0,
	-- Các giá trị status hợp lệ:
	-- 'DRAFT'          = Khách đang soạn (chưa gửi)
	-- 'PENDING_REVIEW' = Thiết kế đã được gắn vào đơn, chờ admin xác nhận đơn
	-- 'NEEDS_REVISION' = Admin yêu cầu khách chỉnh sửa
	-- 'APPROVED'       = Thiết kế được duyệt tự động khi admin xác nhận đơn
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `CustomDesign` [FROM MEMBER]
--
INSERT INTO `CustomDesign` (`id`, `userId`, `productId`, `variantId`, `name`, `baseColor`, `canvasData`, `previewUrl`, `designFee`, `status`, `adminNote`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, 10, 'Thiết kế chưa đặt tên', '#FFFFFF', '{"layers": [{"x": 150, "y": 100, "src": "https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-cty-abc.png", "type": "image", "width": 120, "height": 80, "rotation": 0}], "background": "#FFFFFF"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-1.jpg', 150000.00, 'PENDING_REVIEW', NULL, '2026-06-02 08:00:00', '2026-06-02 08:00:00'),
(2, 3, 4, 20, 'Thiết kế chưa đặt tên', '#FFFFFF', '{"layers": [{"x": 100, "y": 80, "type": "text", "color": "#003399", "content": "ĐỒNG PHỤC CÔNG TY XYZ", "fontSize": 24, "fontFamily": "Arial"}, {"x": 170, "y": 120, "src": "https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-xyz.png", "type": "image", "width": 60, "height": 60}], "background": "#FFFFFF"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-3.jpg', 200000.00, 'PENDING_REVIEW', NULL, '2026-06-01 09:00:00', '2026-06-01 09:00:00'),
(3, 5, 1, 2, 'Thiết kế chưa đặt tên', '#FFFFFF', '{"layers": [{"x": 90, "y": 90, "type": "text", "color": "#FF6600", "content": "TEAM BUILDING 2026", "fontSize": 28}], "background": "#FFFFFF"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-5.jpg', 100000.00, 'PENDING_REVIEW', NULL, '2026-06-02 09:00:00', '2026-06-02 09:00:00'),
(4, 6, 2, 12, 'Thiết kế chưa đặt tên', '#808080', '{"layers": [{"x": 140, "y": 110, "src": "https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-startup.png", "type": "image", "width": 100, "height": 70}], "background": "#808080"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-6.jpg', 120000.00, 'DRAFT', NULL, '2026-06-01 10:00:00', '2026-06-01 10:00:00'),
(7, 16, 3, NULL, 'Thiết kế chưa đặt tên222312', 'Trắng', '{"elements": [{"x": 163.7142857142857, "y": 246.91428571428577, "id": "fb67142d-d438-466f-bb7f-6d218b70c337", "fill": "#000000", "text": "Văn bản mới", "type": "text", "width": 200, "height": 40, "fontSize": 28, "rotation": 0, "fontStyle": "normal", "fontFamily": "Montserrat"}, {"x": 172.85714285714286, "y": 189.20000000000007, "id": "3b57b772-0066-4f62-843a-4efdb8b13ed7", "fill": "#000000", "text": "Văn bản mới", "type": "text", "width": 200, "height": 40, "fontSize": 28, "rotation": 0, "fontStyle": "normal", "fontFamily": "Quicksand"}, {"x": 121.5714285714284, "y": 144.4285714285714, "id": "f585115f-5fa0-4821-aed4-4573f1a72caf", "src": "https://res.cloudinary.com/dwol6aarv/image/upload/v1782033314/thank-you_7328366_q8e2f3.png", "type": "image", "width": 247.71428571428584, "height": 238.00000000000009, "rotation": 0}], "shirtView": "front"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782035952/teestudio/user-designs/c5jfgcj0fmixfofsphm9.png', 0.00, 'DRAFT', NULL, '2026-06-21 16:58:48', '2026-06-21 16:59:13'),
(8, 16, 1, NULL, 'Thiết kế c1', '#ffffff', '{"elements": [{"x": 200.2857142857136, "y": 235.48571428571415, "id": "ddea394b-d98f-4d7b-9076-635d6fc570eb", "fill": "#000000", "text": "Văn bản mẫu", "type": "text", "width": 121.71428571428636, "height": 27.999999999999982, "fontSize": 27.999999999999982, "rotation": 0, "fontStyle": "normal", "fontFamily": "Great Vibes"}], "shirtView": "front"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782221859/teestudio/user-designs/lodmjw2cfeack61etict.png', 0.00, 'DRAFT', NULL, '2026-06-23 20:37:41', '2026-06-23 20:37:41'),
(9, 16, 3, NULL, 'Thiết kế chưa đặt tên2312', '#8b4513', '{"elements": [{"x": 203.2, "y": 235.20000000000005, "id": "50f64091-3316-4d8b-a907-0cafee631d80", "src": "https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png", "type": "image", "width": 93.6, "height": 93.6, "rotation": 0}], "shirtView": "front"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782222734/teestudio/user-designs/r0itp5mqlyfiyekrbtam.png', 0.00, 'DRAFT', NULL, '2026-06-23 20:52:16', '2026-06-23 20:52:16'),
(10, 16, 4, NULL, 'Thiết kế chưa đặt tên', '#ffffff', '{"elements": [{"x": 211.8571428571429, "y": 236.42857142857144, "id": "96f497c3-73dd-4f78-a670-e6297906b786", "src": "https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png", "type": "image", "width": 138, "height": 138, "rotation": 0}], "shirtView": "front"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1783157435/teestudio/user-designs/ww36mcft3nfoi9usmkxu.png', 0.00, 'DRAFT', NULL, '2026-07-04 16:30:36', '2026-07-04 16:30:36');

-- Các thiết kế đã gắn với đơn cũ phải ở trạng thái đã duyệt.
UPDATE `CustomDesign`
SET `status` = 'APPROVED',
    `adminNote` = 'Thiết kế đã được duyệt để đưa vào sản xuất.'
WHERE `id` IN (1, 2, 3, 4);

-- Dữ liệu đa dạng để kiểm thử danh sách thiết kế theo khách hàng và trạng thái.
INSERT INTO `CustomDesign`
(`id`, `userId`, `productId`, `variantId`, `name`, `baseColor`, `canvasData`, `previewUrl`, `designFee`, `status`, `adminNote`, `createdAt`, `updatedAt`) VALUES
(11, 2, 3, 14, 'Hoodie Câu lạc bộ Nhiếp ảnh', '#000000', '{"elements":[{"type":"text","text":"CAPTURE THE MOMENT","x":90,"y":110,"fill":"#FFFFFF"}],"shirtView":"front"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-nhiep-anh.jpg', 120000.00, 'PENDING_REVIEW', NULL, '2026-06-14 08:00:00', '2026-06-14 08:30:00'),
(12, 4, 4, 21, 'Polo Đội ngũ Kinh doanh', '#FFFFFF', '{"elements":[{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/logos/sales-team.png","x":145,"y":105,"width":110,"height":110}],"shirtView":"front"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/polo-sales-team.jpg', 180000.00, 'APPROVED', 'Đã duyệt logo ngực trái và màu in.', '2026-06-14 09:00:00', '2026-06-14 10:00:00'),
(13, 7, 1, 3, 'Áo thun Sự kiện Mùa hè', '#FFFFFF', '{"elements":[{"type":"text","text":"SUMMER FEST 2026","x":95,"y":130,"fill":"#F97316"}],"shirtView":"front"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/summer-fest-2026.jpg', 80000.00, 'NEEDS_REVISION', 'Vui lòng tăng kích thước chữ và đưa nội dung vào giữa vùng in.', '2026-06-14 11:00:00', '2026-06-14 15:00:00'),
(14, 8, 4, 23, 'Polo Câu lạc bộ Chạy bộ', '#0066CC', '{"elements":[{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/icons/running-club.png","x":150,"y":100,"width":100,"height":120}],"shirtView":"front"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/polo-running-club.jpg', 100000.00, 'APPROVED', 'Thiết kế đạt yêu cầu in DTG.', '2026-06-15 08:00:00', '2026-06-15 09:00:00'),
(15, 1, 1, 5, 'Bản nháp Typography Tối giản', '#000000', '{"elements":[{"type":"text","text":"LESS IS MORE","x":120,"y":150,"fill":"#FFFFFF"}],"shirtView":"front"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/less-is-more-draft.jpg', 0.00, 'DRAFT', NULL, '2026-06-15 09:30:00', '2026-06-15 09:30:00'),
(16, 2, 3, 15, 'Hoodie Team Building 2026', '#000000', '{"elements":[{"type":"text","text":"ONE TEAM ONE DREAM","x":75,"y":120,"fill":"#FACC15"}],"shirtView":"back"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-team-building.jpg', 150000.00, 'APPROVED', 'Đã duyệt nội dung mặt sau.', '2026-06-15 10:00:00', '2026-06-15 11:00:00'),
(17, 3, 3, 18, 'Hoodie Workshop Công nghệ', '#003153', '{"elements":[{"type":"text","text":"BUILD • LEARN • SHARE","x":80,"y":115,"fill":"#FFFFFF"}],"shirtView":"front"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-tech-workshop.jpg', 180000.00, 'APPROVED', 'Đã duyệt mẫu in mặt trước.', '2026-06-16 08:00:00', '2026-06-16 09:00:00');


-- ============================================================
-- Bảng: DesignPrintPosition [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `DesignPrintPosition` [FROM MEMBER]
--
INSERT INTO `DesignPrintPosition` (`id`, `designId`, `printPositionId`, `extraCost`) VALUES
(1, 1, 1, 0.00),
(2, 2, 1, 0.00),
(3, 2, 3, 15000.00),
(4, 3, 1, 0.00),
(5, 4, 2, 20000.00);

INSERT INTO `DesignPrintPosition` (`id`, `designId`, `printPositionId`, `extraCost`) VALUES
(6, 11, 1, 0.00),
(7, 12, 1, 0.00),
(8, 13, 2, 20000.00),
(9, 14, 1, 0.00),
(10, 15, 1, 0.00),
(11, 16, 2, 20000.00),
(12, 17, 1, 0.00);


-- ============================================================
-- Bảng: DesignPrintMethod [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `DesignPrintMethod` [FROM MEMBER]
--
INSERT INTO `DesignPrintMethod` (`id`, `designId`, `printMethodId`, `extraCost`) VALUES
(1, 1, 1, 0.00),
(2, 2, 2, 30000.00),
(3, 3, 1, 0.00),
(4, 4, 1, 0.00);

INSERT INTO `DesignPrintMethod` (`id`, `designId`, `printMethodId`, `extraCost`) VALUES
(5, 11, 1, 0.00),
(6, 12, 2, 30000.00),
(7, 13, 3, 50000.00),
(8, 14, 1, 0.00),
(9, 15, 4, 20000.00),
(10, 16, 2, 30000.00),
(11, 17, 1, 0.00);


-- ============================================================
-- Bảng: Cart [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `Cart` [FROM MEMBER]
--
INSERT INTO `Cart` (`id`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 16, '2026-07-04 16:30:23', '2026-07-04 16:35:00');


-- ============================================================
-- Bảng: CartItem [BOTH]
-- ============================================================

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

--
-- Dữ liệu mẫu cho bảng `CartItem`
-- Hai thiết kế đều thuộc userId=16, trùng với chủ sở hữu của Cart id=1.
--
INSERT INTO `CartItem` (`id`, `cartId`, `variantId`, `designId`, `quantity`) VALUES
(1, 1, 2, 8, 2),
(2, 1, 20, 10, 1);


-- ============================================================
-- Bảng: Promotion [MERGED]
-- Ghi chú:
--   [FROM ADMIN]  Thêm cột `isNewCustomerOnly` và `updatedAt`
--                 (member đã xóa – admin vẫn dùng)
--   [FROM ADMIN]  Giữ `endDate NULL` (linh hoạt hơn NOT NULL của member)
--   [FROM ADMIN]  Giữ `usageLimit NULL` (cho phép không giới hạn lượt dùng)
-- ============================================================

CREATE TABLE IF NOT EXISTS `Promotion` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`code` VARCHAR(50) NOT NULL,
	`discountType` VARCHAR(30) NOT NULL COMMENT 'PERCENT, FIXED, FREE_SHIPPING',
	`discountValue` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`minOrderAmount` DECIMAL(15,2) NOT NULL DEFAULT 0,
	`startDate` DATETIME NOT NULL,
	`endDate` DATETIME NULL COMMENT '[FROM ADMIN] NULL = không giới hạn ngày kết thúc',
	`usageLimit` INT NULL COMMENT '[FROM ADMIN] NULL = không giới hạn lượt dùng',
	`usedCount` INT NOT NULL DEFAULT 0,
	`isNewCustomerOnly` TINYINT NOT NULL DEFAULT 0 COMMENT '[FROM ADMIN] 1 = chỉ áp dụng cho khách hàng mới',
	`status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_promotion_code` (`code`),
	KEY `idx_promotion_status_dates` (`status`, `startDate`, `endDate`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `Promotion` [FROM MEMBER]
--
INSERT INTO `Promotion` (`id`, `code`, `discountType`, `discountValue`, `minOrderAmount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `isNewCustomerOnly`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'TEEWELCOME', 'PERCENT', 10.00, 200000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 500, 1, 0, 'ACTIVE', '2026-01-01 00:00:00', '2026-06-03 08:24:00'),
(2, 'SALE50K', 'FIXED', 50000.00, 300000.00, '2026-01-01 00:00:00', '2026-06-30 23:59:59', 200, 1, 0, 'ACTIVE', '2026-01-01 00:00:00', '2026-05-30 08:00:00');


-- ============================================================
-- Bảng: PricingConfiguration [FROM ADMIN – chỉ có ở admin DB]
-- ============================================================

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


-- ============================================================
-- Bảng: CustomerOrder [MERGED]
-- Ghi chú:
--   [FROM ADMIN]  Thêm lại cột `paymentType` và `paymentStatus`
--                 (member đã xóa cả 2 cột này)
--   [FROM ADMIN]  Thêm index `idx_customer_order_payment_type_status`
-- ============================================================

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
	`paymentType` VARCHAR(20) NOT NULL COMMENT '[FROM ADMIN] Chính sách thanh toán ban đầu, bất biến: FULL hoặc DEPOSIT. Không có DEFAULT – backend PHẢI truyền giá trị tường minh để tránh bỏ sót.',
	`paymentStatus` VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT '[FROM ADMIN] Tiến độ thanh toán tổng của đơn: PENDING, PARTIALLY_PAID, PAID',
	`status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_customer_order_code` (`orderCode`),
	KEY `idx_customer_order_user_id` (`userId`),
	KEY `idx_customer_order_promotion_id` (`promotionId`),
	KEY `idx_customer_order_address_id` (`addressId`),
	KEY `idx_customer_order_payment_type_status` (`paymentType`, `paymentStatus`),
	CONSTRAINT `fk_customer_order_user`
		FOREIGN KEY (`userId`) REFERENCES `Account` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT,
	CONSTRAINT `fk_customer_order_promotion`
		FOREIGN KEY (`promotionId`) REFERENCES `Promotion` (`id`)
		ON UPDATE NO ACTION ON DELETE SET NULL,
	CONSTRAINT `fk_customer_order_address`
		FOREIGN KEY (`addressId`) REFERENCES `UserAddress` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `CustomerOrder` [FROM MEMBER]
-- Lưu ý: paymentType và paymentStatus được gán mặc định 'FULL' và 'PAID'/'PENDING' phù hợp với dữ liệu
--
INSERT INTO `CustomerOrder` (`id`, `orderCode`, `userId`, `promotionId`, `addressId`, `subtotal`, `discountAmount`, `shippingFee`, `shippingCarrier`, `shippingMethod`, `trackingCode`, `shippedAt`, `deliveredAt`, `cancelReason`, `totalAmount`, `depositAmount`, `codAmount`, `paymentType`, `paymentStatus`, `status`, `createdAt`, `updatedAt`) VALUES
(1, '#TS-2026-00128', 1, 1, 1, 450000.00, 60000.00, 30000.00, 'GHTK', 'Tiêu chuẩn', NULL, NULL, NULL, NULL, 570000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-06-03 08:24:00', '2026-06-03 10:30:00'),
(2, '#TS-2026-00129', 2, NULL, 2, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-03 09:05:00', '2026-06-03 09:05:00'),
(3, '#TS-2026-00130', 3, NULL, 3, 1440000.00, 0.00, 0.00, 'J&T Express', 'Nhanh', NULL, NULL, NULL, NULL, 1640000.00, 0.00, 0.00, 'FULL', 'PAID', 'READY_TO_SHIP', '2026-06-02 13:40:00', '2026-06-03 09:00:00'),
(4, '#TS-2026-00131', 4, NULL, 4, 480000.00, 0.00, 30000.00, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260601001', '2026-06-01 14:00:00', '2026-06-03 10:20:00', NULL, 510000.00, 0.00, 0.00, 'FULL', 'PAID', 'COMPLETED', '2026-05-31 15:20:00', '2026-06-03 10:20:00'),
(5, '#TS-2026-00132', 5, NULL, 5, 360000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 490000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CONFIRMED', '2026-06-03 10:15:00', '2026-06-03 11:00:00'),
(6, '#TS-2026-00133', 6, NULL, 6, 450000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 600000.00, 0.00, 0.00, 'FULL', 'PAID', 'PRINTING', '2026-06-02 14:30:00', '2026-06-03 08:00:00'),
(7, '#TS-2026-00134', 7, NULL, 7, 360000.00, 0.00, 30000.00, 'GHTK', 'Nhanh', 'GHTK2026060001', '2026-06-02 16:00:00', NULL, NULL, 390000.00, 0.00, 0.00, 'FULL', 'PENDING', 'SHIPPING', '2026-06-01 16:45:00', '2026-06-02 16:00:00'),
(8, '#TS-2026-00135', 8, NULL, 8, 240000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, 'Khách hàng yêu cầu hủy, không có nhu cầu nữa', 270000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-06-01 09:00:00', '2026-06-01 10:30:00'),
(9, '#TS-2026-00136', 1, NULL, 1, 300000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 330000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-03 11:00:00', '2026-06-03 11:00:00'),
(10, '#TS-2026-00137', 2, 2, 2, 600000.00, 50000.00, 0.00, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260603002', '2026-06-02 08:00:00', '2026-06-03 14:00:00', NULL, 550000.00, 0.00, 0.00, 'FULL', 'PAID', 'COMPLETED', '2026-05-30 08:00:00', '2026-06-03 14:00:00');

-- Đơn mẫu bổ sung: đặt cọc, MOMO/VNPAY, COD chờ đối soát và thanh toán lỗi/chờ.
INSERT INTO `CustomerOrder`
(`id`, `orderCode`, `userId`, `promotionId`, `addressId`, `subtotal`, `discountAmount`, `shippingFee`, `shippingCarrier`, `shippingMethod`, `trackingCode`, `shippedAt`, `deliveredAt`, `cancelReason`, `totalAmount`, `depositAmount`, `codAmount`, `paymentType`, `paymentStatus`, `status`, `createdAt`, `updatedAt`) VALUES
(11, '#TS-2026-00138', 4, NULL, 4, 720000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 900000.00, 450000.00, 450000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'CONFIRMED', '2026-06-14 11:00:00', '2026-06-14 12:00:00'),
(12, '#TS-2026-00139', 8, NULL, 8, 540000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 640000.00, 320000.00, 320000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'PRINTING', '2026-06-15 10:00:00', '2026-06-16 09:00:00'),
(13, '#TS-2026-00140', 2, NULL, 2, 560000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 740000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-06-15 13:00:00', '2026-06-15 14:00:00'),
(14, '#TS-2026-00141', 7, NULL, 7, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 150000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-16 09:00:00', '2026-06-16 09:00:00'),
(15, '#TS-2026-00142', 5, NULL, 5, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-16 10:00:00', '2026-06-16 10:10:00'),
(16, '#TS-2026-00143', 6, NULL, 6, 360000.00, 0.00, 30000.00, 'Giao Hàng Nhanh', 'Tiêu chuẩn', 'GHN202606180143', '2026-06-17 09:00:00', '2026-06-18 16:30:00', NULL, 390000.00, 0.00, 390000.00, 'FULL', 'PENDING', 'COMPLETED', '2026-06-16 14:00:00', '2026-06-18 16:30:00'),
(17, '#TS-2026-00144', 3, NULL, 3, 560000.00, 0.00, 30000.00, 'Viettel Post', 'Nhanh', 'VTP202606190144', '2026-06-18 08:00:00', '2026-06-19 15:00:00', NULL, 770000.00, 385000.00, 385000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'COMPLETED', '2026-06-17 08:00:00', '2026-06-19 15:00:00'),
(18, '#TS-2026-00145', 1, NULL, 1, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-17 10:00:00', '2026-06-17 10:00:00');

-- Trigger: paymentType là bất biến sau khi đơn đã tạo [FROM ADMIN]
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


-- ============================================================
-- Bảng: OrderHistory [BOTH]
-- Ghi chú (2026-06-05): Bổ sung để lưu lịch sử trạng thái thật của đơn hàng.
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `OrderHistory` [FROM MEMBER]
--
INSERT INTO `OrderHistory` (`id`, `orderId`, `fromStatus`, `toStatus`, `action`, `actorId`, `actorRole`, `actorName`, `note`, `createdAt`) VALUES
(1, 1, NULL, 'PENDING', 'Khách hàng đặt đơn', 1, 'CUSTOMER', 'Nguyễn Minh Anh', 'Khách hàng đặt đơn', '2026-06-03 08:24:00'),
(2, 1, 'PENDING', 'PROCESSING', 'STATUS_CHANGED', 9, 'ADMIN', 'Quản Trị Viên', NULL, '2026-06-03 10:30:00'),
(3, 2, NULL, 'PENDING', 'Khách hàng đặt đơn', 2, 'CUSTOMER', 'Trần Văn Cường', 'Khách hàng đặt đơn', '2026-06-03 09:05:00'),
(4, 3, NULL, 'PENDING', 'Khách hàng đặt đơn', 3, 'CUSTOMER', 'Lê Thị Hoa', 'Khách hàng đặt đơn', '2026-06-02 13:40:00'),
(5, 3, 'PENDING', 'READY_TO_SHIP', 'STATUS_CHANGED', 9, 'ADMIN', 'Quản Trị Viên', NULL, '2026-06-03 09:00:00'),
(6, 4, NULL, 'PENDING', 'Khách hàng đặt đơn', 4, 'CUSTOMER', 'Phạm Quốc Bảo', 'Khách hàng đặt đơn', '2026-05-31 15:20:00'),
(7, 4, 'PENDING', 'COMPLETED', 'STATUS_CHANGED', 9, 'ADMIN', 'Quản Trị Viên', NULL, '2026-06-03 10:20:00'),
(8, 5, NULL, 'PENDING', 'Khách hàng đặt đơn', 5, 'CUSTOMER', 'Nguyễn Thị Lan', 'Khách hàng đặt đơn', '2026-06-03 10:15:00'),
(9, 5, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', 9, 'ADMIN', 'Quản Trị Viên', NULL, '2026-06-03 11:00:00'),
(10, 6, NULL, 'PENDING', 'Khách hàng đặt đơn', 6, 'CUSTOMER', 'Hoàng Văn Đức', 'Khách hàng đặt đơn', '2026-06-02 14:30:00'),
(11, 6, 'PENDING', 'PRINTING', 'STATUS_CHANGED', 9, 'ADMIN', 'Quản Trị Viên', NULL, '2026-06-03 08:00:00'),
(12, 7, NULL, 'PENDING', 'Khách hàng đặt đơn', 7, 'CUSTOMER', 'Võ Thị Thu', 'Khách hàng đặt đơn', '2026-06-01 16:45:00'),
(13, 7, 'PENDING', 'SHIPPING', 'STATUS_CHANGED', 9, 'ADMIN', 'Quản Trị Viên', NULL, '2026-06-02 16:00:00'),
(14, 8, NULL, 'PENDING', 'Khách hàng đặt đơn', 8, 'CUSTOMER', 'Đinh Văn Nam', 'Khách hàng đặt đơn', '2026-06-01 09:00:00'),
(15, 8, 'PENDING', 'CANCELLED', 'CANCELLED', 9, 'ADMIN', 'Quản Trị Viên', 'Đã hủy đơn hàng – Lý do: Khách hàng yêu cầu hủy, không có nhu cầu nữa', '2026-06-01 10:30:00'),
(16, 9, NULL, 'PENDING', 'Khách hàng đặt đơn', 1, 'CUSTOMER', 'Nguyễn Minh Anh', 'Khách hàng đặt đơn', '2026-06-03 11:00:00'),
(17, 10, NULL, 'PENDING', 'Khách hàng đặt đơn', 2, 'CUSTOMER', 'Trần Văn Cường', 'Khách hàng đặt đơn', '2026-05-30 08:00:00'),
(18, 10, 'PENDING', 'COMPLETED', 'STATUS_CHANGED', 9, 'ADMIN', 'Quản Trị Viên', NULL, '2026-06-03 14:00:00');

INSERT INTO `OrderHistory` (`id`, `orderId`, `fromStatus`, `toStatus`, `action`, `actorId`, `actorRole`, `actorName`, `note`, `createdAt`) VALUES
(19, 11, NULL, 'PENDING', 'Khách hàng đặt đơn', 4, 'CUSTOMER', 'Phạm Quốc Bảo', 'Đơn thanh toán cọc qua VNPAY.', '2026-06-14 11:00:00'),
(20, 11, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', 11, 'ADMIN', 'Nguyen Thanh Hieu', 'Đã xác nhận tiền cọc; thiết kế đang chờ gửi xưởng.', '2026-06-14 12:00:00'),
(21, 12, NULL, 'PENDING', 'Khách hàng đặt đơn', 8, 'CUSTOMER', 'Đinh Văn Nam', 'Đơn thanh toán cọc qua MOMO.', '2026-06-15 10:00:00'),
(22, 12, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', 11, 'ADMIN', 'Nguyen Thanh Hieu', 'Đã xác nhận tiền cọc MOMO.', '2026-06-15 11:00:00'),
(23, 12, 'CONFIRMED', 'PRINTING', 'STATUS_CHANGED', 14, 'PRODUCTION', 'Hiếu', 'Xưởng đang in thiết kế đã duyệt.', '2026-06-16 09:00:00'),
(24, 13, NULL, 'PENDING', 'Khách hàng đặt đơn', 2, 'CUSTOMER', 'Trần Văn Cường', 'Thanh toán toàn bộ qua MOMO.', '2026-06-15 13:00:00'),
(25, 13, 'PENDING', 'PROCESSING', 'STATUS_CHANGED', 11, 'ADMIN', 'Nguyen Thanh Hieu', 'Đã xác nhận thanh toán và chờ chuyển xưởng.', '2026-06-15 14:00:00'),
(26, 14, NULL, 'PENDING', 'Khách hàng đặt đơn', 7, 'CUSTOMER', 'Võ Thị Thu', 'Đang chờ khách hoàn tất VNPAY.', '2026-06-16 09:00:00'),
(27, 15, NULL, 'PENDING', 'Khách hàng đặt đơn', 5, 'CUSTOMER', 'Nguyễn Thị Lan', 'Giao dịch MOMO thất bại, có thể tạo lại mã thanh toán.', '2026-06-16 10:00:00'),
(28, 16, NULL, 'PENDING', 'Khách hàng đặt đơn', 6, 'CUSTOMER', 'Hoàng Văn Đức', 'Đơn thanh toán COD.', '2026-06-16 14:00:00'),
(29, 16, 'PENDING', 'SHIPPING', 'STATUS_CHANGED', 12, 'WAREHOUSE', 'Nguyen Thanh Hieu', 'Đã bàn giao đơn vị vận chuyển.', '2026-06-17 09:00:00'),
(30, 16, 'SHIPPING', 'COMPLETED', 'STATUS_CHANGED', 11, 'ADMIN', 'Nguyen Thanh Hieu', 'Đã giao hàng, chờ kế toán đối soát COD.', '2026-06-18 16:30:00'),
(31, 17, NULL, 'PENDING', 'Khách hàng đặt đơn', 3, 'CUSTOMER', 'Lê Thị Hoa', 'Đã thanh toán cọc qua VNPAY.', '2026-06-17 08:00:00'),
(32, 17, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', 11, 'ADMIN', 'Nguyen Thanh Hieu', 'Đã xác nhận cọc và chuyển xưởng.', '2026-06-17 09:00:00'),
(33, 17, 'CONFIRMED', 'COMPLETED', 'STATUS_CHANGED', 11, 'ADMIN', 'Nguyen Thanh Hieu', 'Đã giao hàng, phần COD còn lại chờ đối soát.', '2026-06-19 15:00:00'),
(34, 18, NULL, 'PENDING', 'Khách hàng đặt đơn', 1, 'CUSTOMER', 'Nguyễn Minh Anh', 'Đang chờ khách hoàn tất MOMO.', '2026-06-17 10:00:00');


-- ============================================================
-- Bảng: OrderItem [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `OrderItem` [FROM MEMBER]
--
INSERT INTO `OrderItem` (`id`, `orderId`, `variantId`, `designId`, `quantity`, `unitPrice`, `designFee`, `lineTotal`, `productionStatus`) VALUES
(1, 1, 10, 1, 3, 150000.00, 150000.00, 600000.00, 'PROCESSING'),
(2, 2, 14, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(3, 3, 20, 2, 8, 180000.00, 200000.00, 1640000.00, 'READY_TO_SHIP'),
(4, 4, 8, NULL, 4, 120000.00, 0.00, 480000.00, 'COMPLETED'),
(5, 5, 2, 3, 3, 120000.00, 100000.00, 460000.00, 'READY_TO_PRINT'),
(6, 6, 12, 4, 3, 150000.00, 120000.00, 570000.00, 'PRINTING'),
(7, 7, 1, NULL, 3, 120000.00, 0.00, 360000.00, 'SHIPPING'),
(8, 8, 2, NULL, 2, 120000.00, 0.00, 240000.00, 'CANCELLED'),
(9, 9, 22, NULL, 2, 150000.00, 0.00, 300000.00, 'WAITING_DESIGN_APPROVAL'),
(10, 10, 6, NULL, 5, 120000.00, 0.00, 600000.00, 'COMPLETED');

INSERT INTO `OrderItem` (`id`, `orderId`, `variantId`, `designId`, `quantity`, `unitPrice`, `designFee`, `lineTotal`, `productionStatus`) VALUES
(11, 11, 21, 12, 4, 180000.00, 180000.00, 900000.00, 'READY_TO_PRINT'),
(12, 12, 23, 14, 3, 180000.00, 100000.00, 640000.00, 'PRINTING'),
(13, 13, 15, 16, 2, 280000.00, 150000.00, 710000.00, 'READY_TO_PRINT'),
(14, 14, 3, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(15, 15, 17, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(16, 16, 24, NULL, 2, 180000.00, 0.00, 360000.00, 'COMPLETED'),
(17, 17, 18, 17, 2, 280000.00, 180000.00, 740000.00, 'PACKED'),
(18, 18, 15, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL');


-- ============================================================
-- Bảng: OrderProduction [BOTH]
-- ============================================================

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `OrderProduction` [FROM MEMBER]
--
INSERT INTO `OrderProduction` (`id`, `orderItemId`, `designId`, `status`, `note`, `approvedAt`, `printedAt`, `packedAt`, `createdAt`) VALUES
(1, 1, 1, 'PROCESSING', 'Đã nhận file in, đang chuẩn bị máy in DTG', '2026-06-03 10:30:00', NULL, NULL, '2026-06-03 08:24:00'),
(2, 3, 2, 'PACKED', 'Đồng phục công ty XYZ – 8 áo, đã kiểm tra chất lượng', '2026-06-02 14:10:00', '2026-06-02 16:00:00', '2026-06-03 08:30:00', '2026-06-02 13:40:00'),
(3, 5, 3, 'APPROVED', 'Đã duyệt thiết kế, chờ gửi thông số xuống xưởng', '2026-06-03 11:00:00', NULL, NULL, '2026-06-03 10:15:00'),
(4, 6, 4, 'PRINTING', 'Đang in lụa, dự kiến xong chiều nay', '2026-06-02 15:00:00', NULL, NULL, '2026-06-02 14:30:00');

INSERT INTO `OrderProduction` (`id`, `orderItemId`, `designId`, `status`, `note`, `approvedAt`, `printedAt`, `packedAt`, `createdAt`) VALUES
(5, 11, 12, 'APPROVED', 'Thiết kế đã duyệt, đơn đang chờ gửi thông số xuống xưởng.', '2026-06-14 12:00:00', NULL, NULL, '2026-06-14 11:00:00'),
(6, 12, 14, 'PRINTING', 'Xưởng đang in DTG theo mẫu đã duyệt.', '2026-06-15 11:00:00', NULL, NULL, '2026-06-15 10:00:00'),
(7, 13, 16, 'APPROVED', 'Đã duyệt mẫu, đang nằm trong hàng chờ gửi xưởng.', '2026-06-15 14:00:00', NULL, NULL, '2026-06-15 13:00:00'),
(8, 14, NULL, 'WAITING_DESIGN_APPROVAL', 'Đơn áo trơn, chờ xác nhận yêu cầu sản xuất.', NULL, NULL, NULL, '2026-06-16 09:00:00'),
(9, 15, NULL, 'WAITING_DESIGN_APPROVAL', 'Chưa chuyển sản xuất do thanh toán MOMO thất bại.', NULL, NULL, NULL, '2026-06-16 10:00:00'),
(10, 17, 17, 'PACKED', 'Đã in xong, kiểm tra chất lượng và đóng gói.', '2026-06-17 09:00:00', '2026-06-17 15:00:00', '2026-06-18 07:30:00', '2026-06-17 08:00:00');


-- ============================================================
-- Bảng: Payment [MERGED]
-- Ghi chú:
--   [FROM ADMIN]  Thêm lại cột `note` và composite index
--                 `idx_payment_method_status_created_at`
--   [FROM ADMIN]  Mở rộng `status` từ VARCHAR(20) → VARCHAR(30)
-- ============================================================

CREATE TABLE IF NOT EXISTS `Payment` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`orderId` INT NOT NULL,
	`amount` DECIMAL(15,2) NOT NULL,
	`paymentMethod` VARCHAR(30) NOT NULL COMMENT 'Phương thức thanh toán dùng chung: COD, VNPAY, MOMO, BANK_TRANSFER',
	`paymentType` VARCHAR(20) NOT NULL,
	`status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
	`transactionId` VARCHAR(255) NULL,
	`paidAt` DATETIME NULL,
	`gatewayResponse` TEXT NULL,
	`note` TEXT NULL COMMENT '[FROM ADMIN] Ghi chú kế toán của admin',
	`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `uq_payment_transaction_id` (`transactionId`),
	KEY `idx_payment_order_id` (`orderId`),
	KEY `idx_payment_method_status_created_at` (`paymentMethod`, `status`, `createdAt`),
	CONSTRAINT `fk_payment_order`
		FOREIGN KEY (`orderId`) REFERENCES `CustomerOrder` (`id`)
		ON UPDATE NO ACTION ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu cho bảng `Payment` [FROM MEMBER]
--
INSERT INTO `Payment` (`id`, `orderId`, `amount`, `paymentMethod`, `paymentType`, `status`, `transactionId`, `paidAt`, `gatewayResponse`, `note`, `createdAt`) VALUES
(1, 1, 570000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260603001', '2026-06-03 08:30:00', NULL, NULL, '2026-06-03 08:25:00'),
(2, 2, 310000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-06-03 09:05:00'),
(3, 3, 1640000.00, 'BANK_TRANSFER', 'FULL_PAYMENT', 'COMPLETED', 'CK20260602001', '2026-06-02 14:00:00', NULL, NULL, '2026-06-02 13:45:00'),
(4, 4, 510000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260531001', '2026-05-31 15:30:00', NULL, NULL, '2026-05-31 15:25:00'),
(5, 5, 490000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-06-03 10:15:00'),
(6, 6, 600000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260602001', '2026-06-02 14:35:00', NULL, NULL, '2026-06-02 14:31:00'),
(7, 7, 390000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-06-01 16:45:00'),
(8, 8, 270000.00, 'COD', 'COD_FINAL', 'CANCELLED', NULL, NULL, NULL, NULL, '2026-06-01 09:00:00'),
(9, 9, 330000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-06-03 11:00:00'),
(10, 10, 550000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260530001', '2026-05-30 08:15:00', NULL, NULL, '2026-05-30 08:05:00');

INSERT INTO `Payment` (`id`, `orderId`, `amount`, `paymentMethod`, `paymentType`, `status`, `transactionId`, `paidAt`, `gatewayResponse`, `note`, `createdAt`) VALUES
(11, 11, 450000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'VNP202606140138', '2026-06-14 11:08:00', '{"vnp_ResponseCode":"00","vnp_TransactionNo":"2606140138","vnp_BankCode":"NCB"}', 'Đã thanh toán cọc 50% qua VNPAY.', '2026-06-14 11:00:00'),
(12, 12, 320000.00, 'MOMO', 'DEPOSIT', 'COMPLETED', 'MOMO202606150139', '2026-06-15 10:06:00', '{"resultCode":0,"message":"Successful","transId":"2606150139"}', 'Đã thanh toán cọc 50% qua MOMO.', '2026-06-15 10:00:00'),
(13, 13, 740000.00, 'MOMO', 'FULL_PAYMENT', 'COMPLETED', 'MOMO202606150140', '2026-06-15 13:05:00', '{"resultCode":0,"message":"Successful","transId":"2606150140"}', 'Đã thanh toán toàn bộ qua MOMO.', '2026-06-15 13:00:00'),
(14, 14, 150000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'VNP202606160141', NULL, '{"paymentUrlExpiresAt":"2026-06-16T09:15:00+07:00"}', 'Đang chờ khách hoàn tất VNPAY.', '2026-06-16 09:00:00'),
(15, 15, 310000.00, 'MOMO', 'FULL_PAYMENT', 'FAILED', 'MOMO202606160142', NULL, '{"resultCode":1006,"message":"User denied payment"}', 'Giao dịch MOMO thất bại; cho phép tạo lại mã thanh toán.', '2026-06-16 10:00:00'),
(16, 16, 390000.00, 'COD', 'COD_FINAL', 'PENDING_RECONCILIATION', NULL, NULL, NULL, 'Đơn đã giao, đang chờ kế toán xác nhận tiền COD từ đơn vị vận chuyển.', '2026-06-18 16:30:00'),
(17, 17, 385000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'VNP202606170144', '2026-06-17 08:08:00', '{"vnp_ResponseCode":"00","vnp_TransactionNo":"2606170144","vnp_BankCode":"VCB"}', 'Đã thu cọc 50% qua VNPAY.', '2026-06-17 08:00:00'),
(18, 17, 385000.00, 'COD', 'COD_FINAL', 'PENDING_RECONCILIATION', NULL, NULL, NULL, 'Phần tiền còn lại sau đặt cọc đang chờ đối soát COD.', '2026-06-19 15:00:00'),
(19, 18, 310000.00, 'MOMO', 'FULL_PAYMENT', 'PENDING', 'MOMO202606170145', NULL, '{"payUrlExpiresAt":"2026-06-17T10:15:00+07:00"}', 'Đang chờ khách hoàn tất MOMO.', '2026-06-17 10:00:00');


-- ============================================================
-- Bảng: InventoryTransaction [MERGED]
-- Ghi chú:
--   [FROM ADMIN]  Dùng composite index `idx_inventory_transaction_variant_created_at`
--                 thay vì index đơn `idx_inventory_transaction_variant_id` của member
--                 (composite index hiệu quả hơn cho query theo biến thể + thời gian)
-- ============================================================

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
	KEY `idx_inventory_transaction_variant_created_at` (`variantId`, `createdAt`),
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dữ liệu mẫu cho bảng `InventoryTransaction`
-- Tổng biến động của từng variant khớp chính xác ProductVariant.stockQty.
-- Đơn bị hủy id=8 có đủ giao dịch xuất kho và hoàn kho.
--
INSERT INTO `InventoryTransaction`
(`id`, `variantId`, `orderId`, `supplierId`, `quantityChanged`, `transactionType`, `reason`, `createdAt`) VALUES
(1, 1, NULL, 1, 153, 'IMPORT', 'Nhập phôi áo thun trắng size S', '2026-05-20 08:00:00'),
(2, 2, NULL, 1, 203, 'IMPORT', 'Nhập phôi áo thun trắng size M', '2026-05-20 08:01:00'),
(3, 3, NULL, 1, 2, 'IMPORT', 'Nhập phôi áo thun trắng size L', '2026-05-20 08:02:00'),
(4, 4, NULL, 1, 120, 'IMPORT', 'Nhập phôi áo thun trắng size XL', '2026-05-20 08:03:00'),
(5, 5, NULL, 1, 130, 'IMPORT', 'Nhập phôi áo thun đen size S', '2026-05-20 08:04:00'),
(6, 6, NULL, 1, 195, 'IMPORT', 'Nhập phôi áo thun đen size M', '2026-05-20 08:05:00'),
(7, 7, NULL, 1, 160, 'IMPORT', 'Nhập phôi áo thun đen size L', '2026-05-20 08:06:00'),
(8, 8, NULL, 1, 104, 'IMPORT', 'Nhập phôi áo thun đen size XL', '2026-05-20 08:07:00'),
(9, 9, NULL, 1, 80, 'IMPORT', 'Nhập phôi áo thun oversize trắng size M', '2026-05-20 08:08:00'),
(10, 10, NULL, 1, 93, 'IMPORT', 'Nhập phôi áo thun oversize trắng size L', '2026-05-20 08:09:00'),
(11, 11, NULL, 1, 70, 'IMPORT', 'Nhập phôi áo thun oversize trắng size XL', '2026-05-20 08:10:00'),
(12, 12, NULL, 1, 78, 'IMPORT', 'Nhập phôi áo thun oversize xám size M', '2026-05-20 08:11:00'),
(13, 13, NULL, 1, 85, 'IMPORT', 'Nhập phôi áo thun oversize xám size L', '2026-05-20 08:12:00'),
(14, 14, NULL, 2, 4, 'IMPORT', 'Nhập hoodie đen size M', '2026-05-20 08:13:00'),
(15, 15, NULL, 2, 5, 'IMPORT', 'Nhập hoodie đen size L', '2026-05-20 08:14:00'),
(16, 16, NULL, 2, 40, 'IMPORT', 'Nhập hoodie đen size XL', '2026-05-20 08:15:00'),
(17, 17, NULL, 2, 5, 'IMPORT', 'Nhập hoodie xanh navy size M', '2026-05-20 08:16:00'),
(18, 18, NULL, 2, 4, 'IMPORT', 'Nhập hoodie xanh navy size L', '2026-05-20 08:17:00'),
(19, 19, NULL, 3, 60, 'IMPORT', 'Nhập áo polo trắng size S', '2026-05-20 08:18:00'),
(20, 20, NULL, 3, 88, 'IMPORT', 'Nhập áo polo trắng size M', '2026-05-20 08:19:00'),
(21, 21, NULL, 3, 12, 'IMPORT', 'Nhập áo polo trắng size L', '2026-05-20 08:20:00'),
(22, 22, NULL, 3, 72, 'IMPORT', 'Nhập áo polo xanh dương size M', '2026-05-20 08:21:00'),
(23, 23, NULL, 3, 3, 'IMPORT', 'Nhập áo polo xanh dương size L', '2026-05-20 08:22:00'),
(24, 24, NULL, 3, 2, 'IMPORT', 'Nhập áo polo xanh dương size XL', '2026-05-20 08:23:00'),
(25, 6, 10, NULL, -5, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00137', '2026-05-30 08:00:00'),
(26, 8, 4, NULL, -4, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00131', '2026-05-31 15:20:00'),
(27, 2, 8, NULL, -2, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00135', '2026-06-01 09:00:00'),
(28, 2, 8, NULL, 2, 'RETURN', 'Hoàn kho do hủy đơn #TS-2026-00135', '2026-06-01 10:30:00'),
(29, 1, 7, NULL, -3, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00134', '2026-06-01 16:45:00'),
(30, 20, 3, NULL, -8, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00130', '2026-06-02 13:40:00'),
(31, 12, 6, NULL, -3, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00133', '2026-06-02 14:30:00'),
(32, 10, 1, NULL, -3, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00128', '2026-06-03 08:24:00'),
(33, 14, 2, NULL, -1, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00129', '2026-06-03 09:05:00'),
(34, 2, 5, NULL, -3, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00132', '2026-06-03 10:15:00'),
(35, 22, 9, NULL, -2, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00136', '2026-06-03 11:00:00'),
(36, 21, 11, NULL, -4, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00138', '2026-06-14 11:00:00'),
(37, 23, 12, NULL, -3, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00139', '2026-06-15 10:00:00'),
(38, 15, 13, NULL, -2, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00140', '2026-06-15 13:00:00'),
(39, 3, 14, NULL, -1, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00141', '2026-06-16 09:00:00'),
(40, 17, 15, NULL, -1, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00142', '2026-06-16 10:00:00'),
(41, 24, 16, NULL, -2, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00143', '2026-06-16 14:00:00'),
(42, 18, 17, NULL, -2, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00144', '2026-06-17 08:00:00'),
(43, 15, 18, NULL, -1, 'EXPORT', 'Giữ tồn kho cho đơn #TS-2026-00145', '2026-06-17 10:00:00'),
(44, 14, NULL, 2, 10, 'IMPORT', 'Nhập bổ sung hoodie đen size M trong tháng hiện tại', '2026-07-01 08:00:00'),
(45, 14, NULL, NULL, -10, 'ADJUSTMENT', 'Điều chỉnh giảm sau kiểm kê để phản ánh số tồn thực tế', '2026-07-02 09:00:00');


-- ============================================================
-- Bảng: PromotionUsage [BOTH]
-- ============================================================

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

--
-- Dữ liệu mẫu cho bảng `PromotionUsage`
-- Mỗi bản ghi tương ứng đúng promotionId/userId/orderId của CustomerOrder.
--
INSERT INTO `PromotionUsage` (`id`, `promotionId`, `userId`, `orderId`, `usedAt`) VALUES
(1, 1, 1, 1, '2026-06-03 08:24:00'),
(2, 2, 2, 10, '2026-05-30 08:00:00');


-- =====================================================================
-- AUTH BOOTSTRAP NOTE
-- Public registration always creates a CUSTOMER account. After registering
-- the first owner account, promote it once with the statement below, then
-- manage all later staff accounts from Admin > Cai dat.
-- UPDATE `Account` SET `role` = 'ADMIN' WHERE `email` = 'owner@example.com';
-- =====================================================================

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
