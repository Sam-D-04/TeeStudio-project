-- =====================================================================
-- DỮ LIỆU MẪU NGHIỆP VỤ TEESTUDIO
-- Dùng cho MySQL 8.0+ sau khi đã chạy Database.sql
--
-- CẢNH BÁO: Script này xóa dữ liệu hiện có trong các bảng nghiệp vụ
-- để tạo lại một bộ dữ liệu mẫu đồng nhất và có thể chạy lặp lại.
--
-- Tài khoản trong bộ dữ liệu dùng chung mật khẩu: TeeStudio@123
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `PromotionUsage`;
TRUNCATE TABLE `InventoryTransaction`;
TRUNCATE TABLE `Payment`;
TRUNCATE TABLE `OrderProduction`;
TRUNCATE TABLE `OrderHistory`;
TRUNCATE TABLE `OrderItem`;
TRUNCATE TABLE `CustomerOrder`;
TRUNCATE TABLE `PricingConfiguration`;
TRUNCATE TABLE `Promotion`;
TRUNCATE TABLE `CartItem`;
TRUNCATE TABLE `Cart`;
TRUNCATE TABLE `DesignPrintMethod`;
TRUNCATE TABLE `DesignPrintPosition`;
TRUNCATE TABLE `CustomDesign`;
TRUNCATE TABLE `Supplier`;
TRUNCATE TABLE `Sticker`;
TRUNCATE TABLE `PrintMethod`;
TRUNCATE TABLE `PrintPosition`;
TRUNCATE TABLE `BulkPricing`;
TRUNCATE TABLE `ProductImage`;
TRUNCATE TABLE `ProductVariant`;
TRUNCATE TABLE `Product`;
TRUNCATE TABLE `Category`;
TRUNCATE TABLE `UserAddress`;
TRUNCATE TABLE `UserToken`;
TRUNCATE TABLE `Account`;

-- =====================================================================
-- 1. TÀI KHOẢN VÀ PHÂN QUYỀN
-- =====================================================================
INSERT INTO `Account`
  (`id`, `email`, `passwordHash`, `fullName`, `phone`, `role`, `status`, `createdAt`, `updatedAt`)
VALUES
  (1,  'admin@teestudio.vn',             '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Nguyễn Hoàng Minh', '0901000001', 'ADMIN',      'ACTIVE',   '2026-01-05 08:00:00', '2026-06-10 09:15:00'),
  (2,  'kho@teestudio.vn',               '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Trần Quốc Huy',     '0901000002', 'WAREHOUSE',  'ACTIVE',   '2026-01-05 08:10:00', '2026-06-12 16:40:00'),
  (3,  'sanxuat@teestudio.vn',           '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Lê Ngọc Thảo',       '0901000003', 'PRODUCTION', 'ACTIVE',   '2026-01-05 08:20:00', '2026-06-13 07:30:00'),
  (4,  'dieuphoi@teestudio.vn',          '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Phạm Thanh Tùng',    '0901000004', 'PRODUCTION', 'INACTIVE', '2026-02-01 09:00:00', '2026-05-31 17:00:00'),
  (5,  'minhanh.nguyen@gmail.com',       '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Nguyễn Minh Anh',    '0901234567', 'CUSTOMER',   'ACTIVE',   '2026-03-02 10:15:00', '2026-06-13 08:10:00'),
  (6,  'quanghuy.tran@gmail.com',        '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Trần Quang Huy',     '0987654321', 'CUSTOMER',   'ACTIVE',   '2026-03-18 14:20:00', '2026-06-12 21:05:00'),
  (7,  'thanhhoa.le@gmail.com',          '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Lê Thanh Hòa',       '0912345678', 'CUSTOMER',   'ACTIVE',   '2026-04-01 11:30:00', '2026-06-11 19:40:00'),
  (8,  'ngocmai.pham@gmail.com',         '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Phạm Ngọc Mai',      '0934567890', 'CUSTOMER',   'ACTIVE',   '2026-04-07 09:45:00', '2026-06-12 15:25:00'),
  (9,  'giahan.nguyen@gmail.com',        '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Nguyễn Gia Hân',     '0978901234', 'CUSTOMER',   'ACTIVE',   '2026-04-15 16:00:00', '2026-06-12 13:50:00'),
  (10, 'vietduc.hoang@gmail.com',        '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Hoàng Việt Đức',     '0965432109', 'CUSTOMER',   'ACTIVE',   '2026-04-26 08:35:00', '2026-06-13 06:55:00'),
  (11, 'thuha.vo@gmail.com',             '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Võ Thu Hà',          '0943210987', 'CUSTOMER',   'ACTIVE',   '2026-05-04 13:10:00', '2026-06-13 09:00:00'),
  (12, 'namkhanh.dinh@gmail.com',        '$2b$10$uXMgv9BTyTdYl006R128p.bvSwW5WU2GKfm42Uej4PhjCMrGg4SWy', 'Đinh Nam Khánh',     '0921098765', 'CUSTOMER',   'ACTIVE',   '2026-05-12 17:25:00', '2026-06-13 09:20:00'),
  (13, 'admin@gmail.com',        '$2b$12$jSr6MtU5hvJI2IXaSUzZGuK1Akt20O82y21LlsETerkr234qDtPLe', 'Thanh Hiếu',     '0123456789', 'ADMIN',   'ACTIVE',   '2026-05-13 17:25:00', '2026-06-13 09:20:00');

INSERT INTO `UserToken`
  (`id`, `userId`, `refreshToken`, `expiresAt`, `userAgent`, `ipAddress`, `createdAt`)
VALUES
  (1, 1, '8228ce460fb1425b9edbc9ac9dc653cdfd77fea57773136dd9b99d712130df80', '2026-07-13 09:15:00', 'Mozilla/5.0 Chrome/136.0 Windows 11', '192.168.1.10', '2026-06-13 09:15:00'),
  (2, 2, '562aef9831ac926d5238921ffbe4926f5594c3d8ec8e0f757ba85cdd5dee8a8a', '2026-07-12 16:40:00', 'Mozilla/5.0 Edge/136.0 Windows 11',  '192.168.1.12', '2026-06-12 16:40:00'),
  (3, 3, 'd034d4bad2b2aaace57d9b32eb9e4a25c0fdebaf0e6a6c40148ee300f2a5fe23', '2026-07-13 07:30:00', 'Mozilla/5.0 Chrome/136.0 Android',   '192.168.1.15', '2026-06-13 07:30:00'),
  (4, 5, 'b824bfb7f17be14e1619214252f8ea83d592637fe9584a90f9bd3e1ecf77ecaa', '2026-07-13 08:10:00', 'Mozilla/5.0 Safari/18.5 iPhone',     '113.161.72.25', '2026-06-13 08:10:00');

INSERT INTO `UserAddress`
  (`id`, `userId`, `recipientName`, `phone`, `addressLine`, `city`, `district`, `ward`, `isDefault`, `createdAt`)
VALUES
  (1,  5,  'Nguyễn Minh Anh', '0901234567', '123 Nguyễn Trãi',           'Thành phố Hồ Chí Minh', 'Quận 1',         'Phường Bến Thành',       1, '2026-03-02 10:20:00'),
  (2,  5,  'Nguyễn Minh Anh', '0901234567', '18 Đường số 6, Khu dân cư Him Lam', 'Thành phố Hồ Chí Minh', 'Quận 7', 'Phường Tân Hưng', 0, '2026-05-21 14:10:00'),
  (3,  6,  'Trần Quang Huy',  '0987654321', '45 Lê Văn Việt',            'Thành phố Hồ Chí Minh', 'Thành phố Thủ Đức', 'Phường Hiệp Phú',     1, '2026-03-18 14:25:00'),
  (4,  7,  'Lê Thanh Hòa',    '0912345678', '88 Trần Hưng Đạo',          'Hà Nội',                'Quận Hoàn Kiếm',  'Phường Cửa Nam',        1, '2026-04-01 11:35:00'),
  (5,  7,  'Lê Thanh Hòa',    '0912345678', '27 Nguyễn Văn Cừ',          'Hà Nội',                'Quận Long Biên',  'Phường Ngọc Lâm',       0, '2026-05-30 09:00:00'),
  (6,  8,  'Phạm Ngọc Mai',   '0934567890', '210 Điện Biên Phủ',         'Đà Nẵng',               'Quận Thanh Khê',  'Phường Chính Gián',     1, '2026-04-07 09:50:00'),
  (7,  9,  'Nguyễn Gia Hân',  '0978901234', '15 Võ Thị Sáu',             'Thành phố Hồ Chí Minh', 'Quận 3',         'Phường Võ Thị Sáu',     1, '2026-04-15 16:05:00'),
  (8,  10, 'Hoàng Việt Đức',  '0965432109', '67 Lý Tự Trọng',            'Thành phố Hồ Chí Minh', 'Quận 1',         'Phường Bến Nghé',       1, '2026-04-26 08:40:00'),
  (9,  11, 'Võ Thu Hà',       '0943210987', '32 Nguyễn Huệ',             'Cần Thơ',               'Quận Ninh Kiều',  'Phường Tân An',         1, '2026-05-04 13:15:00'),
  (10, 12, 'Đinh Nam Khánh',  '0921098765', '99 Hùng Vương',             'Hải Phòng',             'Quận Hồng Bàng',  'Phường Hoàng Văn Thụ',  1, '2026-05-12 17:30:00');

