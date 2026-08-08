-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 06, 2026 at 01:03 AM
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`id`, `email`, `passwordHash`, `fullName`, `phone`, `role`, `status`, `emailVerified`, `emailVerifiedAt`, `createdAt`, `updatedAt`) VALUES
(1, 'minhanh.nguyen@gmail.com', '$2b$10$hash1', 'Nguyễn Minh Anh', '0901234567', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:00:00', '2026-01-02 08:00:00', '2026-07-20 18:12:29'),
(2, 'cuong.tran@gmail.com', '$2b$10$hash2', 'Trần Văn Cường', '0987654321', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:01:00', '2026-01-02 08:01:00', '2026-07-20 18:12:29'),
(3, 'hoa.le@gmail.com', '$2b$10$hash3', 'Lê Thị Hoa', '0912345678', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:02:00', '2026-01-02 08:02:00', '2026-07-20 18:12:29'),
(4, 'bao.pham@gmail.com', '$2b$10$hash4', 'Phạm Quốc Bảo', '0934567890', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:03:00', '2026-01-02 08:03:00', '2026-07-20 18:12:29'),
(5, 'lan.nguyen@gmail.com', '$2b$10$hash5', 'Nguyễn Thị Lan', '0978901234', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:04:00', '2026-01-02 08:04:00', '2026-07-20 18:12:29'),
(6, 'duc.hoang@gmail.com', '$2b$10$hash6', 'Hoàng Văn Đức', '0965432109', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:05:00', '2026-01-02 08:05:00', '2026-07-20 18:12:29'),
(7, 'thu.vo@gmail.com', '$2b$10$hash7', 'Võ Thị Thu', '0943210987', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:06:00', '2026-01-02 08:06:00', '2026-07-20 18:12:29'),
(8, 'nam.dinh@gmail.com', '$2b$10$hash8', 'Đinh Văn Nam', '0921098765', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:07:00', '2026-01-02 08:07:00', '2026-07-20 18:12:29'),
(9, 'admin@teestudio.vn', '$2b$12$5Ooby8bdxQcHjpLyl4HdZ.IBxqn.9Wzk9YX.2LJNwndW8woRrsj9a', 'Quản Trị Viên', '0909090909', 'ADMIN', 'ACTIVE', 1, '2026-01-02 08:08:00', '2026-01-02 08:08:00', '2026-08-06 06:52:28'),
(10, 'test.tonkho.customer@teestudio.vn', '$2b$10$seedInventoryCustomerHash', 'Nguyễn Văn Hiếu', '0900000999', 'CUSTOMER', 'ACTIVE', 1, '2026-01-02 08:09:00', '2026-01-02 08:09:00', '2026-08-06 07:42:38'),
(11, 'thanhhieu2182004@gmail.com', '$2b$12$dej0jQlYcNB4himKZXnTyO1mAifhTx04Y3kUyy8ot/h5/geo/zOIO', 'Nguyễn Văn Sơn', '0123456789', 'ADMIN', 'ACTIVE', 1, '2026-06-10 11:42:19', '2026-06-10 11:42:19', '2026-08-06 07:43:02'),
(12, 'thanhhieu282004@gmail.com', '$2b$12$IOC5ktoj07Rk/LELF9OsmOtzDltRyhbI2VEexhx.uzB/bHh.Ql6zu', 'Nguyễn Văn Tú', '0123456789', 'WAREHOUSE', 'ACTIVE', 1, '2026-06-10 11:46:32', '2026-06-10 11:46:32', '2026-08-06 07:43:11'),
(13, 'thanhhieu218200@gmail.com', '$2b$12$19oIzOFr0AKZTm8sV8JRXOOU4z2fJLx8ETY6BHS900zSmSYBCLB2W', 'Nguyễn Thanh Hiếu', '0123456789', 'CUSTOMER', 'ACTIVE', 1, '2026-06-10 12:38:47', '2026-06-10 12:38:47', '2026-07-20 18:12:29'),
(14, 'thanhhieu21820@gmail.com', '$2b$12$DSj/.hYjD1pvRGucdIHzReELpjGJOyIT0FAsUBhoL8OXVD/20kuKm', 'Hiếu', '0900000999', 'PRODUCTION', 'ACTIVE', 1, '2026-06-10 12:46:37', '2026-06-10 12:46:37', '2026-07-20 18:12:29'),
(15, 'dangcuh2105@gmail.com', '$2b$12$LMlifS8fBSORNYNLSacewe2DmM45.nTdz7apQrwOiPyOwH1HrvvDi', 'Nguyễn Đăng', '02312312323', 'ADMIN', 'ACTIVE', 1, '2026-06-21 15:54:52', '2026-06-21 15:54:52', '2026-08-03 19:51:27'),
(16, '1212@gmail.com', '$2b$12$tNF6f1T6yvoghVnQpQWX2.MmZ93MhTZ2UB14huZhEVw/lDi0LmnKu', 'Nguyễn Văn Ngọc', '0123456789', 'CUSTOMER', 'ACTIVE', 1, '2026-06-21 16:48:08', '2026-06-21 16:48:08', '2026-08-06 07:43:24'),
(18, 'admin2@teestudio.vn', '$2b$10$JXB.1D1fQPZJL3EG771ReuQYXggSl/wJS9DiVNbNcgge.8EYOWjuS', 'Nguyễn Văn An', '0987654321', 'ADMIN', 'ACTIVE', 1, '2026-06-23 17:02:26', '2026-06-23 17:02:26', '2026-08-06 07:44:12'),
(20, 'dangcuh@gmail.com', '$2b$12$Qx7uifK49tM6ocW1W1Tkmu44iWx6VVn0sxZqDWD4mT8iK0zdmUwX6', 'Nguyễn Đăng', '0123456789', 'CUSTOMER', 'ACTIVE', 1, '2026-07-11 06:10:56', '2026-07-11 06:10:56', '2026-07-20 18:12:29'),
(21, 'test.task1@teestudio.dev', '$2b$10$KH1ACekWdi5j6Bx.8In7M.9jOc0cHHflJ1W8wbxr3fNl0vDlSMJpO', 'Nguyễn Văn Bình', '0912345678', 'CUSTOMER', 'ACTIVE', 1, '2026-07-17 17:04:05', '2026-07-17 17:04:05', '2026-08-06 07:43:42'),
(24, 'haidang40021181@gmail.com', '$2b$12$Bw7ylnbhb/Q99wTvdVlM.ufqSU8I5NwDgqWqQOmEeDlAjWVoqmjvS', 'Nguyễn Hải Đăng', '03242345878', 'CUSTOMER', 'ACTIVE', 1, '2026-07-18 20:36:46', '2026-07-18 20:36:46', '2026-08-05 00:39:03'),
(29, 'ux.verify.final@teestudio.dev', '$2b$12$QVAFafXkABXDwELoE72YluF7tRzAlZQ8IkznRCJ0VblJczOCIwWqq', 'Nguyễn Văn Lưu', '0912345678', 'CUSTOMER', 'ACTIVE', 0, NULL, '2026-08-03 19:08:25', '2026-08-06 07:44:32'),
(30, 'thanhhieu3@gmail.com', '$2b$12$5Ooby8bdxQcHjpLyl4HdZ.IBxqn.9Wzk9YX.2LJNwndW8woRrsj9a', 'Nguyễn Văn Khanh', '0377243647', 'CUSTOMER', 'ACTIVE', 0, NULL, '2026-08-05 20:49:46', '2026-08-06 07:44:48'),
(31, 'picturesavebg@gmail.com', '$2b$12$hZ8..rV4mz.RTQfM2N0ruelBqudfmCbKpklCCSVomonH0W4lW/332', 'Nguyễn Văn Cường', '0377243648', 'CUSTOMER', 'ACTIVE', 1, '2026-08-05 20:55:55', '2026-08-05 20:51:04', '2026-08-06 07:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `accountactiontoken`
--

DROP TABLE IF EXISTS `accountactiontoken`;
CREATE TABLE IF NOT EXISTS `accountactiontoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` int NOT NULL,
  `tokenHash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SHA-256 hash of raw token',
  `purpose` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'EMAIL_VERIFICATION | PASSWORD_RESET',
  `expiresAt` datetime NOT NULL,
  `consumedAt` datetime DEFAULT NULL,
  `requestIp` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_account_action_token_hash` (`tokenHash`),
  KEY `idx_account_action_token_lookup` (`accountId`,`purpose`),
  KEY `idx_account_action_token_expires` (`expiresAt`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `accountactiontoken`
--

INSERT INTO `accountactiontoken` (`id`, `accountId`, `tokenHash`, `purpose`, `expiresAt`, `consumedAt`, `requestIp`, `createdAt`) VALUES
(7, 29, 'e7240f4a0b10a686199faaf4ea3de1ed21c1bd00d48189b1cf6b7551d59aa693', 'EMAIL_VERIFICATION', '2026-08-04 19:08:26', NULL, '::1', '2026-08-03 19:08:25'),
(8, 15, '6f2206612ee2c2653a4c5010d1a9ddfa1e222d4d7c9586740d623fa95f0b1860', 'PASSWORD_RESET', '2026-08-03 20:50:39', '2026-08-03 19:51:26', '::1', '2026-08-03 19:50:39'),
(9, 24, '9b4ac72d8e2173d2aaed289e3fd29a29ee8a4d70a21aade8b0809dc1a93625c8', 'PASSWORD_RESET', '2026-08-05 01:38:30', '2026-08-05 00:39:03', '::1', '2026-08-05 00:38:30'),
(11, 30, 'c0892491f41fb2413082871d17311d7ac83b77475484f74884ae634fb5f6a75c', 'EMAIL_VERIFICATION', '2026-08-06 20:50:02', NULL, '::1', '2026-08-05 20:50:01'),
(13, 31, 'b5640e881c092a3c391e5b22a0022130258ce7d01442c173e7c069d953561e8b', 'EMAIL_VERIFICATION', '2026-08-06 20:55:21', '2026-08-05 20:55:55', '::1', '2026-08-05 20:55:21');

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(12, 4, 100, 13.00);

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
(5, 24, '2026-08-05 00:39:16', '2026-08-05 00:39:16'),
(6, 31, '2026-08-05 20:51:16', '2026-08-05 20:51:16'),
(7, 30, '2026-08-06 06:51:25', '2026-08-06 06:51:25');

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `createdAt`) VALUES
(1, 'Áo thun', '2026-01-05 08:00:00'),
(2, 'Áo hoodie', '2026-01-05 08:01:00'),
(3, 'Áo polo', '2026-01-05 08:02:00'),
(5, 'Áo sweater', '2026-08-04 21:34:26');

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
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'Thiết kế chưa đặt tên' COMMENT '[FROM MEMBER] Tên thiết kế do khách đặt',
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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customdesign`
--

INSERT INTO `customdesign` (`id`, `userId`, `productId`, `variantId`, `name`, `baseColor`, `canvasData`, `previewUrl`, `printFileUrlFront`, `printFileUrlBack`, `designFee`, `status`, `adminNote`, `createdAt`, `updatedAt`) VALUES
(28, 24, 1, 7, 'Thiết kế 2', '#000000', '{\"version\": 1, \"elements\": [{\"x\": 189.9999999999999, \"y\": 245.9999999999994, \"id\": \"6b84ff70-7fb5-478e-96f2-d01fda4f9e99\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033308/have-a-good-day_6122874_hroodz.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 65.14285714285728, \"height\": 57.714285714286305, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785866496/teestudio/user-designs/unadxntqwge5bx3ezb5q.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785865688/teestudio/print-files/b9woxyacvniigvtwayuz.png', NULL, 20000.00, 'APPROVED', 'xấu vcl', '2026-08-05 00:43:40', '2026-08-05 01:02:08'),
(29, 20, 1, 3, 'a', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 172.99999999999997, \"y\": 225.0000000000001, \"id\": \"28b03a9a-1d65-450b-8536-9f56df3ca1a5\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6103560-png_enpz6a.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 148.00000000000003, \"height\": 162.99999999999991, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"shirtColor\": \"#ffffff\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785865842/teestudio/user-designs/bw1barmsy18f1nonmry8.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785865848/teestudio/print-files/kw1kwxa0mv8tkmyrn6ry.png', NULL, 50000.00, 'PENDING_REVIEW', NULL, '2026-08-05 00:50:49', '2026-08-05 22:49:20'),
(34, 24, 1, 5, 'Thiết kế chưa đặt tên', '#000000', '{\"version\": 1, \"elements\": [{\"x\": 190, \"y\": 246, \"id\": \"f963a1e1-4e96-421e-8f0c-c876a3e4531f\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033249/social-distancing_7143864_gxzpup.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 218.00000000000003, \"y\": 295.1428571428571, \"id\": \"90a46a83-32fc-460a-b33d-557cf6ef81a5\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033308/have-a-good-day_6122874_hroodz.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 184, \"y\": 240.00000000000003, \"id\": \"e106afe6-4219-4c21-8892-eccb4a8c6b8d\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6103560-png_enpz6a.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}, \"printingMethodCode\": \"DTG\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785936079/teestudio/user-designs/nsnz9yenhtfnvhsbelax.png', NULL, NULL, 80000.00, 'DRAFT', NULL, '2026-08-05 01:33:27', '2026-08-05 20:21:19'),
(35, 24, 1, 1, 'Thiết kế chưa đặt tên', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 139.14285714285677, \"y\": 177.4285714285711, \"id\": \"bc6481c2-d6c6-48a5-839f-18a802b867fc\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1785929623/teestudio/user-designs/w5gxetyzldwksp7fhm8s.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 222.8571428571432, \"height\": 248.57142857142887, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}, \"printingMethodCode\": \"DTG\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785929790/teestudio/user-designs/ea2pmeniqrysejq1yl7j.png', NULL, NULL, 60000.00, 'PENDING_REVIEW', NULL, '2026-08-05 18:33:42', '2026-08-05 18:45:00'),
(36, 24, 1, 2, 'Thiết kế chưa đặt tên', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 200.2857142857143, \"y\": 237.42857142857144, \"id\": \"2bdccbf8-58b3-4eac-b99b-f040e66f0836\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1785931602/teestudio/user-designs/wvplwnb5uvjqqvv2a855.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 188.8571428571428, \"y\": 231.14285714285663, \"id\": \"1b655445-2fdd-4008-b3c5-d61b84824c70\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1785931604/teestudio/user-designs/iyyynvnwvmpsio83m96j.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 145.71428571428586, \"height\": 139.42857142857193, \"rotation\": 0}, {\"x\": 219.42857142857116, \"y\": 255.9999999999997, \"id\": \"71720897-1111-4175-aaf7-7974d40b8b7f\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1785931603/teestudio/user-designs/bz2eqyyjxpuozymkvt6a.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 81.71428571428604, \"height\": 90.8571428571432, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"back\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}, \"printingMethodCode\": \"VINYL\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785931601/teestudio/user-designs/erw2gzo56pnhi5fzawtd.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785931674/teestudio/print-files/axqadlb0mzvagjp6to97.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785931675/teestudio/print-files/swbxjvifctfz85drkyp8.png', 80000.00, 'PENDING_REVIEW', NULL, '2026-08-05 19:05:30', '2026-08-05 19:07:55'),
(37, 24, 1, 1, 'Thiết kế chưa đặt tên', '#ffffff', '{\"version\": 1, \"elements\": [{\"x\": 185.42857142857144, \"y\": 246.00000000000003, \"id\": \"b08840df-54c4-44c8-a824-49960e907b89\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033314/thank-you_7328366_q8e2f3.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 184, \"y\": 240.00000000000003, \"id\": \"332c8ee3-9a87-4071-9272-f2a228c57358\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 132, \"height\": 132, \"rotation\": 0}], \"shirtType\": \"tshirt\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}, \"printingMethodCode\": \"DTG\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785934315/teestudio/user-designs/vmqf2wuh5vakvt7upvbf.png', NULL, NULL, 80000.00, 'DRAFT', NULL, '2026-08-05 19:24:35', '2026-08-05 19:51:54'),
(38, 24, 3, 36, 'Thiết kế chưa đặt tên', '#9ca3af', '{\"version\": 1, \"elements\": [{\"x\": 202.62857142857143, \"y\": 228.91428571428577, \"id\": \"f04840d5-2686-4642-9cb4-1270be4075f3\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1785932777/teestudio/user-designs/eitpsbcnvxrneg0eyy2y.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 93.6, \"height\": 93.6, \"rotation\": 0}], \"shirtType\": \"hoodie\", \"shirtView\": \"front\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}, \"printingMethodCode\": \"DTG\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785934422/teestudio/user-designs/kdngdksohfpgjlq8ho6m.png', NULL, NULL, 40000.00, 'DRAFT', NULL, '2026-08-05 19:26:16', '2026-08-05 19:53:53'),
(39, 20, 3, 36, 'abc123', '#9ca3af', '{\"version\": 1, \"elements\": [{\"x\": 151.77142857142857, \"y\": 293.4857142857144, \"id\": \"d14d9c4f-775a-4468-b163-547dd9b3c81e\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782024675/image-from-rawpixel-id-6011494-png_xwfrjv.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 93.6, \"height\": 93.6, \"rotation\": 0}, {\"x\": 213.42857142857144, \"y\": 180.8571428571429, \"id\": \"ce4ec17c-b598-4d14-8273-b88c47c3770d\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png\", \"side\": \"back\", \"type\": \"image\", \"width\": 144, \"height\": 144, \"rotation\": 0}, {\"x\": 188.28571428571428, \"y\": 229.20000000000007, \"id\": \"8942fed6-5ffd-4ec6-8d49-5cdb7754b426\", \"fill\": \"#000000\", \"side\": \"front\", \"text\": \"acccc\", \"type\": \"text\", \"width\": 200, \"height\": 40, \"fontSize\": 28, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Arial\"}, {\"x\": 151.71428571428572, \"y\": 350.91428571428577, \"id\": \"1f946936-090a-448f-9d27-56abcae6e63f\", \"fill\": \"#1ee510\", \"side\": \"back\", \"text\": \"hhhhh\", \"type\": \"text\", \"width\": 200, \"height\": 40, \"fontSize\": 28, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Arial\"}], \"shirtType\": \"hoodie\", \"shirtView\": \"front\", \"shirtColor\": \"#9ca3af\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785939185/teestudio/user-designs/afsprm4cmuwgyrrpszfm.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785939186/teestudio/print-files/qahzvbdqto8fuye0sy7t.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785939187/teestudio/print-files/yvnwsgi3ypl6q7abopgu.png', 0.00, 'APPROVED', NULL, '2026-08-05 21:00:03', '2026-08-05 21:15:20'),
(40, 13, 3, 35, 'aaaaaa', '#8b4513', '{\"version\": 1, \"elements\": [{\"x\": 220, \"y\": 227, \"id\": \"33029be7-3a75-4207-b9ee-16d90b934db0\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782218680/have-a-good-day_6122874_yrdyci.png\", \"side\": \"front\", \"type\": \"image\", \"width\": 60, \"height\": 60, \"rotation\": 0}, {\"x\": 160, \"y\": 297, \"id\": \"61e1b1dd-0521-4fde-9ea0-94d038dc555f\", \"fill\": \"#ffffff\", \"side\": \"front\", \"text\": \"GOOD VIBES\", \"type\": \"text\", \"align\": \"center\", \"width\": 180, \"height\": 40, \"fontSize\": 36, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Oswald\", \"letterSpacing\": 1, \"textTransform\": \"uppercase\"}], \"shirtType\": \"hoodie\", \"shirtView\": \"front\", \"shirtColor\": \"#8b4513\", \"logicalCanvas\": {\"width\": 500, \"height\": 600}}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785942322/teestudio/user-designs/sqchaqhnwmzpeyyfb4ax.png', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785942323/teestudio/print-files/veawnixqntfp9hbppaju.png', NULL, 10000.00, 'DRAFT', NULL, '2026-08-05 22:02:57', '2026-08-05 22:05:32');

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
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customerorder`
--

INSERT INTO `customerorder` (`id`, `orderCode`, `userId`, `promotionId`, `addressId`, `subtotal`, `discountAmount`, `shippingFee`, `shippingCarrier`, `shippingMethod`, `trackingCode`, `shippedAt`, `deliveredAt`, `cancelReason`, `totalAmount`, `depositAmount`, `codAmount`, `paymentType`, `paymentStatus`, `status`, `createdAt`, `updatedAt`) VALUES
(1, '#TS-2026-00128', 1, 1, 1, 450000.00, 60000.00, 30000.00, 'GHTK', 'Tiêu chuẩn', NULL, NULL, NULL, NULL, 570000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-06-03 08:24:00', '2026-06-03 10:30:00'),
(2, '#TS-2026-00129', 2, NULL, 2, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-03 09:05:00', '2026-06-03 09:05:00'),
(3, '#TS-2026-00130', 3, NULL, 3, 1440000.00, 0.00, 0.00, 'J&T Express', 'Nhanh', NULL, NULL, NULL, NULL, 1640000.00, 0.00, 0.00, 'FULL', 'PAID', 'READY_TO_SHIP', '2026-06-02 13:40:00', '2026-06-03 09:00:00'),
(4, '#TS-2026-00131', 4, NULL, 4, 480000.00, 0.00, 30000.00, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260601001', '2026-06-01 14:00:00', '2026-06-03 10:20:00', NULL, 510000.00, 0.00, 0.00, 'FULL', 'PAID', 'COMPLETED', '2026-05-31 15:20:00', '2026-06-03 10:20:00'),
(5, '#TS-2026-00132', 5, NULL, 5, 360000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 490000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CONFIRMED', '2026-06-03 10:15:00', '2026-06-03 11:00:00'),
(6, '#TS-2026-00133', 6, NULL, 6, 450000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 600000.00, 0.00, 0.00, 'FULL', 'PAID', 'PRINTING', '2026-06-02 14:30:00', '2026-06-03 08:00:00'),
(7, '#TS-2026-00134', 7, NULL, 7, 360000.00, 0.00, 30000.00, 'GHTK', 'Nhanh', 'GHTK2026060001', '2026-06-02 16:00:00', NULL, NULL, 390000.00, 0.00, 0.00, 'FULL', 'PENDING', 'SHIPPING', '2026-06-01 16:45:00', '2026-06-02 16:00:00'),
(8, '#TS-2026-00135', 8, NULL, 8, 240000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, 'Khách hàng yêu cầu hủy, không có nhu cầu nữa', 270000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-06-01 09:00:00', '2026-06-01 10:30:00'),
(9, '#TS-2026-00136', 1, NULL, 1, 300000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 330000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-03 11:00:00', '2026-06-03 11:00:00'),
(10, '#TS-2026-00137', 2, 2, 2, 600000.00, 50000.00, 0.00, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260603002', '2026-06-02 08:00:00', '2026-06-03 14:00:00', NULL, 550000.00, 0.00, 0.00, 'FULL', 'PAID', 'COMPLETED', '2026-05-30 08:00:00', '2026-06-03 14:00:00'),
(11, '#TS-2026-00138', 4, NULL, 4, 720000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 900000.00, 450000.00, 450000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'CONFIRMED', '2026-06-14 11:00:00', '2026-06-14 12:00:00'),
(12, '#TS-2026-00139', 8, NULL, 8, 540000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 640000.00, 320000.00, 320000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'PRINTING', '2026-06-15 10:00:00', '2026-06-16 09:00:00'),
(13, '#TS-2026-00140', 2, NULL, 2, 560000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 740000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-06-15 13:00:00', '2026-06-15 14:00:00'),
(14, '#TS-2026-00141', 7, NULL, 7, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 150000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-06-16 09:00:00', '2026-08-06 06:48:55'),
(15, '#TS-2026-00142', 5, NULL, 5, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-16 10:00:00', '2026-06-16 10:10:00'),
(16, '#TS-2026-00143', 6, NULL, 6, 360000.00, 0.00, 30000.00, 'Giao Hàng Nhanh', 'Tiêu chuẩn', 'GHN202606180143', '2026-06-17 09:00:00', '2026-06-18 16:30:00', NULL, 390000.00, 0.00, 390000.00, 'FULL', 'PENDING', 'COMPLETED', '2026-06-16 14:00:00', '2026-06-18 16:30:00'),
(17, '#TS-2026-00144', 3, NULL, 3, 560000.00, 0.00, 30000.00, 'Viettel Post', 'Nhanh', 'VTP202606190144', '2026-06-18 08:00:00', '2026-06-19 15:00:00', NULL, 770000.00, 385000.00, 385000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'COMPLETED', '2026-06-17 08:00:00', '2026-06-19 15:00:00'),
(18, '#TS-2026-00145', 1, NULL, 1, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-17 10:00:00', '2026-06-17 10:00:00'),
(20, 'TS-20260711-QNGUL9', 20, NULL, 11, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 215000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-11 06:15:47', '2026-07-11 06:15:47'),
(21, 'TS-20260717-XMWOPI', 21, NULL, 12, 240000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 240000.00, 0.00, 240000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:16:32', '2026-07-17 17:16:32'),
(22, 'TS-20260717-LAIGOF', 20, NULL, 13, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 215000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-07-17 17:42:13', '2026-08-06 06:48:55'),
(23, 'TS-20260717-Z4I529', 20, NULL, 14, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 215000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-07-17 17:42:13', '2026-08-06 06:48:55'),
(24, 'TS-20260717-J21USW', 20, NULL, 15, 360000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 395000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-07-17 17:43:17', '2026-08-06 06:48:55'),
(25, 'TS-20260717-E8OZ1F', 20, NULL, 16, 360000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 395000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-07-17 17:43:17', '2026-08-06 06:48:55'),
(26, 'TS-20260717-5RPGIL', 21, NULL, 17, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 120000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-07-17 17:49:53', '2026-08-06 06:48:55'),
(27, 'TS-20260717-QW0207', 21, NULL, 18, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 120000.00, 0.00, 120000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:50:59', '2026-07-17 17:50:59'),
(28, 'TS-20260717-ZG56AI', 20, NULL, 19, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 155000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-07-17 17:53:28', '2026-08-06 06:48:55'),
(29, 'TS-20260717-IQLQ8P', 20, NULL, 20, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 17:53:28', '2026-07-17 17:53:28'),
(30, 'TS-20260717-CS3MCU', 21, NULL, 21, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 120000.00, 0.00, 120000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 18:05:25', '2026-07-17 18:05:25'),
(37, 'TS-20260718-NAGSAH', 20, NULL, 28, 600000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 635000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-07-18 19:46:35', '2026-07-18 19:48:35'),
(38, 'TS-20260718-0OVCJU', 20, NULL, 29, 600000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 635000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CANCELLED', '2026-07-18 19:46:35', '2026-08-06 06:48:55'),
(39, 'TS-20260718-86GJSD', 16, NULL, 30, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-07-18 23:22:00', '2026-07-18 23:22:00'),
(40, 'TS-20260718-3L26Y9', 16, NULL, 31, 120000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 155000.00, 0.00, 0.00, 'FULL', 'PAID', 'PENDING', '2026-07-18 23:22:01', '2026-07-18 23:22:51'),
(41, 'TS-20260804-FEEY61', 16, NULL, 35, 360000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 395000.00, 197500.00, 197500.00, 'DEPOSIT', 'PARTIALLY_PAID', 'PENDING', '2026-08-04 18:50:11', '2026-08-04 18:51:23'),
(42, 'TS-20260804-3LSAF9', 16, NULL, 36, 360000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 395000.00, 197500.00, 197500.00, 'DEPOSIT', 'PENDING', 'CANCELLED', '2026-08-04 18:50:11', '2026-08-06 06:48:55'),
(43, 'TS-20260804-1LHOE0', 16, NULL, 37, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 215000.00, 0.00, 0.00, 'FULL', 'PAID', 'PENDING', '2026-08-04 22:15:28', '2026-08-04 22:16:29'),
(44, 'TS-20260804-LA6LXV', 16, NULL, 38, 180000.00, 0.00, 35000.00, NULL, NULL, NULL, NULL, NULL, NULL, 215000.00, 0.00, 0.00, 'FULL', 'PENDING', 'CONFIRMED', '2026-08-04 22:15:28', '2026-08-04 22:17:07'),
(45, 'TS-20260805-GC4ZEN', 24, NULL, 39, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 190000.00, 95000.00, 95000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'PENDING', '2026-08-05 00:48:08', '2026-08-05 00:51:25'),
(46, 'TS-20260805-PZ1GAB', 24, NULL, 40, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, 'Hủy tự động do quá hạn thanh toán 24 giờ', 190000.00, 95000.00, 95000.00, 'DEPOSIT', 'PENDING', 'CANCELLED', '2026-08-05 00:48:09', '2026-08-06 06:48:55'),
(47, 'TS-20260805-9V0TOA', 24, NULL, 41, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 150000.00, 0.00, 150000.00, 'FULL', 'PENDING', 'PENDING', '2026-08-05 00:54:24', '2026-08-05 00:54:24'),
(48, 'TS-20260805-RXWK15', 24, NULL, 42, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 150000.00, 0.00, 150000.00, 'FULL', 'PENDING', 'PENDING', '2026-08-05 00:54:24', '2026-08-05 00:54:24'),
(49, 'TS-20260805-JM8KIW', 24, NULL, 43, 180000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 250000.00, 0.00, 0.00, 'FULL', 'PAID', 'PROCESSING', '2026-08-05 01:27:18', '2026-08-05 02:48:39'),
(50, 'TS-20260805-DELVAM', 24, NULL, 44, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 210000.00, 105000.00, 105000.00, 'DEPOSIT', 'PENDING', 'PENDING', '2026-08-05 01:35:40', '2026-08-05 01:35:40'),
(51, 'TS-20260805-B3YKOP', 24, NULL, 43, 240000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 330000.00, 0.00, 0.00, 'FULL', 'PAID', 'PENDING', '2026-08-05 18:45:00', '2026-08-05 18:45:34'),
(52, 'TS-20260805-DTTIKF', 24, NULL, 43, 240000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 350000.00, 175000.00, 175000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'PENDING', '2026-08-05 19:07:55', '2026-08-05 19:08:55'),
(53, 'TS-20260805-CGW21R', 20, NULL, 45, 2800000.00, 152000.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 3830400.00, 0.00, 0.00, 'FULL', 'PENDING', 'PROCESSING', '2026-08-05 21:11:57', '2026-08-05 21:15:45'),
(54, 'TS-20260805-Z1PDKJ', 20, NULL, 46, 3888000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 3888000.00, 1944000.00, 1944000.00, 'DEPOSIT', 'PENDING', 'PENDING', '2026-08-05 22:27:57', '2026-08-05 22:27:57'),
(55, 'TS-20260805-AWOEAZ', 20, NULL, 47, 3888000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 3888000.00, 1944000.00, 1944000.00, 'DEPOSIT', 'PENDING', 'PENDING', '2026-08-05 22:32:33', '2026-08-05 22:32:33'),
(56, 'TS-20260805-LELO8U', 20, NULL, 48, 3888000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 3888000.00, 1944000.00, 1944000.00, 'DEPOSIT', 'PENDING', 'PENDING', '2026-08-05 22:38:55', '2026-08-05 22:38:55'),
(57, 'TS-20260805-AIWSJ7', 20, NULL, 49, 3888000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 4082400.00, 2041200.00, 2041200.00, 'DEPOSIT', 'PENDING', 'PENDING', '2026-08-05 22:45:48', '2026-08-05 22:45:48'),
(58, 'TS-20260805-78ZZEO', 20, NULL, 50, 180000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 273000.00, 136500.00, 136500.00, 'DEPOSIT', 'PENDING', 'PENDING', '2026-08-05 22:49:20', '2026-08-05 22:49:20');

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `designprintmethod`
--

INSERT INTO `designprintmethod` (`id`, `designId`, `printMethodId`, `extraCost`) VALUES
(12, 29, 4, 20000.00),
(13, 39, 4, 20000.00),
(16, 40, 4, 20000.00);

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
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `designprintposition`
--

INSERT INTO `designprintposition` (`id`, `designId`, `printPositionId`, `extraCost`) VALUES
(16, 29, 1, 0.00),
(17, 28, 1, 0.00),
(31, 35, 1, 0.00),
(35, 36, 2, 20000.00),
(36, 36, 1, 0.00),
(45, 37, 2, 20000.00),
(46, 37, 1, 0.00),
(47, 38, 1, 0.00),
(50, 34, 2, 20000.00),
(51, 34, 1, 0.00),
(56, 39, 2, 20000.00),
(57, 39, 1, 0.00),
(61, 40, 1, 0.00);

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
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(62, 5, NULL, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-H2DOY9 - giữ tồn kho ngay khi tạo đơn', '2026-07-18 19:43:50'),
(63, 5, 37, NULL, -3, 'EXPORT', 'Tạo đơn hàng TS-20260718-NAGSAH - giữ tồn kho ngay khi tạo đơn', '2026-07-18 19:46:35'),
(64, 6, 37, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-NAGSAH - giữ tồn kho ngay khi tạo đơn', '2026-07-18 19:46:35'),
(65, 2, 37, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-NAGSAH - giữ tồn kho ngay khi tạo đơn', '2026-07-18 19:46:35'),
(66, 5, 38, NULL, -3, 'EXPORT', 'Tạo đơn hàng TS-20260718-0OVCJU - giữ tồn kho ngay khi tạo đơn', '2026-07-18 19:46:35'),
(67, 6, 38, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-0OVCJU - giữ tồn kho ngay khi tạo đơn', '2026-07-18 19:46:35'),
(68, 2, 38, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-0OVCJU - giữ tồn kho ngay khi tạo đơn', '2026-07-18 19:46:35'),
(69, 2, 39, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-86GJSD - giữ tồn kho ngay khi tạo đơn', '2026-07-18 23:22:00'),
(70, 2, 40, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260718-3L26Y9 - giữ tồn kho ngay khi tạo đơn', '2026-07-18 23:22:01'),
(71, 1, 41, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260804-FEEY61 - giữ tồn kho ngay khi tạo đơn', '2026-08-04 18:50:11'),
(72, 2, 41, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260804-FEEY61 - giữ tồn kho ngay khi tạo đơn', '2026-08-04 18:50:11'),
(73, 1, 42, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260804-3LSAF9 - giữ tồn kho ngay khi tạo đơn', '2026-08-04 18:50:11'),
(74, 2, 42, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260804-3LSAF9 - giữ tồn kho ngay khi tạo đơn', '2026-08-04 18:50:11'),
(75, 37, 43, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260804-1LHOE0 - giữ tồn kho ngay khi tạo đơn', '2026-08-04 22:15:28'),
(76, 37, 44, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260804-LA6LXV - giữ tồn kho ngay khi tạo đơn', '2026-08-04 22:15:28'),
(77, 40, NULL, 4, 5000, 'IMPORT', 'test', '2026-08-04 22:54:00'),
(78, 40, NULL, NULL, -5000, 'EXPORT', 'oo[op', '2026-08-04 22:54:44'),
(79, 7, 45, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-GC4ZEN - giữ tồn kho ngay khi tạo đơn', '2026-08-05 00:48:08'),
(80, 7, 46, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-PZ1GAB - giữ tồn kho ngay khi tạo đơn', '2026-08-05 00:48:09'),
(81, 2, 47, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-9V0TOA - giữ tồn kho ngay khi tạo đơn', '2026-08-05 00:54:24'),
(82, 2, 48, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-RXWK15 - giữ tồn kho ngay khi tạo đơn', '2026-08-05 00:54:24'),
(83, 40, NULL, 3, 1, 'IMPORT', '', '2026-08-05 01:07:26'),
(84, 38, 49, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-JM8KIW - giữ tồn kho ngay khi tạo đơn', '2026-08-05 01:27:18'),
(85, 7, 50, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-DELVAM - giữ tồn kho ngay khi tạo đơn', '2026-08-05 01:35:40'),
(86, 40, NULL, NULL, -1, 'EXPORT', '480', '2026-08-05 04:12:25'),
(87, 1, 51, NULL, -2, 'EXPORT', 'Tạo đơn hàng TS-20260805-B3YKOP - giữ tồn kho ngay khi tạo đơn', '2026-08-05 18:45:00'),
(88, 2, 52, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-DTTIKF - giữ tồn kho ngay khi tạo đơn', '2026-08-05 19:07:55'),
(89, 4, 52, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-DTTIKF - giữ tồn kho ngay khi tạo đơn', '2026-08-05 19:07:55'),
(90, 36, 53, NULL, -10, 'EXPORT', 'Tạo đơn hàng TS-20260805-CGW21R - giữ tồn kho ngay khi tạo đơn', '2026-08-05 21:11:57'),
(91, 36, 54, NULL, -10, 'EXPORT', 'Tạo đơn hàng TS-20260805-Z1PDKJ - giữ tồn kho ngay khi tạo đơn', '2026-08-05 22:27:57'),
(92, 36, 55, NULL, -10, 'EXPORT', 'Tạo đơn hàng TS-20260805-AWOEAZ - giữ tồn kho ngay khi tạo đơn', '2026-08-05 22:32:33'),
(93, 36, 56, NULL, -10, 'EXPORT', 'Tạo đơn hàng TS-20260805-LELO8U - giữ tồn kho ngay khi tạo đơn', '2026-08-05 22:38:55'),
(94, 36, 57, NULL, -10, 'EXPORT', 'Tạo đơn hàng TS-20260805-AIWSJ7 - giữ tồn kho ngay khi tạo đơn', '2026-08-05 22:45:48'),
(95, 3, 58, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260805-78ZZEO - giữ tồn kho ngay khi tạo đơn', '2026-08-05 22:49:20'),
(96, 3, 14, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #14', '2026-08-06 06:48:55'),
(97, 20, 22, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #22', '2026-08-06 06:48:55'),
(98, 20, 23, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #23', '2026-08-06 06:48:55'),
(99, 21, 24, NULL, 2, 'RETURN', 'Hoàn kho khi hủy đơn #24', '2026-08-06 06:48:55'),
(100, 21, 25, NULL, 2, 'RETURN', 'Hoàn kho khi hủy đơn #25', '2026-08-06 06:48:55'),
(101, 2, 26, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #26', '2026-08-06 06:48:55'),
(102, 2, 28, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #28', '2026-08-06 06:48:55'),
(103, 5, 38, NULL, 3, 'RETURN', 'Hoàn kho khi hủy đơn #38', '2026-08-06 06:48:55'),
(104, 6, 38, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #38', '2026-08-06 06:48:55'),
(105, 2, 38, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #38', '2026-08-06 06:48:55'),
(106, 1, 42, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #42', '2026-08-06 06:48:55'),
(107, 2, 42, NULL, 2, 'RETURN', 'Hoàn kho khi hủy đơn #42', '2026-08-06 06:48:55'),
(108, 7, 46, NULL, 1, 'RETURN', 'Hoàn kho khi hủy đơn #46', '2026-08-06 06:48:55');

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
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(53, 37, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 19:46:35'),
(54, 38, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 19:46:35'),
(55, 37, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Admin Chính', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-07-18 19:48:24'),
(56, 37, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Admin Chính', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-07-18 19:48:35'),
(57, 39, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 23:22:00'),
(58, 40, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-18 23:22:01'),
(59, 38, 'PENDING', 'PENDING', 'VNPAY_PAYMENT_RECREATED', NULL, 'ADMIN', 'Nguyễn Đăng', 'Admin đã khởi tạo lại mã thanh toán VNPAY', '2026-08-03 19:52:34'),
(60, 41, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-04 18:50:11'),
(61, 42, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-04 18:50:11'),
(62, 43, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-04 22:15:28'),
(63, 44, NULL, 'PENDING', 'CREATED', 16, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-04 22:15:28'),
(64, 44, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Admin Chính', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-04 22:17:07'),
(65, 45, NULL, 'PENDING', 'CREATED', 24, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 00:48:08'),
(66, 46, NULL, 'PENDING', 'CREATED', 24, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 00:48:09'),
(67, 47, NULL, 'PENDING', 'CREATED', 24, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 00:54:24'),
(68, 48, NULL, 'PENDING', 'CREATED', 24, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 00:54:24'),
(69, 49, NULL, 'PENDING', 'CREATED', 24, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 01:27:18'),
(70, 50, NULL, 'PENDING', 'CREATED', 24, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 01:35:40'),
(71, 49, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Admin Chính', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-05 02:46:14'),
(72, 49, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Admin Chính', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-05 02:48:39'),
(73, 51, NULL, 'PENDING', 'CREATED', 24, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 18:45:00'),
(74, 51, NULL, 'PAID', 'PAYMENT_CONFIRMED', NULL, 'SYSTEM', 'Hệ thống', 'Đã xác nhận thanh toán qua VNPAY', '2026-08-05 18:45:34'),
(75, 52, NULL, 'PENDING', 'CREATED', 24, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 19:07:55'),
(76, 52, NULL, 'PAID', 'PAYMENT_CONFIRMED', NULL, 'SYSTEM', 'Hệ thống', 'Đã xác nhận thanh toán qua VNPAY', '2026-08-05 19:08:55'),
(77, 53, NULL, 'PENDING', 'CREATED', 20, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-08-05 21:11:57'),
(78, 53, 'PENDING', 'CONFIRMED', 'STATUS_CHANGED', NULL, 'ADMIN', 'Admin Chính', 'Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận', '2026-08-05 21:15:20'),
(79, 53, 'CONFIRMED', 'PROCESSING', 'STATUS_CHANGED', NULL, 'ADMIN', 'Admin Chính', 'Cập nhật trạng thái: Đã xác nhận → Đang xử lý in', '2026-08-05 21:15:45'),
(80, 54, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Admin Chính', 'Tạo đơn cho khách', '2026-08-05 22:27:57'),
(81, 55, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Admin Chính', 'Tạo đơn cho khách', '2026-08-05 22:32:33'),
(82, 56, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Admin Chính', 'Tạo đơn cho khách', '2026-08-05 22:38:55'),
(83, 57, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Admin Chính', 'Tạo đơn cho khách', '2026-08-05 22:45:48'),
(84, 58, NULL, 'PENDING', 'Tạo đơn cho khách', NULL, 'ADMIN', 'Admin Chính', 'Tạo đơn cho khách', '2026-08-05 22:49:20'),
(85, 14, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(86, 22, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(87, 23, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(88, 24, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(89, 25, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(90, 26, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(91, 28, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(92, 38, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(93, 42, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55'),
(94, 46, 'PENDING', 'CANCELLED', 'CANCELLED', NULL, 'SYSTEM', 'Hệ thống', 'Đã hủy đơn hàng – Lý do: Hủy tự động do quá hạn thanh toán 24 giờ', '2026-08-06 06:48:55');

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
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderitem`
--

INSERT INTO `orderitem` (`id`, `orderId`, `variantId`, `designId`, `quantity`, `unitPrice`, `designFee`, `lineTotal`, `productionStatus`) VALUES
(1, 1, 10, NULL, 3, 150000.00, 150000.00, 600000.00, 'PROCESSING'),
(2, 2, 14, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(3, 3, 20, NULL, 8, 180000.00, 200000.00, 1640000.00, 'READY_TO_SHIP'),
(4, 4, 8, NULL, 4, 120000.00, 0.00, 480000.00, 'COMPLETED'),
(5, 5, 2, NULL, 3, 120000.00, 100000.00, 460000.00, 'READY_TO_PRINT'),
(6, 6, 12, NULL, 3, 150000.00, 120000.00, 570000.00, 'PRINTING'),
(7, 7, 1, NULL, 3, 120000.00, 0.00, 360000.00, 'SHIPPING'),
(8, 8, 2, NULL, 2, 120000.00, 0.00, 240000.00, 'CANCELLED'),
(9, 9, 22, NULL, 2, 150000.00, 0.00, 300000.00, 'WAITING_DESIGN_APPROVAL'),
(10, 10, 6, NULL, 5, 120000.00, 0.00, 600000.00, 'COMPLETED'),
(11, 11, 21, NULL, 4, 180000.00, 180000.00, 900000.00, 'READY_TO_PRINT'),
(12, 12, 23, NULL, 3, 180000.00, 100000.00, 640000.00, 'PRINTING'),
(13, 13, 15, NULL, 2, 280000.00, 150000.00, 710000.00, 'PRINTING'),
(14, 14, 3, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(15, 15, 17, NULL, 1, 280000.00, 0.00, 280000.00, 'WAITING_DESIGN_APPROVAL'),
(16, 16, 24, NULL, 2, 180000.00, 0.00, 360000.00, 'COMPLETED'),
(17, 17, 18, NULL, 2, 280000.00, 180000.00, 740000.00, 'PACKED'),
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
(37, 37, 5, NULL, 3, 120000.00, 0.00, 360000.00, 'READY_TO_PRINT'),
(38, 37, 6, NULL, 1, 120000.00, 0.00, 120000.00, 'PRINTING'),
(39, 37, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(40, 38, 5, NULL, 3, 120000.00, 0.00, 360000.00, 'PRINTING'),
(41, 38, 6, NULL, 1, 120000.00, 0.00, 120000.00, 'PRINTING'),
(42, 38, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(43, 39, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'READY_TO_PRINT'),
(44, 40, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'READY_TO_PRINT'),
(45, 41, 1, NULL, 1, 120000.00, 0.00, 120000.00, 'READY_TO_PRINT'),
(46, 41, 2, NULL, 2, 120000.00, 0.00, 240000.00, 'READY_TO_PRINT'),
(47, 42, 1, NULL, 1, 120000.00, 0.00, 120000.00, 'READY_TO_PRINT'),
(48, 42, 2, NULL, 2, 120000.00, 0.00, 240000.00, 'READY_TO_PRINT'),
(49, 43, 37, NULL, 1, 180000.00, 0.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(50, 44, 37, NULL, 1, 180000.00, 0.00, 180000.00, 'WAITING_DESIGN_APPROVAL'),
(51, 45, 7, 28, 1, 120000.00, 40000.00, 160000.00, 'PRINTED'),
(52, 46, 7, 28, 1, 120000.00, 40000.00, 160000.00, 'PRINTED'),
(53, 47, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(54, 48, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL'),
(55, 49, 38, NULL, 1, 180000.00, 40000.00, 220000.00, 'READY_TO_PRINT'),
(56, 50, 7, NULL, 1, 120000.00, 60000.00, 180000.00, 'READY_TO_PRINT'),
(57, 51, 1, 35, 2, 120000.00, 60000.00, 300000.00, 'READY_TO_PRINT'),
(58, 52, 2, 36, 1, 120000.00, 80000.00, 200000.00, 'READY_TO_PRINT'),
(59, 52, 4, 36, 1, 120000.00, 0.00, 120000.00, 'READY_TO_PRINT'),
(60, 53, 36, 39, 10, 280000.00, 100000.00, 2900000.00, 'READY_TO_PRINT'),
(61, 54, 36, 39, 10, 388800.00, 0.00, 3888000.00, 'WAITING_DESIGN_APPROVAL'),
(62, 55, 36, 39, 10, 388800.00, 0.00, 3888000.00, 'WAITING_DESIGN_APPROVAL'),
(63, 56, 36, 39, 10, 388800.00, 0.00, 3888000.00, 'WAITING_DESIGN_APPROVAL'),
(64, 57, 36, 39, 10, 388800.00, 0.00, 3888000.00, 'WAITING_DESIGN_APPROVAL'),
(65, 58, 3, 29, 1, 180000.00, 50000.00, 230000.00, 'WAITING_DESIGN_APPROVAL');

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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orderproduction`
--

INSERT INTO `orderproduction` (`id`, `orderItemId`, `designId`, `status`, `note`, `approvedAt`, `printedAt`, `packedAt`, `createdAt`) VALUES
(1, 1, NULL, 'PROCESSING', 'Đã nhận file in, đang chuẩn bị máy in DTG', '2026-06-03 10:30:00', NULL, NULL, '2026-06-03 08:24:00'),
(2, 3, NULL, 'PACKED', 'Đồng phục công ty XYZ – 8 áo, đã kiểm tra chất lượng', '2026-06-02 14:10:00', '2026-06-02 16:00:00', '2026-06-03 08:30:00', '2026-06-02 13:40:00'),
(3, 5, NULL, 'APPROVED', 'Đã duyệt thiết kế, chờ gửi thông số xuống xưởng', '2026-06-03 11:00:00', NULL, NULL, '2026-06-03 10:15:00'),
(4, 6, NULL, 'PRINTING', 'Đang in lụa, dự kiến xong chiều nay', '2026-06-02 15:00:00', NULL, NULL, '2026-06-02 14:30:00'),
(5, 11, NULL, 'APPROVED', 'Thiết kế đã duyệt, đơn đang chờ gửi thông số xuống xưởng.', '2026-06-14 12:00:00', NULL, NULL, '2026-06-14 11:00:00'),
(6, 12, NULL, 'PRINTING', 'Xưởng đang in DTG theo mẫu đã duyệt.', '2026-06-15 11:00:00', NULL, NULL, '2026-06-15 10:00:00'),
(7, 13, NULL, 'PRINTING', 'Đã duyệt mẫu, đang nằm trong hàng chờ gửi xưởng.', '2026-06-15 14:00:00', NULL, NULL, '2026-06-15 13:00:00'),
(8, 14, NULL, 'WAITING_DESIGN_APPROVAL', 'Đơn áo trơn, chờ xác nhận yêu cầu sản xuất.', NULL, NULL, NULL, '2026-06-16 09:00:00'),
(9, 15, NULL, 'WAITING_DESIGN_APPROVAL', 'Chưa chuyển sản xuất do thanh toán MOMO thất bại.', NULL, NULL, NULL, '2026-06-16 10:00:00'),
(10, 17, NULL, 'PACKED', 'Đã in xong, kiểm tra chất lượng và đóng gói.', '2026-06-17 09:00:00', '2026-06-17 15:00:00', '2026-06-18 07:30:00', '2026-06-17 08:00:00'),
(15, 37, NULL, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-07-18 19:46:35'),
(16, 38, NULL, 'PRINTING', NULL, NULL, NULL, NULL, '2026-07-18 19:46:35'),
(17, 40, NULL, 'PRINTING', NULL, NULL, NULL, NULL, '2026-07-18 19:46:35'),
(18, 41, NULL, 'PRINTING', NULL, NULL, NULL, NULL, '2026-07-18 19:46:35'),
(19, 43, NULL, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-07-18 23:22:00'),
(20, 44, NULL, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-07-18 23:22:01'),
(21, 45, NULL, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-08-04 18:50:11'),
(22, 46, NULL, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-08-04 18:50:11'),
(23, 47, NULL, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-08-04 18:50:11'),
(24, 48, NULL, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-08-04 18:50:11'),
(25, 51, 28, 'PRINTED', NULL, NULL, '2026-08-05 01:03:13', NULL, '2026-08-05 00:48:08'),
(26, 52, 28, 'PRINTED', NULL, NULL, '2026-08-05 01:03:08', NULL, '2026-08-05 00:48:09'),
(27, 55, NULL, 'APPROVED', NULL, '2026-08-05 02:46:14', NULL, NULL, '2026-08-05 01:27:18'),
(28, 56, NULL, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-08-05 01:35:40'),
(29, 57, 35, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-08-05 18:45:00'),
(30, 58, 36, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-08-05 19:07:55'),
(31, 59, 36, 'READY_TO_PRINT', NULL, NULL, NULL, NULL, '2026-08-05 19:07:55'),
(32, 60, 39, 'APPROVED', NULL, '2026-08-05 21:15:20', NULL, NULL, '2026-08-05 21:11:57');

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
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(9, 9, 330000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-06-03 11:00:00'),
(10, 10, 550000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'VNP20260530001', '2026-05-30 08:15:00', NULL, NULL, '2026-05-30 08:05:00'),
(11, 11, 450000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'VNP202606140138', '2026-06-14 11:08:00', '{\"vnp_ResponseCode\":\"00\",\"vnp_TransactionNo\":\"2606140138\",\"vnp_BankCode\":\"NCB\"}', 'Đã thanh toán cọc 50% qua VNPAY.', '2026-06-14 11:00:00'),
(12, 12, 320000.00, 'MOMO', 'DEPOSIT', 'COMPLETED', 'MOMO202606150139', '2026-06-15 10:06:00', '{\"resultCode\":0,\"message\":\"Successful\",\"transId\":\"2606150139\"}', 'Đã thanh toán cọc 50% qua MOMO.', '2026-06-15 10:00:00'),
(13, 13, 740000.00, 'MOMO', 'FULL_PAYMENT', 'COMPLETED', 'MOMO202606150140', '2026-06-15 13:05:00', '{\"resultCode\":0,\"message\":\"Successful\",\"transId\":\"2606150140\"}', 'Đã thanh toán toàn bộ qua MOMO.', '2026-06-15 13:00:00'),
(14, 14, 150000.00, 'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'VNP202606160141', NULL, '{\"paymentUrlExpiresAt\":\"2026-06-16T09:15:00+07:00\",\"vnp_ResponseId\":\"f1f7833ab48542c3ad00de3956605888\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"VNP202606160141\",\"vnp_SecureHash\":\"91e168e1c1cb3c72c7de7601b19189d77f2ba82ba481372e28daae9c719e1074a550bc625d50bcfae4c40f999c4bf6883ae162b0de0337120ed8f70040625ae3\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:00.781Z\"}', 'Đang chờ khách hoàn tất VNPAY.', '2026-06-16 09:00:00'),
(15, 15, 310000.00, 'MOMO', 'FULL_PAYMENT', 'FAILED', 'MOMO202606160142', NULL, '{\"resultCode\":1006,\"message\":\"User denied payment\"}', 'Giao dịch MOMO thất bại; cho phép tạo lại mã thanh toán.', '2026-06-16 10:00:00'),
(16, 16, 390000.00, 'COD', 'COD_FINAL', 'PENDING_RECONCILIATION', NULL, NULL, NULL, 'Đơn đã giao, đang chờ kế toán xác nhận tiền COD từ đơn vị vận chuyển.', '2026-06-18 16:30:00'),
(17, 17, 385000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'VNP202606170144', '2026-06-17 08:08:00', '{\"vnp_ResponseCode\":\"00\",\"vnp_TransactionNo\":\"2606170144\",\"vnp_BankCode\":\"VCB\"}', 'Đã thu cọc 50% qua VNPAY.', '2026-06-17 08:00:00'),
(18, 17, 385000.00, 'COD', 'COD_FINAL', 'PENDING_RECONCILIATION', NULL, NULL, NULL, 'Phần tiền còn lại sau đặt cọc đang chờ đối soát COD.', '2026-06-19 15:00:00'),
(19, 18, 310000.00, 'MOMO', 'FULL_PAYMENT', 'FAILED', 'MOMO202606170145', NULL, '{\"payUrlExpiresAt\":\"2026-06-17T10:15:00+07:00\",\"partnerCode\":\"MOMO\",\"orderId\":\"MOMO202606170145\",\"requestId\":null,\"responseTime\":1784391289350,\"resultCode\":1005,\"message\":\"Giao dịch đã hết hạn hoặc không tồn tại.\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T16:14:50.458Z\"}', 'Đang chờ khách hoàn tất MOMO.', '2026-06-17 10:00:00'),
(20, 20, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260711QNGUL9', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260711061547&vnp_CurrCode=VND&vnp_ExpireDate=20260711063047&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260711-QNGUL9&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260711QNGUL9&vnp_Version=2.1.0&vnp_SecureHash=62c6bd82d53fc33b7e688154f6221d016af0bb58f293e63e1379579f381da9dcd8f2e477fa04d1998575a0173f667d6643628b6d94170f3dd3f7abc8358292f4\",\"expiresAt\":\"2026-07-10T23:30:47.623Z\",\"transactionRef\":\"TS20260711QNGUL9\",\"transactionDate\":\"20260711061547\",\"vnp_Amount\":\"21500000\",\"vnp_BankCode\":\"VNPAY\",\"vnp_CardType\":\"QRCODE\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260711-QNGUL9\",\"vnp_PayDate\":\"20260711061546\",\"vnp_ResponseCode\":\"24\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"0\",\"vnp_TransactionStatus\":\"02\",\"vnp_TxnRef\":\"TS20260711QNGUL9\",\"vnp_SecureHash\":\"c1ec2d7fb6a49084bc29d891d7c65d46bc49203a0cd9e1056fc3b44100939b29a0ac395345c9db3803f2d31ee1fe97d689c9e86eae104f244f0cb5cd7d31df79\"}', NULL, '2026-07-11 06:15:47'),
(21, 21, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 17:16:32'),
(22, 22, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'undefinedMROT6HN6ADC03E58', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260717174213&vnp_CurrCode=VND&vnp_ExpireDate=20260717175713&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=ae37cef809f7330a54328bf17fe4c380a5d476e3a650c2683313d36b9818075a3d735232e126ae353568ffe1ef6664716b428a536d1912ff2a895f99abd60f18\",\"expiresAt\":\"2026-07-17T10:57:13.074Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174213\"},\"transactionRef\":\"undefinedMROT6HN6ADC03E58\",\"vnp_ResponseId\":\"a482010983cf43af887ed6cf7689af7e\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT6HN6ADC03E58\",\"vnp_SecureHash\":\"43097e7ee9d09ee8ea622e502f23c13a58c851872b76c6378eb2c7e205bf88372c2325d61bc110f9c288dd020bc03ba4f6eead34b95cb30cd0bd8f2b4852ea63\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:01.048Z\"}', NULL, '2026-07-17 17:42:13'),
(23, 23, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'undefinedMROT6HNX9E0E3728', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260717174213&vnp_CurrCode=VND&vnp_ExpireDate=20260717175713&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=ae37cef809f7330a54328bf17fe4c380a5d476e3a650c2683313d36b9818075a3d735232e126ae353568ffe1ef6664716b428a536d1912ff2a895f99abd60f18\",\"expiresAt\":\"2026-07-17T10:57:13.101Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174213\"},\"transactionRef\":\"undefinedMROT6HNX9E0E3728\",\"vnp_ResponseId\":\"d6dc24a4a1844d5a8c4067daddb83a15\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT6HNX9E0E3728\",\"vnp_SecureHash\":\"48815a98930af87388b6c9209e7ed7cba6598521113b7b084f9ed58f38ecd5f10b6eeec875c4687a7c28252d6dcf0229bce5129ce2dbc3ff4e464879953da3f9\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:01.137Z\"}', NULL, '2026-07-17 17:42:13'),
(24, 24, 395000.00, 'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'undefinedMROT7V6Q72ECAF17', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=39500000&vnp_Command=pay&vnp_CreateDate=20260717174317&vnp_CurrCode=VND&vnp_ExpireDate=20260717175817&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=19f9db8f693ab2c83ce4bce0265120bb5f5bff587829cb740e2366dedc75d4c1215e1407a34c7bf0134f2f8233e76ee39b45b9d9a00a02f691b75807436404fc\",\"expiresAt\":\"2026-07-17T10:58:17.282Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174317\"},\"transactionRef\":\"undefinedMROT7V6Q72ECAF17\",\"vnp_ResponseId\":\"11228fe4a7b84bb7865a9406abf419b3\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT7V6Q72ECAF17\",\"vnp_SecureHash\":\"dffac8df9eab9211fb2138a2cd035eb55b51e3e7cba703ff500529f15f4909f4b880c4c087f4b5b2df47eea35d7a8310527c1d6ba930aaadd80b64557f6bd300\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:01.233Z\"}', NULL, '2026-07-17 17:43:17'),
(25, 25, 395000.00, 'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'undefinedMROT7V9SF5D9E73D', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=39500000&vnp_Command=pay&vnp_CreateDate=20260717174317&vnp_CurrCode=VND&vnp_ExpireDate=20260717175817&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=19f9db8f693ab2c83ce4bce0265120bb5f5bff587829cb740e2366dedc75d4c1215e1407a34c7bf0134f2f8233e76ee39b45b9d9a00a02f691b75807436404fc\",\"expiresAt\":\"2026-07-17T10:58:17.392Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174317\"},\"transactionRef\":\"undefinedMROT7V9SF5D9E73D\",\"vnp_ResponseId\":\"6e7c04b9f04341e2b3ffe1f96200daf1\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT7V9SF5D9E73D\",\"vnp_SecureHash\":\"e96edd468703f76f3ffd353ed7af426c6fa0a86d649bdb4c35c54910886533c2716f6c98be917327505bb6df08bb575d7e65a89c6285fbd562c7ef8c80a5439d\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:01.321Z\"}', NULL, '2026-07-17 17:43:17'),
(26, 26, 120000.00, 'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'TS202607175RPGIL', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=12000000&vnp_Command=pay&vnp_CreateDate=20260717174953&vnp_CurrCode=VND&vnp_ExpireDate=20260717180453&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-5RPGIL&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607175RPGIL&vnp_Version=2.1.0&vnp_SecureHash=a3dd83e6ebddb68e330c3b40f601024f199f42686f15da9050da484f8898e92eb678135728dc8e9b319c207a76cd3609e0bc2134add3e71e6c204058ae62f44f\",\"expiresAt\":\"2026-07-17T11:04:53.181Z\",\"transactionRef\":\"TS202607175RPGIL\",\"transactionDate\":\"20260717174953\",\"vnp_ResponseId\":\"9ba8c2a689144a46ad92d2a7a648a516\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS202607175RPGIL\",\"vnp_SecureHash\":\"b0fc535d856c4d5a5ea54867247332ee4372ff82a0e729d95e2f3f7c762fc848de6faac1d139de2a90ac724f9cfb206279eba5befafa759064be48513d6a242d\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:01.421Z\"}', NULL, '2026-07-17 17:49:53'),
(27, 27, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 17:50:59'),
(28, 28, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'TS20260717ZG56AI', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260717175328&vnp_CurrCode=VND&vnp_ExpireDate=20260717180828&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-ZG56AI&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260717ZG56AI&vnp_Version=2.1.0&vnp_SecureHash=f6bbd58b3e6a940273a5b998b1fe3935959fdf3c7b528e1224af6671991ce9074653d987c6ed7ab210ddd12ae7a1d3a7ea1351e9df9708f54123c30910393450\",\"expiresAt\":\"2026-07-17T11:08:28.655Z\",\"transactionRef\":\"TS20260717ZG56AI\",\"transactionDate\":\"20260717175328\",\"vnp_ResponseId\":\"bc5f38c244574c2abcf43a14f8b0c7b2\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260717ZG56AI\",\"vnp_SecureHash\":\"46f25e1951f079408e72b186b3f47118bfbef73d51fb9e7d77c8a0b8489d48abd9094413b14ed55f2d7397daf186cb738891f1dd45fadc50b8a0989e20f3277b\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:01.531Z\"}', NULL, '2026-07-17 17:53:28'),
(29, 29, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260717IQLQ8P', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260717175328&vnp_CurrCode=VND&vnp_ExpireDate=20260717180828&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-IQLQ8P&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260717IQLQ8P&vnp_Version=2.1.0&vnp_SecureHash=e44ab09ad703d3595f18b4752264ad6f20eccaeb5b6971632b47f180e21223065a85f826277e6af11bdcdc94b718f1af895880afdc7a25dc2058add2995829a8\",\"expiresAt\":\"2026-07-17T11:08:28.704Z\",\"transactionRef\":\"TS20260717IQLQ8P\",\"transactionDate\":\"20260717175328\",\"vnp_ResponseId\":\"cbb92e8523224ab5b7bab19d9e110dc4\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260717IQLQ8P\",\"vnp_Amount\":\"15500000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260717-IQLQ8P\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260717175327\",\"vnp_TransactionNo\":\"5385178\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"d730697cce3f982613f8a270c8b86f5b59b4f34489e9acae051836f30931ad363febe5a513be5dc22eecddf6b88d7b089b0a5390284a4d86f7af29af5b6f8d65\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-17T11:44:53.669Z\"}', NULL, '2026-07-17 17:53:28'),
(30, 30, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 18:05:25'),
(37, 37, 635000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260718NAGSAH', '2026-07-18 19:47:28', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=63500000&vnp_Command=pay&vnp_CreateDate=20260718194635&vnp_CurrCode=VND&vnp_ExpireDate=20260718200135&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260718-NAGSAH&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260718NAGSAH&vnp_Version=2.1.0&vnp_SecureHash=ed9d89d90b8f5af9b440eb28a967a1648126a0307d0df28208b54a325b3439bb8000a572d670df60fae077c578c06e5fbfb4f86090ff0e1e9f8df6c363fc8997\",\"expiresAt\":\"2026-07-18T13:01:35.126Z\",\"transactionRef\":\"TS20260718NAGSAH\",\"transactionDate\":\"20260718194635\",\"vnp_Amount\":\"63500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626343\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260718-NAGSAH\",\"vnp_PayDate\":\"20260718194718\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626343\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260718NAGSAH\",\"vnp_SecureHash\":\"3d0f8e220e638f8b5e5b66aaffdec9a577fd0ce5a055e6ff5bd672cac06f5ab1848a5c8dfa402c25c182abd95d7e6d6cb7a5fcf7ff6f07944c7d6bf92e331e16\"}', NULL, '2026-07-18 19:46:35'),
(38, 38, 635000.00, 'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'TS202607180OVCJUMSD8BLYU9E7B8548', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=63500000&vnp_Command=pay&vnp_CreateDate=20260803195234&vnp_CurrCode=VND&vnp_ExpireDate=20260803200734&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260718-0OVCJU&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607180OVCJUMSD8BLYU9E7B8548&vnp_Version=2.1.0&vnp_SecureHash=985687cffbeadbbf674e68b877a12cfe95cd439d4642f91d07686c15c3866575b4f4643e4e2ea73ed4015401e0905952d2db0ee5204c01a1a159833bb5a00b4f\",\"expiresAt\":\"2026-08-03T13:07:34.423Z\",\"transactionRef\":\"TS202607180OVCJUMSD8BLYU9E7B8548\",\"transactionDate\":\"20260803195234\",\"vnp_ResponseId\":\"88f537037f27461d962d3d0a4f6a844d\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS202607180OVCJUMSD8BLYU9E7B8548\",\"vnp_SecureHash\":\"43250dc9a2f60f3fbf8e44a41a86cbf89ca8f2facdc7ed80d5d4720bc939065cba9319b103ddd92a5edc978f50ec92b4400aa7e461f102b76ce4c92aee0a7faa\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:01.620Z\"}', NULL, '2026-07-18 19:46:35'),
(39, 39, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS2026071886GJSD', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260718232200&vnp_CurrCode=VND&vnp_ExpireDate=20260718233700&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260718-86GJSD&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS2026071886GJSD&vnp_Version=2.1.0&vnp_SecureHash=05f3e40f50b2ec9de60348e8ca89205afeb9481e18a2f215d72ec7632f5da6843a5af90c8190c551da3127789328894cf3157b0f4f56b7efdd29cb7858b062d9\",\"expiresAt\":\"2026-07-18T16:37:00.445Z\",\"transactionRef\":\"TS2026071886GJSD\",\"transactionDate\":\"20260718232200\",\"vnp_ResponseId\":\"b391be5bd1e244558cbfa6da7e5d75bd\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS2026071886GJSD\",\"vnp_Amount\":\"15500000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260718-86GJSD\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260718232203\",\"vnp_TransactionNo\":\"5386722\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"f4d9cbd574df65d9c82dbd36baac18c19e61ac4935ed7692525fa35c6c64c63c563b19564e97a8516f1425ed306bf180b144574844a950a1ed768b1de0471d95\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T17:11:07.681Z\"}', NULL, '2026-07-18 23:22:00'),
(40, 40, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS202607183L26Y9', '2026-07-18 23:22:51', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260718232201&vnp_CurrCode=VND&vnp_ExpireDate=20260718233701&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260718-3L26Y9&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607183L26Y9&vnp_Version=2.1.0&vnp_SecureHash=63003c2eaa0e4235144ee3c2920dbce462c0116f94dc258ce966619852b9b03c20349d33a04334908c0a6e21087847d2abbd1567f08e0344fc7c310fa0150ac8\",\"expiresAt\":\"2026-07-18T16:37:01.232Z\",\"transactionRef\":\"TS202607183L26Y9\",\"transactionDate\":\"20260718232201\",\"vnp_Amount\":\"15500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15626469\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260718-3L26Y9\",\"vnp_PayDate\":\"20260718232243\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15626469\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS202607183L26Y9\",\"vnp_SecureHash\":\"2e1ae5916f05949f563751556d553dbac1ee0c0630a02c6441274b3d19edff04ab6819d315cc014b5b09544566ce416301725035694608f8fa13ab85b1b43109\"}', NULL, '2026-07-18 23:22:01'),
(41, 41, 197500.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'TS20260804FEEY61', '2026-08-04 18:51:23', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=19750000&vnp_Command=pay&vnp_CreateDate=20260804185011&vnp_CurrCode=VND&vnp_ExpireDate=20260804190511&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260804-FEEY61&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260804FEEY61&vnp_Version=2.1.0&vnp_SecureHash=ef681a03b098bdee4c214a985d92750cdf3e5d03a37899b6c57af0cfe767a66ca824ea929dceeb0be4c917f3e7e4e44c1de1486f2827326dba41ab25047c86ab\",\"expiresAt\":\"2026-08-04T12:05:11.316Z\",\"transactionRef\":\"TS20260804FEEY61\",\"transactionDate\":\"20260804185011\",\"vnp_Amount\":\"19750000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15646363\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260804-FEEY61\",\"vnp_PayDate\":\"20260804185110\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15646363\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260804FEEY61\",\"vnp_SecureHash\":\"9b33118ca7c22021bbb58353ec0a943b27da76f1a96b7319e828d78dc30e6bb80560c1f4cd424f411f5bd84c8f34a962035f806e976d860dc7ea34a4e9a25fbd\"}', NULL, '2026-08-04 18:50:11'),
(42, 42, 197500.00, 'VNPAY', 'DEPOSIT', 'CANCELLED', 'TS202608043LSAF9', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=19750000&vnp_Command=pay&vnp_CreateDate=20260804185011&vnp_CurrCode=VND&vnp_ExpireDate=20260804190511&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260804-3LSAF9&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202608043LSAF9&vnp_Version=2.1.0&vnp_SecureHash=0ed5552754bccb280e94566138a7024ee04a9e570b92969c17593379c37ddfff75364df5640db4d23853d44869578c60154ea3bdbabf0ccfd4b7b0d2091dd6b7\",\"expiresAt\":\"2026-08-04T12:05:11.776Z\",\"transactionRef\":\"TS202608043LSAF9\",\"transactionDate\":\"20260804185011\",\"vnp_ResponseId\":\"ce0a07a6d7f74a1d9453db42324bc897\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS202608043LSAF9\",\"vnp_SecureHash\":\"df07833b2fc1f562895b15955c59e3e61b17a14fc167854a0e4e1ba3916b9f95690e501283051422153323d9279916620ef4878a372b9296d5c92c21a7d4da62\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:01.717Z\"}', NULL, '2026-08-04 18:50:11'),
(43, 43, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS202608041LHOE0', '2026-08-04 22:16:30', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260804221528&vnp_CurrCode=VND&vnp_ExpireDate=20260804223028&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260804-1LHOE0&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202608041LHOE0&vnp_Version=2.1.0&vnp_SecureHash=c3a4933845802a3383ea653c01e27ebaa7025892b04fbe56f892cc6adb14f965eb26d82009e4546127170422ed29932ca757c97e7354c8b5ec9a1035c4e1663f\",\"expiresAt\":\"2026-08-04T15:30:28.409Z\",\"transactionRef\":\"TS202608041LHOE0\",\"transactionDate\":\"20260804221528\",\"vnp_Amount\":\"21500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15646501\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260804-1LHOE0\",\"vnp_PayDate\":\"20260804221621\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15646501\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS202608041LHOE0\",\"vnp_SecureHash\":\"9fa424170f1238df0580e016d8334ffa79e7d7f8bb9050b7b85d1607b8f43ca4c36bed6a73c29654cd1c68ac9d8afa427dfdd738cebea3e4d3f16b81832a764b\"}', NULL, '2026-08-04 22:15:28'),
(44, 44, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260804LA6LXV', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260804221528&vnp_CurrCode=VND&vnp_ExpireDate=20260804223028&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260804-LA6LXV&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260804LA6LXV&vnp_Version=2.1.0&vnp_SecureHash=b445ef38d2a6118752883e7688f46c09549188cff0c859219091e9dad22e7cf7fa6e8c4fb3666abc80f958b0c7bea9145da17b964cab75af500665091cef2d62\",\"expiresAt\":\"2026-08-04T15:30:28.505Z\",\"transactionRef\":\"TS20260804LA6LXV\",\"transactionDate\":\"20260804221528\",\"vnp_ResponseId\":\"dd715d802cc84a4c89bdb7f10bdf79ff\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260804LA6LXV\",\"vnp_Amount\":\"21500000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260804-LA6LXV\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260804221531\",\"vnp_TransactionNo\":\"5421319\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"0a146d4ccdeaa01e0f913edd6d21e66fdde73c1a04ce88b58d0402c088a5f10269597466d57cee55fe3a858d3c18bec0551ba535ab96c45761062a26f59941df\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-04T15:56:42.422Z\"}', NULL, '2026-08-04 22:15:28'),
(45, 45, 95000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'TS20260805GC4ZEN', '2026-08-05 00:51:26', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=9500000&vnp_Command=pay&vnp_CreateDate=20260805004808&vnp_CurrCode=VND&vnp_ExpireDate=20260805010308&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-GC4ZEN&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805GC4ZEN&vnp_Version=2.1.0&vnp_SecureHash=925b70a2541041aa10c667ac90db69e37a8e4ee690425f8c58e27781e936e494611e005e9297f536548159df7583a559ce1979973c6e182ea5f494907faea978\",\"expiresAt\":\"2026-08-04T18:03:08.197Z\",\"transactionRef\":\"TS20260805GC4ZEN\",\"transactionDate\":\"20260805004808\",\"vnp_Amount\":\"9500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15646664\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-GC4ZEN\",\"vnp_PayDate\":\"20260805005117\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15646664\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260805GC4ZEN\",\"vnp_SecureHash\":\"f51d9978bb949c7c21fac496c954fd3bb891ff93eb86dedb8b16c74cf3ceb618a1dc8172788bac585a98a0429d7d0007b84dfe8a5598dc4ccdb4ab23dadc209a\"}', NULL, '2026-08-05 00:48:08'),
(46, 46, 95000.00, 'VNPAY', 'DEPOSIT', 'CANCELLED', 'TS20260805PZ1GAB', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=9500000&vnp_Command=pay&vnp_CreateDate=20260805004809&vnp_CurrCode=VND&vnp_ExpireDate=20260805010309&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-PZ1GAB&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805PZ1GAB&vnp_Version=2.1.0&vnp_SecureHash=7a8968c9bbf5e000f8af1395757e205664f703bd7b17962acdc5ca5eb7e6463b84f06b8226de66efd4c493861844a7d0f4de3500b5e112d9f14fe938c23bf07d\",\"expiresAt\":\"2026-08-04T18:03:09.090Z\",\"transactionRef\":\"TS20260805PZ1GAB\",\"transactionDate\":\"20260805004809\",\"vnp_ResponseId\":\"daa0f0d1e0104e37aa0bf40ed9583a1b\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260805PZ1GAB\",\"vnp_SecureHash\":\"ac9622e2ae6d99f4dbf2c0d345dd5ee0ae10d7dea1ed7d74d97f705c9fbe5247a0c2b2646435d41e4b5947ad38981608abf61c4cc4039e22b105c58640443cc9\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T15:45:02.096Z\"}', NULL, '2026-08-05 00:48:09'),
(47, 47, 150000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-08-05 00:54:24'),
(48, 48, 150000.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-08-05 00:54:24'),
(49, 49, 250000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260805JM8KIW', '2026-08-05 01:30:18', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=25000000&vnp_Command=pay&vnp_CreateDate=20260805012718&vnp_CurrCode=VND&vnp_ExpireDate=20260805014218&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-JM8KIW&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805JM8KIW&vnp_Version=2.1.0&vnp_SecureHash=0ef837cf5caa3a04035c9c48f1caf525440df356a34ff11a2bc20af512a36ac487577542e4fab040c3020fad074622290ad05e02c527faa1a43b4ef59aa91175\",\"expiresAt\":\"2026-08-04T18:42:18.970Z\",\"transactionRef\":\"TS20260805JM8KIW\",\"transactionDate\":\"20260805012718\",\"vnp_Amount\":\"25000000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15646682\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-JM8KIW\",\"vnp_PayDate\":\"20260805012915\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15646682\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260805JM8KIW\",\"vnp_SecureHash\":\"1649baba8da38937dd53dc67fc5483093902f2cb17a0d1fab18ce71aaea2bfbae99f49ae941c3703bf35d4412d159804bcd9e7b88acdcb7bc3fe70d3350f6263\"}', NULL, '2026-08-05 01:27:18'),
(50, 50, 105000.00, 'VNPAY', 'DEPOSIT', 'FAILED', 'TS20260805DELVAM', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=10500000&vnp_Command=pay&vnp_CreateDate=20260805013540&vnp_CurrCode=VND&vnp_ExpireDate=20260805015040&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-DELVAM&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805DELVAM&vnp_Version=2.1.0&vnp_SecureHash=b1561f64155f5155c2543b1eb51b1cd30a9a2b17fe571ce5526a314d0c6ec9cc7ba2b2f0114b86ee060ee02768030823636b6863d4c900bc459b5a45863e4903\",\"expiresAt\":\"2026-08-04T18:50:40.214Z\",\"transactionRef\":\"TS20260805DELVAM\",\"transactionDate\":\"20260805013540\",\"vnp_ResponseId\":\"2a27a310833f4b9e9e54770458cffe40\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260805DELVAM\",\"vnp_Amount\":\"10500000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-DELVAM\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260805013544\",\"vnp_TransactionNo\":\"5421595\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"ece690d4b3c002d4aaf5d34091e15c99987d4bc371a469fc70a5bd29f6ecd6b821fe0a2431dd3aab9cd010c836ae719171cc3c6f40af047791eeb66eda60cf2a\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-04T19:22:05.114Z\"}', NULL, '2026-08-05 01:35:40'),
(51, 51, 330000.00, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260805B3YKOP', '2026-08-05 18:45:34', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=33000000&vnp_Command=pay&vnp_CreateDate=20260805184500&vnp_CurrCode=VND&vnp_ExpireDate=20260805190000&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-B3YKOP&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805B3YKOP&vnp_Version=2.1.0&vnp_SecureHash=8a48d2175d02079ad511cc94d953e3a01cca7b88872cc7d5cc22dda6468864401dacdc6a8ac78b9172867dac598f18fc1f8278e132957945bfdd8f79d1a9fe70\",\"expiresAt\":\"2026-08-05T12:00:00.234Z\",\"transactionRef\":\"TS20260805B3YKOP\",\"transactionDate\":\"20260805184500\",\"vnp_Amount\":\"33000000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15647581\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-B3YKOP\",\"vnp_PayDate\":\"20260805184529\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15647581\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260805B3YKOP\",\"vnp_SecureHash\":\"0b72175397d0dd9c731cbcdd56d12e3827734fdede1cfafc283d6d9a04340f1776b256c960729cb212184b79a8d8b3449aa034a9aaac05e9544fa071484c537f\"}', NULL, '2026-08-05 18:45:00'),
(52, 52, 175000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'TS20260805DTTIKF', '2026-08-05 19:08:56', '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=17500000&vnp_Command=pay&vnp_CreateDate=20260805190755&vnp_CurrCode=VND&vnp_ExpireDate=20260805192255&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-DTTIKF&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805DTTIKF&vnp_Version=2.1.0&vnp_SecureHash=5ee40442097761833e70129d32b94c168d16bd577d222fa0d29654a955b5ebb9d6c0013e3e8a5fca5c5af32af4a989ca09f09d8bc93472e9071f3484950711ad\",\"expiresAt\":\"2026-08-05T12:22:55.240Z\",\"transactionRef\":\"TS20260805DTTIKF\",\"transactionDate\":\"20260805190755\",\"vnp_Amount\":\"17500000\",\"vnp_BankCode\":\"NCB\",\"vnp_BankTranNo\":\"VNP15647604\",\"vnp_CardType\":\"ATM\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-DTTIKF\",\"vnp_PayDate\":\"20260805190851\",\"vnp_ResponseCode\":\"00\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"15647604\",\"vnp_TransactionStatus\":\"00\",\"vnp_TxnRef\":\"TS20260805DTTIKF\",\"vnp_SecureHash\":\"76d1f42d3298824a6bd65b36f9a3279a98ceaf73ebb7935f42a124412c5980470d95b366bb6e26688ab4220d0994ca90154d8c64098b19cea83b0e6545cb9e19\"}', NULL, '2026-08-05 19:07:55'),
(53, 53, 3830400.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260805CGW21R', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=383040000&vnp_Command=pay&vnp_CreateDate=20260805211157&vnp_CurrCode=VND&vnp_ExpireDate=20260805212657&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-CGW21R&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805CGW21R&vnp_Version=2.1.0&vnp_SecureHash=16a6d06699285db2ccd7c7e273c305819e20ccc83923b3e155470561cf73e6e74a0185b455753746f960f9648def3597547c343935565a94c5326ef1a4668352\",\"expiresAt\":\"2026-08-05T14:26:57.510Z\",\"transactionRef\":\"TS20260805CGW21R\",\"transactionDate\":\"20260805211157\",\"vnp_Amount\":\"383040000\",\"vnp_BankCode\":\"VNPAY\",\"vnp_CardType\":\"QRCODE\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-CGW21R\",\"vnp_PayDate\":\"20260805211153\",\"vnp_ResponseCode\":\"15\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"0\",\"vnp_TransactionStatus\":\"02\",\"vnp_TxnRef\":\"TS20260805CGW21R\",\"vnp_SecureHash\":\"33d40c686cb68355889b45978337c7b55ce1cd1603bcde75f7d628a9efa6364e40f46ff28fba03741d200bcfdc5b6347853924388f87596ef19ad7effe78ba65\"}', NULL, '2026-08-05 21:11:57'),
(54, 54, 1944000.00, 'VNPAY', 'DEPOSIT', 'FAILED', 'TS20260805Z1PDKJ', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=194400000&vnp_Command=pay&vnp_CreateDate=20260805222757&vnp_CurrCode=VND&vnp_ExpireDate=20260805224257&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-Z1PDKJ&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805Z1PDKJ&vnp_Version=2.1.0&vnp_SecureHash=b5545b0a65164c60883686e50e1cca08426b67679a9b6b868e14f2314b64fcdcae5e5fa0db8c5e49565a23744b3ea6b2b0e9ed732ab6451dc858316884269a03\",\"expiresAt\":\"2026-08-05T15:42:57.831Z\",\"transactionRef\":\"TS20260805Z1PDKJ\",\"transactionDate\":\"20260805222757\",\"vnp_ResponseId\":\"221fd71cb33d4c87bec940e3862284a3\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260805Z1PDKJ\",\"vnp_Amount\":\"194400000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-Z1PDKJ\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260805222908\",\"vnp_TransactionNo\":\"5423364\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"409bdf6e39bb182ef2fa281b5fc57c0489daf72a52a738399304f2c2068a74817831f8f729899fb31953ffe9a77dc8d65745569ce053b042bd2e174f5be64c54\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T23:49:03.933Z\"}', NULL, '2026-08-05 22:27:57'),
(55, 55, 1944000.00, 'MOMO', 'DEPOSIT', 'FAILED', 'TS-20260805-AWOEAZ.MSG8X1W4.D35017ECB7', NULL, '{\"paymentUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xUUy0yMDI2MDgwNS1BV09FQVouTVNHOFgxVzQuRDM1MDE3RUNCNw&s=908496d0b8776d623358982b96f43a365b22f74b9a6565767ef17290b4a4777e\",\"qrCodeValue\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xUUy0yMDI2MDgwNS1BV09FQVouTVNHOFgxVzQuRDM1MDE3RUNCNw&s=908496d0b8776d623358982b96f43a365b22f74b9a6565767ef17290b4a4777e\",\"providerQrCodeValue\":null,\"deeplink\":null,\"requestType\":\"payWithMethod\",\"expiresInMinutes\":100,\"expiresAt\":\"2026-08-05T17:12:25.264Z\",\"transactionRef\":\"TS-20260805-AWOEAZ.MSG8X1W4.D35017ECB7\",\"requestId\":\"REQMSGQNKJQ773362ABB8\",\"gatewayCreateResponse\":{\"partnerCode\":\"MOMO\",\"orderId\":\"TS-20260805-AWOEAZ.MSG8X1W4.D35017ECB7\",\"requestId\":\"REQMSG8X1W4ABFDC0076D\",\"amount\":1944000,\"responseTime\":1785943945264,\"resultCode\":0,\"message\":\"Thành công.\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xUUy0yMDI2MDgwNS1BV09FQVouTVNHOFgxVzQuRDM1MDE3RUNCNw&s=908496d0b8776d623358982b96f43a365b22f74b9a6565767ef17290b4a4777e\",\"shortLink\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xUUy0yMDI2MDgwNS1BV09FQVouTVNHOFgxVzQuRDM1MDE3RUNCNw&s=908496d0b8776d623358982b96f43a365b22f74b9a6565767ef17290b4a4777e\"},\"partnerCode\":\"MOMO\",\"orderId\":\"TS-20260805-AWOEAZ.MSG8X1W4.D35017ECB7\",\"extraData\":\"eyJvcmRlckNvZGUiOiJUUy0yMDI2MDgwNS1BV09FQVoifQ==\",\"amount\":1944000,\"transId\":0,\"payType\":\"\",\"resultCode\":1005,\"refundTrans\":[],\"message\":\"Giao dịch đã hết hạn hoặc không tồn tại.\",\"responseTime\":1785973736799,\"lastUpdated\":1785943945262,\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T23:49:04.069Z\"}', NULL, '2026-08-05 22:32:33'),
(56, 56, 1944000.00, 'VNPAY', 'DEPOSIT', 'FAILED', 'TS20260805LELO8U', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=194400000&vnp_Command=pay&vnp_CreateDate=20260805223855&vnp_CurrCode=VND&vnp_ExpireDate=20260805225355&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-LELO8U&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805LELO8U&vnp_Version=2.1.0&vnp_SecureHash=ae9d9f6fe6d67aa00671b59da5cbd8f71b1036e82fd9b1f1662313525c8a7737ea65e4b9772a0402b63d74dcaa7541a1e62ef562e62df22bde79a64e96093c9e\",\"expiresAt\":\"2026-08-05T15:53:55.429Z\",\"transactionRef\":\"TS20260805LELO8U\",\"transactionDate\":\"20260805223855\",\"vnp_ResponseId\":\"1fb8486a4f8d4c6b91d2b9c3db2d4433\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260805LELO8U\",\"vnp_Amount\":\"194400000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-LELO8U\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260805223851\",\"vnp_TransactionNo\":\"5423374\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"c8f304e7b4395d17f2b9342b6741b3d4b38d73e629f77db5956ba3d5bb583e01e92df85077655e9cde94b61fb0ee51ff89c6b46e5eadcd4237472b5e0b7a37af\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T23:49:05.568Z\"}', NULL, '2026-08-05 22:38:55'),
(57, 57, 2041200.00, 'VNPAY', 'DEPOSIT', 'FAILED', 'TS20260805AIWSJ7', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=204120000&vnp_Command=pay&vnp_CreateDate=20260805224548&vnp_CurrCode=VND&vnp_ExpireDate=20260805230048&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260805-AIWSJ7&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260805AIWSJ7&vnp_Version=2.1.0&vnp_SecureHash=d305e92ce5f55b3daf8a89d6ff2b808c58137ac08ef507ff42fea0cee6b0f164678a88095daf89c7fb3106681a004440de216573dc78551d1bdd8e90c0f77c07\",\"expiresAt\":\"2026-08-05T16:00:48.456Z\",\"transactionRef\":\"TS20260805AIWSJ7\",\"transactionDate\":\"20260805224548\",\"vnp_ResponseId\":\"ac92fe77b2c64661bb327879129a8100\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260805AIWSJ7\",\"vnp_Amount\":\"204120000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260805-AIWSJ7\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260805224546\",\"vnp_TransactionNo\":\"5423381\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"463db436a35dcdc6db95a15044011dfd12582f73b0381f458292e79b709eb8f68b1ce63669a94b9bef648018f1ecb13569e63ea3369f3a9e5d7d250bdfee4fc5\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T23:49:05.729Z\"}', NULL, '2026-08-05 22:45:48'),
(58, 58, 136500.00, 'MOMO', 'DEPOSIT', 'FAILED', 'TS-20260805-78ZZEO.MSG9IN3Z.E1ADD2E640', NULL, '{\"paymentUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xUUy0yMDI2MDgwNS03OFpaRU8uTVNHOUlOM1ouRTFBREQyRTY0MA&s=526831c69c4a7d58cb71a7d44c8e351dd6c5465b7400c1c615014636a97671da\",\"qrCodeValue\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xUUy0yMDI2MDgwNS03OFpaRU8uTVNHOUlOM1ouRTFBREQyRTY0MA&s=526831c69c4a7d58cb71a7d44c8e351dd6c5465b7400c1c615014636a97671da\",\"providerQrCodeValue\":null,\"deeplink\":null,\"requestType\":\"payWithMethod\",\"expiresInMinutes\":100,\"expiresAt\":\"2026-08-05T17:29:12.554Z\",\"transactionRef\":\"TS-20260805-78ZZEO.MSG9IN3Z.E1ADD2E640\",\"requestId\":\"REQMSGQNLXJD9F89BB9DB\",\"gatewayCreateResponse\":{\"partnerCode\":\"MOMO\",\"orderId\":\"TS-20260805-78ZZEO.MSG9IN3Z.E1ADD2E640\",\"requestId\":\"REQMSG9IN3ZD1B75CEBF8\",\"amount\":136500,\"responseTime\":1785944952554,\"resultCode\":0,\"message\":\"Thành công.\",\"payUrl\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xUUy0yMDI2MDgwNS03OFpaRU8uTVNHOUlOM1ouRTFBREQyRTY0MA&s=526831c69c4a7d58cb71a7d44c8e351dd6c5465b7400c1c615014636a97671da\",\"shortLink\":\"https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xUUy0yMDI2MDgwNS03OFpaRU8uTVNHOUlOM1ouRTFBREQyRTY0MA&s=526831c69c4a7d58cb71a7d44c8e351dd6c5465b7400c1c615014636a97671da\"},\"partnerCode\":\"MOMO\",\"orderId\":\"TS-20260805-78ZZEO.MSG9IN3Z.E1ADD2E640\",\"responseTime\":1785973737175,\"resultCode\":1005,\"message\":\"Giao dịch đã hết hạn hoặc không tồn tại.\",\"source\":\"query\",\"lastReconciledAt\":\"2026-08-05T23:49:05.863Z\"}', NULL, '2026-08-05 22:49:20');

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
(1, 1000, 30000.00, 500000.00, 5.00, '2026-08-05 20:07:19');

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `printmethod`
--

INSERT INTO `printmethod` (`id`, `code`, `name`, `extraCost`, `isActive`, `createdAt`) VALUES
(1, 'DTG', 'In DTG (Direct-to-Garment)', 0.00, 1, '2026-01-08 08:00:00'),
(2, 'IN_LUOI', 'In lụa (Silk Screen)', 30000.00, 0, '2026-01-08 08:01:00'),
(3, 'THEU', 'Thêu vi tính', 50000.00, 0, '2026-01-08 08:02:00'),
(4, 'VINYL', 'In cắt decal nhiệt', 20000.00, 1, '2026-01-08 08:03:00');

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
(11, 2, 'tshirt', 'wdw', 'wdw-1785858798045', 200000.00, 'eq', 'eq', 'Việt Nam', '', 'INACTIVE', '2026-08-04 22:53:18');

-- --------------------------------------------------------

--
-- Table structure for table `productimage`
--

DROP TABLE IF EXISTS `productimage`;
CREATE TABLE IF NOT EXISTS `productimage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `variantId` int DEFAULT NULL,
  `colorHex` char(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `view` enum('front','back','model') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `altText` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isPrimary` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_image_product_id` (`productId`),
  KEY `idx_product_image_variant_id` (`variantId`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productimage`
--

INSERT INTO `productimage` (`id`, `productId`, `variantId`, `colorHex`, `view`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `createdAt`) VALUES
(5, 1, NULL, '#FFFFFF', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026489/TShirt-White-Front_sjhjg8.png', 'White-front', 0, 1, '2026-06-21 14:43:01'),
(6, 1, NULL, '#FFFFFF', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-White-Back_w0ezzy.png', 'White-back', 0, 0, '2026-06-21 14:43:01'),
(7, 1, NULL, '#1E3A8A', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-Navy-Front_wc2lhf.png', 'Navy-front', 0, 0, '2026-06-21 14:43:01'),
(8, 1, NULL, '#1E3A8A', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/TShirt-Navy-Back_phdkvi.png', 'Navy-back', 0, 0, '2026-06-21 14:43:01'),
(9, 1, NULL, '#000000', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026483/TShirt-Black-Front_f0ljkq.png', 'Black-front', 0, 0, '2026-06-21 14:43:01'),
(10, 1, NULL, '#000000', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/TShirt-Black-Back_bc88nk.png', 'Black-back', 0, 0, '2026-06-21 14:43:01'),
(11, 2, NULL, '#000000', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026483/TShirt-Black-Front_f0ljkq.png', 'Black-front', 0, 1, '2026-06-21 14:43:01'),
(12, 2, NULL, '#000000', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/TShirt-Black-Back_bc88nk.png', 'Black-back', 0, 0, '2026-06-21 14:43:01'),
(13, 2, NULL, '#FFFFFF', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026489/TShirt-White-Front_sjhjg8.png', 'White-front', 0, 0, '2026-06-21 14:43:01'),
(14, 2, NULL, '#FFFFFF', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-White-Back_w0ezzy.png', 'White-back', 0, 0, '2026-06-21 14:43:01'),
(15, 2, NULL, '#1E3A8A', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026488/TShirt-Navy-Front_wc2lhf.png', 'Navy-front', 0, 0, '2026-06-21 14:43:01'),
(16, 2, NULL, '#1E3A8A', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/TShirt-Navy-Back_phdkvi.png', 'Navy-back', 0, 0, '2026-06-21 14:43:01'),
(18, 4, NULL, '#FFFFFF', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Front_b11fvx.png', 'White-front', 0, 1, '2026-06-21 14:43:01'),
(19, 4, NULL, '#FFFFFF', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026481/Polo-White-Back_vr6uas.png', 'White-back', 0, 0, '2026-06-21 14:43:01'),
(20, 4, NULL, '#D6B89A', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026484/Polo-Beige-Front_ulxjri.png', 'Beige-front', 0, 0, '2026-06-21 14:43:01'),
(21, 4, NULL, '#D6B89A', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Beige-Back_d4sp14.png', 'Beige-back', 0, 0, '2026-06-21 14:43:01'),
(22, 4, NULL, '#1E3A8A', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Front_rc2pvr.png', 'Navy-front', 0, 0, '2026-06-21 14:43:01'),
(23, 4, NULL, '#1E3A8A', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782026480/Polo-Navy-Backt_uvfyjg.png', 'Navy-back', 0, 0, '2026-06-21 14:43:01'),
(24, 3, NULL, '#9CA3AF', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209405/Hoodie-Grey-Front_boebdz.png', 'Grey-front', 1, 1, '2026-06-23 17:14:16'),
(25, 3, NULL, '#9CA3AF', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209405/Hoodie-Grey-Back_ntgcoc.png', 'Grey-back', 2, 0, '2026-06-23 17:14:16'),
(26, 3, NULL, '#8B4513', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209409/Hoodie-Brown-Front_ab4bha.png', 'Brown-front', 3, 0, '2026-06-23 17:14:16'),
(27, 3, NULL, '#8B4513', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209411/Hoodie-Brown-Back_echgn5.png', 'Brown-back', 4, 0, '2026-06-23 17:14:16'),
(28, 1, NULL, '#1E3A8A', 'model', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785851344/TshirtWide-Navy_dmghba.png', 'TshirtWide-Navy_dmghba', 0, 0, '2026-08-04 21:35:07'),
(29, 1, NULL, '#000000', 'model', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785851343/TshirtWide-Black_ppgbow.png', 'TshirtWide-Black_ppgbow', 0, 0, '2026-08-04 21:35:07'),
(30, 4, NULL, '#D6B89A', 'model', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785851337/Polo-Beige_levlhg.png', 'Polo-Beige_levlhg', 0, 0, '2026-08-04 21:35:07'),
(31, 3, NULL, '#8B4513', 'model', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785851337/Hoodie-Brown_qbpa03.png', 'Hoodie-Brown_qbpa03', 0, 0, '2026-08-04 21:35:07'),
(32, 3, NULL, '#9CA3AF', 'model', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785851336/Hoodie-Grey_ftv2an.png', 'Hoodie-Grey_ftv2an', 0, 0, '2026-08-04 21:35:07'),
(33, 1, NULL, '#FFFFFF', 'model', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785851335/TshirtWide-White_des6zh.png', 'TshirtWide-White_des6zh', 0, 0, '2026-08-04 21:35:07'),
(34, 4, NULL, '#FFFFFF', 'model', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785851335/Polo-White_d5xzmy.png', 'Polo-White_d5xzmy', 0, 0, '2026-08-04 21:35:07'),
(35, 11, NULL, '#8b4513', 'front', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785858799/teestudio/product-mockups/owfdehblf2l1bxojveyd.jpg', 'Nâu-front', 0, 1, '2026-08-04 22:53:21'),
(36, 11, NULL, '#8b4513', 'back', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785858800/teestudio/product-mockups/bxkoj0ezwyinzpqlr85e.jpg', 'Nâu-back', 1, 0, '2026-08-04 22:53:21');

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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productvariant`
--

INSERT INTO `productvariant` (`id`, `productId`, `color`, `colorHex`, `size`, `sku`, `stockQty`, `status`, `createdAt`) VALUES
(1, 1, 'Trắng', '#FFFFFF', 'S', 'ATCT-TRANG-S', 145, 'ACTIVE', '2026-01-07 08:00:00'),
(2, 1, 'Trắng', '#FFFFFF', 'M', 'ATCT-TRANG-M', 187, 'ACTIVE', '2026-01-07 08:01:00'),
(3, 1, 'Trắng', '#FFFFFF', 'L', 'ATCT-TRANG-L', 1, 'ACTIVE', '2026-01-07 08:02:00'),
(4, 1, 'Trắng', '#FFFFFF', 'XL', 'ATCT-TRANG-XL', 119, 'ACTIVE', '2026-01-07 08:03:00'),
(5, 1, 'Đen', '#000000', 'S', 'ATCT-DEN-S', 127, 'ACTIVE', '2026-01-07 08:04:00'),
(6, 1, 'Đen', '#000000', 'M', 'ATCT-DEN-M', 189, 'ACTIVE', '2026-01-07 08:05:00'),
(7, 1, 'Đen', '#000000', 'L', 'ATCT-DEN-L', 160, 'ACTIVE', '2026-01-07 08:06:00'),
(8, 1, 'Đen', '#000000', 'XL', 'ATCT-DEN-XL', 100, 'ACTIVE', '2026-01-07 08:07:00'),
(9, 2, 'Trắng', '#ffffff', 'M', 'ATOS-TRANG-M', 80, 'ACTIVE', '2026-01-07 08:08:00'),
(10, 2, 'Trắng', '#ffffff', 'L', 'ATOS-TRANG-L', 90, 'ACTIVE', '2026-01-07 08:09:00'),
(11, 2, 'Trắng', '#ffffff', 'XL', 'ATOS-TRANG-XL', 70, 'ACTIVE', '2026-01-07 08:10:00'),
(12, 2, 'Xám', '#808080', 'M', 'ATOS-XAM-M', 75, 'INACTIVE', '2026-01-07 08:11:00'),
(13, 2, 'Xám', '#808080', 'L', 'ATOS-XAM-L', 85, 'INACTIVE', '2026-01-07 08:12:00'),
(14, 3, 'Đen', '#000000', 'M', 'AHN-DEN-M', 3, 'INACTIVE', '2026-01-07 08:13:00'),
(15, 3, 'Đen', '#000000', 'L', 'AHN-DEN-L', 2, 'INACTIVE', '2026-01-07 08:14:00'),
(16, 3, 'Đen', '#000000', 'XL', 'AHN-DEN-XL', 40, 'INACTIVE', '2026-01-07 08:15:00'),
(17, 3, 'Xanh navy', '#1E3A8A', 'M', 'AHN-NAVY-M', 4, 'INACTIVE', '2026-01-07 08:16:00'),
(18, 3, 'Xanh navy', '#1E3A8A', 'L', 'AHN-NAVY-L', 2, 'INACTIVE', '2026-01-07 08:17:00'),
(19, 4, 'Trắng', '#FFFFFF', 'S', 'APL-TRANG-S', 60, 'ACTIVE', '2026-01-07 08:18:00'),
(20, 4, 'Trắng', '#FFFFFF', 'M', 'APL-TRANG-M', 80, 'ACTIVE', '2026-01-07 08:19:00'),
(21, 4, 'Trắng', '#FFFFFF', 'L', 'APL-TRANG-L', 7, 'ACTIVE', '2026-01-07 08:20:00'),
(22, 4, 'Xanh dương', '#0066CC', 'M', 'APL-XDUONG-M', 70, 'INACTIVE', '2026-01-07 08:21:00'),
(23, 4, 'Xanh dương', '#0066CC', 'L', 'APL-XDUONG-L', 0, 'INACTIVE', '2026-01-07 08:22:00'),
(24, 4, 'Xanh dương', '#0066CC', 'XL', 'APL-XDUONG-XL', 0, 'INACTIVE', '2026-01-07 08:23:00'),
(35, 3, 'Nâu', '#8B4513', 'L', 'HD-BR-L', 100, 'ACTIVE', '2026-08-04 15:04:37'),
(36, 3, 'Xám', '#9CA3AF', 'L', 'HD-GR-L', 50, 'ACTIVE', '2026-08-04 15:04:37'),
(37, 4, 'Be', '#D6B89A', 'L', 'PL-BG-L', 98, 'ACTIVE', '2026-08-04 15:04:37'),
(38, 4, 'Xanh navy', '#1E3A8A', 'L', 'PL-NV-L', 99, 'ACTIVE', '2026-08-04 15:04:37'),
(39, 1, 'Xanh navy', '#1E3A8A', 'L', 'TS-NV-L', 100, 'ACTIVE', '2026-08-04 15:04:37'),
(40, 11, 'Nâu', '#8b4513', 'XS', 'WDW-NAU-XS', 0, 'INACTIVE', '2026-08-04 22:53:18'),
(41, 2, 'Xanh navy', '#1e3a8a', 'XXL', 'AOTHUN-XAN-XXL', 0, 'ACTIVE', '2026-08-05 04:22:38');

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
(1, 'TEEWELCOME', 'PERCENT', 10.00, 200000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 500, 1, 0, 'ACTIVE', '2026-01-01 00:00:00', '2026-07-18 14:25:34'),
(2, 'SALE50K', 'FIXED', 50000.00, 300000.00, '2026-01-01 00:00:00', '2026-06-30 23:59:59', 200, 1, 0, 'ACTIVE', '2026-01-01 00:00:00', '2026-05-30 08:00:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `promotionusage`
--

INSERT INTO `promotionusage` (`id`, `promotionId`, `userId`, `orderId`, `usedAt`) VALUES
(1, 1, 1, 1, '2026-06-03 08:24:00'),
(2, 2, 2, 10, '2026-05-30 08:00:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(36, 'reading', 'hinh_ve', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782218625/reading_10139481_fbkofa.png', 16, 1, '2026-06-23 19:49:53');

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
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(9, 10, 'Khách Test Tồn Kho', '0900000999', '100 Đường Test Tồn Kho', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 1, '2026-01-03 08:08:00'),
(11, 20, 'Nguyễn Đăng', '0123456789', 'acv', '', '', '', 0, '2026-07-11 06:15:47'),
(12, 21, 'Test Task1', '0912345678', '12 Nguyen Trai, Phuong Ben Thanh, Ho Chi Minh', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 17:16:32'),
(13, 20, 'Nguyễn Đăng', '0886834024', '23, Ngọc Đường, Tuyên Quang', 'Tuyên Quang', '', 'Ngọc Đường', 0, '2026-07-17 17:42:13'),
(14, 20, 'Nguyễn Đăng', '0886834024', '23, Ngọc Đường, Tuyên Quang', 'Tuyên Quang', '', 'Ngọc Đường', 0, '2026-07-17 17:42:13'),
(15, 20, 'Nguyễn Đăng', '0886834024', '21, Sông Cầu, Đắk Lắk', 'Đắk Lắk', '', 'Sông Cầu', 0, '2026-07-17 17:43:17'),
(16, 20, 'Nguyễn Đăng', '0886834024', '21, Sông Cầu, Đắk Lắk', 'Đắk Lắk', '', 'Sông Cầu', 0, '2026-07-17 17:43:17'),
(17, 21, 'Test Task1', '0912345678', '12 Nguyen Trai, Phuong Ben Thanh, Ho Chi Minh', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 17:49:53'),
(18, 21, 'Test Task1', '0912345678', '12 Nguyen Trai, Phuong Ben Thanh, Ho Chi Minh', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 17:50:59'),
(19, 20, 'Nguyễn Đăng', '0123456789', '125, Bù Gia Mập, Đồng Nai', 'Đồng Nai', '', 'Bù Gia Mập', 0, '2026-07-17 17:53:28'),
(20, 20, 'Nguyễn Đăng', '0123456789', '125, Bù Gia Mập, Đồng Nai', 'Đồng Nai', '', 'Bù Gia Mập', 0, '2026-07-17 17:53:28'),
(21, 21, 'Test Task1', '0912345678', '12 Nguyen Trai, Phuong Ben Thanh, Ho Chi Minh', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 18:05:25'),
(28, 20, 'Nguyễn Đăng', '0123456789', '123, Lũng Cú, Tuyên Quang', 'Tuyên Quang', '', 'Lũng Cú', 0, '2026-07-18 19:46:35'),
(29, 20, 'Nguyễn Đăng', '0123456789', '123, Lũng Cú, Tuyên Quang', 'Tuyên Quang', '', 'Lũng Cú', 0, '2026-07-18 19:46:35'),
(30, 16, 'abc', '0326323808', '1, Ngọc Đường, Tuyên Quang', 'Tuyên Quang', '', 'Ngọc Đường', 0, '2026-07-18 23:22:00'),
(31, 16, 'abc', '0326323808', '1, Ngọc Đường, Tuyên Quang', 'Tuyên Quang', '', 'Ngọc Đường', 1, '2026-07-18 23:22:01'),
(35, 16, 'abc', '0326329089', '21, Tả Lèng, Lai Châu', 'Lai Châu', '', 'Tả Lèng', 0, '2026-08-04 18:50:11'),
(36, 16, 'abc', '0326329089', '21, Tả Lèng, Lai Châu', 'Lai Châu', '', 'Tả Lèng', 0, '2026-08-04 18:50:11'),
(37, 16, 'abc', '0326323156', '125, Lý Bôn, Cao Bằng', 'Cao Bằng', '', 'Lý Bôn', 0, '2026-08-04 22:15:28'),
(38, 16, 'abc', '0326323156', '125, Lý Bôn, Cao Bằng', 'Cao Bằng', '', 'Lý Bôn', 0, '2026-08-04 22:15:28'),
(39, 24, 'Nguyễn Hải Đăng', '0123456789', '35, Phú Linh, Tuyên Quang', 'Tuyên Quang', '', 'Phú Linh', 1, '2026-08-05 00:48:08'),
(40, 24, 'Nguyễn Hải Đăng', '0123456789', '35, Phú Linh, Tuyên Quang', 'Tuyên Quang', '', 'Phú Linh', 0, '2026-08-05 00:48:09'),
(41, 24, 'Nguyễn Hải Đăng', '0123456789', '12, Hương An, Huế', 'Huế', '', 'Hương An', 0, '2026-08-05 00:54:24'),
(42, 24, 'Nguyễn Hải Đăng', '0123456789', '12, Hương An, Huế', 'Huế', '', 'Hương An', 0, '2026-08-05 00:54:24'),
(43, 24, 'Nguyễn Hải Đăng', '0123456789', '35, Phú Linh, Tuyên Quang, Phú Linh, Tuyên Quang', 'Tuyên Quang', '', 'Phú Linh', 0, '2026-08-05 01:27:18'),
(44, 24, 'Nguyễn Hải Đăng', '0123456789', '35, Phú Linh, Tuyên Quang, Phú Linh, Tuyên Quang', 'Tuyên Quang', '', 'Phú Linh', 0, '2026-08-05 01:35:40'),
(45, 20, 'Nguyễn Đăng', '0123456789', '123, Lũng Cú, Tuyên Quang, Lũng Cú, Tuyên Quang', 'Tuyên Quang', '', 'Lũng Cú', 0, '2026-08-05 21:11:57'),
(46, 20, 'Nguyễn Đăng', '0123456789', 'acv', '', '', '', 0, '2026-08-05 22:27:57'),
(47, 20, 'Nguyễn Đăng', '0123456789', 'acv', '', '', '', 0, '2026-08-05 22:32:33'),
(48, 20, 'Nguyễn Đăng', '0123456789', 'acv', '', '', '', 0, '2026-08-05 22:38:55'),
(49, 20, 'Nguyễn Đăng', '0123456789', 'acv', '', '', '', 0, '2026-08-05 22:45:48'),
(50, 20, 'Nguyễn Đăng', '0123456789', 'acv', '', '', '', 0, '2026-08-05 22:49:20');

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
) ENGINE=InnoDB AUTO_INCREMENT=220 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usertoken`
--

INSERT INTO `usertoken` (`id`, `userId`, `refreshToken`, `expiresAt`, `userAgent`, `ipAddress`, `createdAt`) VALUES
(129, 29, '334aebab831ba6fd66276e8cf9539d71128e2db1510ca68bf33135c9173256cc', '2026-08-10 19:08:25', 'curl/8.19.0', '::1', '2026-08-03 19:08:25'),
(138, 16, 'db563ebece0131fa106a23b6ff6aa22929236c344ce9dd1a926801fe84ed8c9e', '2026-08-11 14:56:05', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-04 14:56:05'),
(140, 18, '8667824f45da673c0c3bac64e7465ac40458ca50c0987f3545a666e6abf1c668', '2026-08-11 15:03:30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-04 15:03:30'),
(145, 16, '186152e9d906ffeb58ff80a619b741bae48ba1c7939585ad0733d5e07219e339', '2026-08-11 19:14:35', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-04 19:14:35'),
(146, 18, '571dd954d1c29357ef5145d4dcbb00098f0ae7c4f53e3256be4182b03e480bc7', '2026-08-11 19:14:38', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-04 19:14:38'),
(165, 16, '38b33f67934d7972440fb1264023efbf3094430d8fe1187e7176a51f4c8f8370', '2026-08-12 00:35:15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-05 00:35:15'),
(176, 24, '203a633091bde538a3d4de03363d9d950abc946e6c6bca75a7284edd077f6d57', '2026-08-12 02:08:58', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-05 02:08:58'),
(181, 24, '8505abb5abc14f64741d4ad3056388400d0851d92258e271045e511cf218385b', '2026-08-12 02:58:36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-05 02:58:36'),
(187, 24, 'db83e0f32154e8acf097780d9d67bad9702755de5a33c65243c69fa72237cfb0', '2026-08-12 04:17:19', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-05 04:17:19'),
(192, 16, '30448f0875250742a9ad9ea6b2473f9ca502f31cef3c66a84d93db6a091ae32c', '2026-08-12 04:57:53', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-05 04:57:53'),
(200, 24, 'b01183e422f0fefa288e84fe519f4485ca087799978208038c16aa80c99f0e5f', '2026-08-12 20:45:12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-05 20:45:12'),
(212, 18, '04fe21977670896ea190b8aa7fe6ad08b15101b802f3d65539d6e946721de9aa', '2026-08-12 23:00:23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-05 23:00:23'),
(218, 9, '5d381ee2772caf6eac6ab8fed2915006fec056e22c68378074127d314ef722c6', '2026-08-13 07:47:59', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-08-06 07:47:59'),
(219, 9, 'b0ff05d7d05455e6ff0f5a4b7e9333fb68c8a245e3fb7bb14501d75ffa31e084', '2026-08-13 07:51:26', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '::1', '2026-08-06 07:51:26');

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
