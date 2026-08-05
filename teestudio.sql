-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 05, 2026 at 12:09 PM
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
-- Database: `teestudio`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
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
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `emailVerifiedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_account_email` (`email`),
  KEY `idx_account_role_status` (`role`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`id`, `email`, `passwordHash`, `fullName`, `phone`, `role`, `status`, `emailVerified`, `emailVerifiedAt`, `createdAt`, `updatedAt`) VALUES
(1, 'minhanh.nguyen@gmail.com', '$2b$10$hash1', 'Nguyễn Minh Anh', '0901234567', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:00:00', '2026-01-02 08:00:00', '2026-08-05 11:01:40'),
(2, 'cuong.tran@gmail.com', '$2b$10$hash2', 'Trần Văn Cường', '0987654321', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:01:00', '2026-01-02 08:01:00', '2026-08-05 11:01:40'),
(3, 'hoa.le@gmail.com', '$2b$10$hash3', 'Lê Thị Hoa', '0912345678', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:02:00', '2026-01-02 08:02:00', '2026-08-05 11:01:40'),
(4, 'bao.pham@gmail.com', '$2b$10$hash4', 'Phạm Quốc Bảo', '0934567890', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:03:00', '2026-01-02 08:03:00', '2026-08-05 11:01:40'),
(5, 'lan.nguyen@gmail.com', '$2b$10$hash5', 'Nguyễn Thị Lan', '0978901234', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:04:00', '2026-01-02 08:04:00', '2026-08-05 11:01:40'),
(6, 'duc.hoang@gmail.com', '$2b$10$hash6', 'Hoàng Văn Đức', '0965432109', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:05:00', '2026-01-02 08:05:00', '2026-08-05 11:01:40'),
(7, 'thu.vo@gmail.com', '$2b$10$hash7', 'Võ Thị Thu', '0943210987', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:06:00', '2026-01-02 08:06:00', '2026-08-05 11:01:40'),
(8, 'nam.dinh@gmail.com', '$2b$10$hash8', 'Đinh Văn Nam', '0921098765', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:07:00', '2026-01-02 08:07:00', '2026-08-05 11:01:40'),
(9, 'admin@teestudio.vn', '$2b$10$hash9', 'Quản Trị Viên', '0909090909', 'ADMIN', 'ACTIVE', 1, '2026-01-02 08:08:00', '2026-01-02 08:08:00', '2026-08-05 11:01:40'),
(10, 'khachhang.kho@teestudio.vn', '$2b$10$seedInventoryCustomerHash', 'Khách Hàng Kho', '0900000999', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:09:00', '2026-01-02 08:09:00', '2026-08-05 11:01:40'),
(11, 'thanhhieu2182004@gmail.com', '$2b$12$dej0jQlYcNB4himKZXnTyO1mAifhTx04Y3kUyy8ot/h5/geo/zOIO', 'Nguyen Thanh Hieu', '0123456789', 'ADMIN', 'ACTIVE', 1, '2026-06-10 11:42:19', '2026-06-10 11:42:19', '2026-08-05 11:01:40'),
(12, 'thanhhieu282004@gmail.com', '$2b$12$IOC5ktoj07Rk/LELF9OsmOtzDltRyhbI2VEexhx.uzB/bHh.Ql6zu', 'Nguyen Thanh Hieu', '0123456789', 'WAREHOUSE', 'ACTIVE', 1, '2026-06-10 11:46:32', '2026-06-10 11:46:32', '2026-08-05 11:01:40'),
(13, 'thanhhieu218200@gmail.com', '$2b$12$19oIzOFr0AKZTm8sV8JRXOOU4z2fJLx8ETY6BHS900zSmSYBCLB2W', 'Nguyễn Thanh Hiếu', '0123456789', 'CUSTOMER', 'ACTIVE', 1, '2026-06-10 12:38:47', '2026-06-10 12:38:47', '2026-08-05 11:01:40'),
(14, 'thanhhieu21820@gmail.com', '$2b$12$DSj/.hYjD1pvRGucdIHzReELpjGJOyIT0FAsUBhoL8OXVD/20kuKm', 'Hiếu', '0900000999', 'PRODUCTION', 'ACTIVE', 1, '2026-06-10 12:46:37', '2026-06-10 12:46:37', '2026-08-05 11:01:40'),
(15, 'dangcuh2105@gmail.com', '$2b$12$3vzWRYqdZF0WZg/kj2uSv.e7Ot3pwHgbNl06yC5yglXqhWccYB8AW', 'Nguyễn Đăng', '02312312323', 'ADMIN', 'ACTIVE', 1, '2026-06-21 15:54:52', '2026-06-21 15:54:52', '2026-08-05 11:01:40'),
(16, 'phan.c@gmail.com', '$2b$12$M32aaDqfG3RXEMxe2VCdEupS7.oI7ZW6lpySPRLPBv5/4SEJ3Tr.W', 'Phan Văn C', '0123456789', 'PRODUCTION', 'ACTIVE', 1, '2026-06-21 16:48:08', '2026-06-21 16:48:08', '2026-08-05 11:01:40'),
(18, 'admin2@teestudio.vn', '$2b$10$JXB.1D1fQPZJL3EG771ReuQYXggSl/wJS9DiVNbNcgge.8EYOWjuS', 'Admin Chính', '0987654321', 'ADMIN', 'ACTIVE', 1, '2026-06-23 17:02:26', '2026-06-23 17:02:26', '2026-08-05 11:01:40'),
(20, 'dangcuh@gmail.com', '$2b$12$Qx7uifK49tM6ocW1W1Tkmu44iWx6VVn0sxZqDWD4mT8iK0zdmUwX6', 'Nguyễn Đăng', '0123456789', 'CUSTOMER', 'ACTIVE', 1, '2026-07-11 06:10:56', '2026-07-11 06:10:56', '2026-08-05 11:01:40'),
(21, 'nam.nguyen@teestudio.vn', '$2b$12$CjYsQDlFUk.B8.s9mAJPaeL7XpJyBn9p9z71MKo2VfKZ4W87wsSTm', 'Nguyễn Văn Nam', '0912345678', 'CUSTOMER', 'ACTIVE', 1, '2026-07-17 17:04:05', '2026-07-17 17:04:05', '2026-08-05 11:01:40'),
(24, 'thanhhieu@gmail.com', '$2b$12$E1c130jnSAwbPoqsIqGwL.jLzZ5aUwmbxhft5ZgOVHi29VHglYZm6', 'Nguyễn Thanh Hiếu', '0377243647', 'ADMIN', 'ACTIVE', 1, '2026-07-19 14:40:30', '2026-07-19 14:40:30', '2026-08-05 11:01:40'),
(25, 'anh.le@gmail.com', '$2b$12$zPKBqIBsBJtMriV1OZuhjeYn.u3xF2RMDKVXOP0E6P8oblTU3dhAO', 'Lê Văn Ảnh', '0123456789', 'CUSTOMER', 'ACTIVE', 1, '2026-07-19 20:11:10', '2026-07-19 20:11:10', '2026-08-05 11:01:40'),
(26, 'thanh.hieu3@gmail.com', '$2b$12$yCMdlAObztypgZfs4kPdLuWsNfsXhVP6ZtsHzWD2GxHIrq4zPtVl.', 'Trần Thanh Hiếu', '0377243647', 'PRODUCTION', 'ACTIVE', 1, '2026-07-31 19:51:18', '2026-07-31 19:51:18', '2026-08-05 11:01:40'),
(27, 'thanh.hieu4@gmail.com', '$2b$12$JzKb0HM55UGi7EbeQigxn.6aZLLzMK6OrT4We0EJRIQ2RQrfS732y', 'Lê Thanh Hiếu', '0377243647', 'CUSTOMER', 'ACTIVE', 1, '2026-07-31 21:45:20', '2026-07-31 21:45:20', '2026-08-05 11:01:40'),
(28, 'pham.hieu@gmail.com', '$2b$12$7ifqotSFaFR1y.9aHF4P/u6f3eLT2mycxlv2UoJCFC2yTuFEmTRpa', 'Phạm Thanh Hiếu', '0377243647', 'CUSTOMER', 'ACTIVE', 1, '2026-07-31 21:53:07', '2026-07-31 21:53:07', '2026-08-05 11:01:40');

-- --------------------------------------------------------

--
-- Table structure for table `accountactiontoken`
--

DROP TABLE IF EXISTS `accountactiontoken`;
CREATE TABLE IF NOT EXISTS `accountactiontoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `tokenHash` varchar(64) NOT NULL COMMENT 'SHA-256 hash of raw token',
  `purpose` varchar(30) NOT NULL COMMENT 'EMAIL_VERIFICATION | PASSWORD_RESET',
  `expiresAt` datetime NOT NULL,
  `consumedAt` datetime DEFAULT NULL,
  `requestIp` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_account_action_token_hash` (`tokenHash`),
  KEY `idx_account_action_token_lookup` (`accountId`,`purpose`),
  KEY `idx_account_action_token_expires` (`expiresAt`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bulkpricing`
--

INSERT INTO `bulkpricing` (`id`, `productId`, `minQty`, `discountPercent`) VALUES
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
(12, 4, 100, 13.00),
(13, 1, 150, 25.00);

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 16, '2026-07-04 16:30:23', '2026-07-04 16:35:00'),
(2, 20, '2026-07-11 06:10:56', '2026-07-11 06:10:56'),
(3, 1, '2026-07-15 20:31:28', '2026-07-15 20:31:28'),
(4, 21, '2026-07-17 23:39:53', '2026-07-17 23:39:53'),
(5, 25, '2026-07-19 20:11:10', '2026-07-19 20:11:10'),
(6, 27, '2026-07-31 21:48:20', '2026-07-31 21:48:20'),
(7, 28, '2026-07-31 22:00:33', '2026-07-31 22:00:33');

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cartitem`
--

INSERT INTO `cartitem` (`id`, `cartId`, `variantId`, `designId`, `quantity`) VALUES
(1, 1, 1, NULL, 2),
(2, 1, 3, 1, 1),
(3, 2, 2, NULL, 5),
(4, 3, 5, 2, 1),
(5, 4, 7, NULL, 3),
(6, 5, 10, NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `createdAt`) VALUES
(1, 'Áo thun', '2026-01-05 08:00:00'),
(2, 'Áo hoodie', '2026-01-05 08:01:00'),
(3, 'Áo polo', '2026-01-05 08:02:00'),
(4, 'Áo khoác', '2026-01-05 08:03:00'),
(5, 'Phụ kiện', '2026-01-05 08:04:00');

-- --------------------------------------------------------

--
-- Table structure for table `customdesign`
--

DROP TABLE IF EXISTS `customdesign`;
CREATE TABLE IF NOT EXISTS `customdesign` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `productId` int NOT NULL,
  `variantId` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Áo nhóm kỷ niệm' COMMENT '[FROM MEMBER] Tên thiết kế do khách đặt',
  `baseColor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `canvasData` json NOT NULL,
  `previewUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `printFileUrlFront` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `printFileUrlBack` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customdesign`
--

INSERT INTO `customdesign` (`id`, `userId`, `productId`, `variantId`, `name`, `baseColor`, `canvasData`, `previewUrl`, `printFileUrlFront`, `printFileUrlBack`, `designFee`, `status`, `adminNote`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, 10, 'Áo nhóm kỷ niệm', '#FFFFFF', '{\"layers\": [{\"x\": 150, \"y\": 100, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-cty-abc.png\", \"type\": \"image\", \"width\": 120, \"height\": 80, \"rotation\": 0}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-1.jpg', NULL, NULL, 150000.00, 'APPROVED', 'Thiết kế đã được duyệt để đưa vào sản xuất.', '2026-06-02 08:00:00', '2026-07-07 08:20:40'),
(2, 3, 4, 20, 'Áo nhóm kỷ niệm', '#FFFFFF', '{\"layers\": [{\"x\": 100, \"y\": 80, \"type\": \"text\", \"color\": \"#003399\", \"content\": \"ĐỒNG PHỤC CÔNG TY XYZ\", \"fontSize\": 24, \"fontFamily\": \"Arial\"}, {\"x\": 170, \"y\": 120, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-xyz.png\", \"type\": \"image\", \"width\": 60, \"height\": 60}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-3.jpg', NULL, NULL, 200000.00, 'APPROVED', 'Thiết kế đã được duyệt để đưa vào sản xuất.', '2026-06-01 09:00:00', '2026-07-07 08:20:40'),
(3, 5, 1, 2, 'Áo nhóm kỷ niệm', '#FFFFFF', '{\"layers\": [{\"x\": 90, \"y\": 90, \"type\": \"text\", \"color\": \"#FF6600\", \"content\": \"TEAM BUILDING 2026\", \"fontSize\": 28}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-5.jpg', NULL, NULL, 100000.00, 'APPROVED', 'Thiết kế đã được duyệt để đưa vào sản xuất.', '2026-06-02 09:00:00', '2026-07-07 08:20:40'),
(4, 6, 2, 12, 'Áo nhóm kỷ niệm', '#808080', '{\"layers\": [{\"x\": 140, \"y\": 110, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-startup.png\", \"type\": \"image\", \"width\": 100, \"height\": 70}], \"background\": \"#808080\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-6.jpg', NULL, NULL, 120000.00, 'APPROVED', 'Thiết kế đã được duyệt để đưa vào sản xuất.', '2026-06-01 10:00:00', '2026-07-07 08:20:40'),
(7, 16, 3, NULL, 'Áo thun đồng phục 12A1', 'Trắng', '{\"elements\": [{\"x\": 163.7142857142857, \"y\": 246.91428571428577, \"id\": \"fb67142d-d438-466f-bb7f-6d218b70c337\", \"fill\": \"#000000\", \"text\": \"Văn bản mới\", \"type\": \"text\", \"width\": 200, \"height\": 40, \"fontSize\": 28, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Montserrat\"}, {\"x\": 172.85714285714286, \"y\": 189.20000000000007, \"id\": \"3b57b772-0066-4f62-843a-4efdb8b13ed7\", \"fill\": \"#000000\", \"text\": \"Văn bản mới\", \"type\": \"text\", \"width\": 200, \"height\": 40, \"fontSize\": 28, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Quicksand\"}, {\"x\": 121.5714285714284, \"y\": 144.4285714285714, \"id\": \"f585115f-5fa0-4821-aed4-4573f1a72caf\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033314/thank-you_7328366_q8e2f3.png\", \"type\": \"image\", \"width\": 247.71428571428584, \"height\": 238.00000000000009, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782035952/teestudio/user-designs/c5jfgcj0fmixfofsphm9.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-06-21 16:58:48', '2026-06-21 16:59:13'),
(8, 16, 1, NULL, 'Áo nhóm đi biển', '#ffffff', '{\"elements\": [{\"x\": 200.2857142857136, \"y\": 235.48571428571415, \"id\": \"ddea394b-d98f-4d7b-9076-635d6fc570eb\", \"fill\": \"#000000\", \"text\": \"Văn bản mẫu\", \"type\": \"text\", \"width\": 121.71428571428636, \"height\": 27.999999999999982, \"fontSize\": 27.999999999999982, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Great Vibes\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782221859/teestudio/user-designs/lodmjw2cfeack61etict.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-06-23 20:37:41', '2026-06-23 20:37:41'),
(9, 16, 3, NULL, 'Áo hoodie mùa đông', '#8b4513', '{\"elements\": [{\"x\": 203.2, \"y\": 235.20000000000005, \"id\": \"50f64091-3316-4d8b-a907-0cafee631d80\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png\", \"type\": \"image\", \"width\": 93.6, \"height\": 93.6, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782222734/teestudio/user-designs/r0itp5mqlyfiyekrbtam.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-06-23 20:52:16', '2026-06-23 20:52:16'),
(10, 16, 4, NULL, 'Áo nhóm kỷ niệm', '#ffffff', '{\"elements\": [{\"x\": 211.8571428571429, \"y\": 236.42857142857144, \"id\": \"96f497c3-73dd-4f78-a670-e6297906b786\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png\", \"type\": \"image\", \"width\": 138, \"height\": 138, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1783157435/teestudio/user-designs/ww36mcft3nfoi9usmkxu.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-07-04 16:30:36', '2026-07-04 16:30:36'),
(11, 2, 3, 14, 'Hoodie Câu lạc bộ Nhiếp ảnh', '#000000', '{\"elements\": [{\"x\": 90, \"y\": 110, \"fill\": \"#FFFFFF\", \"text\": \"CAPTURE THE MOMENT\", \"type\": \"text\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-nhiep-anh.jpg', NULL, NULL, 120000.00, 'PENDING_REVIEW', NULL, '2026-06-14 08:00:00', '2026-06-14 08:30:00'),
(12, 4, 4, 21, 'Polo Đội ngũ Kinh doanh', '#FFFFFF', '{\"elements\": [{\"x\": 145, \"y\": 105, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/sales-team.png\", \"type\": \"image\", \"width\": 110, \"height\": 110}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/polo-sales-team.jpg', NULL, NULL, 180000.00, 'APPROVED', 'Đã duyệt logo ngực trái và màu in.', '2026-06-14 09:00:00', '2026-06-14 10:00:00'),
(13, 7, 1, 3, 'Áo thun Sự kiện Mùa hè', '#ffffff', '{\"elements\": [{\"x\": 95, \"y\": 130, \"fill\": \"#F97316\", \"text\": \"SUMMER FEST 2026\", \"type\": \"text\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/summer-fest-2026.jpg', NULL, NULL, 80000.00, 'NEEDS_REVISION', 'Vui lòng tăng kích thước chữ và đưa nội dung vào giữa vùng in.', '2026-06-14 11:00:00', '2026-07-13 19:17:15'),
(14, 8, 4, 23, 'Polo Câu lạc bộ Chạy bộ', '#0066CC', '{\"elements\": [{\"x\": 150, \"y\": 100, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/icons/running-club.png\", \"type\": \"image\", \"width\": 100, \"height\": 120}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/polo-running-club.jpg', NULL, NULL, 100000.00, 'APPROVED', 'Thiết kế đạt yêu cầu in DTG.', '2026-06-15 08:00:00', '2026-06-15 09:00:00'),
(15, 1, 1, 5, 'Bản nháp Typography Tối giản', '#000000', '{\"elements\": [{\"x\": 120, \"y\": 150, \"fill\": \"#FFFFFF\", \"text\": \"LESS IS MORE\", \"type\": \"text\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/less-is-more-draft.jpg', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-06-15 09:30:00', '2026-06-15 09:30:00'),
(16, 2, 3, 15, 'Hoodie Team Building 2026', '#000000', '{\"version\": 1, \"elements\": [{\"x\": 173, \"y\": 283, \"id\": \"7a6497df-e892-4853-920f-e20059631ba5\", \"fill\": \"#facc15\", \"side\": \"back\", \"text\": \"ONE TEAM ONE DREAM\", \"type\": \"text\"}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"shirtColor\": \"#000000\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785845975/teestudio/user-designs/ru9lp6iq76usxasbwone.png', NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785845976/teestudio/print-files/ge82kop6ffokmbtqmohk.png', 150000.00, 'APPROVED', 'Đã duyệt nội dung mặt sau.', '2026-06-15 10:00:00', '2026-08-04 19:19:44'),
(17, 3, 3, 18, 'Hoodie Workshop Công nghệ', '#003153', '{\"elements\": [{\"x\": 80, \"y\": 115, \"fill\": \"#FFFFFF\", \"text\": \"BUILD • LEARN • SHARE\", \"type\": \"text\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-tech-workshop.jpg', NULL, NULL, 180000.00, 'APPROVED', 'Đã duyệt mẫu in mặt trước.', '2026-06-16 08:00:00', '2026-06-16 09:00:00'),
(18, 18, 1, NULL, 'Áo nhóm kỷ niệm', '#ffffff', '{\"elements\": [{\"x\": 225.42857142857144, \"y\": 302, \"id\": \"6610e80b-d318-4ef8-95f7-1bc5311b099a\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 155.7142857142857, \"y\": 198.5714285714286, \"id\": \"353a64af-ba50-4066-a931-e5bad5b605c8\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033314/thank-you_7328366_q8e2f3.png\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784122455/teestudio/user-designs/kz8r8v9vcuybph0qqqw6.png', NULL, NULL, 0.00, 'PENDING_REVIEW', NULL, '2026-07-11 01:52:03', '2026-07-15 20:34:09'),
(19, 20, 1, NULL, 'Áo khoác phượt', '#000000', '{\"elements\": [{\"x\": 194.00000000000003, \"y\": 304.2857142857143, \"id\": \"fe37b149-14f5-4e50-8c78-cf5d895142b3\", \"src\": \"blob:http://localhost:3000/8d4ff24a-24a0-4df9-83ea-3e3b71587644\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 196.8571428571423, \"y\": 261.91666666666634, \"id\": \"253101f2-bf42-4e9b-9c91-aa826dbecb23\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1784143205/teestudio/user-designs/elkgltmhgmbrxwvchgoq.jpg\", \"type\": \"image\", \"width\": 82.85714285714344, \"height\": 63.59523809523833, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784143203/teestudio/user-designs/nawh24tt6lnkrihgtdpk.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-07-11 06:57:46', '2026-07-16 02:20:06'),
(24, NULL, 1, 7, 'Áo thun sự kiện', '#000000', '{\"version\": 1, \"elements\": [{\"x\": 165.0000015258787, \"y\": 225.0000021362303, \"id\": \"96ae6da9-3383-4428-a442-f0aae0085840\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 173.99999670410182, \"height\": 177.99999409993546, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#000000\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784384965/teestudio/user-designs/mj5pzgi1v5mwoihptlsu.png', NULL, NULL, 60000.00, 'DRAFT', NULL, '2026-07-18 21:29:53', '2026-07-18 21:29:53'),
(25, 16, 1, NULL, 'Áo phông nam tính', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 288.8571428571417, \"y\": 370.2275600505674, \"id\": \"08437053-a493-4702-bed6-6a9544e1cc66\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1784387071/teestudio/user-designs/lnnyna7hjqixmvgdfqdc.jpg\", \"side\": \"front\", \"type\": \"image\", \"width\": 57.14285714285806, \"height\": 49.83059418457694, \"rotation\": 0}, {\"x\": 160.2857142857143, \"y\": 207.1428571428571, \"id\": \"d99c5562-7f04-4e22-b910-8a27ddebc3e4\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033308/have-a-good-day_6122874_hroodz.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784387192/teestudio/user-designs/vg6ciwxggaumzhr0rj8r.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-07-18 22:04:59', '2026-07-18 22:07:00'),
(26, 16, 1, 2, 'Áo nhóm kỷ niệm', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 137.71428571428572, \"y\": 311.1428571428571, \"id\": \"bed86400-f75d-48c8-b435-5373db355908\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785503731/teestudio/user-designs/ixttszyvvv5ko4bxsst3.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785503731/teestudio/print-files/ltufz2xljpvpwk3nxkls.png', NULL, 60000.00, 'DRAFT', NULL, '2026-07-18 22:07:52', '2026-07-31 20:15:36'),
(27, 13, 1, 3, 'Áo thun sự kiện 2026', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 190, \"y\": 246, \"id\": \"775a8c6f-e471-4b53-935a-788fe2e6e8f6\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784389499/teestudio/user-designs/mkiyehauzuwxfjpasvr6.png', NULL, NULL, 60000.00, 'APPROVED', NULL, '2026-07-18 22:45:27', '2026-08-01 15:25:42'),
(28, 16, 1, 1, 'Áo lớp 9A', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 176.85714285714266, \"y\": 226.5714285714284, \"id\": \"c983bbba-554f-4f81-897b-c1f4ea1a6c3c\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 146.28571428571448, \"height\": 184.00000000000023, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785672494/teestudio/user-designs/iwniskn3ue9m9ksczfpj.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785672496/teestudio/print-files/ibdipufak5wbnlybcn36.png', NULL, 60000.00, 'APPROVED', NULL, '2026-07-19 12:01:01', '2026-08-02 19:08:22'),
(29, 21, 1, 2, 'Áo thun kỷ yếu', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 115, \"y\": 128, \"id\": \"cc4bb76e-d39a-4844-8fb7-5cdcfd1abcc3\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784447587/teestudio/user-designs/e5lu0od13nvxhe8ck6kb.png', NULL, NULL, 60000.00, 'APPROVED', NULL, '2026-07-19 14:53:36', '2026-07-19 14:56:44'),
(30, 10, 1, 2, 'Thiết kế áo nữ sinh', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 263, \"y\": 156, \"id\": \"f45c6511-242b-467b-b745-f4653af3133e\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784449123/teestudio/user-designs/h7nditmifwrh7q3yc7ww.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784449124/teestudio/print-files/rrfl6acbfz4frl6vai67.png', NULL, 60000.00, 'APPROVED', NULL, '2026-07-19 15:19:14', '2026-07-19 15:33:46'),
(31, 21, 1, 1, 'Áo nhóm phượt', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 171.28891808639682, \"y\": 196.88176129678376, \"id\": \"78dfcf83-3153-4f4f-8203-2eed14166b27\", \"fill\": \"#000000\", \"side\": \"front\", \"text\": \"Văn bản mới\", \"type\": \"text\", \"width\": 153.99999999999977, \"height\": 56.00000000000028, \"fontSize\": 28.00000000000014, \"rotation\": 2.4895529219991284, \"fontStyle\": \"normal\", \"fontFamily\": \"Roboto\"}, {\"x\": 154, \"y\": 309, \"id\": \"ca02f3dd-ad72-417b-ab3e-8aaaf92d896e\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033341/movie-ticket_6426920_vrksf0.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 190, \"y\": 246, \"id\": \"1c29f9d7-b1ff-43a4-a724-69d176bbbb43\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784459234/teestudio/user-designs/jtvojv0w5wei7wawvujd.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784459235/teestudio/print-files/kumtqheepuxcd7iig4uj.png', NULL, 60000.00, 'APPROVED', NULL, '2026-07-19 18:07:45', '2026-07-19 18:11:05'),
(32, 27, 1, 5, 'Áo hoodie đơn giản', '#000000', '{\"version\": 1, \"elements\": [{\"x\": 135.14285714285714, \"y\": 184.28571428571428, \"id\": \"f312b848-dd9b-42a8-b01c-0a4e4aebff6a\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785509149/teestudio/user-designs/otfpcvekj3mke5tfp8eu.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785509177/teestudio/print-files/bgtajioruwmfoyqzubsk.png', NULL, 0.00, 'APPROVED', NULL, '2026-07-31 21:45:52', '2026-08-01 15:14:18'),
(33, 28, 4, 20, 'Thiết kế áo công sở', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 116.00000000000004, \"y\": 148.4285714285714, \"id\": \"d0fd4334-64a2-4268-bf9c-e5aac31ec453\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033308/have-a-good-day_6122874_hroodz.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 138, \"height\": 138, \"rotation\": 0}], \"shirtType\": \"polo\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785672771/teestudio/user-designs/ssnzhcv9o1ydtldo0bm2.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785672772/teestudio/print-files/x9do4gaf5zv8ep6iveez.png', NULL, 60000.00, 'DRAFT', NULL, '2026-07-31 21:53:24', '2026-08-02 19:12:59'),
(34, 28, 3, 17, 'Áo khoác gió', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 146.05714285714282, \"y\": 206.0571428571429, \"id\": \"16d3f691-25e6-4f86-b58b-f5da3ec86d09\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033249/social-distancing_7143864_gxzpup.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 93.6, \"height\": 93.6, \"rotation\": 0}], \"shirtType\": \"hoodie\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785510053/teestudio/user-designs/zdnlggzplkrb9usx83ic.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785510073/teestudio/print-files/mz4bbcw679rpgnuvucqy.png', NULL, 0.00, 'APPROVED', NULL, '2026-07-31 22:00:56', '2026-08-01 15:06:32'),
(35, 28, 1, 1, 'Áo thun kỷ yếu', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 251, \"y\": 321, \"id\": \"5e745686-f453-4898-ae1b-3bb70d4da4a5\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785513699/teestudio/user-designs/v5bhwc4zna1sfwjsnysp.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785513701/teestudio/print-files/caqbj8pdeaqrztoqsfo2.png', NULL, 60000.00, 'APPROVED', NULL, '2026-07-31 23:01:45', '2026-08-01 15:06:32'),
(36, 28, 1, 8, 'Áo nhóm sinh viên', '#000000', '{\"version\": 1, \"elements\": [{\"x\": 147, \"y\": 198, \"id\": \"28e7f38e-98d5-4561-a7da-59ce5d241d0a\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033248/keep-your-distance_7001168_uqa90c.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#000000\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785855676/teestudio/user-designs/bh1li1t6foxpllhpwivh.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785855677/teestudio/print-files/yla3rnakzrcjekbwoxug.png', NULL, 60000.00, 'APPROVED', NULL, '2026-07-31 23:02:16', '2026-08-04 22:01:25'),
(37, NULL, 1, 2, 'Áo kỷ yếu lớp 9', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 273, \"y\": 133, \"id\": \"00c1a1be-696c-4045-bae3-c87ad8060a59\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785672751/teestudio/user-designs/pckyymoygnxwrxz040r9.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785672752/teestudio/print-files/o496tbsar7ycklianfwb.png', NULL, 60000.00, 'DRAFT', NULL, '2026-08-02 19:12:38', '2026-08-02 19:12:38'),
(38, 27, 1, NULL, 'Thiết kế áo cặp', '#000000', '{\"version\": 1, \"elements\": [{\"x\": 229.71428571428572, \"y\": 315.42857142857144, \"id\": \"55ac79b0-eae2-4ef5-adc3-cbe1f7290020\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785673869/teestudio/user-designs/auvmidx5x23tlmatjmfk.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-08-02 19:31:15', '2026-08-02 19:31:15'),
(39, NULL, 1, 2, 'Áo kỷ yếu cấp 3', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 190, \"y\": 246, \"id\": \"1f9b1129-1c1b-42dd-b71a-2d007b1c346d\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785769930/teestudio/user-designs/bscjohx3xjxdhm7wfeuz.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785769932/teestudio/print-files/ds5hcajk3jqsz7zryygu.png', NULL, 100000.00, 'DRAFT', NULL, '2026-08-03 22:12:19', '2026-08-03 22:12:19'),
(40, NULL, 1, 2, 'Áo nhóm phượt', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 212, \"y\": 168, \"id\": \"14dfcb44-ccb5-4613-af69-f3cff60b61e8\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785770151/teestudio/user-designs/bjygxs0fwopyk5qvcpcg.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785770152/teestudio/print-files/iey2b2p72pbjbpzmb551.png', NULL, 60000.00, 'DRAFT', NULL, '2026-08-03 22:16:00', '2026-08-03 22:16:00'),
(41, NULL, 1, 2, 'Áo thun kỷ yếu', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 190, \"y\": 246, \"id\": \"130eef43-af9a-4f8a-af21-4f610ce4c5cc\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785770986/teestudio/user-designs/vwp8eth5x0qkakznteca.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785770987/teestudio/print-files/ndbxczad35lsqpb9le7v.png', NULL, 0.00, 'DRAFT', NULL, '2026-08-03 22:29:54', '2026-08-03 22:29:54'),
(42, 27, 1, 4, 'Áo lớp 10B', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 258, \"y\": 343, \"id\": \"57d9e152-0ef0-4ef1-85ae-6561442f6b93\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785771475/teestudio/user-designs/jurd6gnnkdkhfnofthqi.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785771475/teestudio/print-files/fmsbi9nu3tqyr4f1ncdg.png', NULL, 70000.00, 'DRAFT', NULL, '2026-08-03 22:32:50', '2026-08-03 22:38:03'),
(43, 27, 1, NULL, 'Áo thun in 2 mặt (bản cuối)', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 189.99999999999957, \"y\": 291.14285714285717, \"id\": \"7cedd12b-54f1-41b8-832d-020f832c00b9\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 88.57142857142898, \"height\": 74.85714285714181, \"rotation\": 0}, {\"x\": 183.99999999999912, \"y\": 296.57142857142856, \"id\": \"47ba897a-90e9-4a8c-96bf-64a227ee92ca\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 81.71428571428653, \"height\": 75.42857142856988, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}, \"printingMethodCode\": \"VINYL\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785905262/teestudio/user-designs/k1os7fyp0nq2uh2edmou.png', NULL, NULL, 60000.00, 'DRAFT', NULL, '2026-08-05 11:47:42', '2026-08-05 11:47:50'),
(44, NULL, 1, 2, 'Áo thun in 2 mặt', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 140, \"y\": 167, \"id\": \"34d3f1e4-545b-425e-9106-e7181a2f43c8\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 245, \"y\": 344, \"id\": \"c9aefda3-b6b6-4126-a077-2664b297e4d8\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906198/teestudio/user-designs/vqflnbn3sapf41ab6abi.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906199/teestudio/print-files/n44rtdxgvtmgtff39ljv.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906200/teestudio/print-files/x89orojf4dkcx2yslaoh.png', 100000.00, 'DRAFT', NULL, '2026-08-05 12:03:29', '2026-08-05 12:03:29'),
(45, NULL, 1, 2, 'Áo thun in 2 mặt', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 149, \"y\": 197, \"id\": \"f933cf3b-1913-409f-82b7-b1506b1b36fd\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033249/social-distancing_7143864_gxzpup.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 236, \"y\": 340, \"id\": \"5fb7c77c-bf75-474a-85de-f57b8a55397a\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6103560-png_enpz6a.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906734/teestudio/user-designs/hr3big554kkit1ugl5is.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906736/teestudio/print-files/hn7qqumeno62axmbz9xw.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906737/teestudio/print-files/wen1dkew2y9hizegp4tj.png', 100000.00, 'DRAFT', NULL, '2026-08-05 12:12:25', '2026-08-05 12:12:25'),
(46, NULL, 1, 2, 'Áo phông nam', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 113, \"y\": 337, \"id\": \"837080a7-ea17-4da3-be9b-fcd7f75febac\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033341/movie-ticket_6426920_vrksf0.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 107, \"y\": 337, \"id\": \"a6ec7285-9490-4115-b1a9-ee53d8f7fe7e\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906840/teestudio/user-designs/pav6uax0zmmycej4kuyh.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906841/teestudio/print-files/zdoh3vwg9zvty5jgqfnt.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785906844/teestudio/print-files/hfjxbebhkwu5gskyhhht.png', 100000.00, 'DRAFT', NULL, '2026-08-05 12:13:39', '2026-08-05 12:14:12'),
(47, NULL, 1, 2, 'Thiết kế logo chính', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 147, \"y\": 203, \"id\": \"ed98bcd7-600d-41af-8604-b0b26b71387c\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033248/keep-your-distance_7001168_uqa90c.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 252, \"y\": 346, \"id\": \"736e2a72-42a9-45d7-a9be-056984a3838d\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782218686/planner_8512483_nyptrl.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785907181/teestudio/user-designs/e2h6kbvkehewxi4fo5ng.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785907183/teestudio/print-files/ybdnzuir8v9z8xfq2fyh.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785907183/teestudio/print-files/hmvjstok92vnbqzhj0kq.png', 100000.00, 'DRAFT', NULL, '2026-08-05 12:19:52', '2026-08-05 12:19:52'),
(48, 28, 1, 2, 'Thiết kế logo phụ', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 145, \"y\": 168, \"id\": \"4a45694f-2f0e-449c-aec5-d86364ea296f\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 121, \"y\": 125.00000000000004, \"id\": \"930b6ae5-d51c-417e-a69c-12b17e77f1a9\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033259/star_6427746_qf9rwm.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785907500/teestudio/user-designs/ymg3ajvcvcvxlnytojp2.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785907503/teestudio/print-files/x0hvqxzoaxtrlchnxbz1.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785907504/teestudio/print-files/redxkqaemolqu5pyvtdd.png', 100000.00, 'APPROVED', NULL, '2026-08-05 12:25:12', '2026-08-05 12:27:17'),
(49, 3, 1, 2, 'Thiết kế dạo phố', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 149, \"y\": 179, \"id\": \"8964f076-0091-43a4-9cfd-039c03a2caf9\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 215, \"y\": 304, \"id\": \"aa9f33e3-61ad-42bc-ba65-c63ddbfc830f\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033341/movie-ticket_6426920_vrksf0.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 184, \"y\": 240.00000000000003, \"id\": \"a714f0e4-f039-46d2-9639-4a0e99d5330f\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-18345112-png_umdppj.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785909003/teestudio/user-designs/ooj4ykuqs4w4x56cg6yr.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785909004/teestudio/print-files/yhkhtu7sjzolk6vtpgrp.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785909006/teestudio/print-files/w7vu7nwsargmy05g0nkl.png', 10000.00, 'APPROVED', NULL, '2026-08-05 12:50:14', '2026-08-05 12:51:25'),
(50, 27, 1, NULL, 'Áo nhóm kỷ niệm', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 190, \"y\": 246, \"id\": \"bb393799-7189-475d-8d21-16356c0b73f4\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}, \"printingMethodCode\": \"DTG\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785914646/teestudio/user-designs/gesliblacjkc4n8iq5wt.png', NULL, NULL, 40000.00, 'DRAFT', NULL, '2026-08-05 14:24:14', '2026-08-05 14:24:14'),
(51, NULL, 1, 4, 'Áo thun sự kiện', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 175.0000000000001, \"y\": 279.1999999999998, \"id\": \"370910e6-3b2f-4e78-9d15-534522503ee7\", \"fill\": \"#ff2600\", \"side\": \"front\", \"text\": \"bbbbb\", \"type\": \"text\", \"width\": 115.99999999999989, \"height\": 134.00000000000048, \"fontSize\": 67.00000000000024, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Roboto\"}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785927073/teestudio/user-designs/stejtfqpfmvvozd0qiqt.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785927074/teestudio/print-files/wanntw8dybhnkh3szzdn.png', NULL, 10000.00, 'DRAFT', NULL, '2026-08-05 17:51:23', '2026-08-05 17:51:23');

-- --------------------------------------------------------

--
-- Table structure for table `customerorder`
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
  `paymentType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '[FROM ADMIN] Chính sách thanh toán ban đầu, bất biến: FULL hoặc DEPOSIT. Không có DEFAULT – backend PHẢI truyền giá trị tường minh để tránh bỏ sót.',
  `paymentStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT '[FROM ADMIN] Tiến độ thanh toán tổng của đơn: PENDING, PARTIALLY_PAID, PAID',
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customer_order_code` (`orderCode`),
  KEY `idx_customer_order_user_id` (`userId`),
  KEY `idx_customer_order_promotion_id` (`promotionId`),
  KEY `idx_customer_order_address_id` (`addressId`),
  KEY `idx_customer_order_payment_type_status` (`paymentType`,`paymentStatus`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customerorder`
--

INSERT INTO `customerorder` (`id`, `orderCode`, `userId`, `promotionId`, `addressId`, `subtotal`, `discountAmount`, `shippingFee`, `shippingCarrier`, `shippingMethod`, `trackingCode`, `shippedAt`, `deliveredAt`, `cancelReason`, `totalAmount`, `depositAmount`, `codAmount`, `paymentType`, `paymentStatus`, `status`, `createdAt`, `updatedAt`) VALUES
(1, '#TS-2026-00128', 1, 1, 1, 450000.00, 60000.00, 30000.00, 'GHTK', 'Tiêu chuẩn', NULL, NULL, NULL, NULL, 570000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-06-03 08:24:00', '2026-06-03 10:30:00'),
(2, '#TS-2026-00129', 2, NULL, 2, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CONFIRMED', '2026-06-03 09:05:00', '2026-08-04 19:59:52'),
(3, '#TS-2026-00130', 3, NULL, 3, 1440000.00, 0.00, 0.00, 'J&T Express', 'Nhanh', NULL, NULL, NULL, NULL, 1640000.00, 0.00, 0.00, 'FULL', 'PAID', 'READY_TO_SHIP', '2026-06-02 13:40:00', '2026-06-03 09:00:00'),
(4, '#TS-2026-00131', 4, NULL, 4, 480000.00, 0.00, 30000.00, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260601001', '2026-06-01 14:00:00', '2026-06-03 10:20:00', NULL, 510000.00, 0.00, 0.00, 'FULL', 'PAID', 'COMPLETED', '2026-05-31 15:20:00', '2026-06-03 10:20:00'),
(5, '#TS-2026-00132', 5, NULL, 5, 360000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 490000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CONFIRMED', '2026-06-03 10:15:00', '2026-06-03 11:00:00'),
(6, '#TS-2026-00133', 6, NULL, 6, 450000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 600000.00, 0.00, 0.00, 'FULL', 'PAID', 'PRINTING', '2026-06-02 14:30:00', '2026-06-03 08:00:00'),
(7, '#TS-2026-00134', 7, NULL, 7, 360000.00, 0.00, 30000.00, 'GHTK', 'Nhanh', 'GHTK2026060001', '2026-06-02 16:00:00', NULL, NULL, 390000.00, 0.00, 0.00, 'FULL', 'PENDING', 'SHIPPING', '2026-06-01 16:45:00', '2026-06-02 16:00:00'),
(8, '#TS-2026-00135', 8, NULL, 8, 240000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, 'Khách hàng yêu cầu hủy, không có nhu cầu nữa', 270000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-06-01 09:00:00', '2026-06-01 10:30:00'),
(9, '#TS-2026-00136', 1, NULL, 1, 300000.00, 0.00, 30000.00, 'Ahamove', NULL, 'aa', '2026-08-02 14:18:52', '2026-08-02 14:18:57', NULL, 330000.00, 0.00, 0.00, 'FULL', 'PAID', 'COMPLETED', '2026-06-03 11:00:00', '2026-08-02 14:19:34'),
(10, '#TS-2026-00137', 2, 2, 2, 600000.00, 50000.00, 0.00, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260603002', '2026-06-02 08:00:00', '2026-06-03 14:00:00', NULL, 550000.00, 0.00, 0.00, 'FULL', 'PAID', 'COMPLETED', '2026-05-30 08:00:00', '2026-06-03 14:00:00'),
(11, '#TS-2026-00138', 4, NULL, 4, 720000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 900000.00, 450000.00, 450000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'CONFIRMED', '2026-06-14 11:00:00', '2026-06-14 12:00:00'),
(12, '#TS-2026-00139', 8, NULL, 8, 540000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 640000.00, 320000.00, 320000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'PRINTING', '2026-06-15 10:00:00', '2026-06-16 09:00:00'),
(13, '#TS-2026-00140', 2, NULL, 2, 560000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 740000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-06-15 13:00:00', '2026-06-15 14:00:00'),
(14, '#TS-2026-00141', 7, NULL, 7, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 150000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-16 09:00:00', '2026-06-16 09:00:00'),
(15, '#TS-2026-00142', 5, NULL, 5, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-16 10:00:00', '2026-06-16 10:10:00'),
(16, '#TS-2026-00143', 6, NULL, 6, 360000.00, 0.00, 30000.00, 'Giao Hàng Nhanh', 'Tiêu chuẩn', 'GHN202606180143', '2026-06-17 09:00:00', '2026-06-18 16:30:00', NULL, 390000.00, 0.00, 390000.00, 'FULL', 'PENDING', 'COMPLETED', '2026-06-16 14:00:00', '2026-06-18 16:30:00'),
(17, '#TS-2026-00144', 3, NULL, 3, 560000.00, 0.00, 30000.00, 'Viettel Post', 'Nhanh', 'VTP202606190144', '2026-06-18 08:00:00', '2026-06-19 15:00:00', NULL, 770000.00, 385000.00, 385000.00, 'DEPOSIT', 'PAID', 'COMPLETED', '2026-06-17 08:00:00', '2026-08-02 13:09:27'),
(18, '#TS-2026-00145', 1, NULL, 1, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-17 10:00:00', '2026-06-17 10:00:00'),
(20, 'TS-20260711-QNGUL9', 20, NULL, 11, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 215000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-11 06:15:47', '2026-07-11 06:15:47'),
(21, 'TS-20260717-XMWOPI', 21, NULL, 12, 240000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 240000.00, 0.00, 240000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:16:32', '2026-07-17 17:16:32'),
(22, 'TS-20260717-LAIGOF', 20, NULL, 13, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 215000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:42:13', '2026-07-17 17:42:13'),
(23, 'TS-20260717-Z4I529', 20, NULL, 14, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 215000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:42:13', '2026-07-17 17:42:13'),
(24, 'TS-20260717-J21USW', 20, NULL, 15, 360000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 395000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:43:17', '2026-07-17 17:43:17'),
(25, 'TS-20260717-E8OZ1F', 20, NULL, 16, 360000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 395000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:43:17', '2026-07-17 17:43:17'),
(26, 'TS-20260717-5RPGIL', 21, NULL, 17, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 120000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:49:53', '2026-07-17 17:49:53'),
(27, 'TS-20260717-QW0207', 21, NULL, 18, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 120000.00, 0.00, 120000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:50:59', '2026-07-17 17:50:59'),
(28, 'TS-20260717-ZG56AI', 20, NULL, 19, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:53:28', '2026-07-17 17:53:28'),
(29, 'TS-20260717-IQLQ8P', 20, NULL, 20, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:53:28', '2026-07-17 17:53:28'),
(30, 'TS-20260717-CS3MCU', 21, NULL, 21, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 120000.00, 0.00, 120000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 18:05:25', '2026-07-17 18:05:25'),
(36, 'TS-20260718-1BUIG6', 16, 1, 27, 360000.00, 36000.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 359000.00, 0.00, 359000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-18 21:47:28', '2026-07-18 21:47:28'),
(37, 'TS-20260718-3065TM', 16, NULL, 28, 240000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 275000.00, 0.00, 275000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-18 21:50:02', '2026-07-18 21:50:02'),
(38, 'TS-20260718-ISK6ZC', 16, NULL, 29, 240000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 275000.00, 0.00, 275000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-18 21:50:02', '2026-07-18 21:50:02'),
(39, 'TS-20260718-XA8TGQ', 16, NULL, 30, 240000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 275000.00, 0.00, 275000.00, 'FULL', 'PENDING', 'CONFIRMED', '2026-07-18 21:51:05', '2026-07-31 20:00:36'),
(40, 'TS-20260718-XOYPY9', 16, NULL, 31, 240000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 275000.00, 0.00, 275000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-18 21:51:05', '2026-07-18 21:51:05'),
(41, 'TS-20260718-DHZCTT', 16, NULL, 32, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PAID', 'PENDING', '2026-07-18 21:51:45', '2026-07-18 21:56:03'),
(42, 'TS-20260718-AHRIBV', 16, NULL, 33, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CONFIRMED', '2026-07-18 21:51:45', '2026-07-31 20:00:02'),
(43, 'TS-20260718-WS039V', 3, NULL, 34, 280000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 460000.00, 230000.00, 230000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'PENDING', '2026-07-18 22:42:58', '2026-07-18 22:43:49'),
(44, 'TS-20260718-4FV563', 13, NULL, 35, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 180000.00, 90000.00, 90000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'CONFIRMED', '2026-07-18 22:46:24', '2026-08-01 15:25:42'),
(45, 'TS-20260719-0MBZ8V', 16, NULL, 36, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PAID', 'CONFIRMED', '2026-07-19 12:42:43', '2026-07-19 18:38:59'),
(46, 'TS-20260719-81X1AY', 16, NULL, 37, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PROCESSING', '2026-07-19 12:42:47', '2026-07-31 20:07:06'),
(47, 'TS-20260719-G9BL88', 21, NULL, 38, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 180000.00, 0.00, 0.00, 'FULL', 'PAID', 'CONFIRMED', '2026-07-19 14:53:54', '2026-07-19 14:56:44'),
(48, 'TS-20260719-MOXETA', 10, NULL, 39, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 180000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-07-19 15:32:43', '2026-08-01 16:20:39'),
(49, 'TS-20260719-9RE0DK', 21, NULL, 40, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 180000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-07-19 18:09:16', '2026-08-01 16:04:24'),
(50, 'TS-20260731-RBCS11', 27, NULL, 41, 120000.00, 0.00, 35000.00, 'Giao hàng nhanh chóng', NULL, 'Ghi chú cho shipper', '2026-08-04 12:24:33', NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PAID', 'SHIPPING', '2026-07-31 21:46:21', '2026-08-04 12:24:33'),
(52, 'TS-20260731-2TZASK', 28, NULL, 43, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 215000.00, 0.00, 0.00, 'FULL', 'PAID', 'PENDING', '2026-07-31 21:53:37', '2026-07-31 21:54:03'),
(53, 'TS-20260731-922GFY', 28, NULL, 44, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 215000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-31 21:53:37', '2026-07-31 21:53:37'),
(54, 'TS-20260731-H3CSQW', 28, NULL, 45, 280000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 315000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-07-31 22:01:16', '2026-08-01 16:15:03'),
(55, 'TS-20260731-E03SKC', 28, NULL, 46, 280000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 315000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-31 22:01:16', '2026-07-31 22:01:16'),
(56, 'TS-20260731-4321A8', 28, NULL, 47, 520000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 640000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PROCESSING', '2026-07-31 23:02:59', '2026-08-01 16:18:28'),
(57, 'TS-20260801-KSI336', 8, 1, 48, 180000.00, 28000.00, 60000.00, NULL, NULL, NULL, NULL, NULL, 'Áo kỷ yếu cấp 3', 312000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-08-01 22:49:09', '2026-08-04 12:41:56'),
(58, 'TS-20260802-R09EOG', 6, NULL, 49, 180000.00, 0.00, 30000.00, 'J&T Express', NULL, 'Thiết kế mẫu số 3', '2026-08-02 14:34:50', '2026-08-02 14:34:54', NULL, 210000.00, 0.00, 210000.00, 'FULL', 'PAID', 'COMPLETED', '2026-08-02 14:06:31', '2026-08-02 14:35:02'),
(59, 'TS-20260802-RF6Q18', 28, NULL, 50, 640000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, '[TECH_ADJUST] Điều chỉnh giá hệ thống', 790000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-08-02 20:10:39', '2026-08-04 12:42:22'),
(60, 'TS-20260803-UXCMTR', 2, 1, 51, 1240000.00, 139000.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 1281000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-08-03 21:56:06', '2026-08-03 21:56:06'),
(61, 'TS-20260805-533RAN', 28, NULL, 52, 160000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 290000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PROCESSING', '2026-08-05 12:27:05', '2026-08-05 12:27:42'),
(62, 'TS-20260805-TSXWSS', 3, NULL, 53, 160000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 200000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PROCESSING', '2026-08-05 12:51:06', '2026-08-05 12:51:51');

--
-- Triggers `customerorder`
--
DROP TRIGGER IF EXISTS `trg_customer_order_payment_type_immutable`;
DELIMITER $$
CREATE TRIGGER `trg_customer_order_payment_type_immutable` BEFORE UPDATE ON `customerorder` FOR EACH ROW BEGIN
	IF NOT (NEW.paymentType <=> OLD.paymentType) THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'CustomerOrder.paymentType is immutable';
	END IF;
END
$$
DELIMITER ;

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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `designprintmethod`
--

INSERT INTO `designprintmethod` (`id`, `designId`, `printMethodId`, `extraCost`) VALUES
(1, 1, 1, 0.00),
(2, 2, 2, 30000.00),
(3, 3, 1, 0.00),
(4, 4, 1, 0.00),
(5, 11, 1, 0.00),
(6, 12, 2, 30000.00),
(7, 13, 3, 50000.00),
(8, 14, 1, 0.00),
(9, 15, 4, 20000.00),
(10, 16, 2, 30000.00),
(11, 17, 1, 0.00),
(12, 40, 5, 10000.00),
(13, 41, 4, 20000.00),
(17, 42, 4, 20000.00),
(19, 36, 4, 20000.00),
(20, 44, 4, 20000.00),
(21, 45, 4, 20000.00),
(23, 46, 4, 20000.00),
(24, 47, 4, 20000.00),
(25, 48, 4, 20000.00),
(26, 49, 4, 20000.00),
(27, 51, 4, 30000.00);

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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `designprintposition`
--

INSERT INTO `designprintposition` (`id`, `designId`, `printPositionId`, `extraCost`) VALUES
(1, 1, 1, 0.00),
(2, 2, 1, 0.00),
(3, 2, 3, 15000.00),
(4, 3, 1, 0.00),
(5, 4, 2, 20000.00),
(6, 11, 1, 0.00),
(7, 12, 1, 0.00),
(8, 13, 2, 20000.00),
(9, 14, 1, 0.00),
(10, 15, 1, 0.00),
(12, 17, 1, 0.00),
(13, 24, 1, 0.00),
(14, 27, 1, 0.00),
(15, 29, 1, 0.00),
(16, 30, 1, 0.00),
(17, 31, 1, 0.00),
(18, 26, 1, 0.00),
(19, 35, 1, 0.00),
(21, 28, 1, 0.00),
(22, 37, 1, 0.00),
(23, 33, 1, 0.00),
(24, 39, 1, 0.00),
(25, 40, 1, 0.00),
(26, 41, 1, 0.00),
(30, 42, 1, 0.00),
(31, 16, 2, 20000.00),
(33, 36, 1, 0.00),
(36, 43, 2, 20000.00),
(37, 43, 1, 0.00),
(38, 44, 2, 20000.00),
(39, 44, 1, 0.00),
(40, 45, 2, 20000.00),
(41, 45, 1, 0.00),
(44, 46, 2, 20000.00),
(45, 46, 1, 0.00),
(46, 47, 2, 20000.00),
(47, 47, 1, 0.00),
(48, 48, 2, 20000.00),
(49, 48, 1, 0.00),
(50, 49, 2, 20000.00),
(51, 49, 1, 0.00),
(52, 50, 1, 0.00),
(53, 51, 1, 0.00);

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
  `transactionType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inventory_transaction_variant_created_at` (`variantId`,`createdAt`),
  KEY `idx_inventory_transaction_order_id` (`orderId`),
  KEY `idx_inventory_transaction_supplier_id` (`supplierId`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inventorytransaction`
--

INSERT INTO `inventorytransaction` (`id`, `variantId`, `orderId`, `supplierId`, `quantityChanged`, `transactionType`, `reason`, `createdAt`) VALUES
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
(45, 14, NULL, NULL, -10, 'ADJUSTMENT', 'Điều chỉnh giảm sau kiểm kê để phản ánh số tồn thực tế', '2026-07-02 09:00:00'),
(46, 21, 20, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260711-QNGUL9 - giữ tồn kho ngay khi tạo đơn', '2026-07-11 06:15:47'),
(47, 1, 21, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260717-XMWOPI - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:16:32'),
(48, 20, 22, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260717-LAIGOF - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:42:13'),
(49, 20, 23, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260717-Z4I529 - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:42:13'),
(50, 21, 24, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260717-J21USW - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:43:17'),
(51, 21, 25, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260717-E8OZ1F - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:43:17'),
(52, 2, 26, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260717-5RPGIL - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:49:53'),
(53, 2, 27, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260717-QW0207 - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:50:59'),
(54, 2, 28, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260717-ZG56AI - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:53:28'),
(55, 2, 29, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260717-IQLQ8P - giữ tồn kho ngay khi tạo đơn', '2026-07-17 17:53:28'),
(56, 2, 30, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260717-CS3MCU - giữ tồn kho ngay khi tạo đơn', '2026-07-17 18:05:25'),
(62, 21, 36, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260718-1BUIG6 - giữ tồn kho ngay khi tạo đơn', '2026-07-18 21:47:28'),
(63, 1, 37, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260718-3065TM - giữ tồn kho ngay khi tạo đơn', '2026-07-18 21:50:02'),
(64, 1, 38, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260718-ISK6ZC - giữ tồn kho ngay khi tạo đơn', '2026-07-18 21:50:02'),
(65, 1, 39, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260718-XA8TGQ - giữ tồn kho ngay khi tạo đơn', '2026-07-18 21:51:05'),
(66, 1, 40, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260718-XOYPY9 - giữ tồn kho ngay khi tạo đơn', '2026-07-18 21:51:05'),
(67, 1, 41, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-DHZCTT - giữ tồn kho ngay khi tạo đơn', '2026-07-18 21:51:45'),
(68, 1, 42, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-AHRIBV - giữ tồn kho ngay khi tạo đơn', '2026-07-18 21:51:45'),
(69, 18, 43, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-WS039V - giữ tồn kho ngay khi tạo đơn', '2026-07-18 22:42:58'),
(70, 3, 44, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-4FV563 - giữ tồn kho ngay khi tạo đơn', '2026-07-18 22:46:24'),
(71, 1, 45, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260719-0MBZ8V - giữ tồn kho ngay khi tạo đơn', '2026-07-19 12:42:43'),
(72, 1, 46, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260719-81X1AY - giữ tồn kho ngay khi tạo đơn', '2026-07-19 12:42:47'),
(73, 2, 47, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260719-G9BL88 - giữ tồn kho ngay khi tạo đơn', '2026-07-19 14:53:54'),
(74, 2, 48, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260719-MOXETA - giữ tồn kho ngay khi tạo đơn', '2026-07-19 15:32:43'),
(75, 1, 49, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260719-9RE0DK - giữ tồn kho ngay khi tạo đơn', '2026-07-19 18:09:16'),
(76, 36, NULL, 1, 100, 'IMPORT', 'Nhập phôi áo thun đen size M', '2026-07-19 19:32:03'),
(77, 35, NULL, 3, 200, 'IMPORT', 'Áo nhóm bạn thân', '2026-07-19 19:32:24'),
(78, 5, 50, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260731-RBCS11 - giữ tồn kho ngay khi tạo đơn', '2026-07-31 21:46:21'),
(79, 20, 52, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260731-2TZASK - giữ tồn kho ngay khi tạo đơn', '2026-07-31 21:53:37'),
(80, 20, 53, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260731-922GFY - giữ tồn kho ngay khi tạo đơn', '2026-07-31 21:53:37'),
(81, 17, 54, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260731-H3CSQW - giữ tồn kho ngay khi tạo đơn', '2026-07-31 22:01:16'),
(82, 17, 55, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260731-E03SKC - giữ tồn kho ngay khi tạo đơn', '2026-07-31 22:01:16'),
(83, 1, 56, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260731-4321A8 - giữ tồn kho ngay khi tạo đơn', '2026-07-31 23:02:59'),
(84, 8, 56, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260731-4321A8 - giữ tồn kho ngay khi tạo đơn', '2026-07-31 23:02:59'),
(85, 18, 56, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260731-4321A8 - giữ tồn kho ngay khi tạo đơn', '2026-07-31 23:02:59'),
(86, 14, NULL, 3, 10, 'IMPORT', 'Áo nhóm bạn thân', '2026-08-01 21:48:30'),
(87, 14, NULL, 1, 70, 'IMPORT', 'Thiết kế mẫu số 2', '2026-08-01 21:48:49'),
(88, 15, NULL, 3, 2, 'IMPORT', 'Sản phẩm thử nghiệm', '2026-08-01 22:08:50'),
(89, 18, NULL, 1, 10, 'IMPORT', '', '2026-08-01 22:12:24'),
(90, 23, NULL, 3, 10, 'IMPORT', '', '2026-08-01 22:12:37'),
(91, 23, 57, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260801-KSI336 - giữ tồn kho ngay khi tạo đơn', '2026-08-01 22:49:09'),
(92, 23, 58, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260802-R09EOG - giữ tồn kho ngay khi tạo đơn', '2026-08-02 14:06:31'),
(93, 1, 59, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260802-RF6Q18 - giữ tồn kho ngay khi tạo đơn', '2026-08-02 20:10:39'),
(94, 17, 59, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260802-RF6Q18 - giữ tồn kho ngay khi tạo đơn', '2026-08-02 20:10:39'),
(95, 8, 59, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260802-RF6Q18 - giữ tồn kho ngay khi tạo đơn', '2026-08-02 20:10:39'),
(96, 7, 59, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260802-RF6Q18 - giữ tồn kho ngay khi tạo đơn', '2026-08-02 20:10:39'),
(97, 15, 60, NULL, -4, 'EXPORT', 'Tạo đơn hàng TS-20260803-UXCMTR - giữ tồn kho ngay khi tạo đơn', '2026-08-03 21:56:06'),
(98, 23, 57, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #57', '2026-08-04 12:41:56'),
(99, 1, 59, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #59', '2026-08-04 12:42:22'),
(100, 17, 59, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #59', '2026-08-04 12:42:22'),
(101, 8, 59, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #59', '2026-08-04 12:42:22'),
(102, 7, 59, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #59', '2026-08-04 12:42:22'),
(103, 2, 61, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-533RAN - giữ tồn kho ngay khi tạo đơn', '2026-08-05 12:27:05'),
(104, 2, 62, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-TSXWSS - giữ tồn kho ngay khi tạo đơn', '2026-08-05 12:51:06'),
(105, 38, NULL, 3, 100, 'IMPORT', '', '2026-08-05 18:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `orderhistory`
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
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(18, 10, 'PENDING', 'COMPLETED', 'STATUS_CHANGED', 9, 'ADMIN', 'Quản Trị Viên', NULL, '2026-06-03 14:00:00'),
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
(34, 18, NULL, 'PENDING', 'Khách hàng đặt đơn', 1, 'CUSTOMER', 'Nguyễn Minh Anh', 'Đang chờ khách hoàn tất MOMO.', '2026-06-17 10:00:00'),
(36, 20, NULL, 'PENDING', 'Khách hàng đặt đơn', NULL, 'CUSTOMER', 'Nguyễn Đăng', 'Khách hàng đặt đơn', '2026-07-11 06:15:47'),
(37, 21, NULL, 'PENDING', 'CREATED', 21, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:16:32'),
(38, 22, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:42:13'),
(39, 23, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:42:13'),
(40, 24, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:43:17'),
(41, 25, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:43:17'),
(42, 26, NULL, 'PENDING', 'CREATED', 21, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:49:53'),
(43, 27, NULL, 'PENDING', 'CREATED', 21, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:50:59'),
(44, 28, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:53:28'),
(45, 29, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 17:53:28'),
(46, 30, NULL, 'PENDING', 'CREATED', 21, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 18:05:25'),
(52, 36, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 21:47:28'),
(53, 37, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 21:50:02'),
(54, 38, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 21:50:02'),
(55, 39, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 21:51:05'),
(56, 40, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 21:51:05'),
(57, 41, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 21:51:45'),
(58, 42, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 21:51:45'),
(59, 43, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Admin Chính', 'Tạo đơn cho khách', '2026-07-18 22:42:58'),
(60, 44, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Admin Chính', 'Tạo đơn cho khách', '2026-07-18 22:46:24'),
(61, 45, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-19 12:42:43'),
(62, 46, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-19 12:42:47'),
(63, 47, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-07-19 14:53:54'),
(64, 47, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-07-19 14:56:44'),
(65, 48, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-07-19 15:32:43'),
(66, 48, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-07-19 15:33:46'),
(67, 49, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-07-19 18:09:16'),
(68, 49, 'PENDING', 'PENDING', 'DESIGN_REVISION_REQUESTED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Yêu cầu khách chỉnh sửa thiết kế: aaaaaaaaaa', '2026-07-19 18:10:38'),
(69, 49, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-07-19 18:11:05'),
(70, 45, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'PRODUCTION', 'Phan Văn C', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-07-19 18:38:59'),
(71, 46, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-07-31 19:59:38'),
(72, 42, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-07-31 20:00:02'),
(73, 39, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'PRODUCTION', 'Trần Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-07-31 20:00:36'),
(74, 46, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-07-31 20:07:06'),
(75, 50, NULL, 'PENDING', 'CREATED', 27, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-31 21:46:21'),
(77, 52, NULL, 'PENDING', 'CREATED', 28, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-31 21:53:37'),
(78, 53, NULL, 'PENDING', 'CREATED', 28, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-31 21:53:37'),
(79, 54, NULL, 'PENDING', 'CREATED', 28, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-31 22:01:16'),
(80, 55, NULL, 'PENDING', 'CREATED', 28, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-31 22:01:16'),
(81, 50, 'PENDING', 'PENDING', 'DESIGN_REVISION_REQUESTED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Yêu cầu khách chỉnh sửa thiết kế: chua dat', '2026-07-31 22:13:58'),
(82, 56, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-07-31 23:02:59'),
(83, 56, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-01 15:06:32'),
(84, 50, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-01 15:14:18'),
(85, 44, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-01 15:25:42'),
(86, 50, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-01 16:03:43'),
(87, 50, 'PROCESSING', 'READY_TO_SHIP', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đang xử lý in → Chờ giao', '2026-08-01 16:03:49'),
(88, 49, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-01 16:04:24'),
(89, 54, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-01 16:14:59'),
(90, 54, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-01 16:15:03'),
(91, 56, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-01 16:18:28'),
(92, 48, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'PRODUCTION', 'Trần Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-01 16:20:39'),
(93, 57, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-08-01 22:49:09'),
(94, 58, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-08-02 14:06:31'),
(95, 9, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-02 14:18:39'),
(96, 9, 'CONFIRMED', 'READY_TO_SHIP', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Chờ giao', '2026-08-02 14:18:43'),
(97, 9, 'READY_TO_SHIP', 'SHIPPING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ giao → Đang giao hàng (ĐVVC: Ahamove - Mã: aa)', '2026-08-02 14:18:52'),
(98, 9, 'SHIPPING', 'COMPLETED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đang giao hàng → Hoàn tất', '2026-08-02 14:18:56'),
(99, 58, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-02 14:34:40'),
(100, 58, 'CONFIRMED', 'READY_TO_SHIP', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Chờ giao', '2026-08-02 14:34:43'),
(101, 58, 'READY_TO_SHIP', 'SHIPPING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ giao → Đang giao hàng (ĐVVC: J&T Express - Mã: bbb)', '2026-08-02 14:34:50'),
(102, 58, 'SHIPPING', 'COMPLETED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đang giao hàng → Hoàn tất', '2026-08-02 14:34:53'),
(103, 59, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-08-02 20:10:39'),
(104, 59, 'PENDING', 'PENDING', 'VNPAY_PAYMENT_RECREATED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Admin đã khởi tạo lại mã thanh toán VNPAY', '2026-08-03 12:19:42'),
(105, 57, 'PENDING', 'PENDING', 'VNPAY_PAYMENT_RECREATED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Admin đã khởi tạo lại mã thanh toán VNPAY', '2026-08-03 12:29:33'),
(106, 59, 'PENDING', 'PENDING', 'VNPAY_PAYMENT_RECREATED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Admin đã khởi tạo lại mã thanh toán VNPAY', '2026-08-03 12:41:22'),
(107, 59, 'PENDING', 'PENDING', 'VNPAY_PAYMENT_RECREATED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Admin đã khởi tạo lại mã thanh toán VNPAY', '2026-08-03 12:45:46'),
(108, 60, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-08-03 21:56:06'),
(109, 50, 'READY_TO_SHIP', 'SHIPPING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ giao → Đang giao hàng (ĐVVC: aaaaaaaaaaaaa - Mã: aab)', '2026-08-04 12:24:33'),
(110, 57, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Đã hủy đơn hàng – Lý do: aaaaaaaa', '2026-08-04 12:41:56'),
(111, 59, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Đã hủy đơn hàng – Lý do: [TECH_ADJUST] aaaaaaaaaa', '2026-08-04 12:42:22'),
(112, 2, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-04 19:59:52'),
(113, 61, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-08-05 12:27:05'),
(114, 61, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-05 12:27:38'),
(115, 61, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-05 12:27:42'),
(116, 62, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Tạo đơn cho khách', '2026-08-05 12:51:06'),
(117, 62, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-05 12:51:39'),
(118, 62, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Nguyễn Thanh Hiếu', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-05 12:51:51');

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
  `productionStatus` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WAITING_DESIGN_APPROVAL',
  PRIMARY KEY (`id`),
  KEY `idx_order_item_order_id` (`orderId`),
  KEY `idx_order_item_variant_id` (`variantId`),
  KEY `idx_order_item_design_id` (`designId`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderitem`
--

INSERT INTO `orderitem` (`id`, `orderId`, `variantId`, `designId`, `quantity`, `unitPrice`, `designFee`, `lineTotal`, `productionStatus`) VALUES
(1, 1, 10, 1, 3, 150000.00, 150000.00, 600000.00, 'PROCESSING'),
(2, 2, 14, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(3, 3, 20, 2, 8, 180000.00, 200000.00, 1640000.00, 'READY_TO_SHIP'),
(4, 4, 8, NULL, 4, 120000.00, 0.00, 480000.00, 'COMPLETED'),
(5, 5, 2, 3, 3, 120000.00, 100000.00, 460000.00, 'READY_TO_PRINT'),
(6, 6, 12, 4, 3, 150000.00, 120000.00, 570000.00, 'PRINTING'),
(7, 7, 1, NULL, 3, 120000.00, 0.00, 360000.00, 'SHIPPING'),
(8, 8, 2, NULL, 2, 120000.00, 0.00, 240000.00, 'CANCELLED'),
(9, 9, 22, NULL, 2, 150000.00, 0.00, 300000.00, 'WAITING_DESIGN_APPROVAL'),
(10, 10, 6, NULL, 5, 120000.00, 0.00, 600000.00, 'COMPLETED'),
(11, 11, 21, 12, 4, 180000.00, 180000.00, 900000.00, 'READY_TO_PRINT'),
(12, 12, 23, 14, 3, 180000.00, 100000.00, 640000.00, 'PRINTING'),
(13, 13, 15, 16, 2, 280000.00, 150000.00, 710000.00, 'READY_TO_PRINT'),
(14, 14, 3, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(15, 15, 17, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(16, 16, 24, NULL, 2, 180000.00, 0.00, 360000.00, 'COMPLETED'),
(17, 17, 18, 17, 2, 280000.00, 180000.00, 740000.00, 'PACKED'),
(18, 18, 15, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(20, 20, 21, NULL, 1, 180000.00, 0.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(21, 21, 1, NULL, 2, 120000.00, 0.00, 240000.00, 'WAITING_DESIGN_APPROVAL'),
(22, 22, 20, NULL, 1, 180000.00, 0.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(23, 23, 20, NULL, 1, 180000.00, 0.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(24, 24, 21, NULL, 2, 180000.00, 0.00, 360000.00, 'WAITING_DESIGN_APPROVAL'),
(25, 25, 21, NULL, 2, 180000.00, 0.00, 360000.00, 'WAITING_DESIGN_APPROVAL'),
(26, 26, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(27, 27, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(28, 28, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(29, 29, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(30, 30, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(36, 36, 21, NULL, 2, 180000.00, 0.00, 360000.00, 'WAITING_DESIGN_APPROVAL'),
(37, 37, 1, NULL, 2, 120000.00, 0.00, 240000.00, 'WAITING_DESIGN_APPROVAL'),
(38, 38, 1, NULL, 2, 120000.00, 0.00, 240000.00, 'WAITING_DESIGN_APPROVAL'),
(39, 39, 1, NULL, 2, 120000.00, 0.00, 240000.00, 'WAITING_DESIGN_APPROVAL'),
(40, 40, 1, NULL, 2, 120000.00, 0.00, 240000.00, 'WAITING_DESIGN_APPROVAL'),
(41, 41, 1, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(42, 42, 1, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(43, 43, 18, 17, 1, 280000.00, 180000.00, 460000.00, 'WAITING_DESIGN_APPROVAL'),
(44, 44, 3, 27, 1, 120000.00, 60000.00, 180000.00, 'READY_TO_PRINT'),
(45, 45, 1, 28, 1, 120000.00, 0.00, 120000.00, 'READY_TO_PRINT'),
(46, 46, 1, 28, 1, 120000.00, 0.00, 120000.00, 'READY_TO_PRINT'),
(47, 47, 2, 29, 1, 120000.00, 60000.00, 180000.00, 'PRINTING'),
(48, 48, 2, 30, 1, 120000.00, 60000.00, 180000.00, 'READY_TO_PRINT'),
(49, 49, 1, 31, 1, 120000.00, 60000.00, 180000.00, 'PRINTED'),
(50, 50, 5, 32, 1, 120000.00, 0.00, 120000.00, 'READY_TO_PRINT'),
(52, 52, 20, NULL, 1, 180000.00, 0.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(53, 53, 20, NULL, 1, 180000.00, 0.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(54, 54, 17, 34, 1, 280000.00, 0.00, 280000.00, 'PRINTED'),
(55, 55, 17, 34, 1, 280000.00, 0.00, 280000.00, 'READY_TO_PRINT'),
(56, 56, 1, 35, 1, 120000.00, 60000.00, 180000.00, 'READY_TO_PRINT'),
(57, 56, 8, 36, 1, 120000.00, 60000.00, 180000.00, 'READY_TO_PRINT'),
(58, 56, 18, 34, 1, 280000.00, 0.00, 280000.00, 'PRINTED'),
(59, 57, 23, 14, 1, 180000.00, 100000.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(60, 58, 23, NULL, 1, 180000.00, 0.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(61, 59, 1, 35, 1, 120000.00, 60000.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(62, 59, 17, 34, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(63, 59, 8, 36, 1, 120000.00, 60000.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(64, 59, 7, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(65, 60, 15, 16, 4, 310000.00, 150000.00, 1390000.00, 'WAITING_DESIGN_APPROVAL'),
(66, 61, 2, 48, 1, 160000.00, 100000.00, 260000.00, 'READY_TO_PRINT'),
(67, 62, 2, 49, 1, 160000.00, 10000.00, 170000.00, 'READY_TO_PRINT');

-- --------------------------------------------------------

--
-- Table structure for table `orderproduction`
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderproduction`
--

INSERT INTO `orderproduction` (`id`, `orderItemId`, `designId`, `status`, `note`, `approvedAt`, `printedAt`, `packedAt`, `createdAt`) VALUES
(1, 1, 1, 'PROCESSING', 'Đã nhận file in, đang chuẩn bị máy in DTG', '2026-06-03 10:30:00', NULL, NULL, '2026-06-03 08:24:00'),
(2, 3, 2, 'PACKED', 'Đồng phục công ty XYZ – 8 áo, đã kiểm tra chất lượng', '2026-06-02 14:10:00', '2026-06-02 16:00:00', '2026-06-03 08:30:00', '2026-06-02 13:40:00'),
(3, 5, 3, 'APPROVED', 'Đã duyệt thiết kế, chờ gửi thông số xuống xưởng', '2026-06-03 11:00:00', NULL, NULL, '2026-06-03 10:15:00'),
(4, 6, 4, 'PRINTING', 'Đang in lụa, dự kiến xong chiều nay', '2026-06-02 15:00:00', NULL, NULL, '2026-06-02 14:30:00'),
(5, 11, 12, 'APPROVED', 'Thiết kế đã duyệt, đơn đang chờ gửi thông số xuống xưởng.', '2026-06-14 12:00:00', NULL, NULL, '2026-06-14 11:00:00'),
(6, 12, 14, 'PRINTING', 'Xưởng đang in DTG theo mẫu đã duyệt.', '2026-06-15 11:00:00', NULL, NULL, '2026-06-15 10:00:00'),
(7, 13, 16, 'APPROVED', 'Đã duyệt mẫu, đang nằm trong hàng chờ gửi xưởng.', '2026-06-15 14:00:00', NULL, NULL, '2026-06-15 13:00:00'),
(8, 14, NULL, 'WAITING_DESIGN_APPROVAL', 'Đơn áo trơn, chờ xác nhận yêu cầu sản xuất.', NULL, NULL, NULL, '2026-06-16 09:00:00'),
(9, 15, NULL, 'WAITING_DESIGN_APPROVAL', 'Chưa chuyển sản xuất do thanh toán MOMO thất bại.', NULL, NULL, NULL, '2026-06-16 10:00:00'),
(10, 17, 17, 'PACKED', 'Đã in xong, kiểm tra chất lượng và đóng gói.', '2026-06-17 09:00:00', '2026-06-17 15:00:00', '2026-06-18 07:30:00', '2026-06-17 08:00:00'),
(14, 45, 28, 'APPROVED', NULL, '2026-07-19 18:38:59', NULL, NULL, '2026-07-19 12:42:43'),
(15, 46, 28, 'APPROVED', NULL, '2026-07-31 19:59:38', NULL, NULL, '2026-07-19 12:42:47'),
(16, 47, 29, 'PRINTING', NULL, '2026-07-19 14:56:44', NULL, NULL, '2026-07-19 14:56:44'),
(17, 48, 30, 'APPROVED', NULL, '2026-07-19 15:33:46', NULL, NULL, '2026-07-19 15:33:46'),
(18, 49, 31, 'PRINTED', NULL, '2026-07-19 18:11:05', '2026-08-01 16:04:45', NULL, '2026-07-19 18:11:05'),
(21, 54, 34, 'PRINTED', NULL, '2026-08-01 16:14:59', '2026-08-01 16:17:07', NULL, '2026-07-31 22:01:16'),
(22, 55, 34, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-07-31 22:01:16'),
(23, 56, 35, 'APPROVED', NULL, '2026-08-01 15:06:32', NULL, NULL, '2026-08-01 15:06:32'),
(24, 57, 36, 'APPROVED', NULL, '2026-08-01 15:06:32', NULL, NULL, '2026-08-01 15:06:32'),
(25, 58, 34, 'PRINTED', NULL, '2026-08-01 15:06:32', '2026-08-01 16:18:46', NULL, '2026-08-01 15:06:32'),
(26, 50, 32, 'APPROVED', NULL, '2026-08-01 15:14:18', NULL, NULL, '2026-08-01 15:14:18'),
(27, 44, 27, 'APPROVED', NULL, '2026-08-01 15:25:42', NULL, NULL, '2026-08-01 15:25:42'),
(28, 66, 48, 'APPROVED', NULL, '2026-08-05 12:27:38', NULL, NULL, '2026-08-05 12:27:38'),
(29, 67, 49, 'APPROVED', NULL, '2026-08-05 12:51:39', NULL, NULL, '2026-08-05 12:51:39');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
CREATE TABLE IF NOT EXISTS `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `paymentMethod` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Phương thức thanh toán dùng chung: COD, VNPAY, MOMO, BANK_TRANSFER',
  `paymentType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `transactionId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidAt` datetime DEFAULT NULL,
  `gatewayResponse` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '[FROM ADMIN] Ghi chú kế toán của admin',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_transaction_id` (`transactionId`),
  KEY `idx_payment_order_id` (`orderId`),
  KEY `idx_payment_method_status_created_at` (`paymentMethod`,`status`,`createdAt`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`id`, `orderId`, `amount`, `paymentMethod`, `paymentType`, `status`, `transactionId`, `paidAt`, `gatewayResponse`, `note`, `createdAt`) VALUES
(1, 1, 570000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260603001', '2026-06-03 08:30:00', NULL, NULL, '2026-06-03 08:25:00'),
(2, 2, 310000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-06-03 09:05:00'),
(3, 3, 1640000.00, 'BANK_TRANSFER', 'FULL_PAYMENT', 'COMPLETED', 'CK20260602001', '2026-06-02 14:00:00', NULL, NULL, '2026-06-02 13:45:00'),
(4, 4, 510000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260531001', '2026-05-31 15:30:00', NULL, NULL, '2026-05-31 15:25:00'),
(5, 5, 490000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-06-03 10:15:00'),
(6, 6, 600000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260602001', '2026-06-02 14:35:00', NULL, NULL, '2026-06-02 14:31:00'),
(7, 7, 390000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-06-01 16:45:00'),
(8, 8, 270000.00, 'COD', 'COD_FINAL', 'CANCELLED', NULL, NULL, NULL, NULL, '2026-06-01 09:00:00'),
(9, 9, 330000.00, 'COD', 'COD_FINAL', 'COMPLETED', NULL, '2026-08-02 14:19:34', NULL, NULL, '2026-06-03 11:00:00'),
(10, 10, 550000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260530001', '2026-05-30 08:15:00', NULL, NULL, '2026-05-30 08:05:00'),
(11, 11, 450000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'VNP202606140138', '2026-06-14 11:08:00', '{\"vnp_ResponseCode\":\"00\",\"vnp_TransactionNo\":\"2606140138\",\"vnp_BankCode\":\"NCB\"}', 'Đã thanh toán cọc 50% qua VNPAY.', '2026-06-14 11:00:00'),
(12, 12, 320000.00, 'MOMO', 'DEPOSIT', 'COMPLETED', 'MOMO202606150139', '2026-06-15 10:06:00', '{\"resultCode\":0,\"message\":\"Successful\",\"transId\":\"2606150139\"}', 'Đã thanh toán cọc 50% qua MOMO.', '2026-06-15 10:00:00'),
(13, 13, 740000.00, 'MOMO', 'FULL_PAYMENT', 'COMPLETED', 'MOMO202606150140', '2026-06-15 13:05:00', '{\"resultCode\":0,\"message\":\"Successful\",\"transId\":\"2606150140\"}', 'Đã thanh toán toàn bộ qua MOMO.', '2026-06-15 13:00:00'),
(14, 14, 150000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'VNP202606160141', NULL, '{\"paymentUrlExpiresAt\":\"2026-06-16T09:15:00+07:00\",\"vnp_ResponseId\":\"50788434a80640c394313e6f254de09a\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"VNP202606160141\",\"vnp_SecureHash\":\"dbee5f6e1c591bfc94d10b3cbc5b0c4fc00b0b24c45b657c0622d5924e54de14e81d3a103ad7a3e0054091472f99624a5b19cc0118d2f825c9a47d13b90b6cb9\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:16.535Z\"}', 'Đang chờ khách hoàn tất VNPAY.', '2026-06-16 09:00:00'),
(15, 15, 310000.00, 'MOMO', 'FULL_PAYMENT', 'FAILED', 'MOMO202606160142', NULL, '{\"resultCode\":1006,\"message\":\"User denied payment\"}', 'Giao dịch MOMO thất bại; cho phép tạo lại mã thanh toán.', '2026-06-16 10:00:00'),
(16, 16, 390000.00, 'COD', 'COD_FINAL', 'PENDING_RECONCILIATION', NULL, NULL, NULL, 'Đơn đã giao, đang chờ kế toán xác nhận tiền COD từ đơn vị vận chuyển.', '2026-06-18 16:30:00'),
(17, 17, 385000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'VNP202606170144', '2026-06-17 08:08:00', '{\"vnp_ResponseCode\":\"00\",\"vnp_TransactionNo\":\"2606170144\",\"vnp_BankCode\":\"VCB\"}', 'Đã thu cọc 50% qua VNPAY.', '2026-06-17 08:00:00'),
(18, 17, 385000.00, 'COD', 'COD_FINAL', 'COMPLETED', NULL, '2026-08-02 13:09:27', NULL, 'Phần tiền còn lại sau đặt cọc đang chờ đối soát COD.', '2026-06-19 15:00:00'),
(19, 18, 310000.00, 'MOMO', 'FULL_PAYMENT', 'FAILED', 'MOMO202606170145', NULL, '{\"payUrlExpiresAt\":\"2026-06-17T10:15:00+07:00\",\"partnerCode\":\"MOMO\",\"orderId\":\"MOMO202606170145\",\"requestId\":null,\"responseTime\":1784383999406,\"resultCode\":1005,\"message\":\"Giao dịch đã hết hạn hoặc không tồn tại.\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T14:13:46.554Z\"}', 'Đang chờ khách hoàn tất MOMO.', '2026-06-17 10:00:00'),
(20, 20, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260711QNGUL9', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260711061547&vnp_CurrCode=VND&vnp_ExpireDate=20260711063047&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260711-QNGUL9&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260711QNGUL9&vnp_Version=2.1.0&vnp_SecureHash=62c6bd82d53fc33b7e688154f6221d016af0bb58f293e63e1379579f381da9dcd8f2e477fa04d1998575a0173f667d6643628b6d94170f3dd3f7abc8358292f4\",\"expiresAt\":\"2026-07-10T23:30:47.623Z\",\"transactionRef\":\"TS20260711QNGUL9\",\"transactionDate\":\"20260711061547\",\"vnp_Amount\":\"21500000\",\"vnp_BankCode\":\"VNPAY\",\"vnp_CardType\":\"QRCODE\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260711-QNGUL9\",\"vnp_PayDate\":\"20260711061546\",\"vnp_ResponseCode\":\"24\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"0\",\"vnp_TransactionStatus\":\"02\",\"vnp_TxnRef\":\"TS20260711QNGUL9\",\"vnp_SecureHash\":\"c1ec2d7fb6a49084bc29d891d7c65d46bc49203a0cd9e1056fc3b44100939b29a0ac395345c9db3803f2d31ee1fe97d689c9e86eae104f244f0cb5cd7d31df79\"}', NULL, '2026-07-11 06:15:47'),
(21, 21, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 17:16:32'),
(22, 22, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'undefinedMROT6HN6ADC03E58', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260717174213&vnp_CurrCode=VND&vnp_ExpireDate=20260717175713&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=ae37cef809f7330a54328bf17fe4c380a5d476e3a650c2683313d36b9818075a3d735232e126ae353568ffe1ef6664716b428a536d1912ff2a895f99abd60f18\",\"expiresAt\":\"2026-07-17T10:57:13.074Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174213\"},\"transactionRef\":\"undefinedMROT6HN6ADC03E58\",\"vnp_ResponseId\":\"0fe17d2f23c945f998ee89c64da2ea35\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT6HN6ADC03E58\",\"vnp_SecureHash\":\"8cb43c23f6c89ca3677818090ac852a66834f405a582d198006fc5bf81e00e2bc2a63e76b1b512b9f60ef12325f71f5d47ef74663afd9cc9341c120a8d1a1817\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:16.981Z\"}', NULL, '2026-07-17 17:42:13'),
(23, 23, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'undefinedMROT6HNX9E0E3728', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260717174213&vnp_CurrCode=VND&vnp_ExpireDate=20260717175713&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=ae37cef809f7330a54328bf17fe4c380a5d476e3a650c2683313d36b9818075a3d735232e126ae353568ffe1ef6664716b428a536d1912ff2a895f99abd60f18\",\"expiresAt\":\"2026-07-17T10:57:13.101Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174213\"},\"transactionRef\":\"undefinedMROT6HNX9E0E3728\",\"vnp_ResponseId\":\"9d35f9127d7248ee9a8a85da23af16c9\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT6HNX9E0E3728\",\"vnp_SecureHash\":\"5c9b108a490ccebb92ae327cfd7ca3d1113a3eebae1f5f789235fdc8c5cafb3d5a54b695c9e627fb7431750f2b895237106c2ec33381a1b779c7d2956c9f3605\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.081Z\"}', NULL, '2026-07-17 17:42:13'),
(24, 24, 395000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'undefinedMROT7V6Q72ECAF17', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=39500000&vnp_Command=pay&vnp_CreateDate=20260717174317&vnp_CurrCode=VND&vnp_ExpireDate=20260717175817&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=19f9db8f693ab2c83ce4bce0265120bb5f5bff587829cb740e2366dedc75d4c1215e1407a34c7bf0134f2f8233e76ee39b45b9d9a00a02f691b75807436404fc\",\"expiresAt\":\"2026-07-17T10:58:17.282Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174317\"},\"transactionRef\":\"undefinedMROT7V6Q72ECAF17\",\"vnp_ResponseId\":\"dddaa6c317954bee9cc94f902a2e6cf6\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT7V6Q72ECAF17\",\"vnp_SecureHash\":\"a8a75b75f50644c38fe7f2debf78355e3379e2343d68a105e2026a7d3deaa6e04b033d425de7f0eed5eb054661413371d2aa75e9b56eea7c6e0da69ca09a6119\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.181Z\"}', NULL, '2026-07-17 17:43:17'),
(25, 25, 395000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'undefinedMROT7V9SF5D9E73D', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=39500000&vnp_Command=pay&vnp_CreateDate=20260717174317&vnp_CurrCode=VND&vnp_ExpireDate=20260717175817&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=19f9db8f693ab2c83ce4bce0265120bb5f5bff587829cb740e2366dedc75d4c1215e1407a34c7bf0134f2f8233e76ee39b45b9d9a00a02f691b75807436404fc\",\"expiresAt\":\"2026-07-17T10:58:17.392Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174317\"},\"transactionRef\":\"undefinedMROT7V9SF5D9E73D\",\"vnp_ResponseId\":\"6dc6196706e54baf8fe293d22ccd8fef\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT7V9SF5D9E73D\",\"vnp_SecureHash\":\"eca0f58f9263cc87e67cc5da467957bd1bb6ac2461e0bee01e272858a6a664d661e1f64ff74896350d03b61d98dc19085d55d81a73fd070573128a46109bffd5\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.297Z\"}', NULL, '2026-07-17 17:43:17'),
(26, 26, 120000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS202607175RPGIL', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=12000000&vnp_Command=pay&vnp_CreateDate=20260717174953&vnp_CurrCode=VND&vnp_ExpireDate=20260717180453&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-5RPGIL&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607175RPGIL&vnp_Version=2.1.0&vnp_SecureHash=a3dd83e6ebddb68e330c3b40f601024f199f42686f15da9050da484f8898e92eb678135728dc8e9b319c207a76cd3609e0bc2134add3e71e6c204058ae62f44f\",\"expiresAt\":\"2026-07-17T11:04:53.181Z\",\"transactionRef\":\"TS202607175RPGIL\",\"transactionDate\":\"20260717174953\",\"vnp_ResponseId\":\"5cb44a06c00246e3b8b66e29488bf837\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS202607175RPGIL\",\"vnp_SecureHash\":\"938651b270ed36f8b0b2ee46b91036fb8e6cad097883eb78ea8d5fa3ab3e46b9cce3f61ef136119ced26a8fc9092b8c9a9c783644f73edee7e0f7d96f2e5b067\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.388Z\"}', NULL, '2026-07-17 17:49:53'),
(27, 27, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 17:50:59'),
(28, 28, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS20260717ZG56AI', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260717175328&vnp_CurrCode=VND&vnp_ExpireDate=20260717180828&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-ZG56AI&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260717ZG56AI&vnp_Version=2.1.0&vnp_SecureHash=f6bbd58b3e6a940273a5b998b1fe3935959fdf3c7b528e1224af6671991ce9074653d987c6ed7ab210ddd12ae7a1d3a7ea1351e9df9708f54123c30910393450\",\"expiresAt\":\"2026-07-17T11:08:28.655Z\",\"transactionRef\":\"TS20260717ZG56AI\",\"transactionDate\":\"20260717175328\",\"vnp_ResponseId\":\"6846fa5196c04878b532b71f255b94db\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260717ZG56AI\",\"vnp_SecureHash\":\"4d9c20567c935734cc0fc61be19ff168e478010a4baff6e788d97e51be17fe70ca3797125b38ab4e16f3a2d48deba790d2598f90902ca9363bd99c2e3f33deec\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.488Z\"}', NULL, '2026-07-17 17:53:28'),
(29, 29, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260717IQLQ8P', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260717175328&vnp_CurrCode=VND&vnp_ExpireDate=20260717180828&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-IQLQ8P&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260717IQLQ8P&vnp_Version=2.1.0&vnp_SecureHash=e44ab09ad703d3595f18b4752264ad6f20eccaeb5b6971632b47f180e21223065a85f826277e6af11bdcdc94b718f1af895880afdc7a25dc2058add2995829a8\",\"expiresAt\":\"2026-07-17T11:08:28.704Z\",\"transactionRef\":\"TS20260717IQLQ8P\",\"transactionDate\":\"20260717175328\",\"vnp_ResponseId\":\"cbb92e8523224ab5b7bab19d9e110dc4\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260717IQLQ8P\",\"vnp_Amount\":\"15500000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260717-IQLQ8P\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260717175327\",\"vnp_TransactionNo\":\"5385178\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"d730697cce3f982613f8a270c8b86f5b59b4f34489e9acae051836f30931ad363febe5a513be5dc22eecddf6b88d7b089b0a5390284a4d86f7af29af5b6f8d65\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-17T11:44:53.669Z\"}', NULL, '2026-07-17 17:53:28'),
(30, 30, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 18:05:25'),
(36, 36, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-18 21:47:28'),
(37, 37, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-18 21:50:02'),
(38, 38, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-18 21:50:02'),
(39, 39, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-18 21:51:05'),
(40, 40, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-18 21:51:05'),
(41, 41, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260718DHZCTT', '2026-07-18 21:56:03', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260718215145&vnp_CurrCode=VND&vnp_ExpireDate=20260718220645&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260718-DHZCTT&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260718DHZCTT&vnp_Version=2.1.0&vnp_SecureHash=3960bf5c185273612bdf0db1ff5b7f827110b02a978253e8b395ad85b51d393a6763313302ed0e45a3fddb001b4977e8aa41841c7b294656d5229c2f49f93d9f\",\"expiresAt\":\"2026-07-18T15:06:45.016Z\",\"transactionRef\":\"TS20260718DHZCTT\",\"transactionDate\":\"20260718215145\",\"vnp_Amount\":\"15500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626409\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260718-DHZCTT\",\"vnp_PayDate\":\"20260718215529\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626409\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260718DHZCTT\",\"vnp_SecureHash\":\"732fa8154b6b5a38bfbdcc0f3dcf93d7c7767cbd04fc627a9a9cbef7eac2dcdd34a088f7de8f39fe4bcf8688ce55e91b2af75d5a9e5b82ec3dacfcf35629cb25\"}', NULL, '2026-07-18 21:51:45'),
(42, 42, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS20260718AHRIBV', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260718215145&vnp_CurrCode=VND&vnp_ExpireDate=20260718220645&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260718-AHRIBV&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260718AHRIBV&vnp_Version=2.1.0&vnp_SecureHash=016a4d2a01e9eef15772ef8a1b1df00d71e710b22350969018b9266a35d5c66492e7ed5735cefe1357a472713e953a820c3d4ce9bc201f816cb504189f7497c2\",\"expiresAt\":\"2026-07-18T15:06:45.055Z\",\"transactionRef\":\"TS20260718AHRIBV\",\"transactionDate\":\"20260718215145\",\"vnp_ResponseId\":\"60ee1caec97c41aa9776d6f0003da526\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260718AHRIBV\",\"vnp_SecureHash\":\"5b62984ce35a4829d3c946c6c5865865b5860d521617488fe75376c79c9141d3f803f1a9024518fc27cb254a67326447ffeec0bb0a6ba2bd1ae84fa7201e1a0d\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.572Z\"}', NULL, '2026-07-18 21:51:45'),
(43, 43, 230000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'TS20260718WS039V', '2026-07-18 22:43:49', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=23000000&vnp_Command=pay&vnp_CreateDate=20260718224258&vnp_CurrCode=VND&vnp_ExpireDate=20260718225758&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260718-WS039V&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260718WS039V&vnp_Version=2.1.0&vnp_SecureHash=a686592c484a5e465235a8e8cab3eeae4c1db08ea41e8f05e7772654eae2556e726d5efbcd5c6b3b4f2ec6d84f4f086c6f221842f50d45b07300f01d717d566d\",\"expiresAt\":\"2026-07-18T15:57:58.210Z\",\"transactionRef\":\"TS20260718WS039V\",\"transactionDate\":\"20260718224258\",\"vnp_Amount\":\"23000000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626446\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260718-WS039V\",\"vnp_PayDate\":\"20260718224315\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626446\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260718WS039V\",\"vnp_SecureHash\":\"b0288bb1eac2a9ebc691f922abbce87a77d690a216313b36684a6f3642061a2645b0d0b4a41208ee4d7f5b8034a457786fe18fb15e6f5c009e402c0a321d2b93\"}', NULL, '2026-07-18 22:42:58'),
(44, 44, 90000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'TS202607184FV563', '2026-07-18 22:46:48', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=9000000&vnp_Command=pay&vnp_CreateDate=20260718224624&vnp_CurrCode=VND&vnp_ExpireDate=20260718230124&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260718-4FV563&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607184FV563&vnp_Version=2.1.0&vnp_SecureHash=b1a50adae497822477eeb8b3187586c33e9afad2c4fd5237d4513252a2817f68fe3855f8556a2b2b1200a20967ee5c55cb56dc56a0ba94d38ac636d41131658b\",\"expiresAt\":\"2026-07-18T16:01:24.742Z\",\"transactionRef\":\"TS202607184FV563\",\"transactionDate\":\"20260718224624\",\"vnp_Amount\":\"9000000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626449\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260718-4FV563\",\"vnp_PayDate\":\"20260718224616\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626449\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS202607184FV563\",\"vnp_SecureHash\":\"491477adde66bb265990637a8fc7be44f4a727202c80fa60bbea2c15f5da5914b9596ea17d957acede645c4ea23eb56a9ecac57a4540dc125845d80927a199d4\"}', NULL, '2026-07-18 22:46:24'),
(45, 45, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS202607190MBZ8V', '2026-07-19 12:43:20', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260719124243&vnp_CurrCode=VND&vnp_ExpireDate=20260719125743&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260719-0MBZ8V&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607190MBZ8V&vnp_Version=2.1.0&vnp_SecureHash=349a13fe9f94b5257a9018d7fb42ec92752a2e3058eb14faed66f09f271549ea99e258016d3e986277081744ed1eaaa935761bf2d9257061aca9d91c81cbe5b7\",\"expiresAt\":\"2026-07-19T05:57:43.633Z\",\"transactionRef\":\"TS202607190MBZ8V\",\"transactionDate\":\"20260719124243\",\"vnp_Amount\":\"15500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626641\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260719-0MBZ8V\",\"vnp_PayDate\":\"20260719124240\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626641\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS202607190MBZ8V\",\"vnp_SecureHash\":\"30f6d3b3c5789f00a9369159fa20478c60e1448b4d55b7a14e3c12a87a625a8b4e77a03b917db07e7fd19d5266dd58a043013eb3eb74337d1aaba07363e1bd68\"}', NULL, '2026-07-19 12:42:43'),
(46, 46, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS2026071981X1AY', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260719124247&vnp_CurrCode=VND&vnp_ExpireDate=20260719125747&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260719-81X1AY&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS2026071981X1AY&vnp_Version=2.1.0&vnp_SecureHash=9107a32bc127051bec63e94f9e2d2a2198228b4b37315cfc4d657f9eea2f01db0245c902232f1ba9d833acb2972d9b36aba022bfb62022fe371d1aba95a7be65\",\"expiresAt\":\"2026-07-19T05:57:47.050Z\",\"transactionRef\":\"TS2026071981X1AY\",\"transactionDate\":\"20260719124247\",\"vnp_ResponseId\":\"2bee8de9f3f640efbac055bc3dacd5ac\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS2026071981X1AY\",\"vnp_SecureHash\":\"4f12b8bd7d152a87731b149f61bae0f9f22aa838aea24f37d243c0e9f77c94ef587e994bcd2a423a6697f46a3c75bcffa19bb17b330fcf1e22882eec52953476\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.669Z\"}', NULL, '2026-07-19 12:42:47'),
(47, 47, 180000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260719G9BL88', '2026-07-19 14:56:17', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=18000000&vnp_Command=pay&vnp_CreateDate=20260719145354&vnp_CurrCode=VND&vnp_ExpireDate=20260719150854&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260719-G9BL88&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260719G9BL88&vnp_Version=2.1.0&vnp_SecureHash=17777d6785afd777e465743e243f273644fdb2706641a09c84bc2e1a60e98b0ee23f1c2acccff1650a28c1a21ff6e4075f66c62976313dbfdf603896785f7ca3\",\"expiresAt\":\"2026-07-19T08:08:54.035Z\",\"transactionRef\":\"TS20260719G9BL88\",\"transactionDate\":\"20260719145354\",\"vnp_Amount\":\"18000000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626718\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260719-G9BL88\",\"vnp_PayDate\":\"20260719145532\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626718\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260719G9BL88\",\"vnp_SecureHash\":\"3ea3b4f09aa693dfe1639f990e82565b6bf9a31c5d50beadbb471479daca4e797ded1d3c5597d62a6cf6fd3532ccc57aaf05219e11bdfec3ea3bce567627f7b0\"}', NULL, '2026-07-19 14:53:54'),
(48, 48, 180000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260719MOXETA', '2026-07-19 15:33:29', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=18000000&vnp_Command=pay&vnp_CreateDate=20260719153243&vnp_CurrCode=VND&vnp_ExpireDate=20260719154743&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260719-MOXETA&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260719MOXETA&vnp_Version=2.1.0&vnp_SecureHash=ed4bd8f5e22ad857cb534a795b03b23f96543363cc6ceeed8c9d5a851573858794e57c41b8f29104ff128e162e9bc4f3eba70bc7802aed5a1d0ab8682b97cc86\",\"expiresAt\":\"2026-07-19T08:47:43.409Z\",\"transactionRef\":\"TS20260719MOXETA\",\"transactionDate\":\"20260719153243\",\"vnp_Amount\":\"18000000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626748\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260719-MOXETA\",\"vnp_PayDate\":\"20260719153243\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626748\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260719MOXETA\",\"vnp_SecureHash\":\"0ded8f77c360368f0828e27887361bb3c59fe4b22b5f12176ad37dfc1702815087d12ec31ed9bd075898dadedc18b5194686ca30b65422f7fb255e60df6473b7\"}', NULL, '2026-07-19 15:32:43'),
(49, 49, 180000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS202607199RE0DK', '2026-07-19 18:09:59', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=18000000&vnp_Command=pay&vnp_CreateDate=20260719180916&vnp_CurrCode=VND&vnp_ExpireDate=20260719182416&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260719-9RE0DK&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607199RE0DK&vnp_Version=2.1.0&vnp_SecureHash=5ea9ee0255de5fb7fc45ebf98d33d6228271d8140b2e868665b9796f04cdce331d78fbbfbc63713219b8b904dd4a669fd251bd4aa3c2d172920c967de904f993\",\"expiresAt\":\"2026-07-19T11:24:16.590Z\",\"transactionRef\":\"TS202607199RE0DK\",\"transactionDate\":\"20260719180916\",\"vnp_Amount\":\"18000000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626890\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260719-9RE0DK\",\"vnp_PayDate\":\"20260719180918\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626890\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS202607199RE0DK\",\"vnp_SecureHash\":\"489b1a70ee249316de4ef3ecacb2c28639b10515cf023dbbfc3735cfc819f49fa56e069b57f48e9d60e8a0454f83a6e960172b5b1b5c16c58615d38debc235b7\"}', NULL, '2026-07-19 18:09:16'),
(50, 50, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260731RBCS11', '2026-07-31 21:47:02', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260731214621&vnp_CurrCode=VND&vnp_ExpireDate=20260731220121&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260731-RBCS11&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260731RBCS11&vnp_Version=2.1.0&vnp_SecureHash=026b2f8584ceb4ab2737fe07f3647d22c889f7c2b47d4ca9a81e58717caf6a6298855a100c84e5eefe99b1f53950dacd3b7baa28f1d9346bf916baef5ae56fd2\",\"expiresAt\":\"2026-07-31T15:01:21.093Z\",\"transactionRef\":\"TS20260731RBCS11\",\"transactionDate\":\"20260731214621\",\"vnp_Amount\":\"15500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15642889\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260731-RBCS11\",\"vnp_PayDate\":\"20260731214652\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15642889\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260731RBCS11\",\"vnp_SecureHash\":\"3cc77adebcb6264321ef508e4df6e5e1f47db90a4b7e071be0cbf654bd7005409c29cdfda67212a78b83b5af86866d2c7af604bdfca025ed20419de07c7f3210\"}', NULL, '2026-07-31 21:46:21'),
(51, 52, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS202607312TZASK', '2026-07-31 21:54:03', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260731215337&vnp_CurrCode=VND&vnp_ExpireDate=20260731220837&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260731-2TZASK&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607312TZASK&vnp_Version=2.1.0&vnp_SecureHash=9f70207592011ba98ef79d7b78ade1a9fca6bff6f672072dfa870ee1a67ab803bd4fe9e6ae8d4c014a0ebed9795aacf8674e6762d2334a6c46d9cb35bbff8672\",\"expiresAt\":\"2026-07-31T15:08:37.528Z\",\"transactionRef\":\"TS202607312TZASK\",\"transactionDate\":\"20260731215337\",\"vnp_Amount\":\"21500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15642896\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260731-2TZASK\",\"vnp_PayDate\":\"20260731215354\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15642896\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS202607312TZASK\",\"vnp_SecureHash\":\"f48eb71ff289ef5244803e6a0e0e63abcdc0a30727b29d080a67dc4bdc7a8445770577e7c19aeb09c6699f439e4d0cfad237541d1a434c036ef894a2c06f6d2e\"}', NULL, '2026-07-31 21:53:37'),
(52, 53, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260731922GFY', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260731215337&vnp_CurrCode=VND&vnp_ExpireDate=20260731220837&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260731-922GFY&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260731922GFY&vnp_Version=2.1.0&vnp_SecureHash=b8dd116ce9184a13a6095168d29e9276bb69b6bc4fb5d71359b301e7def3e0e7d8b0945d92d1709129502fb23317d9fff783c8110662bd499d22e29445837764\",\"expiresAt\":\"2026-07-31T15:08:37.576Z\",\"transactionRef\":\"TS20260731922GFY\",\"transactionDate\":\"20260731215337\",\"vnp_ResponseId\":\"6cbd04c3633a427a9a94580b0cf8ed90\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260731922GFY\",\"vnp_Amount\":\"21500000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260731-922GFY\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260731215337\",\"vnp_TransactionNo\":\"5415216\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"163cf21b1ff7a502810ded0465ae8c7211d241e1c261a30bfcf5251aef978fac297c14e71b6401cf5a516e9573731509a45b94771fad4d87e5958b17a7925ebd\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-31T15:44:28.241Z\"}', NULL, '2026-07-31 21:53:37'),
(53, 54, 315000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260731H3CSQW', '2026-07-31 22:01:49', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=31500000&vnp_Command=pay&vnp_CreateDate=20260731220116&vnp_CurrCode=VND&vnp_ExpireDate=20260731221616&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260731-H3CSQW&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260731H3CSQW&vnp_Version=2.1.0&vnp_SecureHash=85a3b78cbadfd6fc62d9db37d4ff82fdc8815d1e374cfd9c651c4296e3770046cba5b0af80b44e10954ff0a70d8533c8d5f09d6235adf91049e1877eed808590\",\"expiresAt\":\"2026-07-31T15:16:16.796Z\",\"transactionRef\":\"TS20260731H3CSQW\",\"transactionDate\":\"20260731220116\",\"vnp_Amount\":\"31500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15642901\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260731-H3CSQW\",\"vnp_PayDate\":\"20260731220140\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15642901\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260731H3CSQW\",\"vnp_SecureHash\":\"8bbb0645a4f11eb4bfaa7f431542f4fa2c6cb9b3f3ac0af881daee16d6a3fc16d9e0d771068ba2f8a64405bcac7cb42556db699c00ddf21d8572e1b71585bfa3\"}', NULL, '2026-07-31 22:01:16'),
(54, 55, 315000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260731E03SKC', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=31500000&vnp_Command=pay&vnp_CreateDate=20260731220116&vnp_CurrCode=VND&vnp_ExpireDate=20260731221616&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260731-E03SKC&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260731E03SKC&vnp_Version=2.1.0&vnp_SecureHash=7ba63b5ab3775ad87b20d5a8e3fc77405bfdf4f9e898583a88c09ab1bd2b5a858d476f71e5a2c5874bcfaf8a3ef5e41a6c5a0fecb26705712b02541bc5092598\",\"expiresAt\":\"2026-07-31T15:16:16.832Z\",\"transactionRef\":\"TS20260731E03SKC\",\"transactionDate\":\"20260731220116\",\"vnp_ResponseId\":\"2f921f77dac24a93ada334883c0823ef\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260731E03SKC\",\"vnp_Amount\":\"31500000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260731-E03SKC\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260731220118\",\"vnp_TransactionNo\":\"5415224\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"1624ef06da35a1a57f59b77b215196374a6172d01629f9e51f2fd572348432f76869b2b6afa590f32ef8f29cb0925c0ae0ff6eb5fddd69ce72c13b9c6ad86260\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-31T15:44:28.397Z\"}', NULL, '2026-07-31 22:01:16'),
(55, 56, 640000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS202607314321A8', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=64000000&vnp_Command=pay&vnp_CreateDate=20260731230259&vnp_CurrCode=VND&vnp_ExpireDate=20260731231759&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260731-4321A8&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607314321A8&vnp_Version=2.1.0&vnp_SecureHash=bd913ad4c3da4b495f550abd5445034e11fa79b4258bc569321e3e31e52231f191b1bd40d1f6421f3bd7a84832b5afc877ff0761b6d736fb1fdb68fa3bb5d903\",\"expiresAt\":\"2026-07-31T16:17:59.307Z\",\"transactionRef\":\"TS202607314321A8\",\"transactionDate\":\"20260731230259\",\"vnp_ResponseId\":\"b0abeb8593ad4ecb9e329de9a23388ce\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS202607314321A8\",\"vnp_SecureHash\":\"58b783f955dc1b5c1ad561a99043963a017d454914ddad3ed3f1308b4aebe613057a3f75e5fc163ecc3426e8019d5afba06cf1d32bd418f11a5c73560024bfe1\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.808Z\"}', NULL, '2026-07-31 23:02:59'),
(56, 57, 312000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260801KSI336MSCSHVPW41114B69', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=31200000&vnp_Command=pay&vnp_CreateDate=20260803122933&vnp_CurrCode=VND&vnp_ExpireDate=20260803124433&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260801-KSI336&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260801KSI336MSCSHVPW41114B69&vnp_Version=2.1.0&vnp_SecureHash=133e6d4068c0df84442a30471b06151624ff5628228ad088449fe71c79d845c1128ce3bb78fe21535f1a99b142d6e18b3e35a6926cb1e5d946f8fb681809a70e\",\"expiresAt\":\"2026-08-03T05:44:33.140Z\",\"transactionRef\":\"TS20260801KSI336MSCSHVPW41114B69\",\"transactionDate\":\"20260803122933\",\"vnp_Amount\":\"31200000\",\"vnp_BankCode\":\"VNPAY\",\"vnp_CardType\":\"QRCODE\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260801-KSI336\",\"vnp_PayDate\":\"20260803122928\",\"vnp_ResponseCode\":\"24\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"0\",\"vnp_TransactionStatus\":\"02\",\"vnp_TxnRef\":\"TS20260801KSI336MSCSHVPW41114B69\",\"vnp_SecureHash\":\"b8f0d5feacad26c38465e53909204c6ab1f452af5bd7c1d2aaff4e76f83275fa98338ad3679a62ea06e223765facb809185d2caa5eafbf62fee5f853e892911b\"}', NULL, '2026-08-01 22:49:09'),
(57, 58, 210000.00, 'COD', 'COD_FINAL', 'COMPLETED', NULL, '2026-08-02 14:35:02', NULL, NULL, '2026-08-02 14:06:31'),
(58, 59, 790000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260802RF6Q18MSCT2QTW945B27ED', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=79000000&vnp_Command=pay&vnp_CreateDate=20260803124546&vnp_CurrCode=VND&vnp_ExpireDate=20260803130046&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260802-RF6Q18&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260802RF6Q18MSCT2QTW945B27ED&vnp_Version=2.1.0&vnp_SecureHash=c45166c4b7bf70b66f1a946241b2ae3494fdfca439700af566830251d899f8119c33de2cdfaef32a621b7b9c9d5b744753be98f01725c032fb0fd35a3cfef9fc\",\"expiresAt\":\"2026-08-03T06:00:46.580Z\",\"transactionRef\":\"TS20260802RF6Q18MSCT2QTW945B27ED\",\"transactionDate\":\"20260803124546\",\"vnp_Amount\":\"79000000\",\"vnp_BankCode\":\"VNPAY\",\"vnp_CardType\":\"QRCODE\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260802-RF6Q18\",\"vnp_PayDate\":\"20260803124541\",\"vnp_ResponseCode\":\"24\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"0\",\"vnp_TransactionStatus\":\"02\",\"vnp_TxnRef\":\"TS20260802RF6Q18MSCT2QTW945B27ED\",\"vnp_SecureHash\":\"876741e8e0f8e68ef5461c3004575f5de221e145dbe94387acf7dd3873e2179862cb0a9cf6aeb28fed5587b6630fa97683ab71ba693f97e493ebab154685e544\"}', NULL, '2026-08-02 20:10:39'),
(59, 60, 1281000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260803UXCMTR', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=128100000&vnp_Command=pay&vnp_CreateDate=20260803215606&vnp_CurrCode=VND&vnp_ExpireDate=20260803221106&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260803-UXCMTR&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260803UXCMTR&vnp_Version=2.1.0&vnp_SecureHash=72b82c7d8d7f64740958b2d99480727434f100af6f770d2214b66a9eed970582ca450fe0639d9c7a4815e3b3b251004b8794b4389ba61f86639c28cf2166f21a\",\"expiresAt\":\"2026-08-03T15:11:06.751Z\",\"transactionRef\":\"TS20260803UXCMTR\",\"transactionDate\":\"20260803215606\",\"vnp_ResponseId\":\"7862b891010449a7a22379c17d5edf5a\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260803UXCMTR\",\"vnp_Amount\":\"128100000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260803-UXCMTR\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260803215606\",\"vnp_TransactionNo\":\"5418989\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"8c66ff591263245c60ab0591fc004ad2e35fffd77128ab953214af5156d6c9df739ab04c38129bbf1edff304bcb7fe9699be77bc38144629da4cf5aa07af4ed1\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-03T15:35:46.858Z\"}', NULL, '2026-08-03 21:56:06'),
(60, 61, 290000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS20260805533RAN', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=29000000&vnp_Command=pay&vnp_CreateDate=20260805122705&vnp_CurrCode=VND&vnp_ExpireDate=20260805124205&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-533RAN&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805533RAN&vnp_Version=2.1.0&vnp_SecureHash=a26680a09964909b38cecb583058667eabe77c339d6fa1214753793a6066d77680c75d1ba396f6a5bfa0f23f04826766c288979143384d840aeda035aa557b2a\",\"expiresAt\":\"2026-08-05T05:42:05.464Z\",\"transactionRef\":\"TS20260805533RAN\",\"transactionDate\":\"20260805122705\",\"vnp_ResponseId\":\"9518be345f71418f922f88bad13d4019\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260805533RAN\",\"vnp_SecureHash\":\"f0a508be22c933655bb0ed3ecbe346584f55f2089dc23035490554cc297425b14b446065909c7a11acded8562163aa0d9afeb9e6a053076ea0926e9a9f538140\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:17.924Z\"}', NULL, '2026-08-05 12:27:05'),
(61, 62, 200000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS20260805TSXWSS', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=20000000&vnp_Command=pay&vnp_CreateDate=20260805125106&vnp_CurrCode=VND&vnp_ExpireDate=20260805130606&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-TSXWSS&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805TSXWSS&vnp_Version=2.1.0&vnp_SecureHash=a09d24caccc1cc1a09c0b159d07e6c74dec47835855ea423aa91b60d308282bd97145af58b5b4f7eb82641cf9d6e180c0a9c2dad9eada6e71737de8a3ab7f88a\",\"expiresAt\":\"2026-08-05T06:06:06.067Z\",\"transactionRef\":\"TS20260805TSXWSS\",\"transactionDate\":\"20260805125106\",\"vnp_ResponseId\":\"f251ea09e3624625ae33f8f97165e79b\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260805TSXWSS\",\"vnp_SecureHash\":\"53a45f03890b01dba97897769432b19ced6f8fe483e26611551e27ea1379606f9a309f2dfaa6ee0daad0c804f52259251a2615005d57c0cc31d5a2537e242949\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T11:57:18.205Z\"}', NULL, '2026-08-05 12:51:06');

-- --------------------------------------------------------

--
-- Table structure for table `pricingconfiguration`
--

DROP TABLE IF EXISTS `pricingconfiguration`;
CREATE TABLE IF NOT EXISTS `pricingconfiguration` (
  `id` int NOT NULL,
  `roundingUnit` int NOT NULL DEFAULT '1000',
  `defaultShippingFee` decimal(15,2) NOT NULL DEFAULT '30000.00',
  `freeShippingThreshold` decimal(15,2) NOT NULL DEFAULT '500000.00',
  `vatPercent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pricingconfiguration`
--

INSERT INTO `pricingconfiguration` (`id`, `roundingUnit`, `defaultShippingFee`, `freeShippingThreshold`, `vatPercent`, `updatedAt`) VALUES
(1, 1000, 30000.00, 500000.00, 10.00, '2026-08-05 17:31:34');

-- --------------------------------------------------------

--
-- Table structure for table `printmethod`
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `printmethod`
--

INSERT INTO `printmethod` (`id`, `code`, `name`, `extraCost`, `isActive`, `createdAt`) VALUES
(1, 'DTG', 'In DTG (Direct-to-Garment)', 0.00, 1, '2026-01-08 08:00:00'),
(2, 'IN_LUOI', 'In lụa (Silk Screen)', 30000.00, 0, '2026-01-08 08:01:00'),
(3, 'THEU', 'Thêu vi tính', 50000.00, 0, '2026-01-08 08:02:00'),
(4, 'VINYL', 'In cắt decal nhiệt', 30000.00, 1, '2026-01-08 08:03:00'),
(5, '123', 'Áo kỷ yếu cấp 3', 10000.00, 0, '2026-08-02 15:39:44');

-- --------------------------------------------------------

--
-- Table structure for table `printposition`
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
-- Dumping data for table `printposition`
--

INSERT INTO `printposition` (`id`, `code`, `name`, `extraCost`, `maxWidth`, `maxHeight`, `printAreaX`, `printAreaY`, `printAreaWidth`, `printAreaHeight`, `isActive`) VALUES
(1, 'MAT_TRUOC', 'Mặt trước (Ngực giữa)', 0.00, 30.00, 40.00, NULL, NULL, NULL, NULL, 1),
(2, 'MAT_SAU', 'Mặt sau (Lưng giữa)', 20000.00, 35.00, 45.00, NULL, NULL, NULL, NULL, 1),
(3, 'TRAI', 'Ngực trái (Logo nhỏ)', 15000.00, 10.00, 10.00, NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
CREATE TABLE IF NOT EXISTS `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoryId` int NOT NULL,
  `shirtType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '[FROM MEMBER] Loại áo dùng cho trang khách hàng (ví dụ: tshirt, hoodie, polo)',
  `name` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '[FROM ADMIN] Slug dùng cho URL thân thiện SEO',
  `basePrice` decimal(15,2) NOT NULL,
  `material` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `form` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'product shape/form',
  `madeIn` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_slug` (`slug`),
  KEY `idx_product_category_id` (`categoryId`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `categoryId`, `shirtType`, `name`, `slug`, `basePrice`, `material`, `form`, `madeIn`, `description`, `status`, `createdAt`) VALUES
(1, 1, 'tshirt', 'Áo Thun Wide Form', 'ao-thun-wide-form', 120000.00, '100% Cotton 180gsm', 'tshirt', 'Việt Nam', 'Áo thun cotton mềm mại, thấm hút tốt, phù hợp in ấn.', 'ACTIVE', '2026-01-06 08:00:00'),
(2, 1, 'tshirt', 'Áo Thun', 'ao-thun', 150000.00, '100% Cotton 200gsm', 'tshirt', 'Việt Nam', 'Dáng rộng thoải mái, form oversize hiện đại.', 'INACTIVE', '2026-01-06 08:05:00'),
(3, 2, 'hoodie', 'Áo Hoodie', 'ao-hoodie', 280000.00, 'Nỉ bông 320gsm', 'hoodie', 'Việt Nam', 'Áo hoodie dày dặn, ấm áp, có mũ và túi kangaroo.', 'ACTIVE', '2026-01-06 08:10:00'),
(4, 3, 'polo', 'Áo Polo', 'ao-polo', 180000.00, 'Cotton pique 220gsm', 'polo', 'Việt Nam', 'Áo polo chuyên nghiệp, phù hợp đồng phục công ty.', 'ACTIVE', '2026-01-06 08:15:00'),
(11, 2, NULL, 'Áo thun basic', 'ao-thun-basic-1784464296661', 100000.00, 'Áo thun basic', 'Nhập phôi áo thun đen size M', 'Việt Nam', '', 'ACTIVE', '2026-07-19 19:31:36'),
(12, 3, NULL, 'Áo nhóm phượt', 'ao-nhom-phuot-1784464500203', 200000.00, 'Áo nhóm phượt', 'Chất liệu co giãn, thoáng mát', 'Việt Nam', 'Áo nhóm phượt', 'ACTIVE', '2026-07-19 19:35:00');

-- --------------------------------------------------------

--
-- Table structure for table `productimage`
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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productimage`
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
(18, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Front_b11fvx.png', 'White-front', 0, 1, '2026-06-21 14:43:01'),
(19, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Back_vr6uas.png', 'White-back', 0, 0, '2026-06-21 14:43:01'),
(20, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/Polo-Beige-Front_ulxjri.png', 'Beige-front', 0, 0, '2026-06-21 14:43:01'),
(21, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Beige-Back_d4sp14.png', 'Beige-back', 0, 0, '2026-06-21 14:43:01'),
(22, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Front_rc2pvr.png', 'Navy-front', 0, 0, '2026-06-21 14:43:01'),
(23, 4, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Backt_uvfyjg.png', 'Navy-back', 0, 0, '2026-06-21 14:43:01'),
(24, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209405/Hoodie-Grey-Front_boebdz.png', 'Grey-front', 1, 1, '2026-06-23 17:14:16'),
(25, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209405/Hoodie-Grey-Back_ntgcoc.png', 'Grey-back', 2, 0, '2026-06-23 17:14:16'),
(26, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209409/Hoodie-Brown-Front_ab4bha.png', 'Brown-front', 3, 0, '2026-06-23 17:14:16'),
(27, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209411/Hoodie-Brown-Back_echgn5.png', 'Brown-back', 4, 0, '2026-06-23 17:14:16'),
(28, 11, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784464270/teestudio/product-mockups/e1tg5o3wo6oiiizzwsow.png', 'Đen-front', 0, 1, '2026-07-19 19:31:41'),
(29, 11, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784464272/teestudio/product-mockups/qmdrzgcxbr3clhdbxop3.png', 'Đen-back', 1, 0, '2026-07-19 19:31:41'),
(30, 12, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784464474/teestudio/product-mockups/r5s7k4k04wzv3qaoxqar.png', 'Xám-front', 0, 1, '2026-07-19 19:35:08'),
(31, 12, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784464475/teestudio/product-mockups/zicvjvdhqyq1dassqvdu.png', 'Xám-back', 1, 0, '2026-07-19 19:35:08'),
(32, 12, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784464477/teestudio/product-mockups/agudi5mbixjbhadc9i8y.png', 'Be-front', 2, 0, '2026-07-19 19:35:08'),
(33, 12, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784464478/teestudio/product-mockups/rm6rbxzbfjcm3vjbyji6.png', 'Be-back', 3, 0, '2026-07-19 19:35:08');

-- --------------------------------------------------------

--
-- Table structure for table `productvariant`
--

DROP TABLE IF EXISTS `productvariant`;
CREATE TABLE IF NOT EXISTS `productvariant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `color` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `colorHex` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#94a3b8' COMMENT '[FROM ADMIN] Mã màu HEX tương ứng với tên màu',
  `size` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `stockQty` int NOT NULL DEFAULT '0',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '[FROM ADMIN] Trạng thái variant: ACTIVE / INACTIVE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_product_variant_sku` (`sku`),
  UNIQUE KEY `uq_product_variant_product_color_size` (`productId`,`color`,`size`),
  KEY `idx_product_variant_product_id` (`productId`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productvariant`
--

INSERT INTO `productvariant` (`id`, `productId`, `color`, `colorHex`, `size`, `sku`, `stockQty`, `status`, `createdAt`) VALUES
(1, 1, 'Trắng', '#FFFFFF', 'S', 'ATCT-TRANG-S', 134, 'ACTIVE', '2026-01-07 08:00:00'),
(2, 1, 'Trắng', '#FFFFFF', 'M', 'ATCT-TRANG-M', 189, 'ACTIVE', '2026-01-07 08:01:00'),
(3, 1, 'Trắng', '#FFFFFF', 'L', 'ATCT-TRANG-L', 0, 'ACTIVE', '2026-01-07 08:02:00'),
(4, 1, 'Trắng', '#FFFFFF', 'XL', 'ATCT-TRANG-XL', 120, 'ACTIVE', '2026-01-07 08:03:00'),
(5, 1, 'Đen', '#000000', 'S', 'ATCT-DEN-S', 129, 'ACTIVE', '2026-01-07 08:04:00'),
(6, 1, 'Đen', '#000000', 'M', 'ATCT-DEN-M', 190, 'ACTIVE', '2026-01-07 08:05:00'),
(7, 1, 'Đen', '#000000', 'L', 'ATCT-DEN-L', 162, 'ACTIVE', '2026-01-07 08:06:00'),
(8, 1, 'Đen', '#000000', 'XL', 'ATCT-DEN-XL', 99, 'ACTIVE', '2026-01-07 08:07:00'),
(9, 2, 'Trắng', '#FFFFFF', 'M', 'ATOS-TRANG-M', 80, 'ACTIVE', '2026-01-07 08:08:00'),
(10, 2, 'Trắng', '#FFFFFF', 'L', 'ATOS-TRANG-L', 90, 'ACTIVE', '2026-01-07 08:09:00'),
(11, 2, 'Trắng', '#FFFFFF', 'XL', 'ATOS-TRANG-XL', 70, 'ACTIVE', '2026-01-07 08:10:00'),
(12, 2, 'Xám', '#808080', 'M', 'ATOS-XAM-M', 75, 'ACTIVE', '2026-01-07 08:11:00'),
(13, 2, 'Xám', '#808080', 'L', 'ATOS-XAM-L', 85, 'ACTIVE', '2026-01-07 08:12:00'),
(14, 3, 'Đen', '#000000', 'M', 'AHN-DEN-M', 83, 'ACTIVE', '2026-01-07 08:13:00'),
(15, 3, 'Đen', '#000000', 'L', 'AHN-DEN-L', 0, 'ACTIVE', '2026-01-07 08:14:00'),
(16, 3, 'Đen', '#000000', 'XL', 'AHN-DEN-XL', 40, 'ACTIVE', '2026-01-07 08:15:00'),
(17, 3, 'Xanh navy', '#003153', 'M', 'AHN-NAVY-M', 2, 'ACTIVE', '2026-01-07 08:16:00'),
(18, 3, 'Xanh navy', '#003153', 'L', 'AHN-NAVY-L', 10, 'ACTIVE', '2026-01-07 08:17:00'),
(19, 4, 'Trắng', '#FFFFFF', 'S', 'APL-TRANG-S', 60, 'ACTIVE', '2026-01-07 08:18:00'),
(20, 4, 'Trắng', '#FFFFFF', 'M', 'APL-TRANG-M', 76, 'ACTIVE', '2026-01-07 08:19:00'),
(21, 4, 'Trắng', '#FFFFFF', 'L', 'APL-TRANG-L', 1, 'ACTIVE', '2026-01-07 08:20:00'),
(22, 4, 'Xanh dương', '#0066CC', 'M', 'APL-XDUONG-M', 70, 'ACTIVE', '2026-01-07 08:21:00'),
(23, 4, 'Xanh dương', '#0066CC', 'L', 'APL-XDUONG-L', 9, 'ACTIVE', '2026-01-07 08:22:00'),
(24, 4, 'Xanh dương', '#0066CC', 'XL', 'APL-XDUONG-XL', 0, 'ACTIVE', '2026-01-07 08:23:00'),
(35, 11, 'Đen', '#000000', 'S', 'AO-THUN-BASIC-DEN-S', 200, 'ACTIVE', '2026-07-19 19:31:36'),
(36, 11, 'Đen', '#000000', 'M', 'AO-THUN-BASIC-DEN-M', 100, 'ACTIVE', '2026-07-19 19:31:36'),
(37, 12, 'Xám', '#808080', 'S', 'AO-NHOM-PHUOT-XAM-S', 0, 'ACTIVE', '2026-07-19 19:35:00'),
(38, 12, 'Be', '#d4b896', 'XS', 'AO-NHOM-PHUOT-BE-XS', 100, 'ACTIVE', '2026-07-19 19:35:00');

-- --------------------------------------------------------

--
-- Table structure for table `promotion`
--

DROP TABLE IF EXISTS `promotion`;
CREATE TABLE IF NOT EXISTS `promotion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `discountType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'PERCENT, FIXED, FREE_SHIPPING',
  `discountValue` decimal(15,2) NOT NULL DEFAULT '0.00',
  `minOrderAmount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `startDate` datetime NOT NULL,
  `endDate` datetime DEFAULT NULL COMMENT '[FROM ADMIN] NULL = không giới hạn ngày kết thúc',
  `usageLimit` int DEFAULT NULL COMMENT '[FROM ADMIN] NULL = không giới hạn lượt dùng',
  `usedCount` int NOT NULL DEFAULT '0',
  `isNewCustomerOnly` tinyint NOT NULL DEFAULT '0' COMMENT '[FROM ADMIN] 1 = chỉ áp dụng cho khách hàng mới',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_promotion_code` (`code`),
  KEY `idx_promotion_status_dates` (`status`,`startDate`,`endDate`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotion`
--

INSERT INTO `promotion` (`id`, `code`, `discountType`, `discountValue`, `minOrderAmount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `isNewCustomerOnly`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'TEEWELCOME', 'PERCENT', 10.00, 200000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 500, 4, 0, 'ACTIVE', '2026-01-01 00:00:00', '2026-08-03 21:56:06'),
(2, 'SALE50K', 'FIXED', 50000.00, 300000.00, '2026-01-01 00:00:00', '2026-06-30 23:59:59', 200, 1, 0, 'INACTIVE', '2026-01-01 00:00:00', '2026-08-04 20:24:50'),
(3, 'FREESHIP', 'FREE_SHIPPING', 0.00, 500000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', NULL, 10, 0, 'ACTIVE', '2026-01-01 00:00:00', '2026-08-05 10:00:00'),
(4, 'NEWUSER', 'PERCENT', 15.00, 0.00, '2026-01-01 00:00:00', NULL, NULL, 50, 1, 'ACTIVE', '2026-01-01 00:00:00', '2026-08-05 10:00:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotionusage`
--

INSERT INTO `promotionusage` (`id`, `promotionId`, `userId`, `orderId`, `usedAt`) VALUES
(1, 1, 1, 1, '2026-06-03 08:24:00'),
(2, 2, 2, 10, '2026-05-30 08:00:00'),
(5, 1, 16, 36, '2026-07-18 21:47:28'),
(6, 1, 8, 57, '2026-08-01 22:49:09'),
(7, 1, 2, 60, '2026-08-03 21:56:06');

-- --------------------------------------------------------

--
-- Table structure for table `sticker`
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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sticker`
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
(36, 'reading', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218625/reading_10139481_fbkofa.png', 16, 1, '2026-06-23 19:49:53'),
(37, 'Nhập phôi áo thun đen size M', 'logo', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785676944/teestudio/stickers/ybwp6obnv9rebdyjfuys.png', 17, 1, '2026-08-02 20:22:31');

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
CREATE TABLE IF NOT EXISTS `supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_supplier_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`id`, `name`, `phone`, `createdAt`) VALUES
(1, 'Công ty Dệt May Thành Công', '0901234501', '2026-05-01 08:00:00'),
(2, 'Xưởng Phôi Áo Việt Tiến', '0901234502', '2026-05-01 08:05:00'),
(3, 'Công ty Vải Thun Phú Sang', '0908123456', '2026-05-01 08:10:00'),
(4, 'Nhà cung cấp Phụ liệu Minh Châu', '0917456789', '2026-05-01 08:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `useraddress`
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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `useraddress`
--

INSERT INTO `useraddress` (`id`, `userId`, `recipientName`, `phone`, `addressLine`, `city`, `district`, `ward`, `isDefault`, `createdAt`) VALUES
(1, 1, 'Nguyễn Minh Anh', '0901234567', '123 Đường Nguyễn Trãi', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', 1, '2026-01-03 08:00:00'),
(2, 2, 'Trần Văn Cường', '0987654321', '45 Lê Văn Việt', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Phường Hiệp Phú', 1, '2026-01-03 08:01:00'),
(3, 3, 'Lê Thị Hoa', '0912345678', '88 Trần Hưng Đạo', 'Hà Nội', 'Quận Hoàn Kiếm', 'Phường Phan Chu Trinh', 1, '2026-01-03 08:02:00'),
(4, 4, 'Phạm Quốc Bảo', '0934567890', '210 Điện Biên Phủ', 'Đà Nẵng', 'Quận Thanh Khê', 'Phường Thanh Khê Đông', 1, '2026-01-03 08:03:00'),
(5, 5, 'Nguyễn Thị Lan', '0978901234', '15 Võ Thị Sáu', 'TP. Hồ Chí Minh', 'Quận 3', 'Phường 6', 1, '2026-01-03 08:04:00'),
(6, 6, 'Hoàng Văn Đức', '0965432109', '67 Lý Tự Trọng', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 1, '2026-01-03 08:05:00'),
(7, 7, 'Võ Thị Thu', '0943210987', '32 Nguyễn Huệ', 'Cần Thơ', 'Quận Ninh Kiều', 'Phường An Hội', 1, '2026-01-03 08:06:00'),
(8, 8, 'Đinh Văn Nam', '0921098765', '99 Hùng Vương', 'Hải Phòng', 'Quận Hồng Bàng', 'Phường Quán Toan', 1, '2026-01-03 08:07:00'),
(9, 10, 'Khách Hàng Kho', '0900000999', '100 Đường Tồn Kho', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 1, '2026-01-03 08:08:00'),
(11, 20, 'Nguyễn Đăng', '0123456789', '25 Nguyễn Thị Minh Khai', '', '', '', 0, '2026-07-11 06:15:47'),
(12, 21, 'Nguyễn Văn Nam', '0912345678', '12 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 17:16:32'),
(13, 20, 'Nguyễn Đăng', '0886834024', '23, Ngọc Đường, Tuyên Quang', 'Tuyên Quang', '', 'Ngọc Đường', 0, '2026-07-17 17:42:13'),
(14, 20, 'Nguyễn Đăng', '0886834024', '23, Ngọc Đường, Tuyên Quang', 'Tuyên Quang', '', 'Ngọc Đường', 0, '2026-07-17 17:42:13'),
(15, 20, 'Nguyễn Đăng', '0886834024', '21, Sông Cầu, Đắk Lắk', 'Đắk Lắk', '', 'Sông Cầu', 0, '2026-07-17 17:43:17'),
(16, 20, 'Nguyễn Đăng', '0886834024', '21, Sông Cầu, Đắk Lắk', 'Đắk Lắk', '', 'Sông Cầu', 0, '2026-07-17 17:43:17'),
(17, 21, 'Nguyễn Văn Nam', '0912345678', '12 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 17:49:53'),
(18, 21, 'Nguyễn Văn Nam', '0912345678', '12 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 17:50:59'),
(19, 20, 'Nguyễn Đăng', '0123456789', '125, Bù Gia Mập, Đồng Nai', 'Đồng Nai', '', 'Bù Gia Mập', 0, '2026-07-17 17:53:28'),
(20, 20, 'Nguyễn Đăng', '0123456789', '125, Bù Gia Mập, Đồng Nai', 'Đồng Nai', '', 'Bù Gia Mập', 0, '2026-07-17 17:53:28'),
(21, 21, 'Nguyễn Văn Nam', '0912345678', '12 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 18:05:25'),
(27, 16, 'Phan Văn C', '0934567890', '15 Ngọc Đường, Tuyên Quang', 'Tuyên Quang', '', 'Ngọc Đường', 0, '2026-07-18 21:47:28'),
(28, 16, 'Phan Văn C', '0965432109', '20 Mường Giôn, Sơn La', 'Sơn La', '', 'Mường Giôn', 0, '2026-07-18 21:50:02'),
(29, 16, 'Phan Văn C', '0965432109', '20 Mường Giôn, Sơn La', 'Sơn La', '', 'Mường Giôn', 0, '2026-07-18 21:50:02'),
(30, 16, 'Phan Văn C', '0934567890', '33 Đồng Văn, Tuyên Quang', 'Tuyên Quang', '', 'Đồng Văn', 0, '2026-07-18 21:51:05'),
(31, 16, 'Phan Văn C', '0934567890', '33 Đồng Văn, Tuyên Quang', 'Tuyên Quang', '', 'Đồng Văn', 0, '2026-07-18 21:51:05'),
(32, 16, 'Phan Văn C', '0934567890', '45 Tả Lèng, Lai Châu', 'Lai Châu', '', 'Tả Lèng', 0, '2026-07-18 21:51:45'),
(33, 16, 'Phan Văn C', '0934567890', '45 Tả Lèng, Lai Châu', 'Lai Châu', '', 'Tả Lèng', 0, '2026-07-18 21:51:45'),
(34, 3, 'Lê Thị Hoa', '0912345678', '88 Trần Hưng Đạo, Phường Phan Chu Trinh, Quận Hoàn Kiếm, Hà Nội', '', '', '', 0, '2026-07-18 22:42:58'),
(35, 13, 'Nguyễn Thanh Hiếu', '0123456789', '123 Đường Điện Biên Phủ, Phường 15, Bình Thạnh, TP.HCM', '', '', '', 0, '2026-07-18 22:46:24'),
(36, 16, 'Phan Văn C', '0123456789', '67 Mường Nhé, Điện Biên', 'Điện Biên', '', 'Mường Nhé', 0, '2026-07-19 12:42:43'),
(37, 16, 'Phan Văn C', '0123456789', '67 Mường Nhé, Điện Biên', 'Điện Biên', '', 'Mường Nhé', 0, '2026-07-19 12:42:47'),
(38, 21, 'Nguyễn Văn Nam', '0912345678', '12 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM', '', '', '', 0, '2026-07-19 14:53:54'),
(39, 10, 'Khách Hàng Kho', '0900000999', '100 Đường Tồn Kho, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', '', '', '', 0, '2026-07-19 15:32:43'),
(40, 21, 'Nguyễn Văn Nam', '0912345678', '12 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM', '', '', '', 0, '2026-07-19 18:09:16'),
(41, 27, 'Lê Thanh Hiếu', '0965432109', '89 Sin Suối Hồ, Lai Châu', 'Lai Châu', '', 'Sin Suối Hồ', 0, '2026-07-31 21:46:21'),
(43, 28, 'Phạm Thanh Hiếu', '0377243647', '12 Chiềng Sinh, Sơn La', 'Sơn La', '', 'Chiềng Sinh', 0, '2026-07-31 21:53:37'),
(44, 28, 'Phạm Thanh Hiếu', '0377243647', '12 Chiềng Sinh, Sơn La', 'Sơn La', '', 'Chiềng Sinh', 0, '2026-07-31 21:53:37'),
(45, 28, 'Phạm Thanh Hiếu', '0123456789', '34 Tả Lèng, Lai Châu', 'Lai Châu', '', 'Tả Lèng', 0, '2026-07-31 22:01:16'),
(46, 28, 'Phạm Thanh Hiếu', '0123456789', '34 Tả Lèng, Lai Châu', 'Lai Châu', '', 'Tả Lèng', 0, '2026-07-31 22:01:16'),
(47, 28, 'Phạm Thanh Hiếu', '0377243647', '12 Chiềng Sinh, Sơn La', '', '', '', 0, '2026-07-31 23:02:59'),
(48, 8, 'Đinh Văn Nam', '0921098765', '99 Hùng Vương, Phường Quán Toan, Quận Hồng Bàng, Hải Phòng', '', '', '', 0, '2026-08-01 22:49:09'),
(49, 6, 'Hoàng Văn Đức', '0965432109', '67 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', '', '', '', 0, '2026-08-02 14:06:31'),
(50, 28, 'Phạm Thanh Hiếu', '0377243647', '12 Chiềng Sinh, Sơn La', '', '', '', 0, '2026-08-02 20:10:39'),
(51, 2, 'Trần Văn Cường', '0987654321', '45 Lê Văn Việt, Phường Hiệp Phú, TP. Thủ Đức, TP. Hồ Chí Minh', '', '', '', 0, '2026-08-03 21:56:06'),
(52, 28, 'Phạm Thanh Hiếu', '0377243647', '12 Chiềng Sinh, Sơn La', '', '', '', 0, '2026-08-05 12:27:05'),
(53, 3, 'Lê Thị Hoa', '0912345678', '88 Trần Hưng Đạo, Phường Phan Chu Trinh, Quận Hoàn Kiếm, Hà Nội', '', '', '', 0, '2026-08-05 12:51:06');

-- --------------------------------------------------------

--
-- Table structure for table `usertoken`
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
) ENGINE=InnoDB AUTO_INCREMENT=254 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usertoken`
--

INSERT INTO `usertoken` (`id`, `userId`, `refreshToken`, `expiresAt`, `userAgent`, `ipAddress`, `createdAt`) VALUES
(141, 24, '0ca9d26406eac2927009d7307c8086f37c812cd23632d4b8d664d4b3b738e681', '2026-08-07 20:23:49', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-07-31 20:23:49'),
(153, 27, '69cc47597ea8d87b14d45db3463006f8502432c13a237207bbd492ee049e1b98', '2026-08-07 22:07:08', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', '2026-07-31 22:07:08'),
(189, 27, '2ced0084354a2ce85da70923d7e21ab2b4d43f56b60002928bf2ec353a5bb384', '2026-08-09 19:30:53', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', '2026-08-02 19:30:53'),
(235, 24, '96ed9189b8d14cd20ca9c8bb4517286ed1915d2ecad3eb0bbcede816ade68470', '2026-08-12 10:20:17', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', '2026-08-05 10:20:17'),
(238, 27, '6a4cba8803f717a440cb9a270330ed18d62605cfd4fc0808792ee585dd118e31', '2026-08-12 11:42:34', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', '2026-08-05 11:42:34'),
(252, 24, '9a2295083a80941cdcb4edb6cf40ba29450cc24c9d994c5be79942d75b3dc487', '2026-08-12 18:57:21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', '2026-08-05 18:57:21'),
(253, 27, 'fb56458d028f560842a96f5c94c0bbfc3f82cb8aaa940a0800e68951894f23e4', '2026-08-12 19:01:09', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-05 19:01:09');

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
