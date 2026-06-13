-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 11, 2026 at 04:13 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `a_lvtn_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
CREATE TABLE IF NOT EXISTS `account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_account_email` (`email`),
  KEY `idx_account_role_status` (`role`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account`
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
(14, 'thanhhieu21820@gmail.com', '$2b$12$DSj/.hYjD1pvRGucdIHzReELpjGJOyIT0FAsUBhoL8OXVD/20kuKm', 'Hiếu', '0900000999', 'PRODUCTION', 'ACTIVE', '2026-06-10 12:46:37', '2026-06-10 12:46:37');

-- --------------------------------------------------------

--
-- Table structure for table `bulkpricing`
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
-- Table structure for table `cart`
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
-- Table structure for table `cartitem`
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
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `createdAt`) VALUES
(1, 'Áo thun', '2026-06-10 11:39:18'),
(2, 'Áo hoodie', '2026-06-10 11:39:18'),
(3, 'Áo polo', '2026-06-10 11:39:18'),
(4, 'Áo Thun Trơn Test Tồn Kho', '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `customdesign`
--

DROP TABLE IF EXISTS `customdesign`;
CREATE TABLE IF NOT EXISTS `customdesign` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `variantId` int DEFAULT NULL,
  `baseColor` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `canvasData` json NOT NULL,
  `previewUrl` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designFee` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `adminNote` text COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú của admin khi yêu cầu khách chỉnh sửa thiết kế',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_custom_design_user_id` (`userId`),
  KEY `idx_custom_design_product_id` (`productId`),
  KEY `idx_custom_design_variant_id` (`variantId`),
  KEY `idx_custom_design_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customdesign`
--

INSERT INTO `customdesign` (`id`, `userId`, `productId`, `variantId`, `baseColor`, `canvasData`, `previewUrl`, `designFee`, `status`, `adminNote`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, 10, '#FFFFFF', '{\"layers\": [{\"x\": 150, \"y\": 100, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-cty-abc.png\", \"type\": \"image\", \"width\": 120, \"height\": 80, \"rotation\": 0}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-1.jpg', 150000.00, 'SUBMITTED', NULL, '2026-06-10 11:39:18', '2026-06-10 11:39:18'),
(2, 3, 4, 20, '#FFFFFF', '{\"layers\": [{\"x\": 100, \"y\": 80, \"type\": \"text\", \"color\": \"#003399\", \"content\": \"ĐỒNG PHỤC CÔNG TY XYZ\", \"fontSize\": 24, \"fontFamily\": \"Arial\"}, {\"x\": 170, \"y\": 120, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-xyz.png\", \"type\": \"image\", \"width\": 60, \"height\": 60}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-3.jpg', 200000.00, 'SUBMITTED', NULL, '2026-06-10 11:39:18', '2026-06-10 11:39:18'),
(3, 5, 1, 2, '#FFFFFF', '{\"layers\": [{\"x\": 90, \"y\": 90, \"type\": \"text\", \"color\": \"#FF6600\", \"content\": \"TEAM BUILDING 2026\", \"fontSize\": 28}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-5.jpg', 100000.00, 'SUBMITTED', NULL, '2026-06-10 11:39:18', '2026-06-10 11:39:18'),
(4, 6, 2, 12, '#808080', '{\"layers\": [{\"x\": 140, \"y\": 110, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-startup.png\", \"type\": \"image\", \"width\": 100, \"height\": 70}], \"background\": \"#808080\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-6.jpg', 120000.00, 'DRAFT', NULL, '2026-06-10 11:39:18', '2026-06-10 11:39:18'),
(5, 10, 5, 25, '#FFFFFF', '{\"seed\": \"inventory-cancel-flow\", \"objects\": [], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/seed-inventory-approved-design.jpg', 50000.00, 'APPROVED', 'Thiết kế mẫu đã duyệt để test tồn kho khi hủy đơn áo tùy chỉnh.', '2026-06-10 11:39:19', '2026-06-10 11:39:19');

-- --------------------------------------------------------

--
-- Table structure for table `customerorder`
--

DROP TABLE IF EXISTS `customerorder`;
CREATE TABLE IF NOT EXISTS `customerorder` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderCode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `promotionId` int DEFAULT NULL,
  `addressId` int NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `discountAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `shippingFee` decimal(15,2) NOT NULL DEFAULT '0.00',
  `shippingCarrier` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shippingMethod` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trackingCode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shippedAt` datetime DEFAULT NULL,
  `deliveredAt` datetime DEFAULT NULL,
  `cancelReason` text COLLATE utf8mb4_unicode_ci,
  `totalAmount` decimal(15,2) NOT NULL,
  `depositAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `codAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customer_order_code` (`orderCode`),
  KEY `idx_customer_order_user_id` (`userId`),
  KEY `idx_customer_order_promotion_id` (`promotionId`),
  KEY `idx_customer_order_address_id` (`addressId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customerorder`
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
-- Table structure for table `designprintmethod`
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
-- Dumping data for table `designprintmethod`
--

INSERT INTO `designprintmethod` (`id`, `designId`, `printMethodId`, `extraCost`) VALUES
(1, 1, 1, 0.00),
(2, 2, 2, 30000.00),
(3, 3, 1, 0.00),
(4, 4, 1, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `designprintposition`
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
-- Dumping data for table `designprintposition`
--

INSERT INTO `designprintposition` (`id`, `designId`, `printPositionId`, `extraCost`) VALUES
(1, 1, 1, 0.00),
(2, 2, 1, 0.00),
(3, 2, 3, 15000.00),
(4, 3, 1, 0.00),
(5, 4, 2, 20000.00);

-- --------------------------------------------------------

--
-- Table structure for table `inventorytransaction`
--

DROP TABLE IF EXISTS `inventorytransaction`;
CREATE TABLE IF NOT EXISTS `inventorytransaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `variantId` int NOT NULL,
  `orderId` int DEFAULT NULL,
  `supplierId` int DEFAULT NULL,
  `quantityChanged` int NOT NULL,
  `transactionType` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inventory_transaction_variant_id` (`variantId`),
  KEY `idx_inventory_transaction_order_id` (`orderId`),
  KEY `idx_inventory_transaction_supplier_id` (`supplierId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventorytransaction`
--

INSERT INTO `inventorytransaction` (`id`, `variantId`, `orderId`, `supplierId`, `quantityChanged`, `transactionType`, `reason`, `createdAt`) VALUES
(1, 25, NULL, NULL, 20, 'IMPORT', 'Seed tồn kho ban đầu cho SKU TST-TONKHO-TRANG-M', '2026-06-10 11:39:19');

-- --------------------------------------------------------

--
-- Table structure for table `orderhistory`
--

DROP TABLE IF EXISTS `orderhistory`;
CREATE TABLE IF NOT EXISTS `orderhistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `fromStatus` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `toStatus` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actorId` int DEFAULT NULL,
  `actorRole` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SYSTEM',
  `actorName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hệ thống',
  `note` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_history_order_id_created_at` (`orderId`,`createdAt`),
  KEY `idx_order_history_actor_id` (`actorId`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderhistory`
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
-- Table structure for table `orderitem`
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
  `productionStatus` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WAITING_DESIGN_APPROVAL',
  PRIMARY KEY (`id`),
  KEY `idx_order_item_order_id` (`orderId`),
  KEY `idx_order_item_variant_id` (`variantId`),
  KEY `idx_order_item_design_id` (`designId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderitem`
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
-- Table structure for table `orderproduction`
--

DROP TABLE IF EXISTS `orderproduction`;
CREATE TABLE IF NOT EXISTS `orderproduction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderItemId` int NOT NULL,
  `designId` int DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WAITING_DESIGN_APPROVAL',
  `note` text COLLATE utf8mb4_unicode_ci,
  `approvedAt` datetime DEFAULT NULL,
  `printedAt` datetime DEFAULT NULL,
  `packedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order_production_order_item_id` (`orderItemId`),
  KEY `idx_order_production_design_id` (`designId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderproduction`
--

INSERT INTO `orderproduction` (`id`, `orderItemId`, `designId`, `status`, `note`, `approvedAt`, `printedAt`, `packedAt`, `createdAt`) VALUES
(1, 1, 1, 'PROCESSING', 'Đã nhận file in, đang chuẩn bị máy in DTG', '2026-06-03 10:30:00', NULL, NULL, '2026-06-10 11:39:18'),
(2, 3, 2, 'PACKED', 'Đồng phục công ty XYZ – 8 áo, đã kiểm tra chất lượng', '2026-06-02 09:00:00', '2026-06-02 14:00:00', '2026-06-03 08:30:00', '2026-06-10 11:39:18'),
(3, 5, 3, 'CONFIRMED', 'Đã duyệt thiết kế, chờ xếp lịch in', '2026-06-03 11:00:00', NULL, NULL, '2026-06-10 11:39:18'),
(4, 6, 4, 'PRINTING', 'Đang in lụa, dự kiến xong chiều nay', '2026-06-02 15:00:00', NULL, NULL, '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
CREATE TABLE IF NOT EXISTS `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `paymentMethod` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `transactionId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL,
  `gatewayResponse` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_transaction_id` (`transactionId`),
  KEY `idx_payment_order_id` (`orderId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment`
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
-- Table structure for table `printmethod`
--

DROP TABLE IF EXISTS `printmethod`;
CREATE TABLE IF NOT EXISTS `printmethod` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `extraCost` decimal(15,2) NOT NULL DEFAULT '0.00',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_print_method_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `printmethod`
--

INSERT INTO `printmethod` (`id`, `code`, `name`, `extraCost`, `isActive`, `createdAt`) VALUES
(1, 'DTG', 'In DTG (Direct-to-Garment)', 0.00, 1, '2026-06-10 11:39:18'),
(2, 'IN_LUOI', 'In lụa (Silk Screen)', 30000.00, 1, '2026-06-10 11:39:18'),
(3, 'THEU', 'Thêu vi tính', 50000.00, 1, '2026-06-10 11:39:18'),
(4, 'VINYL', 'In cắt decal nhiệt', 20000.00, 1, '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `printposition`
--

DROP TABLE IF EXISTS `printposition`;
CREATE TABLE IF NOT EXISTS `printposition` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
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
-- Dumping data for table `printposition`
--

INSERT INTO `printposition` (`id`, `code`, `name`, `extraCost`, `maxWidth`, `maxHeight`, `printAreaX`, `printAreaY`, `printAreaWidth`, `printAreaHeight`, `isActive`) VALUES
(1, 'MAT_TRUOC', 'Mặt trước (Ngực giữa)', 0.00, 30.00, 40.00, NULL, NULL, NULL, NULL, 1),
(2, 'MAT_SAU', 'Mặt sau (Lưng giữa)', 20000.00, 35.00, 45.00, NULL, NULL, NULL, NULL, 1),
(3, 'TRAI', 'Ngực trái (Logo nhỏ)', 15000.00, 10.00, 10.00, NULL, NULL, NULL, NULL, 1),
(4, 'TAY_TRAI', 'Tay trái', 25000.00, 12.00, 20.00, NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
CREATE TABLE IF NOT EXISTS `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int NOT NULL,
  `name` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `basePrice` decimal(15,2) NOT NULL,
  `material` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `form` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'product shape/form',
  `madeIn` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_slug` (`slug`),
  KEY `idx_product_category_id` (`categoryId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `categoryId`, `name`, `slug`, `basePrice`, `material`, `form`, `madeIn`, `description`, `status`, `createdAt`) VALUES
(1, 1, 'Áo thun cotton cổ tròn', 'ao-thun-cotton-co-tron', 120000.00, '100% Cotton 180gsm', 'Cổ tròn', 'Việt Nam', 'Áo thun cotton mềm mại, thấm hút tốt, phù hợp in ấn.', 'ACTIVE', '2026-06-10 11:39:18'),
(2, 1, 'Áo thun oversize unisex', 'ao-thun-oversize-unisex', 150000.00, '100% Cotton 200gsm', 'Oversize', 'Việt Nam', 'Dáng rộng thoải mái, form oversize hiện đại.', 'ACTIVE', '2026-06-10 11:39:18'),
(3, 2, 'Áo hoodie nỉ bông cao cấp', 'ao-hoodie-ni-bong-cao-cap', 280000.00, 'Nỉ bông 320gsm', 'Hoodie', 'Việt Nam', 'Áo hoodie dày dặn, ấm áp, có mũ và túi kangaroo.', 'ACTIVE', '2026-06-10 11:39:18'),
(4, 3, 'Áo polo pique thêu logo', 'ao-polo-pique-theu-logo', 180000.00, 'Cotton pique 220gsm', 'Polo cổ bẻ', 'Việt Nam', 'Áo polo chuyên nghiệp, phù hợp đồng phục công ty.', 'ACTIVE', '2026-06-10 11:39:18'),
(5, 4, 'Áo thun trơn test', 'ao-thun-tron-test-ton-kho', 99000.00, '100% Cotton test', 'Regular fit', 'Việt Nam', 'Phôi áo dùng riêng để test luồng trừ/cộng tồn kho khi tạo và hủy đơn hàng.', 'ACTIVE', '2026-06-10 11:39:19'),
(9, 4, 'bb', 'aaaaaaaaaa-1781105055315', 1.00, 'aaaaaaaaaaaa', 'aaaaaaaaaaaaa', 'Việt Nam', 'aaaaaaaaaaaa', 'ACTIVE', '2026-06-10 22:24:15');

-- --------------------------------------------------------

--
-- Table structure for table `productimage`
--

DROP TABLE IF EXISTS `productimage`;
CREATE TABLE IF NOT EXISTS `productimage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `variantId` int DEFAULT NULL,
  `imageUrl` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `altText` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isPrimary` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_image_product_id` (`productId`),
  KEY `idx_product_image_variant_id` (`variantId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productimage`
--

INSERT INTO `productimage` (`id`, `productId`, `variantId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `createdAt`) VALUES
(1, 1, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-thun-trang.jpg', 'Áo thun cotton cổ tròn màu trắng', 0, 1, '2026-06-10 11:39:18'),
(2, 2, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-oversize-trang.jpg', 'Áo thun oversize màu trắng', 0, 1, '2026-06-10 11:39:18'),
(3, 3, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-hoodie-den.jpg', 'Áo hoodie nỉ bông màu đen', 0, 1, '2026-06-10 11:39:18'),
(4, 4, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-polo-trang.jpg', 'Áo polo pique màu trắng', 0, 1, '2026-06-10 11:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `productvariant`
--

DROP TABLE IF EXISTS `productvariant`;
CREATE TABLE IF NOT EXISTS `productvariant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `color` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stockQty` int NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_variant_sku` (`sku`),
  UNIQUE KEY `uq_product_variant_product_color_size` (`productId`,`color`,`size`),
  KEY `idx_product_variant_product_id` (`productId`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productvariant`
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
(24, 4, 'Xanh dương', 'XL', 'APL-XDUONG-XL', 50, '2026-06-10 11:39:18'),
(25, 5, 'Trắng', 'M', 'TST-TONKHO-TRANG-M', 20, '2026-06-10 11:39:19'),
(28, 5, 'đen', 'M', 'AOTHUN-DEN-M', 10, '2026-06-10 20:27:14'),
(29, 5, 'trắng', 'L', 'AOTHUN-TRA-L', 10, '2026-06-10 20:27:15'),
(30, 9, 'Đen', 'XS', 'AAAAAA-DEN-XS', 10, '2026-06-10 22:24:15'),
(31, 9, 'Xanh dương', 'L', 'AAAAAA-XAN-L', 40, '2026-06-10 22:24:15'),
(32, 9, 'Trắng', 'M', 'AAAAAA-TRA-M', 30, '2026-06-10 22:24:15'),
(33, 9, 'Hồng', 'L', 'AAAAAA-HON-L', 20, '2026-06-10 22:24:15');

-- --------------------------------------------------------

--
-- Table structure for table `promotion`
--

DROP TABLE IF EXISTS `promotion`;
CREATE TABLE IF NOT EXISTS `promotion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discountType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discountValue` decimal(15,2) NOT NULL,
  `minOrderAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `usageLimit` int NOT NULL,
  `usedCount` int NOT NULL DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_promotion_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotion`
--

INSERT INTO `promotion` (`id`, `code`, `discountType`, `discountValue`, `minOrderAmount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `status`) VALUES
(1, 'TEEWELCOME', 'PERCENT', 10.00, 200000.00, '2026-01-01 00:00:00', '2026-12-31 00:00:00', 500, 123, 'ACTIVE'),
(2, 'SALE50K', 'FIXED', 50000.00, 300000.00, '2026-06-01 00:00:00', '2026-06-30 00:00:00', 200, 45, 'ACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `promotionusage`
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
-- Table structure for table `sticker`
--

DROP TABLE IF EXISTS `sticker`;
CREATE TABLE IF NOT EXISTS `sticker` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sticker_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
CREATE TABLE IF NOT EXISTS `supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `useraddress`
--

DROP TABLE IF EXISTS `useraddress`;
CREATE TABLE IF NOT EXISTS `useraddress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `recipientName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `addressLine` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isDefault` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_address_user_id` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `useraddress`
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
-- Table structure for table `usertoken`
--

DROP TABLE IF EXISTS `usertoken`;
CREATE TABLE IF NOT EXISTS `usertoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `refreshToken` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SHA-256 hash of refresh token',
  `expiresAt` datetime NOT NULL,
  `userAgent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ipAddress` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_token_refresh_token` (`refreshToken`),
  KEY `idx_user_token_user_id` (`userId`),
  KEY `idx_user_token_expires_at` (`expiresAt`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usertoken`
--

INSERT INTO `usertoken` (`id`, `userId`, `refreshToken`, `expiresAt`, `userAgent`, `ipAddress`, `createdAt`) VALUES
(23, 11, '658ca88b8a21ad5083ac3f3685b4322cdee1ef06d96b0e99ed68cc4001787334', '2026-06-17 21:35:08', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '2026-06-10 21:35:08'),
(28, 11, '9423b111abe2044226cd11d4cd4780e6048ddbb4f4804537cc57b8baa071c6c9', '2026-06-18 10:52:16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '2026-06-11 10:52:16');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bulkpricing`
--
ALTER TABLE `bulkpricing`
  ADD CONSTRAINT `fk_bulk_pricing_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cartitem`
--
ALTER TABLE `cartitem`
  ADD CONSTRAINT `fk_cart_item_cart` FOREIGN KEY (`cartId`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_item_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cart_item_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `customdesign`
--
ALTER TABLE `customdesign`
  ADD CONSTRAINT `fk_custom_design_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_custom_design_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_custom_design_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `customerorder`
--
ALTER TABLE `customerorder`
  ADD CONSTRAINT `fk_customer_order_address` FOREIGN KEY (`addressId`) REFERENCES `useraddress` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_customer_order_promotion` FOREIGN KEY (`promotionId`) REFERENCES `promotion` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_customer_order_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `designprintmethod`
--
ALTER TABLE `designprintmethod`
  ADD CONSTRAINT `fk_design_print_method_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_design_print_method_method` FOREIGN KEY (`printMethodId`) REFERENCES `printmethod` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `designprintposition`
--
ALTER TABLE `designprintposition`
  ADD CONSTRAINT `fk_design_print_position_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_design_print_position_position` FOREIGN KEY (`printPositionId`) REFERENCES `printposition` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `inventorytransaction`
--
ALTER TABLE `inventorytransaction`
  ADD CONSTRAINT `fk_inventory_transaction_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_inventory_transaction_supplier` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_inventory_transaction_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `orderhistory`
--
ALTER TABLE `orderhistory`
  ADD CONSTRAINT `fk_order_history_actor` FOREIGN KEY (`actorId`) REFERENCES `account` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_order_history_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `fk_order_item_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_order_item_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_item_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `orderproduction`
--
ALTER TABLE `orderproduction`
  ADD CONSTRAINT `fk_order_production_design` FOREIGN KEY (`designId`) REFERENCES `customdesign` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_order_production_order_item` FOREIGN KEY (`orderItemId`) REFERENCES `orderitem` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `productimage`
--
ALTER TABLE `productimage`
  ADD CONSTRAINT `fk_product_image_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_product_image_variant` FOREIGN KEY (`variantId`) REFERENCES `productvariant` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `productvariant`
--
ALTER TABLE `productvariant`
  ADD CONSTRAINT `fk_product_variant_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotionusage`
--
ALTER TABLE `promotionusage`
  ADD CONSTRAINT `fk_promotion_usage_order` FOREIGN KEY (`orderId`) REFERENCES `customerorder` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_promotion_usage_promotion` FOREIGN KEY (`promotionId`) REFERENCES `promotion` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_promotion_usage_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `useraddress`
--
ALTER TABLE `useraddress`
  ADD CONSTRAINT `fk_user_address_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `usertoken`
--
ALTER TABLE `usertoken`
  ADD CONSTRAINT `fk_user_token_user` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