-- =====================================================================
-- 2. DANH MỤC, SẢN PHẨM, BIẾN THỂ VÀ ẢNH
-- Mỗi size S, M, L, XL có 8 dòng biến thể.
-- =====================================================================
INSERT INTO `Category` (`id`, `name`, `createdAt`) VALUES
  (1, 'Áo thun',    '2026-01-06 08:00:00'),
  (2, 'Áo polo',    '2026-01-06 08:05:00'),
  (3, 'Áo hoodie',  '2026-01-06 08:10:00'),
  (4, 'Áo sweater', '2026-01-06 08:15:00');

INSERT INTO `Product`
  (`id`, `categoryId`, `name`, `slug`, `basePrice`, `material`, `form`, `madeIn`, `description`, `status`, `createdAt`)
VALUES
  (1, 1, 'Áo thun cotton cổ tròn 180gsm', 'ao-thun-cotton-co-tron-180gsm', 125000, '100% cotton chải kỹ 180gsm', 'Regular fit', 'Việt Nam', 'Phôi áo mềm mại, thoáng mát, phù hợp in hình cá nhân và đồng phục sự kiện.', 'ACTIVE', '2026-01-07 08:00:00'),
  (2, 1, 'Áo thun oversize unisex 220gsm', 'ao-thun-oversize-unisex-220gsm', 165000, '100% cotton compact 220gsm', 'Oversize', 'Việt Nam', 'Dáng rộng hiện đại, bề mặt vải mịn và giữ phom tốt sau nhiều lần giặt.', 'ACTIVE', '2026-01-07 08:10:00'),
  (3, 2, 'Áo polo pique công sở', 'ao-polo-pique-cong-so', 195000, 'Cotton pique 220gsm', 'Polo cổ bẻ', 'Việt Nam', 'Áo polo lịch sự, phù hợp thêu logo doanh nghiệp và làm đồng phục nhân viên.', 'ACTIVE', '2026-01-07 08:20:00'),
  (4, 2, 'Áo polo thể thao thoáng khí', 'ao-polo-the-thao-thoang-khi', 210000, 'Polyester thể thao co giãn', 'Polo thể thao', 'Việt Nam', 'Chất liệu thoát ẩm nhanh, nhẹ và phù hợp cho câu lạc bộ hoặc hoạt động ngoài trời.', 'ACTIVE', '2026-01-07 08:30:00'),
  (5, 3, 'Áo hoodie nỉ bông có mũ', 'ao-hoodie-ni-bong-co-mu', 335000, 'Nỉ bông 320gsm', 'Hoodie regular', 'Việt Nam', 'Áo hoodie ấm áp, có túi kangaroo, thích hợp in hình lớn trước ngực và sau lưng.', 'ACTIVE', '2026-01-07 08:40:00'),
  (6, 3, 'Áo hoodie khóa kéo cao cấp', 'ao-hoodie-khoa-keo-cao-cap', 365000, 'Nỉ da cá 300gsm', 'Hoodie zip', 'Việt Nam', 'Thiết kế khóa kéo tiện dụng, phù hợp thêu logo nhỏ ở ngực hoặc trên tay áo.', 'ACTIVE', '2026-01-07 08:50:00'),
  (7, 4, 'Áo sweater french terry', 'ao-sweater-french-terry', 245000, 'French terry 280gsm', 'Regular fit', 'Việt Nam', 'Phôi sweater cổ tròn dễ phối đồ, bề mặt vải phù hợp cả in DTG và in lụa.', 'ACTIVE', '2026-01-07 09:00:00'),
  (8, 4, 'Áo sweater oversize cá tính', 'ao-sweater-oversize-ca-tinh', 275000, 'Nỉ chân cua 300gsm', 'Oversize', 'Việt Nam', 'Dáng oversize trẻ trung, thích hợp cho thiết kế chữ, minh họa và bộ sưu tập nhóm.', 'ACTIVE', '2026-01-07 09:10:00');

INSERT INTO `ProductVariant`
  (`id`, `productId`, `color`, `size`, `sku`, `stockQty`, `createdAt`)
VALUES
  (1,  1, 'Trắng',     'S',  'ATCT-TRANG-S',   78, '2026-01-08 08:00:00'),
  (2,  1, 'Trắng',     'M',  'ATCT-TRANG-M',   95, '2026-01-08 08:01:00'),
  (3,  1, 'Trắng',     'L',  'ATCT-TRANG-L',   68, '2026-01-08 08:02:00'),
  (4,  1, 'Trắng',     'XL', 'ATCT-TRANG-XL',  56, '2026-01-08 08:03:00'),
  (5,  2, 'Đen',       'S',  'ATOS-DEN-S',     75, '2026-01-08 08:10:00'),
  (6,  2, 'Đen',       'M',  'ATOS-DEN-M',     89, '2026-01-08 08:11:00'),
  (7,  2, 'Đen',       'L',  'ATOS-DEN-L',     85, '2026-01-08 08:12:00'),
  (8,  2, 'Đen',       'XL', 'ATOS-DEN-XL',    65, '2026-01-08 08:13:00'),
  (9,  3, 'Xanh navy', 'S',  'APCS-NAVY-S',    70, '2026-01-08 08:20:00'),
  (10, 3, 'Xanh navy', 'M',  'APCS-NAVY-M',    88, '2026-01-08 08:21:00'),
  (11, 3, 'Xanh navy', 'L',  'APCS-NAVY-L',    82, '2026-01-08 08:22:00'),
  (12, 3, 'Xanh navy', 'XL', 'APCS-NAVY-XL',   76, '2026-01-08 08:23:00'),
  (13, 4, 'Trắng',     'S',  'APTT-TRANG-S',   60, '2026-01-08 08:30:00'),
  (14, 4, 'Trắng',     'M',  'APTT-TRANG-M',   75, '2026-01-08 08:31:00'),
  (15, 4, 'Trắng',     'L',  'APTT-TRANG-L',   72, '2026-01-08 08:32:00'),
  (16, 4, 'Trắng',     'XL', 'APTT-TRANG-XL',  63, '2026-01-08 08:33:00'),
  (17, 5, 'Xám tiêu',  'S',  'AHNB-XAM-S',     50, '2026-01-08 08:40:00'),
  (18, 5, 'Xám tiêu',  'M',  'AHNB-XAM-M',     72, '2026-01-08 08:41:00'),
  (19, 5, 'Xám tiêu',  'L',  'AHNB-XAM-L',     68, '2026-01-08 08:42:00'),
  (20, 5, 'Xám tiêu',  'XL', 'AHNB-XAM-XL',    50, '2026-01-08 08:43:00'),
  (21, 6, 'Đen',       'S',  'AHKK-DEN-S',     45, '2026-01-08 08:50:00'),
  (22, 6, 'Đen',       'M',  'AHKK-DEN-M',     60, '2026-01-08 08:51:00'),
  (23, 6, 'Đen',       'L',  'AHKK-DEN-L',     61, '2026-01-08 08:52:00'),
  (24, 6, 'Đen',       'XL', 'AHKK-DEN-XL',    50, '2026-01-08 08:53:00'),
  (25, 7, 'Be',        'S',  'ASFT-BE-S',      55, '2026-01-08 09:00:00'),
  (26, 7, 'Be',        'M',  'ASFT-BE-M',      60, '2026-01-08 09:01:00'),
  (27, 7, 'Be',        'L',  'ASFT-BE-L',      65, '2026-01-08 09:02:00'),
  (28, 7, 'Be',        'XL', 'ASFT-BE-XL',     55, '2026-01-08 09:03:00'),
  (29, 8, 'Xanh rêu',  'S',  'ASOS-REU-S',     45, '2026-01-08 09:10:00'),
  (30, 8, 'Xanh rêu',  'M',  'ASOS-REU-M',     62, '2026-01-08 09:11:00'),
  (31, 8, 'Xanh rêu',  'L',  'ASOS-REU-L',     58, '2026-01-08 09:12:00'),
  (32, 8, 'Xanh rêu',  'XL', 'ASOS-REU-XL',    58, '2026-01-08 09:13:00');

