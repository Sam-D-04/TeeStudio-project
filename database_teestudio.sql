-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th6 23, 2026 lúc 09:58 AM
-- Phiên bản máy phục vụ: 8.4.7
-- Phiên bản PHP: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `teestudio`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `account`
--

DROP TABLE IF EXISTS `account`;
CREATE TABLE IF NOT EXISTS `account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_account_email` (`email`),
  KEY `idx_account_role_status` (`role`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `account`
--

INSERT INTO `account` (`id`, `email`, `passwordHash`, `fullName`, `phone`, `role`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'minhanh.nguyen@gmail.com', '$2b$10$hash1', 'Nguyễn Minh Anh', '0901234567', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:17', '2026-06-10 11:39:17'),
(2, 'cuong.tran@gmail.com', '$2b$10$hash2', 'Trần Văn Cường', '0987654321', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:17', '2026-06-10 11:39:17'),
(3, 'hoa.le@gmail.com', '$2b$10$hash3', 'Lê Thị Hoa', '0912345678', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:17', '2026-06-10 11:39:17'),
(4, 'bao.pham@gmail.com', '$2b$10$hash4', 'Phạm Quốc Bảo', '0934567890', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:17', '2026-06-10 11:39:17'),
(5, 'lan.nguyen@gmail.com', '$2b$10$hash5', 'Nguyễn Thị Lan', '0978901234', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:17', '2026-06-10 11:39:17'),
(6, 'duc.hoang@gmail.com', '$2b$10$hash6', 'Hoàng Văn Đức', '0965432109', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:17', '2026-06-10 11:39:17'),
(7, 'thu.vo@gmail.com', '$2b$10$hash7', 'Võ Thị Thu', '0943210987', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:17', '2026-06-10 11:39:17'),
(8, 'nam.dinh@gmail.com', '$2b$10$hash8', 'Đinh Văn Nam', '0921098765', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:17', '2026-06-10 11:39:17'),
(9, 'admin@teestudio.vn', '$2b$10$hash9', 'Quản Trị Viên', '0909090909', 'ADMIN', 'INACTIVE', '2026-06-10 11:39:17', '2026-06-10 12:47:48'),
(10, 'test.tonkho.customer@teestudio.vn', '$2b$10$seedInventoryCustomerHash', 'Khách Test Tồn Kho', '0900000999', 'CUSTOMER', 'ACTIVE', '2026-06-10 11:39:19', '2026-06-10 11:39:19'),
(11, 'thanhhieu2182004@gmail.com', '$2b$12$dej0jQlYcNB4himKZXnTyO1mAifhTx04Y3kUyy8ot/h5/geo/zOIO', 'Nguyen Thanh Hieu', '0123456789', 'ADMIN', 'ACTIVE', '2026-06-10 11:42:19', '2026-06-10 12:36:53'),
(12, 'thanhhieu282004@gmail.com', '$2b$12$IOC5ktoj07Rk/LELF9OsmOtzDltRyhbI2VEexhx.uzB/bHh.Ql6zu', 'Nguyen Thanh Hieu', '0123456789', 'WAREHOUSE', 'ACTIVE', '2026-06-10 11:46:32', '2026-06-10 13:09:33'),
(13, 'thanhhieu218200@gmail.com', '$2b$12$19oIzOFr0AKZTm8sV8JRXOOU4z2fJLx8ETY6BHS900zSmSYBCLB2W', 'Nguyễn Thanh Hiếu', '0123456789', 'CUSTOMER', 'ACTIVE', '2026-06-10 12:38:47', '2026-06-10 12:38:47'),
(14, 'thanhhieu21820@gmail.com', '$2b$12$DSj/.hYjD1pvRGucdIHzReELpjGJOyIT0FAsUBhoL8OXVD/20kuKm', 'Hiếu', '0900000999', 'PRODUCTION', 'ACTIVE', '2026-06-10 12:46:37', '2026-06-10 12:46:37'),
(15, 'dangcuh2105@gmail.com', '$2b$12$3vzWRYqdZF0WZg/kj2uSv.e7Ot3pwHgbNl06yC5yglXqhWccYB8AW', 'Nguyễn Đăng', '02312312323', 'ADMIN', 'ACTIVE', '2026-06-21 15:54:52', '2026-06-21 15:55:07'),
(16, '1212@gmail.com', '$2b$12$M32aaDqfG3RXEMxe2VCdEupS7.oI7ZW6lpySPRLPBv5/4SEJ3Tr.W', 'abc', '0123456789', 'CUSTOMER', 'ACTIVE', '2026-06-21 16:48:08', '2026-06-21 16:48:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bulkpricing`
--

DROP TABLE IF EXISTS `bulkpricing`;
CREATE TABLE IF NOT EXISTS `bulkpricing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `minQty` int NOT NULL,
  `discountPercent` decimal(5,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bulk_pricing_product_min_qty` (`productId`,`minQty`),
  KEY `idx_bulk_pricing_product_id` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart`
--

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_user_id` (`userId`),
  KEY `idx_cart_user_id` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cartitem`
--

DROP TABLE IF EXISTS `cartitem`;
CREATE TABLE IF NOT EXISTS `cartitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cartId` int NOT NULL,
  `variantId` int NOT NULL,
  `designId` int DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_cart_item_cart_id` (`cartId`),
  KEY `idx_cart_item_variant_id` (`variantId`),
  KEY `idx_cart_item_design_id` (`designId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `category`
--

INSERT INTO `category` (`id`, `name`, `createdAt`) VALUES
(1, 'Áo thun', '2026-06-10 11:39:18'),
(2, 'Áo hoodie', '2026-06-10 11:39:18'),
(3, 'Áo polo', '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customdesign`
--

DROP TABLE IF EXISTS `customdesign`;
CREATE TABLE IF NOT EXISTS `customdesign` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `variantId` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Thiết kế chưa đặt tên',
  `baseColor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `canvasData` json NOT NULL,
  `previewUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `designFee` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `adminNote` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú của admin khi yêu cầu khách chỉnh sửa thiết kế',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_custom_design_user_id` (`userId`),
  KEY `idx_custom_design_product_id` (`productId`),
  KEY `idx_custom_design_variant_id` (`variantId`),
  KEY `idx_custom_design_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customdesign`
--

INSERT INTO `customdesign` (`id`, `userId`, `productId`, `variantId`, `name`, `baseColor`, `canvasData`, `previewUrl`, `designFee`, `status`, `adminNote`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, 10, 'Thiết kế chưa đặt tên', '#FFFFFF', '{\"layers\": [{\"x\": 150, \"y\": 100, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-cty-abc.png\", \"type\": \"image\", \"width\": 120, \"height\": 80, \"rotation\": 0}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-1.jpg', 150000.00, 'SUBMITTED', NULL, '2026-06-10 11:39:18', '2026-06-10 11:39:18'),
(2, 3, 4, 20, 'Thiết kế chưa đặt tên', '#FFFFFF', '{\"layers\": [{\"x\": 100, \"y\": 80, \"type\": \"text\", \"color\": \"#003399\", \"content\": \"ĐỒNG PHỤC CÔNG TY XYZ\", \"fontSize\": 24, \"fontFamily\": \"Arial\"}, {\"x\": 170, \"y\": 120, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-xyz.png\", \"type\": \"image\", \"width\": 60, \"height\": 60}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-3.jpg', 200000.00, 'SUBMITTED', NULL, '2026-06-10 11:39:18', '2026-06-10 11:39:18'),
(3, 5, 1, 2, 'Thiết kế chưa đặt tên', '#FFFFFF', '{\"layers\": [{\"x\": 90, \"y\": 90, \"type\": \"text\", \"color\": \"#FF6600\", \"content\": \"TEAM BUILDING 2026\", \"fontSize\": 28}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-5.jpg', 100000.00, 'SUBMITTED', NULL, '2026-06-10 11:39:18', '2026-06-10 11:39:18'),
(4, 6, 2, 12, 'Thiết kế chưa đặt tên', '#808080', '{\"layers\": [{\"x\": 140, \"y\": 110, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-startup.png\", \"type\": \"image\", \"width\": 100, \"height\": 70}], \"background\": \"#808080\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-6.jpg', 120000.00, 'DRAFT', NULL, '2026-06-10 11:39:18', '2026-06-10 11:39:18'),
(7, 16, 3, NULL, 'Thiết kế chưa đặt tên222312', 'Trắng', '{\"elements\": [{\"x\": 163.7142857142857, \"y\": 246.91428571428577, \"id\": \"fb67142d-d438-466f-bb7f-6d218b70c337\", \"fill\": \"#000000\", \"text\": \"Văn bản mới\", \"type\": \"text\", \"width\": 200, \"height\": 40, \"fontSize\": 28, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Montserrat\"}, {\"x\": 172.85714285714286, \"y\": 189.20000000000007, \"id\": \"3b57b772-0066-4f62-843a-4efdb8b13ed7\", \"fill\": \"#000000\", \"text\": \"Văn bản mới\", \"type\": \"text\", \"width\": 200, \"height\": 40, \"fontSize\": 28, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Quicksand\"}, {\"x\": 121.5714285714284, \"y\": 144.4285714285714, \"id\": \"f585115f-5fa0-4821-aed4-4573f1a72caf\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033314/thank-you_7328366_q8e2f3.png\", \"type\": \"image\", \"width\": 247.71428571428584, \"height\": 238.00000000000009, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782035952/teestudio/user-designs/c5jfgcj0fmixfofsphm9.png', 0.00, 'DRAFT', NULL, '2026-06-21 16:58:48', '2026-06-21 16:59:13');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customerorder`
--

DROP TABLE IF EXISTS `customerorder`;
CREATE TABLE IF NOT EXISTS `customerorder` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `promotionId` int DEFAULT NULL,
  `addressId` int NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `discountAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `shippingFee` decimal(15,2) NOT NULL DEFAULT '0.00',
  `shippingCarrier` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shippingMethod` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trackingCode` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shippedAt` datetime DEFAULT NULL,
  `deliveredAt` datetime DEFAULT NULL,
  `cancelReason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `totalAmount` decimal(15,2) NOT NULL,
  `depositAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `codAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customer_order_code` (`orderCode`),
  KEY `idx_customer_order_user_id` (`userId`),
  KEY `idx_customer_order_promotion_id` (`promotionId`),
  KEY `idx_customer_order_address_id` (`addressId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customerorder`
--

INSERT INTO `customerorder` (`id`, `orderCode`, `userId`, `promotionId`, `addressId`, `subtotal`, `discountAmount`, `shippingFee`, `shippingCarrier`, `shippingMethod`, `trackingCode`, `shippedAt`, `deliveredAt`, `cancelReason`, `totalAmount`, `depositAmount`, `codAmount`, `status`, `createdAt`, `updatedAt`) VALUES
(1, '#TS-2026-00128', 1, 1, 1, 750000.00, 75000.00, 30000.00, 'GHTK', 'Tiêu chuẩn', NULL, NULL, NULL, NULL, 705000.00, 0.00, 0.00, 'PROCESSING', '2026-06-03 08:24:00', '2026-06-03 10:30:00'),
(2, '#TS-2026-00129', 2, NULL, 2, 350000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 380000.00, 0.00, 0.00, 'PENDING', '2026-06-03 09:05:00', '2026-06-03 09:05:00'),
(3, '#TS-2026-00130', 3, NULL, 3, 2400000.00, 0.00, 0.00, 'J&T Express', 'Nhanh', NULL, NULL, NULL, NULL, 2400000.00, 0.00, 0.00, 'READY_TO_SHIP', '2026-06-02 13:40:00', '2026-06-03 09:00:00'),
(4, '#TS-2026-00131', 4, NULL, 4, 480000.00, 0.00, 30000.00, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260601001', '2026-06-01 14:00:00', '2026-06-03 10:20:00', NULL, 510000.00, 0.00, 0.00, 'COMPLETED', '2026-05-31 15:20:00', '2026-06-03 10:20:00'),
(5, '#TS-2026-00132', 5, NULL, 5, 420000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 450000.00, 0.00, 0.00, 'CONFIRMED', '2026-06-03 10:15:00', '2026-06-03 11:00:00'),
(6, '#TS-2026-00133', 6, NULL, 6, 480000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 510000.00, 0.00, 0.00, 'PRINTING', '2026-06-02 14:30:00', '2026-06-03 08:00:00'),
(7, '#TS-2026-00134', 7, NULL, 7, 360000.00, 0.00, 30000.00, 'GHTK', 'Nhanh', 'GHTK2026060001', '2026-06-02 16:00:00', NULL, NULL, 390000.00, 0.00, 0.00, 'SHIPPING', '2026-06-01 16:45:00', '2026-06-02 16:00:00'),
(8, '#TS-2026-00135', 8, NULL, 8, 240000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, 'Khách hàng yêu cầu hủy, không có nhu cầu nữa', 270000.00, 0.00, 0.00, 'CANCELLED', '2026-06-01 09:00:00', '2026-06-01 10:30:00'),
(9, '#TS-2026-00136', 1, NULL, 1, 300000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 330000.00, 0.00, 0.00, 'PENDING', '2026-06-03 11:00:00', '2026-06-03 11:00:00'),
(10, '#TS-2026-00137', 2, 2, 2, 600000.00, 50000.00, 0.00, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260603002', '2026-06-02 08:00:00', '2026-06-03 14:00:00', NULL, 550000.00, 0.00, 0.00, 'COMPLETED', '2026-05-30 08:00:00', '2026-06-03 14:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `designprintmethod`
--

DROP TABLE IF EXISTS `designprintmethod`;
CREATE TABLE IF NOT EXISTS `designprintmethod` (
  `id` int NOT NULL AUTO_INCREMENT,
  `designId` int NOT NULL,
  `printMethodId` int NOT NULL,
  `extraCost` decimal(15,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_design_print_method` (`designId`,`printMethodId`),
  KEY `idx_design_print_method_design_id` (`designId`),
  KEY `idx_design_print_method_method_id` (`printMethodId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `designprintmethod`
--

INSERT INTO `designprintmethod` (`id`, `designId`, `printMethodId`, `extraCost`) VALUES
(1, 1, 1, 0.00),
(2, 2, 2, 30000.00),
(3, 3, 1, 0.00),
(4, 4, 1, 0.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `designprintposition`
--

DROP TABLE IF EXISTS `designprintposition`;
CREATE TABLE IF NOT EXISTS `designprintposition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `designId` int NOT NULL,
  `printPositionId` int NOT NULL,
  `extraCost` decimal(15,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_design_print_position` (`designId`,`printPositionId`),
  KEY `idx_design_print_position_design_id` (`designId`),
  KEY `idx_design_print_position_position_id` (`printPositionId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `designprintposition`
--

INSERT INTO `designprintposition` (`id`, `designId`, `printPositionId`, `extraCost`) VALUES
(1, 1, 1, 0.00),
(2, 2, 1, 0.00),
(3, 2, 3, 15000.00),
(4, 3, 1, 0.00),
(5, 4, 2, 20000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventorytransaction`
--

DROP TABLE IF EXISTS `inventorytransaction`;
CREATE TABLE IF NOT EXISTS `inventorytransaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `variantId` int NOT NULL,
  `orderId` int DEFAULT NULL,
  `supplierId` int DEFAULT NULL,
  `quantityChanged` int NOT NULL,
  `transactionType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inventory_transaction_variant_id` (`variantId`),
  KEY `idx_inventory_transaction_order_id` (`orderId`),
  KEY `idx_inventory_transaction_supplier_id` (`supplierId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orderhistory`
--

DROP TABLE IF EXISTS `orderhistory`;
CREATE TABLE IF NOT EXISTS `orderhistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `fromStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `toStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actorId` int DEFAULT NULL,
  `actorRole` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM',
  `actorName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hệ thống',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_history_order_id_created_at` (`orderId`,`createdAt`),
  KEY `idx_order_history_actor_id` (`actorId`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orderhistory`
--

INSERT INTO `orderhistory` (`id`, `orderId`, `fromStatus`, `toStatus`, `action`, `actorId`, `actorRole`, `actorName`, `note`, `createdAt`) VALUES
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orderitem`
--

DROP TABLE IF EXISTS `orderitem`;
CREATE TABLE IF NOT EXISTS `orderitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `variantId` int NOT NULL,
  `designId` int DEFAULT NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(15,2) NOT NULL,
  `designFee` decimal(15,2) NOT NULL DEFAULT '0.00',
  `lineTotal` decimal(15,2) NOT NULL,
  `productionStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WAITING_DESIGN_APPROVAL',
  PRIMARY KEY (`id`),
  KEY `idx_order_item_order_id` (`orderId`),
  KEY `idx_order_item_variant_id` (`variantId`),
  KEY `idx_order_item_design_id` (`designId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orderitem`
--

INSERT INTO `orderitem` (`id`, `orderId`, `variantId`, `designId`, `quantity`, `unitPrice`, `designFee`, `lineTotal`, `productionStatus`) VALUES
(1, 1, 10, 1, 3, 150000.00, 150000.00, 900000.00, 'PROCESSING'),
(2, 2, 14, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(3, 3, 20, 2, 8, 180000.00, 200000.00, 1640000.00, 'READY_TO_SHIP'),
(4, 4, 8, NULL, 4, 120000.00, 0.00, 480000.00, 'COMPLETED'),
(5, 5, 2, 3, 3, 120000.00, 100000.00, 460000.00, 'CONFIRMED'),
(6, 6, 12, 4, 3, 150000.00, 120000.00, 570000.00, 'PRINTING'),
(7, 7, 1, NULL, 3, 120000.00, 0.00, 360000.00, 'SHIPPING'),
(8, 8, 2, NULL, 2, 120000.00, 0.00, 240000.00, 'CANCELLED'),
(9, 9, 22, NULL, 2, 150000.00, 0.00, 300000.00, 'WAITING_DESIGN_APPROVAL'),
(10, 10, 6, NULL, 5, 120000.00, 0.00, 600000.00, 'COMPLETED');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orderproduction`
--

DROP TABLE IF EXISTS `orderproduction`;
CREATE TABLE IF NOT EXISTS `orderproduction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderItemId` int NOT NULL,
  `designId` int DEFAULT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WAITING_DESIGN_APPROVAL',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `approvedAt` datetime DEFAULT NULL,
  `printedAt` datetime DEFAULT NULL,
  `packedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_production_order_item_id` (`orderItemId`),
  KEY `idx_order_production_design_id` (`designId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orderproduction`
--

INSERT INTO `orderproduction` (`id`, `orderItemId`, `designId`, `status`, `note`, `approvedAt`, `printedAt`, `packedAt`, `createdAt`) VALUES
(1, 1, 1, 'PROCESSING', 'Đã nhận file in, đang chuẩn bị máy in DTG', '2026-06-03 10:30:00', NULL, NULL, '2026-06-10 11:39:18'),
(2, 3, 2, 'PACKED', 'Đồng phục công ty XYZ – 8 áo, đã kiểm tra chất lượng', '2026-06-02 09:00:00', '2026-06-02 14:00:00', '2026-06-03 08:30:00', '2026-06-10 11:39:18'),
(3, 5, 3, 'CONFIRMED', 'Đã duyệt thiết kế, chờ xếp lịch in', '2026-06-03 11:00:00', NULL, NULL, '2026-06-10 11:39:18'),
(4, 6, 4, 'PRINTING', 'Đang in lụa, dự kiến xong chiều nay', '2026-06-02 15:00:00', NULL, NULL, '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment`
--

DROP TABLE IF EXISTS `payment`;
CREATE TABLE IF NOT EXISTS `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `paymentMethod` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `transactionId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL,
  `gatewayResponse` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_transaction_id` (`transactionId`),
  KEY `idx_payment_order_id` (`orderId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payment`
--

INSERT INTO `payment` (`id`, `orderId`, `amount`, `paymentMethod`, `paymentType`, `status`, `transactionId`, `paidAt`, `gatewayResponse`, `createdAt`) VALUES
(1, 1, 705000.00, 'VNPAY', 'FULL', 'COMPLETED', 'VNP20260603001', '2026-06-03 08:30:00', NULL, '2026-06-10 11:39:18'),
(2, 2, 380000.00, 'COD', 'FULL', 'PENDING', NULL, NULL, NULL, '2026-06-10 11:39:18'),
(3, 3, 2400000.00, 'BANK_TRANSFER', 'FULL', 'COMPLETED', 'CK20260602001', '2026-06-02 14:00:00', NULL, '2026-06-10 11:39:18'),
(4, 4, 510000.00, 'VNPAY', 'FULL', 'COMPLETED', 'VNP20260531001', '2026-05-31 15:30:00', NULL, '2026-06-10 11:39:18'),
(5, 5, 450000.00, 'COD', 'FULL', 'PENDING', NULL, NULL, NULL, '2026-06-10 11:39:18'),
(6, 6, 510000.00, 'VNPAY', 'FULL', 'COMPLETED', 'VNP20260602001', '2026-06-02 14:35:00', NULL, '2026-06-10 11:39:18'),
(7, 7, 390000.00, 'COD', 'FULL', 'PENDING', NULL, NULL, NULL, '2026-06-10 11:39:18'),
(8, 8, 270000.00, 'COD', 'FULL', 'CANCELLED', NULL, NULL, NULL, '2026-06-10 11:39:18'),
(9, 9, 330000.00, 'COD', 'FULL', 'PENDING', NULL, NULL, NULL, '2026-06-10 11:39:18'),
(10, 10, 550000.00, 'VNPAY', 'FULL', 'COMPLETED', 'VNP20260530001', '2026-05-30 08:15:00', NULL, '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `printmethod`
--

DROP TABLE IF EXISTS `printmethod`;
CREATE TABLE IF NOT EXISTS `printmethod` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `extraCost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_print_method_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `printmethod`
--

INSERT INTO `printmethod` (`id`, `code`, `name`, `extraCost`, `isActive`, `createdAt`) VALUES
(1, 'DTG', 'In DTG (Direct-to-Garment)', 0.00, 1, '2026-06-10 11:39:18'),
(2, 'IN_LUOI', 'In lụa (Silk Screen)', 30000.00, 1, '2026-06-10 11:39:18'),
(3, 'THEU', 'Thêu vi tính', 50000.00, 1, '2026-06-10 11:39:18'),
(4, 'VINYL', 'In cắt decal nhiệt', 20000.00, 1, '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `printposition`
--

DROP TABLE IF EXISTS `printposition`;
CREATE TABLE IF NOT EXISTS `printposition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `extraCost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `maxWidth` decimal(10,2) DEFAULT NULL,
  `maxHeight` decimal(10,2) DEFAULT NULL,
  `printAreaX` decimal(10,2) DEFAULT NULL,
  `printAreaY` decimal(10,2) DEFAULT NULL,
  `printAreaWidth` decimal(10,2) DEFAULT NULL,
  `printAreaHeight` decimal(10,2) DEFAULT NULL,
  `isActive` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_print_position_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `printposition`
--

INSERT INTO `printposition` (`id`, `code`, `name`, `extraCost`, `maxWidth`, `maxHeight`, `printAreaX`, `printAreaY`, `printAreaWidth`, `printAreaHeight`, `isActive`) VALUES
(1, 'MAT_TRUOC', 'Mặt trước (Ngực giữa)', 0.00, 30.00, 40.00, NULL, NULL, NULL, NULL, 1),
(2, 'MAT_SAU', 'Mặt sau (Lưng giữa)', 20000.00, 35.00, 45.00, NULL, NULL, NULL, NULL, 1),
(3, 'TRAI', 'Ngực trái (Logo nhỏ)', 15000.00, 10.00, 10.00, NULL, NULL, NULL, NULL, 1),
(4, 'TAY_TRAI', 'Tay trái', 25000.00, 12.00, 20.00, NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product`
--

DROP TABLE IF EXISTS `product`;
CREATE TABLE IF NOT EXISTS `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int NOT NULL,
  `shirtType` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `basePrice` decimal(15,2) NOT NULL,
  `material` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `form` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'product shape/form',
  `madeIn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_category_id` (`categoryId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product`
--

INSERT INTO `product` (`id`, `categoryId`, `shirtType`, `name`, `basePrice`, `material`, `form`, `madeIn`, `description`, `status`, `createdAt`) VALUES
(1, 1, NULL, 'Áo Thun', 120000.00, '100% Cotton 180gsm', 'tshirt', 'Việt Nam', 'Áo thun cotton mềm mại, thấm hút tốt, phù hợp in ấn.', 'ACTIVE', '2026-06-10 11:39:18'),
(2, 1, NULL, 'Áo Thun', 150000.00, '100% Cotton 200gsm', 'tshirt', 'Việt Nam', 'Dáng rộng thoải mái, form oversize hiện đại.', 'ACTIVE', '2026-06-10 11:39:18'),
(3, 2, NULL, 'Áo Hoodie', 280000.00, 'Nỉ bông 320gsm', 'hoodie', 'Việt Nam', 'Áo hoodie dày dặn, ấm áp, có mũ và túi kangaroo.', 'ACTIVE', '2026-06-10 11:39:18'),
(4, 3, NULL, 'Áo Polo', 180000.00, 'Cotton pique 220gsm', 'polo', 'Việt Nam', 'Áo polo chuyên nghiệp, phù hợp đồng phục công ty.', 'ACTIVE', '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `productimage`
--

DROP TABLE IF EXISTS `productimage`;
CREATE TABLE IF NOT EXISTS `productimage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `variantId` int DEFAULT NULL,
  `imageUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `altText` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isPrimary` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_image_product_id` (`productId`),
  KEY `idx_product_image_variant_id` (`variantId`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `productimage`
--

INSERT INTO `productimage` (`id`, `productId`, `variantId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `createdAt`) VALUES
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
(17, 3, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-hoodie-den.jpg', 'Black-front', 0, 1, '2026-06-21 14:43:01'),
(18, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Front_b11fvx.png', 'White-front', 0, 1, '2026-06-21 14:43:01'),
(19, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Back_vr6uas.png', 'White-back', 0, 0, '2026-06-21 14:43:01'),
(20, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/Polo-Beige-Front_ulxjri.png', 'Beige-front', 0, 0, '2026-06-21 14:43:01'),
(21, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Beige-Back_d4sp14.png', 'Beige-back', 0, 0, '2026-06-21 14:43:01'),
(22, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Front_rc2pvr.png', 'Navy-front', 0, 0, '2026-06-21 14:43:01'),
(23, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Backt_uvfyjg.png', 'Navy-back', 0, 0, '2026-06-21 14:43:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `productvariant`
--

DROP TABLE IF EXISTS `productvariant`;
CREATE TABLE IF NOT EXISTS `productvariant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `color` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stockQty` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_variant_sku` (`sku`),
  UNIQUE KEY `uq_product_variant_product_color_size` (`productId`,`color`,`size`),
  KEY `idx_product_variant_product_id` (`productId`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `productvariant`
--

INSERT INTO `productvariant` (`id`, `productId`, `color`, `size`, `sku`, `stockQty`, `createdAt`) VALUES
(1, 1, 'Trắng', 'S', 'ATCT-TRANG-S', 150, '2026-06-10 11:39:18'),
(2, 1, 'Trắng', 'M', 'ATCT-TRANG-M', 200, '2026-06-10 11:39:18'),
(3, 1, 'Trắng', 'L', 'ATCT-TRANG-L', 180, '2026-06-10 11:39:18'),
(4, 1, 'Trắng', 'XL', 'ATCT-TRANG-XL', 120, '2026-06-10 11:39:18'),
(5, 1, 'Đen', 'S', 'ATCT-DEN-S', 130, '2026-06-10 11:39:18'),
(6, 1, 'Đen', 'M', 'ATCT-DEN-M', 190, '2026-06-10 11:39:18'),
(7, 1, 'Đen', 'L', 'ATCT-DEN-L', 160, '2026-06-10 11:39:18'),
(8, 1, 'Đen', 'XL', 'ATCT-DEN-XL', 100, '2026-06-10 11:39:18'),
(9, 2, 'Trắng', 'M', 'ATOS-TRANG-M', 80, '2026-06-10 11:39:18'),
(10, 2, 'Trắng', 'L', 'ATOS-TRANG-L', 90, '2026-06-10 11:39:18'),
(11, 2, 'Trắng', 'XL', 'ATOS-TRANG-XL', 70, '2026-06-10 11:39:18'),
(12, 2, 'Xám', 'M', 'ATOS-XAM-M', 75, '2026-06-10 11:39:18'),
(13, 2, 'Xám', 'L', 'ATOS-XAM-L', 85, '2026-06-10 11:39:18'),
(14, 3, 'Đen', 'M', 'AHN-DEN-M', 50, '2026-06-10 11:39:18'),
(15, 3, 'Đen', 'L', 'AHN-DEN-L', 60, '2026-06-10 11:39:18'),
(16, 3, 'Đen', 'XL', 'AHN-DEN-XL', 40, '2026-06-10 11:39:18'),
(17, 3, 'Xanh navy', 'M', 'AHN-NAVY-M', 45, '2026-06-10 11:39:18'),
(18, 3, 'Xanh navy', 'L', 'AHN-NAVY-L', 55, '2026-06-10 11:39:18'),
(19, 4, 'Trắng', 'S', 'APL-TRANG-S', 60, '2026-06-10 11:39:18'),
(20, 4, 'Trắng', 'M', 'APL-TRANG-M', 80, '2026-06-10 11:39:18'),
(21, 4, 'Trắng', 'L', 'APL-TRANG-L', 75, '2026-06-10 11:39:18'),
(22, 4, 'Xanh dương', 'M', 'APL-XDUONG-M', 70, '2026-06-10 11:39:18'),
(23, 4, 'Xanh dương', 'L', 'APL-XDUONG-L', 65, '2026-06-10 11:39:18'),
(24, 4, 'Xanh dương', 'XL', 'APL-XDUONG-XL', 50, '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotion`
--

DROP TABLE IF EXISTS `promotion`;
CREATE TABLE IF NOT EXISTS `promotion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discountType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discountValue` decimal(15,2) NOT NULL,
  `minOrderAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `usageLimit` int NOT NULL,
  `usedCount` int NOT NULL DEFAULT '0',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_promotion_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `promotion`
--

INSERT INTO `promotion` (`id`, `code`, `discountType`, `discountValue`, `minOrderAmount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `status`) VALUES
(1, 'TEEWELCOME', 'PERCENT', 10.00, 200000.00, '2026-01-01 00:00:00', '2026-12-31 00:00:00', 500, 123, 'ACTIVE'),
(2, 'SALE50K', 'FIXED', 50000.00, 300000.00, '2026-06-01 00:00:00', '2026-06-30 00:00:00', 200, 45, 'ACTIVE');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotionusage`
--

DROP TABLE IF EXISTS `promotionusage`;
CREATE TABLE IF NOT EXISTS `promotionusage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `promotionId` int NOT NULL,
  `userId` int NOT NULL,
  `orderId` int NOT NULL,
  `usedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_promotion_usage_promotion_user` (`promotionId`,`userId`),
  UNIQUE KEY `uq_promotion_usage_order_id` (`orderId`),
  KEY `idx_promotion_usage_promotion_id` (`promotionId`),
  KEY `idx_promotion_usage_user_id` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sticker`
--

DROP TABLE IF EXISTS `sticker`;
CREATE TABLE IF NOT EXISTS `sticker` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sticker_category` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sticker`
--

INSERT INTO `sticker` (`id`, `name`, `category`, `imageUrl`, `sortOrder`, `isActive`, `createdAt`) VALUES
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
(20, 'social distancing 7143871 v5aj2f', 'Mới nhất', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782033248/social-distancing_7143871_v5aj2f.png', 0, 1, '2026-06-21 16:42:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `supplier`
--

DROP TABLE IF EXISTS `supplier`;
CREATE TABLE IF NOT EXISTS `supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `useraddress`
--

DROP TABLE IF EXISTS `useraddress`;
CREATE TABLE IF NOT EXISTS `useraddress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `recipientName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `addressLine` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `isDefault` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_address_user_id` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `useraddress`
--

INSERT INTO `useraddress` (`id`, `userId`, `recipientName`, `phone`, `addressLine`, `city`, `district`, `ward`, `isDefault`, `createdAt`) VALUES
(1, 1, 'Nguyễn Minh Anh', '0901234567', '123 Đường Nguyễn Trãi', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', 1, '2026-06-10 11:39:18'),
(2, 2, 'Trần Văn Cường', '0987654321', '45 Lê Văn Việt', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Phường Hiệp Phú', 1, '2026-06-10 11:39:18'),
(3, 3, 'Lê Thị Hoa', '0912345678', '88 Trần Hưng Đạo', 'Hà Nội', 'Quận Hoàn Kiếm', 'Phường Phan Chu Trinh', 1, '2026-06-10 11:39:18'),
(4, 4, 'Phạm Quốc Bảo', '0934567890', '210 Điện Biên Phủ', 'Đà Nẵng', 'Quận Thanh Khê', 'Phường Thanh Khê Đông', 1, '2026-06-10 11:39:18'),
(5, 5, 'Nguyễn Thị Lan', '0978901234', '15 Võ Thị Sáu', 'TP. Hồ Chí Minh', 'Quận 3', 'Phường 6', 1, '2026-06-10 11:39:18'),
(6, 6, 'Hoàng Văn Đức', '0965432109', '67 Lý Tự Trọng', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 1, '2026-06-10 11:39:18'),
(7, 7, 'Võ Thị Thu', '0943210987', '32 Nguyễn Huệ', 'Cần Thơ', 'Quận Ninh Kiều', 'Phường An Hội', 1, '2026-06-10 11:39:18'),
(8, 8, 'Đinh Văn Nam', '0921098765', '99 Hùng Vương', 'Hải Phòng', 'Quận Hồng Bàng', 'Phường Quán Toan', 1, '2026-06-10 11:39:18'),
(9, 10, 'Khách Test Tồn Kho', '0900000999', '100 Đường Test Tồn Kho', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 1, '2026-06-10 11:39:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `usertoken`
--

DROP TABLE IF EXISTS `usertoken`;
CREATE TABLE IF NOT EXISTS `usertoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `refreshToken` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SHA-256 hash of refresh token',
  `expiresAt` datetime NOT NULL,
  `userAgent` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ipAddress` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_token_refresh_token` (`refreshToken`),
  KEY `idx_user_token_user_id` (`userId`),
  KEY `idx_user_token_expires_at` (`expiresAt`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `usertoken`
--

INSERT INTO `usertoken` (`id`, `userId`, `refreshToken`, `expiresAt`, `userAgent`, `ipAddress`, `createdAt`) VALUES
(32, 16, 'faf5aba01bb75ae8e8701451ceb18899ab3ef0a7b6701978f87de2476abaabf6', '2026-06-30 16:16:31', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '2026-06-23 16:16:31');

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `bulkpricing`
--
ALTER TABLE `bulkpricing`
  ADD CONSTRAINT `fk_bulk_pricing_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `cartitem`
--
ALTER TABLE `cartitem`
  ADD CONSTRAINT `fk_cart_item_cart` FOREIGN KEY (`cartId`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_item_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cart_item_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `customdesign`
--
ALTER TABLE `customdesign`
  ADD CONSTRAINT `fk_custom_design_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_custom_design_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_custom_design_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `customerorder`
--
ALTER TABLE `customerorder`
  ADD CONSTRAINT `fk_customer_order_address` FOREIGN KEY (`addressId`) REFERENCES `useraddress` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_customer_order_promotion` FOREIGN KEY (`promotionId`) REFERENCES `promotion` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_customer_order_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `designprintmethod`
--
ALTER TABLE `designprintmethod`
  ADD CONSTRAINT `fk_design_print_method_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_design_print_method_method` FOREIGN KEY (`printMethodId`) REFERENCES `printmethod` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `designprintposition`
--
ALTER TABLE `designprintposition`
  ADD CONSTRAINT `fk_design_print_position_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_design_print_position_position` FOREIGN KEY (`printPositionId`) REFERENCES `printposition` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `inventorytransaction`
--
ALTER TABLE `inventorytransaction`
  ADD CONSTRAINT `fk_inventory_transaction_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_inventory_transaction_supplier` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_inventory_transaction_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `orderhistory`
--
ALTER TABLE `orderhistory`
  ADD CONSTRAINT `fk_order_history_actor` FOREIGN KEY (`actorId`) REFERENCES `account` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_order_history_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `fk_order_item_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_order_item_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_item_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `orderproduction`
--
ALTER TABLE `orderproduction`
  ADD CONSTRAINT `fk_order_production_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_order_production_order_item` FOREIGN KEY (`orderItemId`) REFERENCES `orderitem` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `productimage`
--
ALTER TABLE `productimage`
  ADD CONSTRAINT `fk_product_image_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_image_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `productvariant`
--
ALTER TABLE `productvariant`
  ADD CONSTRAINT `fk_product_variant_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `promotionusage`
--
ALTER TABLE `promotionusage`
  ADD CONSTRAINT `fk_promotion_usage_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_promotion_usage_promotion` FOREIGN KEY (`promotionId`) REFERENCES `promotion` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_promotion_usage_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `useraddress`
--
ALTER TABLE `useraddress`
  ADD CONSTRAINT `fk_user_address_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `usertoken`
--
ALTER TABLE `usertoken`
  ADD CONSTRAINT `fk_user_token_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
