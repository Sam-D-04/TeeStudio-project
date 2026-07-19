-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 18, 2026 at 02:29 PM
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
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_account_email` (`email`),
  KEY `idx_account_role_status` (`role`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`id`, `email`, `passwordHash`, `fullName`, `phone`, `role`, `status`, `createdAt`, `updatedAt`) VALUES
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
(18, 'admin2@teestudio.vn', '$2b$10$JXB.1D1fQPZJL3EG771ReuQYXggSl/wJS9DiVNbNcgge.8EYOWjuS', 'Admin Chính', '0987654321', 'ADMIN', 'ACTIVE', '2026-06-23 17:02:26', '2026-06-23 17:02:26'),
(20, 'dangcuh@gmail.com', '$2b$12$Qx7uifK49tM6ocW1W1Tkmu44iWx6VVn0sxZqDWD4mT8iK0zdmUwX6', 'Nguyễn Đăng', '0123456789', 'CUSTOMER', 'ACTIVE', '2026-07-11 06:10:56', '2026-07-11 06:10:56'),
(21, 'test.task1@teestudio.dev', '$2b$12$CjYsQDlFUk.B8.s9mAJPaeL7XpJyBn9p9z71MKo2VfKZ4W87wsSTm', 'Test Task1', '0912345678', 'CUSTOMER', 'ACTIVE', '2026-07-17 17:04:05', '2026-07-17 17:04:05');

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 16, '2026-07-04 16:30:23', '2026-07-04 16:35:00'),
(2, 20, '2026-07-11 06:10:56', '2026-07-11 06:10:56'),
(3, 1, '2026-07-15 20:31:28', '2026-07-15 20:31:28'),
(4, 21, '2026-07-17 23:39:53', '2026-07-17 23:39:53');

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

--
-- Dumping data for table `cartitem`
--

INSERT INTO `cartitem` (`id`, `cartId`, `variantId`, `designId`, `quantity`) VALUES
(1, 1, 2, 8, 2),
(2, 1, 20, 10, 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `createdAt`) VALUES
(1, 'Áo thun', '2026-01-05 08:00:00'),
(2, 'Áo hoodie', '2026-01-05 08:01:00'),
(3, 'Áo polo', '2026-01-05 08:02:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customdesign`
--