-- ProductVariant.colorHex được thêm bởi migration 20260629_add_product_variant_color_hex.sql.
UPDATE `ProductVariant`
SET `colorHex` = CASE LOWER(TRIM(`color`))
  WHEN 'trắng' THEN '#ffffff'
  WHEN 'đen' THEN '#1a1a1a'
  WHEN 'xanh navy' THEN '#1e3a8a'
  WHEN 'xám tiêu' THEN '#737373'
  WHEN 'be' THEN '#d4b896'
  WHEN 'xanh rêu' THEN '#4d7c0f'
  ELSE '#94a3b8'
END;

INSERT INTO `ProductImage`
  (`id`, `productId`, `variantId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `createdAt`)
VALUES
  (1,  1, 1,  'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-thun-cotton-trang-mat-truoc.jpg', 'Áo thun cotton trắng mặt trước', 0, 1, '2026-01-09 08:00:00'),
  (2,  1, NULL,'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-thun-cotton-trang-mat-sau.jpg',   'Áo thun cotton trắng mặt sau',   1, 0, '2026-01-09 08:01:00'),
  (3,  2, 5,  'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-thun-oversize-den-mat-truoc.jpg','Áo thun oversize đen mặt trước',0, 1, '2026-01-09 08:10:00'),
  (4,  2, NULL,'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-thun-oversize-den-chi-tiet.jpg',  'Chi tiết vải áo thun oversize đen',1,0,'2026-01-09 08:11:00'),
  (5,  3, 9,  'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-polo-pique-navy-mat-truoc.jpg',    'Áo polo pique xanh navy mặt trước',0,1,'2026-01-09 08:20:00'),
  (6,  3, NULL,'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-polo-pique-navy-co-ao.jpg',        'Chi tiết cổ áo polo pique xanh navy',1,0,'2026-01-09 08:21:00'),
  (7,  4, 13, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-polo-the-thao-trang.jpg',           'Áo polo thể thao màu trắng',0,1,'2026-01-09 08:30:00'),
  (8,  4, NULL,'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-polo-the-thao-thoang-khi.jpg',      'Bề mặt vải polo thể thao thoáng khí',1,0,'2026-01-09 08:31:00'),
  (9,  5, 17, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-hoodie-ni-bong-xam.jpg',             'Áo hoodie nỉ bông màu xám tiêu',0,1,'2026-01-09 08:40:00'),
  (10, 5, NULL,'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-hoodie-ni-bong-tui-ao.jpg',          'Chi tiết túi áo hoodie nỉ bông',1,0,'2026-01-09 08:41:00'),
  (11, 6, 21, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-hoodie-khoa-keo-den.jpg',             'Áo hoodie khóa kéo màu đen',0,1,'2026-01-09 08:50:00'),
  (12, 6, NULL,'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-hoodie-khoa-keo-chi-tiet.jpg',       'Chi tiết khóa kéo áo hoodie',1,0,'2026-01-09 08:51:00'),
  (13, 7, 25, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-sweater-french-terry-be.jpg',         'Áo sweater french terry màu be',0,1,'2026-01-09 09:00:00'),
  (14, 7, NULL,'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-sweater-french-terry-vai.jpg',       'Chi tiết vải french terry',1,0,'2026-01-09 09:01:00'),
  (15, 8, 29, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-sweater-oversize-xanh-reu.jpg',      'Áo sweater oversize xanh rêu',0,1,'2026-01-09 09:10:00'),
  (16, 8, NULL,'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-sweater-oversize-phoi-do.jpg',        'Gợi ý phối đồ với sweater oversize',1,0,'2026-01-09 09:11:00');

-- =====================================================================
-- 3. CHÍNH SÁCH GIÁ SỈ VÀ CẤU HÌNH IN
-- =====================================================================
INSERT INTO `BulkPricing` (`id`, `productId`, `minQty`, `discountPercent`) VALUES
  (1, 1, 10, 5.00), (2, 1, 30, 10.00), (3, 1, 100, 15.00),
  (4, 2, 10, 5.00), (5, 2, 30, 9.00),  (6, 2, 100, 14.00),
  (7, 3, 10, 4.00), (8, 3, 30, 8.00),  (9, 3, 100, 13.00),
  (10,4, 10, 5.00), (11,4, 30, 9.00),  (12,4, 100, 13.00),
  (13,5, 10, 4.00), (14,5, 30, 8.00),  (15,5, 100, 12.00),
  (16,6, 10, 4.00), (17,6, 30, 8.00),  (18,6, 100, 12.00),
  (19,7, 10, 5.00), (20,7, 30, 10.00), (21,7, 100, 15.00),
  (22,8, 10, 5.00), (23,8, 30, 9.00),  (24,8, 100, 14.00);

INSERT INTO `PrintPosition`
  (`id`, `code`, `name`, `extraCost`, `maxWidth`, `maxHeight`, `printAreaX`, `printAreaY`, `printAreaWidth`, `printAreaHeight`, `isActive`)
VALUES
  (1, 'MAT_TRUOC', 'Mặt trước giữa ngực', 0,     30, 40, 120, 80,  260, 340, 1),
  (2, 'MAT_SAU',   'Mặt sau giữa lưng',   25000, 35, 45, 100, 70,  300, 380, 1);

INSERT INTO `PrintMethod`
  (`id`, `code`, `name`, `extraCost`, `isActive`, `createdAt`)
VALUES
  (1, 'DTG',     'In trực tiếp lên vải DTG', 0,     1, '2026-01-10 08:00:00'),
  (2, 'VINYL',   'In decal chuyển nhiệt',    20000,  1, '2026-01-10 08:15:00');

INSERT INTO `Sticker`
  (`id`, `name`, `category`, `imageUrl`, `sortOrder`, `isActive`, `createdAt`)
VALUES
  (1,  'Mặt trời nhiệt đới', 'Du lịch',    'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/mat-troi-nhiet-doi.png', 1, 1, '2026-01-11 08:00:00'),
  (2,  'Sóng biển xanh',      'Du lịch',    'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/song-bien-xanh.png',      2, 1, '2026-01-11 08:01:00'),
  (3,  'Núi và rừng thông',   'Du lịch',    'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/nui-rung-thong.png',       3, 1, '2026-01-11 08:02:00'),
  (4,  'Sống hết mình',       'Động lực',   'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/song-het-minh.png',        1, 1, '2026-01-11 08:10:00'),
  (5,  'Không ngừng tiến bước','Động lực',  'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/khong-ngung-tien-buoc.png', 2, 1, '2026-01-11 08:11:00'),
  (6,  'Tỏa sáng mỗi ngày',   'Động lực',   'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/toa-sang-moi-ngay.png',    3, 1, '2026-01-11 08:12:00'),
  (7,  'Hoa sen cách điệu',   'Nghệ thuật', 'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/hoa-sen-cach-dieu.png',     1, 1, '2026-01-11 08:20:00'),
  (8,  'Mảng màu trừu tượng', 'Nghệ thuật', 'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/mang-mau-truu-tuong.png',   2, 1, '2026-01-11 08:21:00'),
  (9,  'Nét vẽ Sài Gòn',      'Nghệ thuật', 'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/net-ve-sai-gon.png',        3, 1, '2026-01-11 08:22:00'),
  (10, 'Ngôi sao năm cánh',   'Biểu tượng', 'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/ngoi-sao-nam-canh.png',     1, 1, '2026-01-11 08:30:00'),
  (11, 'Trái tim nét liền',   'Biểu tượng', 'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/trai-tim-net-lien.png',     2, 1, '2026-01-11 08:31:00'),
  (12, 'Vương miện tối giản', 'Biểu tượng', 'https://res.cloudinary.com/teestudio/image/upload/v1/stickers/vuong-mien-toi-gian.png',   3, 0, '2026-01-11 08:32:00');

INSERT INTO `Supplier` (`id`, `name`, `phone`, `createdAt`) VALUES
  (1, 'Công ty Dệt May Thành Công',       '02838153962', '2026-01-12 08:00:00'),
  (2, 'Xưởng Phôi Áo Việt Tiến',          '02838640800', '2026-01-12 08:05:00'),
  (3, 'Công ty Vải Thun Phú Sang',        '0908123456',  '2026-01-12 08:10:00'),
  (4, 'Nhà cung cấp Phụ liệu Minh Châu',  '0917456789',  '2026-01-12 08:15:00');

-- =====================================================================
-- 4. THIẾT KẾ CỦA KHÁCH HÀNG
-- Trạng thái hợp lệ theo luồng quản trị:
-- DRAFT, PENDING_REVIEW, NEEDS_REVISION, APPROVED.
-- =====================================================================
INSERT INTO `CustomDesign`
  (`id`, `userId`, `productId`, `variantId`, `baseColor`, `canvasData`, `previewUrl`, `designFee`, `status`, `adminNote`, `createdAt`, `updatedAt`)
VALUES
  (1, 5, 1, 2, 'Trắng',
   CAST('{"version":"5.3.0","objects":[{"type":"text","text":"Bình yên trong từng khoảnh khắc","left":105,"top":120,"fontSize":24,"fill":"#1F2937"}],"background":"#FFFFFF"}' AS JSON),
   'https://res.cloudinary.com/teestudio/image/upload/v1/previews/thiet-ke-binh-yen.jpg', 80000, 'DRAFT', NULL,
   '2026-06-13 08:20:00', '2026-06-13 08:35:00'),
  (2, 6, 2, 7, 'Đen',
   CAST('{"version":"5.3.0","objects":[{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/uploads/minh-hoa-thanh-pho.png","left":95,"top":85,"width":220,"height":260}],"background":"#111827"}' AS JSON),
   'https://res.cloudinary.com/teestudio/image/upload/v1/previews/thiet-ke-thanh-pho-ve-dem.jpg', 120000, 'PENDING_REVIEW', NULL,
   '2026-06-12 20:10:00', '2026-06-12 20:45:00'),
  (3, 7, 3, 10, 'Xanh navy',
   CAST('{"version":"5.3.0","objects":[{"type":"text","text":"CÔNG TY AN PHÚ","left":125,"top":95,"fontSize":22,"fill":"#FFFFFF"},{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/uploads/logo-an-phu.png","left":155,"top":145,"width":90,"height":90}],"background":"#172554"}' AS JSON),
   'https://res.cloudinary.com/teestudio/image/upload/v1/previews/dong-phuc-an-phu.jpg', 180000, 'NEEDS_REVISION',
   'Vui lòng tăng khoảng cách giữa tên công ty và logo để bảo đảm vùng thêu rõ nét.',
   '2026-06-11 18:30:00', '2026-06-12 09:15:00'),
  (4, 8, 4, 16, 'Trắng',
   CAST('{"version":"5.3.0","objects":[{"type":"text","text":"Câu lạc bộ Chạy Bộ Đà Nẵng","left":80,"top":100,"fontSize":22,"fill":"#0369A1"},{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/uploads/bieu-tuong-chay-bo.png","left":160,"top":150,"width":100,"height":120}],"background":"#FFFFFF"}' AS JSON),
   'https://res.cloudinary.com/teestudio/image/upload/v1/previews/clb-chay-bo-da-nang.jpg', 120000, 'APPROVED', 'Thiết kế đạt yêu cầu, màu in phù hợp chất liệu áo.',
   '2026-05-27 10:00:00', '2026-05-27 15:30:00'),
  (5, 9, 5, 18, 'Xám tiêu',
   CAST('{"version":"5.3.0","objects":[{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/uploads/minh-hoa-ca-phe.png","left":115,"top":95,"width":190,"height":230},{"type":"text","text":"Chậm một chút để thương nhau hơn","left":75,"top":335,"fontSize":18,"fill":"#F9FAFB"}],"background":"#6B7280"}' AS JSON),
   'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-ca-phe.jpg', 150000, 'APPROVED', 'Đã duyệt bản in DTG mặt trước.',
   '2026-06-08 14:20:00', '2026-06-09 09:10:00'),
  (6, 10, 6, 23, 'Đen',
   CAST('{"version":"5.3.0","objects":[{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/uploads/logo-nhom-am-nhac.png","left":130,"top":100,"width":160,"height":160},{"type":"text","text":"Giai Điệu Trẻ","left":135,"top":285,"fontSize":25,"fill":"#FACC15"}],"background":"#111111"}' AS JSON),
   'https://res.cloudinary.com/teestudio/image/upload/v1/previews/hoodie-giai-dieu-tre.jpg', 180000, 'APPROVED', 'Đã duyệt phương án in lụa hai màu.',
   '2026-06-07 11:00:00', '2026-06-08 10:00:00'),
  (7, 11, 7, 26, 'Be',
   CAST('{"version":"5.3.0","objects":[{"type":"text","text":"KỶ NIỆM 10 NĂM - LỚP 12A1","left":70,"top":110,"fontSize":23,"fill":"#7C2D12"},{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/uploads/huy-hieu-12a1.png","left":150,"top":175,"width":120,"height":120}],"background":"#F5F5DC"}' AS JSON),
   'https://res.cloudinary.com/teestudio/image/upload/v1/previews/sweater-ky-niem-12a1.jpg', 250000, 'APPROVED', 'Đã duyệt mẫu thêu ngực trái và in sau lưng.',
   '2026-06-06 08:45:00', '2026-06-07 13:20:00'),
  (8, 12, 8, 32, 'Xanh rêu',
   CAST('{"version":"5.3.0","objects":[{"type":"text","text":"Đi để trở về","left":125,"top":105,"fontSize":28,"fill":"#FEF3C7"},{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/uploads/nui-va-mat-troi.png","left":110,"top":175,"width":210,"height":170}],"background":"#3F6212"}' AS JSON),
   'https://res.cloudinary.com/teestudio/image/upload/v1/previews/sweater-di-de-tro-ve.jpg', 130000, 'PENDING_REVIEW', NULL,
   '2026-06-13 09:05:00', '2026-06-13 09:18:00');

INSERT INTO `DesignPrintPosition` (`id`, `designId`, `printPositionId`, `extraCost`) VALUES
  (1, 1, 1, 0),
  (2, 2, 1, 0),
  (3, 2, 2, 25000),
  (4, 3, 1, 15000),
  (5, 4, 1, 0),
  (6, 4, 2, 25000),
  (7, 5, 1, 0),
  (8, 6, 1, 0),
  (9, 7, 1, 15000),
  (10,7, 2, 25000),
  (11,8, 1, 0);

INSERT INTO `DesignPrintMethod` (`id`, `designId`, `printMethodId`, `extraCost`) VALUES
  (1, 1, 1, 0),
  (2, 2, 1, 0),
  (3, 3, 2, 50000),
  (4, 4, 2, 20000),
  (5, 5, 1, 0),
  (6, 6, 2, 30000),
  (7, 7, 2, 50000),
  (8, 8, 1, 0);

-- =====================================================================
-- 5. GIỎ HÀNG
-- =====================================================================
INSERT INTO `Cart` (`id`, `userId`, `createdAt`, `updatedAt`) VALUES
  (1, 5,  '2026-06-13 08:25:00', '2026-06-13 08:40:00'),
  (2, 6,  '2026-06-12 20:20:00', '2026-06-12 20:50:00'),
  (3, 7,  '2026-06-11 19:00:00', '2026-06-11 19:20:00'),
  (4, 12, '2026-06-13 09:08:00', '2026-06-13 09:22:00');

INSERT INTO `CartItem` (`id`, `cartId`, `variantId`, `designId`, `quantity`) VALUES
  (1, 1, 2,  1,    1),
  (2, 1, 29, NULL, 2),
  (3, 2, 7,  2,    1),
  (4, 3, 10, 3,    2),
  (5, 4, 32, 8,    1),
  (6, 4, 5,  NULL, 1);

-- =====================================================================
-- 6. KHUYẾN MÃI VÀ CẤU HÌNH BÁO GIÁ
-- =====================================================================
INSERT INTO `Promotion`
  (`id`, `code`, `discountType`, `discountValue`, `minOrderAmount`, `startDate`, `endDate`, `usageLimit`, `usedCount`, `isNewCustomerOnly`, `status`, `createdAt`, `updatedAt`)
VALUES
  (1, 'CHAOMUNG15',       'PERCENT',       15,    150000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000, 1, 1, 'ACTIVE',   '2025-12-20 08:00:00', '2026-06-13 08:00:00'),
  (2, 'GIAM60K',          'FIXED',          60000, 500000, '2026-06-01 00:00:00', '2026-06-30 23:59:59', 300,  2, 0, 'ACTIVE',   '2026-05-25 09:00:00', '2026-06-13 08:00:00'),
  (3, 'MIENPHIVANCHUYEN', 'FREE_SHIPPING',  0,    300000, '2026-06-01 00:00:00', '2026-08-31 23:59:59', 500,  2, 0, 'ACTIVE',   '2026-05-25 09:10:00', '2026-06-13 08:00:00'),
  (4, 'DONGPHUC10',       'PERCENT',        10,   2000000, '2026-07-01 00:00:00', '2026-09-30 23:59:59', 200,  0, 0, 'ACTIVE',   '2026-06-10 10:00:00', '2026-06-10 10:00:00'),
  (5, 'HE2026',           'PERCENT',        12,    400000, '2026-04-01 00:00:00', '2026-05-31 23:59:59', 250, 0, 0, 'ACTIVE',   '2026-03-20 08:30:00', '2026-06-01 08:00:00'),
  (6, 'TAMNGUNG50K',      'FIXED',          50000, 350000, '2026-06-01 00:00:00', NULL,                  100, 0, 0, 'INACTIVE', '2026-05-28 14:00:00', '2026-06-09 11:00:00');

INSERT INTO `PricingConfiguration`
  (`id`, `roundingUnit`, `defaultShippingFee`, `freeShippingThreshold`, `vatPercent`, `updatedAt`)
VALUES
  (1, 1000, 30000, 700000, 0, '2026-06-10 09:00:00');

-- =====================================================================
-- 7. ĐƠN HÀNG
-- Phủ đủ trạng thái: PENDING, CONFIRMED, PROCESSING, PRINTING,
-- READY_TO_SHIP, SHIPPING, COMPLETED, CANCELLED.
-- =====================================================================
INSERT INTO `CustomerOrder`
  (`id`, `orderCode`, `userId`, `promotionId`, `addressId`, `subtotal`, `discountAmount`, `shippingFee`,
   `shippingCarrier`, `shippingMethod`, `trackingCode`, `shippedAt`, `deliveredAt`, `cancelReason`,
   `totalAmount`, `depositAmount`, `codAmount`, `status`, `createdAt`, `updatedAt`)
VALUES
  (1,  'TS-20260613-A1B2C3', 5,  NULL, 1,  250000, 0,     30000, NULL,           NULL,                     NULL,             NULL,                  NULL,                  NULL, '280000', 0,       280000,  'PENDING',       '2026-06-13 08:45:00', '2026-06-13 08:45:00'),
  (2,  'TS-20260612-D4E5F6', 8,  2,    6, 1050000, 60000, 0,     NULL,           NULL,                     NULL,             NULL,                  NULL,                  NULL, '1110000',555000,  555000,  'CONFIRMED',     '2026-06-12 14:00:00', '2026-06-12 15:00:00'),
  (3,  'TS-20260611-G7H8K9', 9,  3,    7, 1005000, 0,     0,     NULL,           NULL,                     NULL,             NULL,                  NULL,                  NULL, '1155000',0,       0,       'PROCESSING',    '2026-06-11 10:30:00', '2026-06-12 09:30:00'),
  (4,  'TS-20260611-L2M3N4', 10, 2,    8, 1460000, 60000, 0,     NULL,           NULL,                     NULL,             NULL,                  NULL,                  NULL, '1580000',0,       0,       'PRINTING',      '2026-06-11 08:20:00', '2026-06-13 07:45:00'),
  (5,  'TS-20260610-P5Q6R7', 11, NULL, 9, 2327500, 0,     0,     'Giao Hàng Nhanh','Giao hàng tiêu chuẩn', NULL,             NULL,                  NULL,                  NULL, '2577500',1288750,1288750, 'READY_TO_SHIP', '2026-06-10 09:10:00', '2026-06-13 08:30:00'),
  (6,  'TS-20260609-S8T9U1', 7,  NULL, 4,  390000, 0,     30000, 'Viettel Post',  'Giao hàng nhanh',       'VTP2606120006', '2026-06-12 15:20:00', NULL,                  NULL, '420000', 0,       420000,  'SHIPPING',      '2026-06-09 16:30:00', '2026-06-12 15:20:00'),
  (7,  'TS-20260520-V2W3X4', 5,  1,    2,  165000, 24750, 30000, 'Giao Hàng Tiết Kiệm','Giao hàng tiêu chuẩn','GHTK2605210007','2026-05-21 14:10:00','2026-05-23 10:40:00',NULL,'170250',0,0,'COMPLETED','2026-05-20 19:15:00','2026-05-23 10:40:00'),
  (8,  'TS-20260604-Y5Z6A7', 6,  NULL, 3,  335000, 0,     30000, NULL,           NULL,                     NULL,             NULL,                  NULL,                  'Khách hàng thay đổi nhu cầu và đề nghị hủy trước khi xác nhận.', '365000', 0, 365000, 'CANCELLED', '2026-06-04 11:00:00', '2026-06-04 11:35:00'),
  (9,  'TS-20260528-B8C9D1', 8,  NULL, 6, 2394000, 0,     0,     'J&T Express',    'Giao hàng nhanh',       'JNT2606010009', '2026-06-01 09:00:00', '2026-06-03 16:25:00', NULL, '2514000',0,0,'COMPLETED','2026-05-28 09:30:00','2026-06-03 16:25:00'),
  (10, 'TS-20260613-E2F3G4', 12, NULL, 10, 550000, 0,     30000, NULL,           NULL,                     NULL,             NULL,                  NULL,                  NULL, '580000', 0,       0,       'PENDING',       '2026-06-13 09:30:00', '2026-06-13 09:30:00'),
  (11, 'TS-20260601-H5K6L7', 7,  3,    5,  500000, 0,     0,     'Giao Hàng Nhanh','Giao hàng tiêu chuẩn', 'GHN2606030011', '2026-06-03 13:00:00', '2026-06-05 17:10:00', NULL, '500000', 0,       500000,  'COMPLETED',     '2026-06-01 07:50:00', '2026-06-05 17:10:00'),
  (12, 'TS-20260608-M8N9P1', 6,  NULL, 3,  365000, 0,     30000, NULL,           NULL,                     NULL,             NULL,                  NULL,                  'Giao dịch VNPAY không thành công và khách hàng không tiếp tục đặt hàng.', '395000', 0, 0, 'CANCELLED', '2026-06-08 20:10:00', '2026-06-08 21:00:00'),
  (13, 'TS-20260606-Q2R3S4', 9,  NULL, 7,  490000, 0,     30000, NULL,           NULL,                     NULL,             NULL,                  NULL,                  'Sản phẩm hết màu theo yêu cầu, cửa hàng đã hoàn tiền cho khách.', '520000', 0, 0, 'CANCELLED', '2026-06-06 10:20:00', '2026-06-07 14:30:00');

INSERT INTO `OrderItem`
  (`id`, `orderId`, `variantId`, `designId`, `quantity`, `unitPrice`, `designFee`, `lineTotal`, `productionStatus`)
VALUES
  (1,  1,  3,  NULL, 2, 125000, 0,      250000,  'WAITING_DESIGN_APPROVAL'),
  (2,  2,  16, 4,    5, 210000, 120000, 1170000, 'WAITING_DESIGN_APPROVAL'),
  (3,  3,  18, 5,    3, 335000, 150000, 1155000, 'APPROVED'),
  (4,  4,  23, 6,    4, 365000, 180000, 1640000, 'PRINTING'),
  (5,  5,  26, 7,   10, 232750, 250000, 2577500, 'PACKED'),
  (6,  6,  12, NULL, 2, 195000, 0,      390000,  'SHIPPING'),
  (7,  7,  6,  NULL, 1, 165000, 0,      165000,  'COMPLETED'),
  (8,  8,  20, NULL, 1, 335000, 0,      335000,  'CANCELLED'),
  (9,  9,  16, 4,   12, 199500, 120000, 2514000, 'PACKED'),
  (10, 10, 32, NULL, 2, 275000, 0,      550000,  'WAITING_DESIGN_APPROVAL'),
  (11, 11, 4,  NULL, 4, 125000, 0,      500000,  'COMPLETED'),
  (12, 12, 24, NULL, 1, 365000, 0,      365000,  'CANCELLED'),
  (13, 13, 28, NULL, 2, 245000, 0,      490000,  'CANCELLED');

-- =====================================================================
-- 8. LỊCH SỬ XỬ LÝ ĐƠN
-- =====================================================================
INSERT INTO `OrderHistory`
  (`id`, `orderId`, `fromStatus`, `toStatus`, `action`, `actorId`, `actorRole`, `actorName`, `note`, `createdAt`)
VALUES
  (1,  1,  NULL,            'PENDING',       'Khách hàng đặt đơn', 5,  'CUSTOMER',   'Nguyễn Minh Anh', 'Khách hàng đặt đơn', '2026-06-13 08:45:00'),
  (2,  2,  NULL,            'PENDING',       'Khách hàng đặt đơn', 8,  'CUSTOMER',   'Phạm Ngọc Mai',   'Khách hàng đặt đơn', '2026-06-12 14:00:00'),
  (3,  2,  'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận đơn và khoản đặt cọc.', '2026-06-12 15:00:00'),
  (4,  3,  NULL,            'PENDING',       'Khách hàng đặt đơn', 9,  'CUSTOMER',   'Nguyễn Gia Hân',  'Khách hàng đặt đơn', '2026-06-11 10:30:00'),
  (5,  3,  'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận thanh toán và mẫu thiết kế.', '2026-06-11 14:00:00'),
  (6,  3,  'CONFIRMED',     'PROCESSING',    'STATUS_CHANGED',     3,  'PRODUCTION', 'Lê Ngọc Thảo',    'Đã chuyển thông số in xuống xưởng.', '2026-06-12 09:30:00'),
  (7,  4,  NULL,            'PENDING',       'Khách hàng đặt đơn', 10, 'CUSTOMER',   'Hoàng Việt Đức',  'Khách hàng đặt đơn', '2026-06-11 08:20:00'),
  (8,  4,  'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận đơn hàng.', '2026-06-11 09:10:00'),
  (9,  4,  'CONFIRMED',     'PROCESSING',    'STATUS_CHANGED',     3,  'PRODUCTION', 'Lê Ngọc Thảo',    'Đã pha màu và chuẩn bị khung in.', '2026-06-12 08:00:00'),
  (10, 4,  'PROCESSING',    'PRINTING',      'STATUS_CHANGED',     3,  'PRODUCTION', 'Lê Ngọc Thảo',    'Đang in lụa theo mẫu đã duyệt.', '2026-06-13 07:45:00'),
  (11, 5,  NULL,            'PENDING',       'Khách hàng đặt đơn', 11, 'CUSTOMER',   'Võ Thu Hà',       'Khách hàng đặt đơn', '2026-06-10 09:10:00'),
  (12, 5,  'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận đơn đồng phục lớp.', '2026-06-10 10:30:00'),
  (13, 5,  'CONFIRMED',     'PROCESSING',    'STATUS_CHANGED',     3,  'PRODUCTION', 'Lê Ngọc Thảo',    'Đã gửi xưởng thêu và in sau lưng.', '2026-06-11 08:00:00'),
  (14, 5,  'PROCESSING',    'READY_TO_SHIP', 'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Đã kiểm đếm đủ 10 áo và đóng gói.', '2026-06-13 08:30:00'),
  (15, 6,  NULL,            'PENDING',       'Khách hàng đặt đơn', 7,  'CUSTOMER',   'Lê Thanh Hòa',    'Khách hàng đặt đơn', '2026-06-09 16:30:00'),
  (16, 6,  'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận đơn hàng.', '2026-06-10 08:15:00'),
  (17, 6,  'CONFIRMED',     'READY_TO_SHIP', 'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Đã đóng gói và bàn giao vận chuyển.', '2026-06-12 14:50:00'),
  (18, 6,  'READY_TO_SHIP', 'SHIPPING',      'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Viettel Post đã nhận kiện hàng VTP2606120006.', '2026-06-12 15:20:00'),
  (19, 7,  NULL,            'PENDING',       'Khách hàng đặt đơn', 5,  'CUSTOMER',   'Nguyễn Minh Anh', 'Khách hàng đặt đơn', '2026-05-20 19:15:00'),
  (20, 7,  'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận thanh toán VNPAY.', '2026-05-20 19:25:00'),
  (21, 7,  'CONFIRMED',     'READY_TO_SHIP', 'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Đã đóng gói sản phẩm.', '2026-05-21 09:00:00'),
  (22, 7,  'READY_TO_SHIP', 'SHIPPING',      'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Đã bàn giao Giao Hàng Tiết Kiệm.', '2026-05-21 14:10:00'),
  (23, 7,  'SHIPPING',      'COMPLETED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Khách hàng đã nhận đủ sản phẩm.', '2026-05-23 10:40:00'),
  (24, 8,  NULL,            'PENDING',       'Khách hàng đặt đơn', 6,  'CUSTOMER',   'Trần Quang Huy',  'Khách hàng đặt đơn', '2026-06-04 11:00:00'),
  (25, 8,  'PENDING',       'CANCELLED',     'CANCELLED',          1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã hủy theo yêu cầu của khách hàng.', '2026-06-04 11:35:00'),
  (26, 9,  NULL,            'PENDING',       'Khách hàng đặt đơn', 8,  'CUSTOMER',   'Phạm Ngọc Mai',   'Khách hàng đặt đơn', '2026-05-28 09:30:00'),
  (27, 9,  'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận đơn áo chạy bộ.', '2026-05-28 10:15:00'),
  (28, 9,  'CONFIRMED',     'PROCESSING',    'STATUS_CHANGED',     3,  'PRODUCTION', 'Lê Ngọc Thảo',    'Đã chuyển xưởng in decal.', '2026-05-29 08:00:00'),
  (29, 9,  'PROCESSING',    'READY_TO_SHIP', 'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Đã hoàn tất kiểm tra chất lượng.', '2026-06-01 08:30:00'),
  (30, 9,  'READY_TO_SHIP', 'SHIPPING',      'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Đã bàn giao J&T Express.', '2026-06-01 09:00:00'),
  (31, 9,  'SHIPPING',      'COMPLETED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đơn hàng đã giao thành công.', '2026-06-03 16:25:00'),
  (32, 10, NULL,            'PENDING',       'Khách hàng đặt đơn', 12, 'CUSTOMER',   'Đinh Nam Khánh',  'Khách hàng đặt đơn', '2026-06-13 09:30:00'),
  (33, 11, NULL,            'PENDING',       'Khách hàng đặt đơn', 7,  'CUSTOMER',   'Lê Thanh Hòa',    'Khách hàng đặt đơn', '2026-06-01 07:50:00'),
  (34, 11, 'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận đơn COD.', '2026-06-01 08:20:00'),
  (35, 11, 'CONFIRMED',     'READY_TO_SHIP', 'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Đã đóng gói sản phẩm.', '2026-06-03 12:30:00'),
  (36, 11, 'READY_TO_SHIP', 'SHIPPING',      'STATUS_CHANGED',     2,  'WAREHOUSE',  'Trần Quốc Huy',   'Đã bàn giao Giao Hàng Nhanh.', '2026-06-03 13:00:00'),
  (37, 11, 'SHIPPING',      'COMPLETED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã giao hàng và thu COD.', '2026-06-05 17:10:00'),
  (38, 12, NULL,            'PENDING',       'Khách hàng đặt đơn', 6,  'CUSTOMER',   'Trần Quang Huy',  'Khách hàng đặt đơn', '2026-06-08 20:10:00'),
  (39, 12, 'PENDING',       'CANCELLED',     'CANCELLED',          1,  'ADMIN',      'Nguyễn Hoàng Minh','Hủy đơn do giao dịch VNPAY không thành công.', '2026-06-08 21:00:00'),
  (40, 13, NULL,            'PENDING',       'Khách hàng đặt đơn', 9,  'CUSTOMER',   'Nguyễn Gia Hân',  'Khách hàng đặt đơn', '2026-06-06 10:20:00'),
  (41, 13, 'PENDING',       'CONFIRMED',     'STATUS_CHANGED',     1,  'ADMIN',      'Nguyễn Hoàng Minh','Đã xác nhận đơn hàng.', '2026-06-06 11:00:00'),
  (42, 13, 'CONFIRMED',     'CANCELLED',     'CANCELLED',          1,  'ADMIN',      'Nguyễn Hoàng Minh','Hủy đơn do hết màu áo theo yêu cầu.', '2026-06-07 14:00:00');

-- =====================================================================
-- 9. TIẾN TRÌNH SẢN XUẤT
-- Trạng thái hợp lệ: WAITING_DESIGN_APPROVAL, APPROVED, PRINTING, PACKED.
-- =====================================================================
INSERT INTO `OrderProduction`
  (`id`, `orderItemId`, `designId`, `status`, `note`, `approvedAt`, `printedAt`, `packedAt`, `createdAt`)
VALUES
  (1, 2, 4, 'WAITING_DESIGN_APPROVAL', 'Đơn đã xác nhận, đang chờ gửi thông số in xuống xưởng.', NULL, NULL, NULL, '2026-06-12 14:00:00'),
  (2, 3, 5, 'APPROVED', 'Đã xuất thông số in DTG và chuẩn bị phôi áo.', '2026-06-11 14:00:00', NULL, NULL, '2026-06-11 10:30:00'),
  (3, 4, 6, 'PRINTING', 'Đang in lụa hai màu, dự kiến hoàn tất trong ngày.', '2026-06-11 09:10:00', '2026-06-13 07:45:00', NULL, '2026-06-11 08:20:00'),
  (4, 5, 7, 'PACKED', 'Đã thêu logo, in sau lưng và kiểm đếm đủ 10 áo.', '2026-06-10 10:30:00', '2026-06-12 14:20:00', '2026-06-13 08:30:00', '2026-06-10 09:10:00'),
  (5, 9, 4, 'PACKED', 'Đã hoàn thành 12 áo và bàn giao bộ phận kho.', '2026-05-28 10:15:00', '2026-05-31 16:00:00', '2026-06-01 08:30:00', '2026-05-28 09:30:00');

-- =====================================================================
-- 10. THANH TOÁN
-- Chỉ dùng phương thức VNPAY và COD.
-- Loại thanh toán: FULL_PAYMENT, DEPOSIT, COD_FINAL.
-- =====================================================================
INSERT INTO `Payment`
  (`id`, `orderId`, `amount`, `paymentMethod`, `paymentType`, `status`, `transactionId`, `paidAt`, `gatewayResponse`, `note`, `createdAt`)
VALUES
  (1,  1,  280000,  'COD',   'COD_FINAL',    'PENDING',   NULL,                  NULL,                  NULL, 'Thu hộ toàn bộ khi giao hàng.', '2026-06-13 08:45:00'),
  (2,  2,  555000,  'VNPAY', 'DEPOSIT',      'COMPLETED', 'TS20260612D4E5F6',    '2026-06-12 14:08:00', '{"vnp_ResponseCode":"00","vnp_TransactionNo":"14582931","vnp_BankCode":"NCB"}', 'Khách đã thanh toán cọc 50%.', '2026-06-12 14:00:00'),
  (3,  3,  1155000, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260611G7H8K9',    '2026-06-11 10:38:00', '{"vnp_ResponseCode":"00","vnp_TransactionNo":"14582952","vnp_BankCode":"VCB"}', 'Đã thanh toán toàn bộ.', '2026-06-11 10:30:00'),
  (4,  4,  1580000, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260611L2M3N4',    '2026-06-11 08:29:00', '{"vnp_ResponseCode":"00","vnp_TransactionNo":"14582968","vnp_BankCode":"ACB"}', 'Đã đối soát thành công.', '2026-06-11 08:20:00'),
  (5,  5,  1288750, 'VNPAY', 'DEPOSIT',      'COMPLETED', 'TS20260610P5Q6R7',    '2026-06-10 09:20:00', '{"vnp_ResponseCode":"00","vnp_TransactionNo":"14583001","vnp_BankCode":"TCB"}', 'Đã thu cọc 50%, còn lại thu COD.', '2026-06-10 09:10:00'),
  (6,  6,  420000,  'COD',   'COD_FINAL',    'PENDING',   NULL,                  NULL,                  NULL, 'Đang giao hàng, chờ đối soát COD.', '2026-06-09 16:30:00'),
  (7,  7,  170250,  'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260520V2W3X4',    '2026-05-20 19:22:00', '{"vnp_ResponseCode":"00","vnp_TransactionNo":"14580115","vnp_BankCode":"BIDV"}', 'Đã thanh toán toàn bộ.', '2026-05-20 19:15:00'),
  (8,  8,  365000,  'COD',   'COD_FINAL',    'CANCELLED', NULL,                  NULL,                  NULL, 'Đơn hủy trước khi giao hàng.', '2026-06-04 11:00:00'),
  (9,  9,  2514000, 'VNPAY', 'FULL_PAYMENT', 'COMPLETED', 'TS20260528B8C9D1',    '2026-05-28 09:40:00', '{"vnp_ResponseCode":"00","vnp_TransactionNo":"14581042","vnp_BankCode":"MB"}', 'Đã thanh toán toàn bộ.', '2026-05-28 09:30:00'),
  (10, 10, 580000,  'VNPAY', 'FULL_PAYMENT', 'PENDING',   'TS20260613E2F3G4',    NULL,                  '{"paymentUrlExpiresAt":"2026-06-13T09:45:00+07:00"}', 'Chờ khách hoàn tất thanh toán.', '2026-06-13 09:30:00'),
  (11, 11, 500000,  'COD',   'COD_FINAL',    'COMPLETED', NULL,                  '2026-06-05 17:10:00', NULL, 'Đã thu tiền và đối soát COD.', '2026-06-01 07:50:00'),
  (12, 12, 395000,  'VNPAY', 'FULL_PAYMENT', 'FAILED',    'TS20260608M8N9P1',    NULL,                  '{"vnp_ResponseCode":"24","message":"Khách hàng hủy giao dịch"}', 'Giao dịch không thành công.', '2026-06-08 20:10:00'),
  (13, 13, 520000,  'VNPAY', 'FULL_PAYMENT', 'CANCELLED', 'TS20260606Q2R3S4',    '2026-06-06 10:28:00', '{"vnp_ResponseCode":"00"}', 'Đơn đã hủy, không phát sinh hoàn tiền.', '2026-06-06 10:20:00');

-- =====================================================================
-- 11. GIAO DỊCH KHO
-- Số tồn hiện tại của ProductVariant khớp với nhập kho, xuất đơn và hoàn kho.
-- =====================================================================
INSERT INTO `InventoryTransaction`
  (`id`, `variantId`, `orderId`, `supplierId`, `quantityChanged`, `transactionType`, `reason`, `createdAt`)
VALUES
  (1,  1,  NULL, 1, 80, 'IMPORT', 'Nhập phôi áo thun cotton trắng size S', '2026-01-15 08:00:00'),
  (2,  2,  NULL, 1, 95, 'IMPORT', 'Nhập phôi áo thun cotton trắng size M', '2026-01-15 08:01:00'),
  (3,  3,  NULL, 1, 70, 'IMPORT', 'Nhập phôi áo thun cotton trắng size L', '2026-01-15 08:02:00'),
  (4,  4,  NULL, 1, 60, 'IMPORT', 'Nhập phôi áo thun cotton trắng size XL', '2026-01-15 08:03:00'),
  (5,  5,  NULL, 2, 75, 'IMPORT', 'Nhập áo thun oversize đen size S', '2026-01-15 08:10:00'),
  (6,  6,  NULL, 2, 90, 'IMPORT', 'Nhập áo thun oversize đen size M', '2026-01-15 08:11:00'),
  (7,  7,  NULL, 2, 85, 'IMPORT', 'Nhập áo thun oversize đen size L', '2026-01-15 08:12:00'),
  (8,  8,  NULL, 2, 65, 'IMPORT', 'Nhập áo thun oversize đen size XL', '2026-01-15 08:13:00'),
  (9,  9,  NULL, 1, 70, 'IMPORT', 'Nhập áo polo pique xanh navy size S', '2026-01-15 08:20:00'),
  (10, 10, NULL, 1, 88, 'IMPORT', 'Nhập áo polo pique xanh navy size M', '2026-01-15 08:21:00'),
  (11, 11, NULL, 1, 82, 'IMPORT', 'Nhập áo polo pique xanh navy size L', '2026-01-15 08:22:00'),
  (12, 12, NULL, 1, 78, 'IMPORT', 'Nhập áo polo pique xanh navy size XL', '2026-01-15 08:23:00'),
  (13, 13, NULL, 3, 60, 'IMPORT', 'Nhập áo polo thể thao trắng size S', '2026-01-15 08:30:00'),
  (14, 14, NULL, 3, 75, 'IMPORT', 'Nhập áo polo thể thao trắng size M', '2026-01-15 08:31:00'),
  (15, 15, NULL, 3, 72, 'IMPORT', 'Nhập áo polo thể thao trắng size L', '2026-01-15 08:32:00'),
  (16, 16, NULL, 3, 80, 'IMPORT', 'Nhập áo polo thể thao trắng size XL', '2026-01-15 08:33:00'),
  (17, 17, NULL, 2, 50, 'IMPORT', 'Nhập hoodie nỉ bông xám tiêu size S', '2026-01-15 08:40:00'),
  (18, 18, NULL, 2, 75, 'IMPORT', 'Nhập hoodie nỉ bông xám tiêu size M', '2026-01-15 08:41:00'),
  (19, 19, NULL, 2, 68, 'IMPORT', 'Nhập hoodie nỉ bông xám tiêu size L', '2026-01-15 08:42:00'),
  (20, 20, NULL, 2, 50, 'IMPORT', 'Nhập hoodie nỉ bông xám tiêu size XL', '2026-01-15 08:43:00'),
  (21, 21, NULL, 2, 45, 'IMPORT', 'Nhập hoodie khóa kéo đen size S', '2026-01-15 08:50:00'),
  (22, 22, NULL, 2, 60, 'IMPORT', 'Nhập hoodie khóa kéo đen size M', '2026-01-15 08:51:00'),
  (23, 23, NULL, 2, 65, 'IMPORT', 'Nhập hoodie khóa kéo đen size L', '2026-01-15 08:52:00'),
  (24, 24, NULL, 2, 50, 'IMPORT', 'Nhập hoodie khóa kéo đen size XL', '2026-01-15 08:53:00'),
  (25, 25, NULL, 3, 55, 'IMPORT', 'Nhập sweater french terry be size S', '2026-01-15 09:00:00'),
  (26, 26, NULL, 3, 70, 'IMPORT', 'Nhập sweater french terry be size M', '2026-01-15 09:01:00'),
  (27, 27, NULL, 3, 65, 'IMPORT', 'Nhập sweater french terry be size L', '2026-01-15 09:02:00'),
  (28, 28, NULL, 3, 55, 'IMPORT', 'Nhập sweater french terry be size XL', '2026-01-15 09:03:00'),
  (29, 29, NULL, 3, 45, 'IMPORT', 'Nhập sweater oversize xanh rêu size S', '2026-01-15 09:10:00'),
  (30, 30, NULL, 3, 62, 'IMPORT', 'Nhập sweater oversize xanh rêu size M', '2026-01-15 09:11:00'),
  (31, 31, NULL, 3, 58, 'IMPORT', 'Nhập sweater oversize xanh rêu size L', '2026-01-15 09:12:00'),
  (32, 32, NULL, 3, 60, 'IMPORT', 'Nhập sweater oversize xanh rêu size XL', '2026-01-15 09:13:00'),
  (33, 6,  7,  NULL, -1,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260520-V2W3X4', '2026-05-20 19:15:00'),
  (34, 16, 9,  NULL, -12, 'EXPORT', 'Giữ tồn kho cho đơn TS-20260528-B8C9D1', '2026-05-28 09:30:00'),
  (35, 4,  11, NULL, -4,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260601-H5K6L7', '2026-06-01 07:50:00'),
  (36, 20, 8,  NULL, -1,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260604-Y5Z6A7', '2026-06-04 11:00:00'),
  (37, 20, 8,  NULL, 1,   'RETURN', 'Hoàn kho do hủy đơn TS-20260604-Y5Z6A7', '2026-06-04 11:35:00'),
  (38, 28, 13, NULL, -2,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260606-Q2R3S4', '2026-06-06 10:20:00'),
  (39, 28, 13, NULL, 2,   'RETURN', 'Hoàn kho do hủy đơn TS-20260606-Q2R3S4', '2026-06-07 14:30:00'),
  (40, 24, 12, NULL, -1,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260608-M8N9P1', '2026-06-08 20:10:00'),
  (41, 24, 12, NULL, 1,   'RETURN', 'Hoàn kho do hủy đơn TS-20260608-M8N9P1', '2026-06-08 21:00:00'),
  (42, 12, 6,  NULL, -2,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260609-S8T9U1', '2026-06-09 16:30:00'),
  (43, 26, 5,  NULL, -10, 'EXPORT', 'Giữ tồn kho cho đơn TS-20260610-P5Q6R7', '2026-06-10 09:10:00'),
  (44, 23, 4,  NULL, -4,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260611-L2M3N4', '2026-06-11 08:20:00'),
  (45, 18, 3,  NULL, -3,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260611-G7H8K9', '2026-06-11 10:30:00'),
  (46, 16, 2,  NULL, -5,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260612-D4E5F6', '2026-06-12 14:00:00'),
  (47, 3,  1,  NULL, -2,  'ORDER_EXPORT', 'Giữ tồn kho cho đơn TS-20260613-A1B2C3', '2026-06-13 08:45:00'),
  (48, 32, 10, NULL, -2,  'EXPORT', 'Giữ tồn kho cho đơn TS-20260613-E2F3G4', '2026-06-13 09:30:00'),
  (49, 1,  NULL, NULL, -2, 'ADJUSTMENT', 'Điều chỉnh giảm sau khi kiểm kê định kỳ', '2026-06-13 10:00:00');

-- =====================================================================
-- 12. LƯỢT SỬ DỤNG KHUYẾN MÃI
-- =====================================================================
INSERT INTO `PromotionUsage` (`id`, `promotionId`, `userId`, `orderId`, `usedAt`) VALUES
  (1, 1, 5,  7,  '2026-05-20 19:15:00'),
  (2, 2, 8,  2,  '2026-06-12 14:00:00'),
  (3, 2, 10, 4,  '2026-06-11 08:20:00'),
  (4, 3, 9,  3,  '2026-06-11 10:30:00'),
  (5, 3, 7,  11, '2026-06-01 07:50:00');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 13. KIỂM TRA NHANH SAU KHI NẠP DỮ LIỆU
-- =====================================================================
SELECT 'Account' AS bang, COUNT(*) AS so_ban_ghi FROM `Account`
UNION ALL SELECT 'UserToken', COUNT(*) FROM `UserToken`
UNION ALL SELECT 'UserAddress', COUNT(*) FROM `UserAddress`
UNION ALL SELECT 'Category', COUNT(*) FROM `Category`
UNION ALL SELECT 'Product', COUNT(*) FROM `Product`
UNION ALL SELECT 'ProductVariant', COUNT(*) FROM `ProductVariant`
UNION ALL SELECT 'ProductImage', COUNT(*) FROM `ProductImage`
UNION ALL SELECT 'BulkPricing', COUNT(*) FROM `BulkPricing`
UNION ALL SELECT 'PrintPosition', COUNT(*) FROM `PrintPosition`
UNION ALL SELECT 'PrintMethod', COUNT(*) FROM `PrintMethod`
UNION ALL SELECT 'Sticker', COUNT(*) FROM `Sticker`
UNION ALL SELECT 'Supplier', COUNT(*) FROM `Supplier`
UNION ALL SELECT 'CustomDesign', COUNT(*) FROM `CustomDesign`
UNION ALL SELECT 'DesignPrintPosition', COUNT(*) FROM `DesignPrintPosition`
UNION ALL SELECT 'DesignPrintMethod', COUNT(*) FROM `DesignPrintMethod`
UNION ALL SELECT 'Cart', COUNT(*) FROM `Cart`
UNION ALL SELECT 'CartItem', COUNT(*) FROM `CartItem`
UNION ALL SELECT 'Promotion', COUNT(*) FROM `Promotion`
UNION ALL SELECT 'PricingConfiguration', COUNT(*) FROM `PricingConfiguration`
UNION ALL SELECT 'CustomerOrder', COUNT(*) FROM `CustomerOrder`
UNION ALL SELECT 'OrderItem', COUNT(*) FROM `OrderItem`
UNION ALL SELECT 'OrderHistory', COUNT(*) FROM `OrderHistory`
UNION ALL SELECT 'OrderProduction', COUNT(*) FROM `OrderProduction`
UNION ALL SELECT 'Payment', COUNT(*) FROM `Payment`
UNION ALL SELECT 'InventoryTransaction', COUNT(*) FROM `InventoryTransaction`
UNION ALL SELECT 'PromotionUsage', COUNT(*) FROM `PromotionUsage`;

SELECT `size`, COUNT(*) AS so_bien_the
FROM `ProductVariant`
GROUP BY `size`
ORDER BY FIELD(`size`, 'S', 'M', 'L', 'XL');

SELECT `paymentMethod`, COUNT(*) AS so_giao_dich
FROM `Payment`
GROUP BY `paymentMethod`
ORDER BY `paymentMethod`;