INSERT INTO `customdesign` (`id`, `userId`, `productId`, `variantId`, `name`, `baseColor`, `canvasData`, `previewUrl`, `printFileUrlFront`, `printFileUrlBack`, `designFee`, `status`, `adminNote`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, 10, 'Thiết kế chưa đặt tên', '#FFFFFF', '{\"layers\": [{\"x\": 150, \"y\": 100, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-cty-abc.png\", \"type\": \"image\", \"width\": 120, \"height\": 80, \"rotation\": 0}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-1.jpg', NULL, NULL, 150000.00, 'APPROVED', 'Thiết kế đã được duyệt để đưa vào sản xuất.', '2026-06-02 08:00:00', '2026-07-07 08:20:40'),
(2, 3, 4, 20, 'Thiết kế chưa đặt tên', '#FFFFFF', '{\"layers\": [{\"x\": 100, \"y\": 80, \"type\": \"text\", \"color\": \"#003399\", \"content\": \"ĐỒNG PHỤC CÔNG TY XYZ\", \"fontSize\": 24, \"fontFamily\": \"Arial\"}, {\"x\": 170, \"y\": 120, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-xyz.png\", \"type\": \"image\", \"width\": 60, \"height\": 60}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-3.jpg', NULL, NULL, 200000.00, 'APPROVED', 'Thiết kế đã được duyệt để đưa vào sản xuất.', '2026-06-01 09:00:00', '2026-07-07 08:20:40'),
(3, 5, 1, 2, 'Thiết kế chưa đặt tên', '#FFFFFF', '{\"layers\": [{\"x\": 90, \"y\": 90, \"type\": \"text\", \"color\": \"#FF6600\", \"content\": \"TEAM BUILDING 2026\", \"fontSize\": 28}], \"background\": \"#FFFFFF\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-5.jpg', NULL, NULL, 100000.00, 'APPROVED', 'Thiết kế đã được duyệt để đưa vào sản xuất.', '2026-06-02 09:00:00', '2026-07-07 08:20:40'),
(4, 6, 2, 12, 'Thiết kế chưa đặt tên', '#808080', '{\"layers\": [{\"x\": 140, \"y\": 110, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-startup.png\", \"type\": \"image\", \"width\": 100, \"height\": 70}], \"background\": \"#808080\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-6.jpg', NULL, NULL, 120000.00, 'APPROVED', 'Thiết kế đã được duyệt để đưa vào sản xuất.', '2026-06-01 10:00:00', '2026-07-07 08:20:40'),
(7, 16, 3, NULL, 'Thiết kế chưa đặt tên222312', 'Trắng', '{\"elements\": [{\"x\": 163.7142857142857, \"y\": 246.91428571428577, \"id\": \"fb67142d-d438-466f-bb7f-6d218b70c337\", \"fill\": \"#000000\", \"text\": \"Văn bản mới\", \"type\": \"text\", \"width\": 200, \"height\": 40, \"fontSize\": 28, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Montserrat\"}, {\"x\": 172.85714285714286, \"y\": 189.20000000000007, \"id\": \"3b57b772-0066-4f62-843a-4efdb8b13ed7\", \"fill\": \"#000000\", \"text\": \"Văn bản mới\", \"type\": \"text\", \"width\": 200, \"height\": 40, \"fontSize\": 28, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Quicksand\"}, {\"x\": 121.5714285714284, \"y\": 144.4285714285714, \"id\": \"f585115f-5fa0-4821-aed4-4573f1a72caf\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033314/thank-you_7328366_q8e2f3.png\", \"type\": \"image\", \"width\": 247.71428571428584, \"height\": 238.00000000000009, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782035952/teestudio/user-designs/c5jfgcj0fmixfofsphm9.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-06-21 16:58:48', '2026-06-21 16:59:13'),
(8, 16, 1, NULL, 'Thiết kế c1', '#ffffff', '{\"elements\": [{\"x\": 200.2857142857136, \"y\": 235.48571428571415, \"id\": \"ddea394b-d98f-4d7b-9076-635d6fc570eb\", \"fill\": \"#000000\", \"text\": \"Văn bản mẫu\", \"type\": \"text\", \"width\": 121.71428571428636, \"height\": 27.999999999999982, \"fontSize\": 27.999999999999982, \"rotation\": 0, \"fontStyle\": \"normal\", \"fontFamily\": \"Great Vibes\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782221859/teestudio/user-designs/lodmjw2cfeack61etict.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-06-23 20:37:41', '2026-06-23 20:37:41'),
(9, 16, 3, NULL, 'Thiết kế chưa đặt tên2312', '#8b4513', '{\"elements\": [{\"x\": 203.2, \"y\": 235.20000000000005, \"id\": \"50f64091-3316-4d8b-a907-0cafee631d80\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png\", \"type\": \"image\", \"width\": 93.6, \"height\": 93.6, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782222734/teestudio/user-designs/r0itp5mqlyfiyekrbtam.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-06-23 20:52:16', '2026-06-23 20:52:16'),
(10, 16, 4, NULL, 'Thiết kế chưa đặt tên', '#ffffff', '{\"elements\": [{\"x\": 211.8571428571429, \"y\": 236.42857142857144, \"id\": \"96f497c3-73dd-4f78-a670-e6297906b786\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782034047/planner_8512483_u5u7mb.png\", \"type\": \"image\", \"width\": 138, \"height\": 138, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1783157435/teestudio/user-designs/ww36mcft3nfoi9usmkxu.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-07-04 16:30:36', '2026-07-04 16:30:36'),
(11, 2, 3, 14, 'Hoodie Câu lạc bộ Nhiếp ảnh', '#000000', '{\"elements\": [{\"x\": 90, \"y\": 110, \"fill\": \"#FFFFFF\", \"text\": \"CAPTURE THE MOMENT\", \"type\": \"text\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-nhiep-anh.jpg', NULL, NULL, 120000.00, 'PENDING_REVIEW', NULL, '2026-06-14 08:00:00', '2026-06-14 08:30:00'),
(12, 4, 4, 21, 'Polo Đội ngũ Kinh doanh', '#FFFFFF', '{\"elements\": [{\"x\": 145, \"y\": 105, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/logos/sales-team.png\", \"type\": \"image\", \"width\": 110, \"height\": 110}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/polo-sales-team.jpg', NULL, NULL, 180000.00, 'APPROVED', 'Đã duyệt logo ngực trái và màu in.', '2026-06-14 09:00:00', '2026-06-14 10:00:00'),
(13, 7, 1, 3, 'Áo thun Sự kiện Mùa hè', '#ffffff', '{\"elements\": [{\"x\": 95, \"y\": 130, \"fill\": \"#F97316\", \"text\": \"SUMMER FEST 2026\", \"type\": \"text\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/summer-fest-2026.jpg', NULL, NULL, 80000.00, 'NEEDS_REVISION', 'Vui lòng tăng kích thước chữ và đưa nội dung vào giữa vùng in.', '2026-06-14 11:00:00', '2026-07-13 19:17:15'),
(14, 8, 4, 23, 'Polo Câu lạc bộ Chạy bộ', '#0066CC', '{\"elements\": [{\"x\": 150, \"y\": 100, \"src\": \"https://res.cloudinary.com/teestudio/image/upload/v1/icons/running-club.png\", \"type\": \"image\", \"width\": 100, \"height\": 120}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/polo-running-club.jpg', NULL, NULL, 100000.00, 'APPROVED', 'Thiết kế đạt yêu cầu in DTG.', '2026-06-15 08:00:00', '2026-06-15 09:00:00'),
(15, 1, 1, 5, 'Bản nháp Typography Tối giản', '#000000', '{\"elements\": [{\"x\": 120, \"y\": 150, \"fill\": \"#FFFFFF\", \"text\": \"LESS IS MORE\", \"type\": \"text\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/less-is-more-draft.jpg', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-06-15 09:30:00', '2026-06-15 09:30:00'),
(16, 2, 3, 15, 'Hoodie Team Building 2026', '#000000', '{\"elements\": [{\"x\": 75, \"y\": 120, \"fill\": \"#FACC15\", \"text\": \"ONE TEAM ONE DREAM\", \"type\": \"text\"}], \"shirtView\": \"back\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-team-building.jpg', NULL, NULL, 150000.00, 'APPROVED', 'Đã duyệt nội dung mặt sau.', '2026-06-15 10:00:00', '2026-06-15 11:00:00'),
(17, 3, 3, 18, 'Hoodie Workshop Công nghệ', '#003153', '{\"elements\": [{\"x\": 80, \"y\": 115, \"fill\": \"#FFFFFF\", \"text\": \"BUILD • LEARN • SHARE\", \"type\": \"text\"}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-tech-workshop.jpg', NULL, NULL, 180000.00, 'APPROVED', 'Đã duyệt mẫu in mặt trước.', '2026-06-16 08:00:00', '2026-06-16 09:00:00'),
(18, 18, 1, NULL, 'Thiết kế chưa đặt tên', '#ffffff', '{\"elements\": [{\"x\": 225.42857142857144, \"y\": 302, \"id\": \"6610e80b-d318-4ef8-95f7-1bc5311b099a\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033392/today_14356090_s4nfxf.png\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 155.7142857142857, \"y\": 198.5714285714286, \"id\": \"353a64af-ba50-4066-a931-e5bad5b605c8\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1782033314/thank-you_7328366_q8e2f3.png\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784122455/teestudio/user-designs/kz8r8v9vcuybph0qqqw6.png', NULL, NULL, 0.00, 'PENDING_REVIEW', NULL, '2026-07-11 01:52:03', '2026-07-15 20:34:09'),
(19, 20, 1, NULL, '324', '#000000', '{\"elements\": [{\"x\": 194.00000000000003, \"y\": 304.2857142857143, \"id\": \"fe37b149-14f5-4e50-8c78-cf5d895142b3\", \"src\": \"blob:http://localhost:3000/8d4ff24a-24a0-4df9-83ea-3e3b71587644\", \"type\": \"image\", \"width\": 120, \"height\": 120, \"rotation\": 0}, {\"x\": 196.8571428571423, \"y\": 261.91666666666634, \"id\": \"253101f2-bf42-4e9b-9c91-aa826dbecb23\", \"src\": \"https://res.cloudinary.com/dwol6aarv/image/upload/v1784143205/teestudio/user-designs/elkgltmhgmbrxwvchgoq.jpg\", \"type\": \"image\", \"width\": 82.85714285714344, \"height\": 63.59523809523833, \"rotation\": 0}], \"shirtView\": \"front\"}', 'https://res.cloudinary.com/dwol6aarv/image/upload/v1784143203/teestudio/user-designs/nawh24tt6lnkrihgtdpk.png', NULL, NULL, 0.00, 'DRAFT', NULL, '2026-07-11 06:57:46', '2026-07-16 02:20:06');

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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(14, '#TS-2026-00141', 7, NULL, 7, 120000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 150000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-16 09:00:00', '2026-06-16 09:00:00'),
(15, '#TS-2026-00142', 5, NULL, 5, 280000.00, 0.00, 30000.00, NULL, NULL, NULL, NULL, NULL, NULL, 310000.00, 0.00, 0.00, 'FULL', 'PENDING', 'PENDING', '2026-06-16 10:00:00', '2026-06-16 10:10:00'),
(16, '#TS-2026-00143', 6, NULL, 6, 360000.00, 0.00, 30000.00, 'Giao Hàng Nhanh', 'Tiêu chuẩn', 'GHN202606180143', '2026-06-17 09:00:00', '2026-06-18 16:30:00', NULL, 390000.00, 0.00, 390000.00, 'FULL', 'PENDING', 'COMPLETED', '2026-06-16 14:00:00', '2026-06-18 16:30:00'),
(17, '#TS-2026-00144', 3, NULL, 3, 560000.00, 0.00, 30000.00, 'Viettel Post', 'Nhanh', 'VTP202606190144', '2026-06-18 08:00:00', '2026-06-19 15:00:00', NULL, 770000.00, 385000.00, 385000.00, 'DEPOSIT', 'PARTIALLY_PAID', 'COMPLETED', '2026-06-17 08:00:00', '2026-06-19 15:00:00'),
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
(30, 'TS-20260717-CS3MCU', 21, NULL, 21, 120000.00, 0.00, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 120000.00, 0.00, 120000.00, 'FULL', 'PENDING', 'PENDING', '2026-07-17 18:05:25', '2026-07-17 18:05:25');

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(11, 17, 1, 0.00);

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(11, 16, 2, 20000.00),
(12, 17, 1, 0.00);

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
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(56, 2, 30, NULL, -1, 'EXPORT', 'Tạo đơn hàng TS-20260717-CS3MCU - giữ tồn kho ngay khi tạo đơn', '2026-07-17 18:05:25');

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
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(46, 30, NULL, 'PENDING', 'CREATED', 21, 'SYSTEM', 'Hệ thống', 'Khách hàng đặt đơn', '2026-07-17 18:05:25');

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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(30, 30, 2, NULL, 1, 120000.00, 0.00, 120000.00, 'WAITING_DESIGN_APPROVAL');

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(10, 17, 17, 'PACKED', 'Đã in xong, kiểm tra chất lượng và đóng gói.', '2026-06-17 09:00:00', '2026-06-17 15:00:00', '2026-06-18 07:30:00', '2026-06-17 08:00:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(14, 14, 150000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'VNP202606160141', NULL, '{\"paymentUrlExpiresAt\":\"2026-06-16T09:15:00+07:00\",\"vnp_ResponseId\":\"c8c8cab8addb4f47807c996f44fb20fb\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"VNP202606160141\",\"vnp_SecureHash\":\"86c04b4c0c8ebb8958196179a6733ca47d24472f193ef93faef742a8deba99385df3129591a62a52a78728042974fcaacf4d38388bd2f9ebf96517a9a7583f22\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T11:17:47.251Z\"}', 'Đang chờ khách hoàn tất VNPAY.', '2026-06-16 09:00:00'),
(15, 15, 310000.00, 'MOMO', 'FULL_PAYMENT', 'FAILED', 'MOMO202606160142', NULL, '{\"resultCode\":1006,\"message\":\"User denied payment\"}', 'Giao dịch MOMO thất bại; cho phép tạo lại mã thanh toán.', '2026-06-16 10:00:00'),
(16, 16, 390000.00, 'COD', 'COD_FINAL', 'PENDING_RECONCILIATION', NULL, NULL, NULL, 'Đơn đã giao, đang chờ kế toán xác nhận tiền COD từ đơn vị vận chuyển.', '2026-06-18 16:30:00'),
(17, 17, 385000.00, 'VNPAY', 'DEPOSIT', 'COMPLETED', 'VNP202606170144', '2026-06-17 08:08:00', '{\"vnp_ResponseCode\":\"00\",\"vnp_TransactionNo\":\"2606170144\",\"vnp_BankCode\":\"VCB\"}', 'Đã thu cọc 50% qua VNPAY.', '2026-06-17 08:00:00'),
(18, 17, 385000.00, 'COD', 'COD_FINAL', 'PENDING_RECONCILIATION', NULL, NULL, NULL, 'Phần tiền còn lại sau đặt cọc đang chờ đối soát COD.', '2026-06-19 15:00:00'),
(19, 18, 310000.00, 'MOMO', 'FULL_PAYMENT', 'FAILED', 'MOMO202606170145', NULL, '{\"payUrlExpiresAt\":\"2026-06-17T10:15:00+07:00\",\"partnerCode\":\"MOMO\",\"orderId\":\"MOMO202606170145\",\"requestId\":null,\"responseTime\":1784383999406,\"resultCode\":1005,\"message\":\"Giao dịch đã hết hạn hoặc không tồn tại.\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T14:13:46.554Z\"}', 'Đang chờ khách hoàn tất MOMO.', '2026-06-17 10:00:00'),
(20, 20, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260711QNGUL9', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260711061547&vnp_CurrCode=VND&vnp_ExpireDate=20260711063047&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260711-QNGUL9&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260711QNGUL9&vnp_Version=2.1.0&vnp_SecureHash=62c6bd82d53fc33b7e688154f6221d016af0bb58f293e63e1379579f381da9dcd8f2e477fa04d1998575a0173f667d6643628b6d94170f3dd3f7abc8358292f4\",\"expiresAt\":\"2026-07-10T23:30:47.623Z\",\"transactionRef\":\"TS20260711QNGUL9\",\"transactionDate\":\"20260711061547\",\"vnp_Amount\":\"21500000\",\"vnp_BankCode\":\"VNPAY\",\"vnp_CardType\":\"QRCODE\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260711-QNGUL9\",\"vnp_PayDate\":\"20260711061546\",\"vnp_ResponseCode\":\"24\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TransactionNo\":\"0\",\"vnp_TransactionStatus\":\"02\",\"vnp_TxnRef\":\"TS20260711QNGUL9\",\"vnp_SecureHash\":\"c1ec2d7fb6a49084bc29d891d7c65d46bc49203a0cd9e1056fc3b44100939b29a0ac395345c9db3803f2d31ee1fe97d689c9e86eae104f244f0cb5cd7d31df79\"}', NULL, '2026-07-11 06:15:47'),
(21, 21, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 17:16:32'),
(22, 22, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'undefinedMROT6HN6ADC03E58', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260717174213&vnp_CurrCode=VND&vnp_ExpireDate=20260717175713&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=ae37cef809f7330a54328bf17fe4c380a5d476e3a650c2683313d36b9818075a3d735232e126ae353568ffe1ef6664716b428a536d1912ff2a895f99abd60f18\",\"expiresAt\":\"2026-07-17T10:57:13.074Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174213\"},\"transactionRef\":\"undefinedMROT6HN6ADC03E58\",\"vnp_ResponseId\":\"b0e7738b720e485a964609735fc4b8fd\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT6HN6ADC03E58\",\"vnp_SecureHash\":\"ffc6945168b9b5610d9056c0430e67ab550515dd40d7d7a87aab3c0f88dd69164b8f365f6040cb1c8178c741cddd6f89e7865125d3e8a20d8bd5ad92cefde9c7\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T14:13:46.781Z\"}', NULL, '2026-07-17 17:42:13'),
(23, 23, 215000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'undefinedMROT6HNX9E0E3728', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=21500000&vnp_Command=pay&vnp_CreateDate=20260717174213&vnp_CurrCode=VND&vnp_ExpireDate=20260717175713&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=ae37cef809f7330a54328bf17fe4c380a5d476e3a650c2683313d36b9818075a3d735232e126ae353568ffe1ef6664716b428a536d1912ff2a895f99abd60f18\",\"expiresAt\":\"2026-07-17T10:57:13.101Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174213\"},\"transactionRef\":\"undefinedMROT6HNX9E0E3728\",\"vnp_ResponseId\":\"8e028c6cfff246c995190dc823282c14\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT6HNX9E0E3728\",\"vnp_SecureHash\":\"4e7b5a3a9d648b4ff93b6c45fc2e4679aa4a66f1fcb9d3e77a53f0557fef089283293ecd29fb0674a057870a82f86ebe25bc8c2868e45072decf50a5aba7a444\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T14:13:46.917Z\"}', NULL, '2026-07-17 17:42:13'),
(24, 24, 395000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'undefinedMROT7V6Q72ECAF17', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=39500000&vnp_Command=pay&vnp_CreateDate=20260717174317&vnp_CurrCode=VND&vnp_ExpireDate=20260717175817&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=19f9db8f693ab2c83ce4bce0265120bb5f5bff587829cb740e2366dedc75d4c1215e1407a34c7bf0134f2f8233e76ee39b45b9d9a00a02f691b75807436404fc\",\"expiresAt\":\"2026-07-17T10:58:17.282Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174317\"},\"transactionRef\":\"undefinedMROT7V6Q72ECAF17\",\"vnp_ResponseId\":\"a231f54b5c73406bb0ef5d8a3cacbbdf\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT7V6Q72ECAF17\",\"vnp_SecureHash\":\"cab66c2465b1da3adacd5912dcfe7e776b25168b1a6c4d38933ccb8453dccf953a998bc45d014f2aa67270efba3d4f5e01e5216cb699ec8a75209c4bffe3ef5c\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T14:13:47.051Z\"}', NULL, '2026-07-17 17:43:17'),
(25, 25, 395000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'undefinedMROT7V9SF5D9E73D', NULL, '{\"paymentUrl\":{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=39500000&vnp_Command=pay&vnp_CreateDate=20260717174317&vnp_CurrCode=VND&vnp_ExpireDate=20260717175817&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+undefined&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=undefined&vnp_Version=2.1.0&vnp_SecureHash=19f9db8f693ab2c83ce4bce0265120bb5f5bff587829cb740e2366dedc75d4c1215e1407a34c7bf0134f2f8233e76ee39b45b9d9a00a02f691b75807436404fc\",\"expiresAt\":\"2026-07-17T10:58:17.392Z\",\"transactionRef\":\"undefined\",\"transactionDate\":\"20260717174317\"},\"transactionRef\":\"undefinedMROT7V9SF5D9E73D\",\"vnp_ResponseId\":\"7a49964f07504e6e931f9e5ff7e4ab28\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"undefinedMROT7V9SF5D9E73D\",\"vnp_SecureHash\":\"7b29e251aa21deaae1fa7f16bdbe65ebcc37ba8b4ce83e0404bc2ee46c59144b43cd2ee416e05f49df9a97b23c86098aa7fd4e0477846e3cc3b56f72eb5c9252\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T14:13:47.177Z\"}', NULL, '2026-07-17 17:43:17'),
(26, 26, 120000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS202607175RPGIL', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=12000000&vnp_Command=pay&vnp_CreateDate=20260717174953&vnp_CurrCode=VND&vnp_ExpireDate=20260717180453&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-5RPGIL&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS202607175RPGIL&vnp_Version=2.1.0&vnp_SecureHash=a3dd83e6ebddb68e330c3b40f601024f199f42686f15da9050da484f8898e92eb678135728dc8e9b319c207a76cd3609e0bc2134add3e71e6c204058ae62f44f\",\"expiresAt\":\"2026-07-17T11:04:53.181Z\",\"transactionRef\":\"TS202607175RPGIL\",\"transactionDate\":\"20260717174953\",\"vnp_ResponseId\":\"e844acffea80404493b9970e4d1ef191\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS202607175RPGIL\",\"vnp_SecureHash\":\"732c1fbf7ce029b9e1fc21c68f655cc51c09a4d54cdc47d02cf38fefe99e0bcd6d7608ee4efdb57e74662e522bd4ce2bd08525d1eb1fc5875221a5c5428b4952\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T14:13:47.301Z\"}', NULL, '2026-07-17 17:49:53'),
(27, 27, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 17:50:59'),
(28, 28, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'PENDING', 'TS20260717ZG56AI', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260717175328&vnp_CurrCode=VND&vnp_ExpireDate=20260717180828&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-ZG56AI&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260717ZG56AI&vnp_Version=2.1.0&vnp_SecureHash=f6bbd58b3e6a940273a5b998b1fe3935959fdf3c7b528e1224af6671991ce9074653d987c6ed7ab210ddd12ae7a1d3a7ea1351e9df9708f54123c30910393450\",\"expiresAt\":\"2026-07-17T11:08:28.655Z\",\"transactionRef\":\"TS20260717ZG56AI\",\"transactionDate\":\"20260717175328\",\"vnp_ResponseId\":\"bb38b3bacee04ea4bae250d09db8d87e\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"91\",\"vnp_Message\":\"Transaction not found\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260717ZG56AI\",\"vnp_SecureHash\":\"b9331fa350bcdf31b0c82c165b8871e26a9345e76d7c85d854fe09cd71776fc7988c5638720b7edc5b06e0536a3f083077e169eb1734d45e5dbec573d26504b5\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-18T14:13:48.457Z\"}', NULL, '2026-07-17 17:53:28'),
(29, 29, 155000.00, 'VNPAY', 'FULL_PAYMENT', 'FAILED', 'TS20260717IQLQ8P', NULL, '{\"paymentUrl\":\"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15500000&vnp_Command=pay&vnp_CreateDate=20260717175328&vnp_CurrCode=VND&vnp_ExpireDate=20260717180828&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+TS-20260717-IQLQ8P&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fthanh-toan-thanh-cong&vnp_TmnCode=XZ40IDQS&vnp_TxnRef=TS20260717IQLQ8P&vnp_Version=2.1.0&vnp_SecureHash=e44ab09ad703d3595f18b4752264ad6f20eccaeb5b6971632b47f180e21223065a85f826277e6af11bdcdc94b718f1af895880afdc7a25dc2058add2995829a8\",\"expiresAt\":\"2026-07-17T11:08:28.704Z\",\"transactionRef\":\"TS20260717IQLQ8P\",\"transactionDate\":\"20260717175328\",\"vnp_ResponseId\":\"cbb92e8523224ab5b7bab19d9e110dc4\",\"vnp_Command\":\"querydr\",\"vnp_ResponseCode\":\"00\",\"vnp_Message\":\"QueryDR success\",\"vnp_TmnCode\":\"XZ40IDQS\",\"vnp_TxnRef\":\"TS20260717IQLQ8P\",\"vnp_Amount\":\"15500000\",\"vnp_OrderInfo\":\"Thanh toan don hang TS-20260717-IQLQ8P\",\"vnp_BankCode\":\"VNPAY\",\"vnp_PayDate\":\"20260717175327\",\"vnp_TransactionNo\":\"5385178\",\"vnp_TransactionType\":\"01\",\"vnp_TransactionStatus\":\"08\",\"vnp_SecureHash\":\"d730697cce3f982613f8a270c8b86f5b59b4f34489e9acae051836f30931ad363febe5a513be5dc22eecddf6b88d7b089b0a5390284a4d86f7af29af5b6f8d65\",\"source\":\"query\",\"lastReconciledAt\":\"2026-07-17T11:44:53.669Z\"}', NULL, '2026-07-17 17:53:28'),
(30, 30, 0.00, 'COD', 'COD_FINAL', 'PENDING', NULL, NULL, NULL, NULL, '2026-07-17 18:05:25');

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
(1, 1000, 30000.00, 500000.00, 0.00, '2026-07-07 08:20:40');

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `categoryId`, `shirtType`, `name`, `slug`, `basePrice`, `material`, `form`, `madeIn`, `description`, `status`, `createdAt`) VALUES
(1, 1, 'tshirt', 'Áo Thun Wide Form', 'ao-thun-wide-form', 120000.00, '100% Cotton 180gsm', 'tshirt', 'Việt Nam', 'Áo thun cotton mềm mại, thấm hút tốt, phù hợp in ấn.', 'ACTIVE', '2026-01-06 08:00:00'),
(2, 1, 'tshirt', 'Áo Thun', 'ao-thun', 150000.00, '100% Cotton 200gsm', 'tshirt', 'Việt Nam', 'Dáng rộng thoải mái, form oversize hiện đại.', 'INACTIVE', '2026-01-06 08:05:00'),
(3, 2, 'hoodie', 'Áo Hoodie', 'ao-hoodie', 280000.00, 'Nỉ bông 320gsm', 'hoodie', 'Việt Nam', 'Áo hoodie dày dặn, ấm áp, có mũ và túi kangaroo.', 'ACTIVE', '2026-01-06 08:10:00'),
(4, 3, 'polo', 'Áo Polo', 'ao-polo', 180000.00, 'Cotton pique 220gsm', 'polo', 'Việt Nam', 'Áo polo chuyên nghiệp, phù hợp đồng phục công ty.', 'ACTIVE', '2026-01-06 08:15:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(27, 3, NULL, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1782209411/Hoodie-Brown-Back_echgn5.png', 'Brown-back', 4, 0, '2026-06-23 17:14:16');

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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `productvariant`
--

INSERT INTO `productvariant` (`id`, `productId`, `color`, `colorHex`, `size`, `sku`, `stockQty`, `status`, `createdAt`) VALUES
(1, 1, 'Trắng', '#FFFFFF', 'S', 'ATCT-TRANG-S', 148, 'ACTIVE', '2026-01-07 08:00:00'),
(2, 1, 'Trắng', '#FFFFFF', 'M', 'ATCT-TRANG-M', 193, 'ACTIVE', '2026-01-07 08:01:00'),
(3, 1, 'Trắng', '#FFFFFF', 'L', 'ATCT-TRANG-L', 1, 'ACTIVE', '2026-01-07 08:02:00'),
(4, 1, 'Trắng', '#FFFFFF', 'XL', 'ATCT-TRANG-XL', 120, 'ACTIVE', '2026-01-07 08:03:00'),
(5, 1, 'Đen', '#000000', 'S', 'ATCT-DEN-S', 130, 'ACTIVE', '2026-01-07 08:04:00'),
(6, 1, 'Đen', '#000000', 'M', 'ATCT-DEN-M', 190, 'ACTIVE', '2026-01-07 08:05:00'),
(7, 1, 'Đen', '#000000', 'L', 'ATCT-DEN-L', 162, 'ACTIVE', '2026-01-07 08:06:00'),
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
(20, 4, 'Trắng', '#FFFFFF', 'M', 'APL-TRANG-M', 78, 'ACTIVE', '2026-01-07 08:19:00'),
(21, 4, 'Trắng', '#FFFFFF', 'L', 'APL-TRANG-L', 3, 'ACTIVE', '2026-01-07 08:20:00'),
(22, 4, 'Xanh dương', '#0066CC', 'M', 'APL-XDUONG-M', 70, 'ACTIVE', '2026-01-07 08:21:00'),
(23, 4, 'Xanh dương', '#0066CC', 'L', 'APL-XDUONG-L', 0, 'ACTIVE', '2026-01-07 08:22:00'),
(24, 4, 'Xanh dương', '#0066CC', 'XL', 'APL-XDUONG-XL', 0, 'ACTIVE', '2026-01-07 08:23:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(21, 21, 'Test Task1', '0912345678', '12 Nguyen Trai, Phuong Ben Thanh, Ho Chi Minh', 'Ho Chi Minh', '', 'Phuong Ben Thanh', 0, '2026-07-17 18:05:25');

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
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usertoken`
--

INSERT INTO `usertoken` (`id`, `userId`, `refreshToken`, `expiresAt`, `userAgent`, `ipAddress`, `createdAt`) VALUES
(58, 18, '27d4bce79e525ef302aad87354d14abf23b011c23b5749b842f4171c7c15963c', '2026-07-22 20:40:14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-07-15 20:40:14'),
(69, 21, '0f26f74d708a99f085ab6ff8cacc551dc395088ccfb4d0932b3ada20cbed2aa6', '2026-07-24 17:04:05', 'curl/8.19.0', '::1', '2026-07-17 17:04:05'),
(70, 21, 'deb681d7589174bb6952867b73fd796282a0e701e38e72fe24ee536a09058a7a', '2026-07-24 17:28:15', 'curl/8.19.0', '::1', '2026-07-17 17:28:15'),
(73, 21, '3b1aa2c43e5c3e3fd38122c2e64c06f7c6be59c3a3ff8bb94386f167e5d155f8', '2026-07-24 17:49:53', 'curl/8.19.0', '::1', '2026-07-17 17:49:53'),
(74, 21, 'c3c77cc20ef199abf0fa3b0f32f7c74c5eb2c9a1aa8c60acff300ec4cf95056d', '2026-07-24 17:50:06', 'curl/8.19.0', '::1', '2026-07-17 17:50:06'),
(75, 21, '6198dd2115c85e2884331dbb5419ae75e02621d7dd25f684f21ec20719e68846', '2026-07-24 17:50:58', 'curl/8.19.0', '::1', '2026-07-17 17:50:58'),
(77, 21, '53758621c8a4e0ebc5eee70a6ae7491c7385e317506465c11dfa8159f3a5c3bd', '2026-07-24 18:05:25', 'curl/8.19.0', '::1', '2026-07-17 18:05:25'),
(81, 21, 'b0746458bf90fb35a4b880a89b45a66c12f3311013f05f5b26ae8b62eb91d8f3', '2026-07-24 22:19:34', 'curl/8.19.0', '::1', '2026-07-17 22:19:34'),
(82, 21, '7522b22796aee5c3e01a2bca8dbf9694d86cfe88ffa3f3257c1dbdd5a9d3f34d', '2026-07-24 22:21:10', 'curl/8.19.0', '::1', '2026-07-17 22:21:10'),
(83, 21, 'e114ee77e4938b60f6cad1eb2bbc4120fe0d5a536032e8299bd81a349474369b', '2026-07-24 23:27:24', 'curl/8.19.0', '::1', '2026-07-17 23:27:24'),
(86, 21, '67eba755fd975e673b8f1d7762dd700471bdfef8001bdb48f24833d6c1b8146f', '2026-07-24 23:55:13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-07-17 23:55:13'),
(87, 18, 'cb918555d1c3a5c37909c47022e735e4368f2f223c2b3a114173c404526b34a0', '2026-07-24 23:57:07', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-07-17 23:57:07'),
(88, 21, '2aec8979ab7a8e613069c48f097ad59bd862cbb154e072ef277c8588751206c8', '2026-07-25 00:14:46', 'curl/8.19.0', '::1', '2026-07-18 00:14:46'),
(92, 21, 'e7dfdc0eb2f7e3a720ec93ddc32fbab85c6ec0cb080cd4797dd45043555e1215', '2026-07-25 04:23:30', 'curl/8.19.0', '::1', '2026-07-18 04:23:30'),
(93, 21, 'ad8f30544c4fbf9fc1e9b46047095a66385cc03dec0b9dad44be284426ee5e67', '2026-07-25 12:56:37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-07-18 12:56:37'),
(94, 20, '2689394801ce422dced37f2ad9216438036192edd16dfbcf2e9b4b83438782e9', '2026-07-25 18:28:57', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-07-18 18:28:57'),
(97, 18, 'd0b3928e45fae17c4757de6e2303102d3361eb9637143049181a1de8a01b423f', '2026-07-25 21:25:32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '::1', '2026-07-18 21:25:32');

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
