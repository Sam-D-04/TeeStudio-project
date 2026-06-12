-- ============================================================
-- DỮ LIỆU MẪU – TeeStudio (Test trang Quản lý Đơn hàng)
-- Dùng cho WAMP64 / MySQL 8.0
-- Chạy theo thứ tự từ trên xuống để tránh lỗi khóa ngoại
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. TÀI KHOẢN KHÁCH HÀNG
-- ============================================================
INSERT INTO `Account` (email, passwordHash, fullName, phone, role, status) VALUES
('minhanh.nguyen@gmail.com',  '$2b$10$hash1', 'Nguyễn Minh Anh',   '0901234567', 'CUSTOMER', 'ACTIVE'),
('cuong.tran@gmail.com',      '$2b$10$hash2', 'Trần Văn Cường',     '0987654321', 'CUSTOMER', 'ACTIVE'),
('hoa.le@gmail.com',          '$2b$10$hash3', 'Lê Thị Hoa',         '0912345678', 'CUSTOMER', 'ACTIVE'),
('bao.pham@gmail.com',        '$2b$10$hash4', 'Phạm Quốc Bảo',     '0934567890', 'CUSTOMER', 'ACTIVE'),
('lan.nguyen@gmail.com',      '$2b$10$hash5', 'Nguyễn Thị Lan',     '0978901234', 'CUSTOMER', 'ACTIVE'),
('duc.hoang@gmail.com',       '$2b$10$hash6', 'Hoàng Văn Đức',      '0965432109', 'CUSTOMER', 'ACTIVE'),
('thu.vo@gmail.com',          '$2b$10$hash7', 'Võ Thị Thu',         '0943210987', 'CUSTOMER', 'ACTIVE'),
('nam.dinh@gmail.com',        '$2b$10$hash8', 'Đinh Văn Nam',       '0921098765', 'CUSTOMER', 'ACTIVE'),
('admin@teestudio.vn',        '$2b$10$hash9', 'Quản Trị Viên',      '0909090909', 'ADMIN',    'ACTIVE');

-- ============================================================
-- 2. DANH MỤC SẢN PHẨM
-- ============================================================
INSERT INTO `Category` (name) VALUES
('Áo thun'),
('Áo hoodie'),
('Áo polo');

-- ============================================================
-- 3. SẢN PHẨM (PHÔI ÁO)
-- ============================================================
INSERT INTO `Product` (categoryId, name, slug, basePrice, material, form, madeIn, description, status) VALUES
(1, 'Áo thun cotton cổ tròn',      'ao-thun-cotton-co-tron',      120000, '100% Cotton 180gsm', 'Cổ tròn',   'Việt Nam', 'Áo thun cotton mềm mại, thấm hút tốt, phù hợp in ấn.', 'ACTIVE'),
(1, 'Áo thun oversize unisex',      'ao-thun-oversize-unisex',     150000, '100% Cotton 200gsm', 'Oversize',  'Việt Nam', 'Dáng rộng thoải mái, form oversize hiện đại.', 'ACTIVE'),
(2, 'Áo hoodie nỉ bông cao cấp',    'ao-hoodie-ni-bong-cao-cap',   280000, 'Nỉ bông 320gsm',     'Hoodie',    'Việt Nam', 'Áo hoodie dày dặn, ấm áp, có mũ và túi kangaroo.', 'ACTIVE'),
(3, 'Áo polo pique thêu logo',      'ao-polo-pique-theu-logo',     180000, 'Cotton pique 220gsm','Polo cổ bẻ','Việt Nam', 'Áo polo chuyên nghiệp, phù hợp đồng phục công ty.', 'ACTIVE');

-- ============================================================
-- 4. BIẾN THỂ SẢN PHẨM (màu sắc + kích cỡ)
-- ============================================================
INSERT INTO `ProductVariant` (productId, color, size, sku, stockQty) VALUES
-- Áo thun cotton cổ tròn (productId=1)
(1, 'Trắng', 'S',  'ATCT-TRANG-S',  150),
(1, 'Trắng', 'M',  'ATCT-TRANG-M',  200),
(1, 'Trắng', 'L',  'ATCT-TRANG-L',  180),
(1, 'Trắng', 'XL', 'ATCT-TRANG-XL', 120),
(1, 'Đen',   'S',  'ATCT-DEN-S',    130),
(1, 'Đen',   'M',  'ATCT-DEN-M',    190),
(1, 'Đen',   'L',  'ATCT-DEN-L',    160),
(1, 'Đen',   'XL', 'ATCT-DEN-XL',   100),
-- Áo thun oversize (productId=2)
(2, 'Trắng', 'M',  'ATOS-TRANG-M',  80),
(2, 'Trắng', 'L',  'ATOS-TRANG-L',  90),
(2, 'Trắng', 'XL', 'ATOS-TRANG-XL', 70),
(2, 'Xám',   'M',  'ATOS-XAM-M',    75),
(2, 'Xám',   'L',  'ATOS-XAM-L',    85),
-- Áo hoodie (productId=3)
(3, 'Đen',   'M',  'AHN-DEN-M',     50),
(3, 'Đen',   'L',  'AHN-DEN-L',     60),
(3, 'Đen',   'XL', 'AHN-DEN-XL',    40),
(3, 'Xanh navy', 'M',  'AHN-NAVY-M', 45),
(3, 'Xanh navy', 'L',  'AHN-NAVY-L', 55),
-- Áo polo (productId=4)
(4, 'Trắng', 'S',  'APL-TRANG-S',   60),
(4, 'Trắng', 'M',  'APL-TRANG-M',   80),
(4, 'Trắng', 'L',  'APL-TRANG-L',   75),
(4, 'Xanh dương', 'M',  'APL-XDUONG-M', 70),
(4, 'Xanh dương', 'L',  'APL-XDUONG-L', 65),
(4, 'Xanh dương', 'XL', 'APL-XDUONG-XL',50);

-- ============================================================
-- 5. ẢNH SẢN PHẨM (ảnh đại diện)
-- ============================================================
INSERT INTO `ProductImage` (productId, variantId, imageUrl, altText, sortOrder, isPrimary) VALUES
(1, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-thun-trang.jpg',   'Áo thun cotton cổ tròn màu trắng', 0, 1),
(2, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-oversize-trang.jpg','Áo thun oversize màu trắng',       0, 1),
(3, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-hoodie-den.jpg',    'Áo hoodie nỉ bông màu đen',        0, 1),
(4, NULL, 'https://res.cloudinary.com/teestudio/image/upload/v1/products/ao-polo-trang.jpg',   'Áo polo pique màu trắng',          0, 1);

-- ============================================================
-- 6. VỊ TRÍ IN ẤN
-- ============================================================
INSERT INTO `PrintPosition` (code, name, extraCost, maxWidth, maxHeight, isActive) VALUES
('MAT_TRUOC', 'Mặt trước (Ngực giữa)',   0,      30, 40, 1),
('MAT_SAU',   'Mặt sau (Lưng giữa)',     20000,  35, 45, 1),
('TRAI',      'Ngực trái (Logo nhỏ)',    15000,  10, 10, 1),
('TAY_TRAI',  'Tay trái',               25000,  12, 20, 1);

-- ============================================================
-- 7. PHƯƠNG PHÁP IN
-- ============================================================
INSERT INTO `PrintMethod` (code, name, extraCost, isActive) VALUES
('DTG',       'In DTG (Direct-to-Garment)', 0,      1),
('IN_LUOI',   'In lụa (Silk Screen)',        30000,  1),
('THEU',      'Thêu vi tính',               50000,  1),
('VINYL',     'In cắt decal nhiệt',         20000,  1);

-- ============================================================
-- 8. ĐỊA CHỈ GIAO HÀNG
-- ============================================================
INSERT INTO `UserAddress` (userId, recipientName, phone, addressLine, city, district, ward, isDefault) VALUES
(1, 'Nguyễn Minh Anh',   '0901234567', '123 Đường Nguyễn Trãi',       'TP. Hồ Chí Minh', 'Quận 1',          'Phường Bến Thành',   1),
(2, 'Trần Văn Cường',     '0987654321', '45 Lê Văn Việt',              'TP. Hồ Chí Minh', 'TP. Thủ Đức',    'Phường Hiệp Phú',    1),
(3, 'Lê Thị Hoa',         '0912345678', '88 Trần Hưng Đạo',            'Hà Nội',          'Quận Hoàn Kiếm', 'Phường Phan Chu Trinh',1),
(4, 'Phạm Quốc Bảo',     '0934567890', '210 Điện Biên Phủ',           'Đà Nẵng',         'Quận Thanh Khê', 'Phường Thanh Khê Đông',1),
(5, 'Nguyễn Thị Lan',     '0978901234', '15 Võ Thị Sáu',               'TP. Hồ Chí Minh', 'Quận 3',         'Phường 6',           1),
(6, 'Hoàng Văn Đức',      '0965432109', '67 Lý Tự Trọng',              'TP. Hồ Chí Minh', 'Quận 1',         'Phường Bến Nghé',    1),
(7, 'Võ Thị Thu',         '0943210987', '32 Nguyễn Huệ',               'Cần Thơ',         'Quận Ninh Kiều', 'Phường An Hội',      1),
(8, 'Đinh Văn Nam',       '0921098765', '99 Hùng Vương',               'Hải Phòng',       'Quận Hồng Bàng', 'Phường Quán Toan',   1);

-- ============================================================
-- 9. MÃ KHUYẾN MÃI
-- ============================================================
INSERT INTO `Promotion` (code, discountType, discountValue, minOrderAmount, startDate, endDate, usageLimit, usedCount, status) VALUES
('TEEWELCOME', 'PERCENT', 10, 200000, '2026-01-01', '2026-12-31', 500, 123, 'ACTIVE'),
('SALE50K',    'FIXED',   50000, 300000, '2026-06-01', '2026-06-30', 200, 45,  'ACTIVE');

-- ============================================================
-- 10. THIẾT KẾ TÙY CHỈNH (custom design)
-- ============================================================
INSERT INTO `CustomDesign` (userId, productId, variantId, baseColor, canvasData, previewUrl, designFee, status) VALUES
(1, 2, 10, '#FFFFFF',
 '{"layers":[{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-cty-abc.png","x":150,"y":100,"width":120,"height":80,"rotation":0}],"background":"#FFFFFF"}',
 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-1.jpg',
 150000, 'SUBMITTED'),

(3, 4, 20, '#FFFFFF',
 '{"layers":[{"type":"text","content":"ĐỒNG PHỤC CÔNG TY XYZ","fontSize":24,"fontFamily":"Arial","color":"#003399","x":100,"y":80},{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-xyz.png","x":170,"y":120,"width":60,"height":60}],"background":"#FFFFFF"}',
 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-3.jpg',
 200000, 'SUBMITTED'),

(5, 1, 2, '#FFFFFF',
 '{"layers":[{"type":"text","content":"TEAM BUILDING 2026","fontSize":28,"color":"#FF6600","x":90,"y":90}],"background":"#FFFFFF"}',
 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-5.jpg',
 100000, 'SUBMITTED'),

(6, 2, 12, '#808080',
 '{"layers":[{"type":"image","src":"https://res.cloudinary.com/teestudio/image/upload/v1/logos/logo-startup.png","x":140,"y":110,"width":100,"height":70}],"background":"#808080"}',
 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/preview-order-6.jpg',
 120000, 'DRAFT');

-- ============================================================
-- 11. VỊ TRÍ IN CHO TỪNG THIẾT KẾ
-- ============================================================
INSERT INTO `DesignPrintPosition` (designId, printPositionId, extraCost) VALUES
(1, 1, 0),
(2, 1, 0),
(2, 3, 15000),
(3, 1, 0),
(4, 2, 20000);

-- ============================================================
-- 12. PHƯƠNG PHÁP IN CHO TỪNG THIẾT KẾ
-- ============================================================
INSERT INTO `DesignPrintMethod` (designId, printMethodId, extraCost) VALUES
(1, 1, 0),
(2, 2, 30000),
(3, 1, 0),
(4, 1, 0);

-- ============================================================
-- 13. ĐƠN HÀNG KHÁCH
-- Bao gồm đủ các trạng thái để test Filter trên giao diện Admin
-- ============================================================
INSERT INTO `CustomerOrder`
  (orderCode, userId, promotionId, addressId, subtotal, discountAmount, shippingFee, shippingCarrier, shippingMethod, trackingCode, shippedAt, deliveredAt, cancelReason, totalAmount, status, createdAt, updatedAt)
VALUES
-- ĐH1: Đang xử lý in (custom design – Nguyễn Minh Anh)
('#TS-2026-00128', 1, 1, 1,
 750000, 75000, 30000, 'GHTK', 'Tiêu chuẩn', NULL, NULL, NULL, NULL,
 705000, 'PROCESSING',
 '2026-06-03 08:24:00', '2026-06-03 10:30:00'),

-- ĐH2: Chờ xác nhận (áo mẫu – Trần Văn Cường)
('#TS-2026-00129', 2, NULL, 2,
 350000, 0, 30000, NULL, NULL, NULL, NULL, NULL, NULL,
 380000, 'PENDING',
 '2026-06-03 09:05:00', '2026-06-03 09:05:00'),

-- ĐH3: Chờ giao hàng (custom design đồng phục – Lê Thị Hoa)
('#TS-2026-00130', 3, NULL, 3,
 2400000, 0, 0, 'J&T Express', 'Nhanh', NULL, NULL, NULL, NULL,
 2400000, 'READY_TO_SHIP',
 '2026-06-02 13:40:00', '2026-06-03 09:00:00'),

-- ĐH4: Hoàn tất (áo mẫu – Phạm Quốc Bảo)
('#TS-2026-00131', 4, NULL, 4,
 480000, 0, 30000, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260601001', '2026-06-01 14:00:00', '2026-06-03 10:20:00', NULL,
 510000, 'COMPLETED',
 '2026-05-31 15:20:00', '2026-06-03 10:20:00'),

-- ĐH5: Đã xác nhận (custom design – Nguyễn Thị Lan)
('#TS-2026-00132', 5, NULL, 5,
 420000, 0, 30000, NULL, NULL, NULL, NULL, NULL, NULL,
 450000, 'CONFIRMED',
 '2026-06-03 10:15:00', '2026-06-03 11:00:00'),

-- ĐH6: Đang in (custom design – Hoàng Văn Đức)
('#TS-2026-00133', 6, NULL, 6,
 480000, 0, 30000, NULL, NULL, NULL, NULL, NULL, NULL,
 510000, 'PRINTING',
 '2026-06-02 14:30:00', '2026-06-03 08:00:00'),

-- ĐH7: Đang giao (áo mẫu – Võ Thị Thu)
('#TS-2026-00134', 7, NULL, 7,
 360000, 0, 30000, 'GHTK', 'Nhanh', 'GHTK2026060001', '2026-06-02 16:00:00', NULL, NULL,
 390000, 'SHIPPING',
 '2026-06-01 16:45:00', '2026-06-02 16:00:00'),

-- ĐH8: Đã hủy (Đinh Văn Nam)
('#TS-2026-00135', 8, NULL, 8,
 240000, 0, 30000, NULL, NULL, NULL, NULL, NULL,
 'Khách hàng yêu cầu hủy, không có nhu cầu nữa',
 270000, 'CANCELLED',
 '2026-06-01 09:00:00', '2026-06-01 10:30:00'),

-- ĐH9: Chờ thanh toán COD – Pending thêm (Nguyễn Minh Anh)
('#TS-2026-00136', 1, NULL, 1,
 300000, 0, 30000, NULL, NULL, NULL, NULL, NULL, NULL,
 330000, 'PENDING',
 '2026-06-03 11:00:00', '2026-06-03 11:00:00'),

-- ĐH10: Hoàn tất hôm nay (Trần Văn Cường)
('#TS-2026-00137', 2, 2, 2,
 600000, 50000, 0, 'Viettel Post', 'Tiêu chuẩn', 'VTP20260603002', '2026-06-02 08:00:00', '2026-06-03 14:00:00', NULL,
 550000, 'COMPLETED',
 '2026-05-30 08:00:00', '2026-06-03 14:00:00');

-- ============================================================
-- 14. LỊCH SỬ ĐƠN HÀNG
-- Mỗi đơn có đúng một mốc tạo đơn. Đơn đã xử lý có thêm mốc trạng thái hiện tại.
-- ============================================================
INSERT INTO `OrderHistory`
  (orderId, fromStatus, toStatus, action, actorId, actorRole, actorName, note, createdAt)
VALUES
(1,  NULL,      'PENDING',       'Khách hàng đặt đơn', 1, 'CUSTOMER', 'Nguyễn Minh Anh',   'Khách hàng đặt đơn', '2026-06-03 08:24:00'),
(1,  'PENDING', 'PROCESSING',    'STATUS_CHANGED',      9, 'ADMIN',    'Quản Trị Viên',      NULL,                  '2026-06-03 10:30:00'),
(2,  NULL,      'PENDING',       'Khách hàng đặt đơn', 2, 'CUSTOMER', 'Trần Văn Cường',     'Khách hàng đặt đơn', '2026-06-03 09:05:00'),
(3,  NULL,      'PENDING',       'Khách hàng đặt đơn', 3, 'CUSTOMER', 'Lê Thị Hoa',         'Khách hàng đặt đơn', '2026-06-02 13:40:00'),
(3,  'PENDING', 'READY_TO_SHIP', 'STATUS_CHANGED',      9, 'ADMIN',    'Quản Trị Viên',      NULL,                  '2026-06-03 09:00:00'),
(4,  NULL,      'PENDING',       'Khách hàng đặt đơn', 4, 'CUSTOMER', 'Phạm Quốc Bảo',      'Khách hàng đặt đơn', '2026-05-31 15:20:00'),
(4,  'PENDING', 'COMPLETED',     'STATUS_CHANGED',      9, 'ADMIN',    'Quản Trị Viên',      NULL,                  '2026-06-03 10:20:00'),
(5,  NULL,      'PENDING',       'Khách hàng đặt đơn', 5, 'CUSTOMER', 'Nguyễn Thị Lan',     'Khách hàng đặt đơn', '2026-06-03 10:15:00'),
(5,  'PENDING', 'CONFIRMED',     'STATUS_CHANGED',      9, 'ADMIN',    'Quản Trị Viên',      NULL,                  '2026-06-03 11:00:00'),
(6,  NULL,      'PENDING',       'Khách hàng đặt đơn', 6, 'CUSTOMER', 'Hoàng Văn Đức',      'Khách hàng đặt đơn', '2026-06-02 14:30:00'),
(6,  'PENDING', 'PRINTING',      'STATUS_CHANGED',      9, 'ADMIN',    'Quản Trị Viên',      NULL,                  '2026-06-03 08:00:00'),
(7,  NULL,      'PENDING',       'Khách hàng đặt đơn', 7, 'CUSTOMER', 'Võ Thị Thu',         'Khách hàng đặt đơn', '2026-06-01 16:45:00'),
(7,  'PENDING', 'SHIPPING',      'STATUS_CHANGED',      9, 'ADMIN',    'Quản Trị Viên',      NULL,                  '2026-06-02 16:00:00'),
(8,  NULL,      'PENDING',       'Khách hàng đặt đơn', 8, 'CUSTOMER', 'Đinh Văn Nam',       'Khách hàng đặt đơn', '2026-06-01 09:00:00'),
(8,  'PENDING', 'CANCELLED',     'CANCELLED',           9, 'ADMIN',    'Quản Trị Viên',      'Đã hủy đơn hàng – Lý do: Khách hàng yêu cầu hủy, không có nhu cầu nữa', '2026-06-01 10:30:00'),
(9,  NULL,      'PENDING',       'Khách hàng đặt đơn', 1, 'CUSTOMER', 'Nguyễn Minh Anh',   'Khách hàng đặt đơn', '2026-06-03 11:00:00'),
(10, NULL,      'PENDING',       'Khách hàng đặt đơn', 2, 'CUSTOMER', 'Trần Văn Cường',     'Khách hàng đặt đơn', '2026-05-30 08:00:00'),
(10, 'PENDING', 'COMPLETED',     'STATUS_CHANGED',      9, 'ADMIN',    'Quản Trị Viên',      NULL,                  '2026-06-03 14:00:00');

-- ============================================================
-- 15. CHI TIẾT TỪNG MỤC TRONG ĐƠN HÀNG
-- ============================================================
INSERT INTO `OrderItem` (orderId, variantId, designId, quantity, unitPrice, designFee, lineTotal, productionStatus) VALUES
-- ĐH1: Áo oversize trắng L + custom design (designId=1)
(1, 10, 1, 3, 150000, 150000, 900000, 'PROCESSING'),

-- ĐH2: Áo hoodie đen M (không custom)
(2, 14, NULL, 1, 280000, 0, 280000, 'WAITING_DESIGN_APPROVAL'),

-- ĐH3: Áo polo trắng M × 8 cái + custom design (designId=2)
(3, 20, 2, 8, 180000, 200000, 1640000, 'READY_TO_SHIP'),

-- ĐH4: Áo thun đen XL (không custom)
(4, 8, NULL, 4, 120000, 0, 480000, 'COMPLETED'),

-- ĐH5: Áo thun trắng M + custom design (designId=3)
(5, 2, 3, 3, 120000, 100000, 460000, 'CONFIRMED'),

-- ĐH6: Áo oversize xám M + custom design (designId=4)
(6, 12, 4, 3, 150000, 120000, 570000, 'PRINTING'),

-- ĐH7: Áo thun trắng S (không custom)
(7, 1, NULL, 3, 120000, 0, 360000, 'SHIPPING'),

-- ĐH8: Áo thun trắng M (không custom, đã hủy)
(8, 2, NULL, 2, 120000, 0, 240000, 'CANCELLED'),

-- ĐH9: Áo polo xanh dương M (không custom)
(9, 22, NULL, 2, 150000, 0, 300000, 'WAITING_DESIGN_APPROVAL'),

-- ĐH10: Áo thun đen M × 5 (không custom)
(10, 6, NULL, 5, 120000, 0, 600000, 'COMPLETED');

-- ============================================================
-- 16. TIẾN TRÌNH SẢN XUẤT
-- ============================================================
INSERT INTO `OrderProduction` (orderItemId, designId, status, note, approvedAt, printedAt, packedAt) VALUES
-- ĐH1: Đang xử lý in
(1, 1, 'PROCESSING',
 'Đã nhận file in, đang chuẩn bị máy in DTG', '2026-06-03 10:30:00', NULL, NULL),

-- ĐH3: Chờ giao (đã đóng gói xong)
(3, 2, 'PACKED',
 'Đồng phục công ty XYZ – 8 áo, đã kiểm tra chất lượng', '2026-06-02 09:00:00', '2026-06-02 14:00:00', '2026-06-03 08:30:00'),

-- ĐH5: Đã xác nhận, chờ in
(5, 3, 'CONFIRMED',
 'Đã duyệt thiết kế, chờ xếp lịch in', '2026-06-03 11:00:00', NULL, NULL),

-- ĐH6: Đang in
(6, 4, 'PRINTING',
 'Đang in lụa, dự kiến xong chiều nay', '2026-06-02 15:00:00', NULL, NULL);

-- ============================================================
-- 17. THANH TOÁN
-- ============================================================
INSERT INTO `Payment` (orderId, amount, paymentMethod, paymentType, status, transactionId, paidAt) VALUES
-- ĐH1: VNPAY đã thanh toán
(1,  705000, 'VNPAY',          'FULL', 'COMPLETED', 'VNP20260603001', '2026-06-03 08:30:00'),
-- ĐH2: COD chờ thanh toán
(2,  380000, 'COD',            'FULL','PENDING',   NULL, NULL),
-- ĐH3: VNPAY đã thanh toán
(3,  2400000,'VNPAY',  'FULL', 'COMPLETED', 'VNP20260602001', '2026-06-02 14:00:00'),
-- ĐH4: VNPAY đã thanh toán
(4,  510000, 'VNPAY',          'FULL', 'COMPLETED', 'VNP20260531001', '2026-05-31 15:30:00'),
-- ĐH5: COD chờ thanh toán
(5,  450000, 'COD',            'FULL','PENDING',   NULL, NULL),
-- ĐH6: VNPAY đã thanh toán
(6,  510000, 'VNPAY',          'FULL', 'COMPLETED', 'VNP20260602001', '2026-06-02 14:35:00'),
-- ĐH7: COD chờ thanh toán
(7,  390000, 'COD',            'FULL','PENDING',   NULL, NULL),
-- ĐH8: Đã hủy nên không thanh toán
(8,  270000, 'COD',            'FULL','CANCELLED', NULL, NULL),
-- ĐH9: COD chờ thanh toán
(9,  330000, 'COD',            'FULL','PENDING',   NULL, NULL),
-- ĐH10: VNPAY đã thanh toán
(10, 550000, 'VNPAY',          'FULL', 'COMPLETED', 'VNP20260530001', '2026-05-30 08:15:00');

-- ============================================================
-- 18. DỮ LIỆU TEST TỒN KHO KHI HỦY ĐƠN
-- Mục tiêu:
--   1) Tạo đơn áo mẫu: chọn biến thể SKU=TST-TONKHO-TRANG-M, không chọn thiết kế.
--   2) Tạo đơn áo tùy chỉnh: chọn khách test và thiết kế APPROVED bên dưới.
-- Sau đó hủy đơn ở từng trạng thái để kiểm tra ProductVariant.stockQty.
-- ============================================================

-- Bước 1: Category
INSERT INTO `Category` (`name`)
VALUES ('Áo Thun Trơn Test Tồn Kho')
ON DUPLICATE KEY UPDATE `id` = LAST_INSERT_ID(`id`);
SET @seed_inventory_category_id = LAST_INSERT_ID();

-- Bước 2: Product/phôi áo
INSERT INTO `Product`
  (`categoryId`, `name`, `slug`, `basePrice`, `material`, `form`, `madeIn`, `description`, `status`)
VALUES
  (
    @seed_inventory_category_id,
    'Áo thun trơn test tồn kho',
    'ao-thun-tron-test-ton-kho',
    99000,
    '100% Cotton test',
    'Regular fit',
    'Việt Nam',
    'Phôi áo dùng riêng để test luồng trừ/cộng tồn kho khi tạo và hủy đơn hàng.',
    'ACTIVE'
  )
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `basePrice` = VALUES(`basePrice`),
  `material` = VALUES(`material`),
  `form` = VALUES(`form`),
  `madeIn` = VALUES(`madeIn`),
  `description` = VALUES(`description`),
  `status` = VALUES(`status`),
  `id` = LAST_INSERT_ID(`id`);
SET @seed_inventory_product_id = LAST_INSERT_ID();

-- Bước 3: ProductVariant/biến thể có tồn kho rõ ràng để quan sát
INSERT INTO `ProductVariant`
  (`productId`, `color`, `size`, `sku`, `stockQty`)
VALUES
  (@seed_inventory_product_id, 'Trắng', 'M', 'TST-TONKHO-TRANG-M', 20)
ON DUPLICATE KEY UPDATE
  `productId` = VALUES(`productId`),
  `color` = VALUES(`color`),
  `size` = VALUES(`size`),
  `stockQty` = VALUES(`stockQty`),
  `id` = LAST_INSERT_ID(`id`);
SET @seed_inventory_variant_id = LAST_INSERT_ID();

-- Bước 4: Account khách hàng test
INSERT INTO `Account`
  (`email`, `passwordHash`, `fullName`, `phone`, `role`, `status`)
VALUES
  (
    'test.tonkho.customer@teestudio.vn',
    '$2b$10$seedInventoryCustomerHash',
    'Khách Test Tồn Kho',
    '0900000999',
    'CUSTOMER',
    'ACTIVE'
  )
ON DUPLICATE KEY UPDATE
  `fullName` = VALUES(`fullName`),
  `phone` = VALUES(`phone`),
  `role` = VALUES(`role`),
  `status` = VALUES(`status`),
  `id` = LAST_INSERT_ID(`id`);
SET @seed_inventory_customer_id = LAST_INSERT_ID();

-- Bổ sung địa chỉ để form tạo đơn tự điền thông tin giao hàng cho khách test.
INSERT INTO `UserAddress`
  (`userId`, `recipientName`, `phone`, `addressLine`, `city`, `district`, `ward`, `isDefault`)
SELECT
  @seed_inventory_customer_id,
  'Khách Test Tồn Kho',
  '0900000999',
  '100 Đường Test Tồn Kho',
  'TP. Hồ Chí Minh',
  'Quận 1',
  'Phường Bến Nghé',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM `UserAddress`
  WHERE `userId` = @seed_inventory_customer_id
    AND `phone` = '0900000999'
    AND `addressLine` = '100 Đường Test Tồn Kho'
);

-- Bước 5: CustomDesign APPROVED để Admin thấy trong dropdown khi tạo đơn tùy chỉnh.
INSERT INTO `CustomDesign`
  (`userId`, `productId`, `variantId`, `baseColor`, `canvasData`, `previewUrl`, `designFee`, `status`, `adminNote`)
SELECT
  @seed_inventory_customer_id,
  @seed_inventory_product_id,
  @seed_inventory_variant_id,
  '#FFFFFF',
  CAST('{"objects":[],"background":"#FFFFFF","seed":"inventory-cancel-flow"}' AS JSON),
  'https://res.cloudinary.com/teestudio/image/upload/v1/previews/seed-inventory-approved-design.jpg',
  50000,
  'APPROVED',
  'Thiết kế mẫu đã duyệt để test tồn kho khi hủy đơn áo tùy chỉnh.'
WHERE NOT EXISTS (
  SELECT 1
  FROM `CustomDesign`
  WHERE `userId` = @seed_inventory_customer_id
    AND `productId` = @seed_inventory_product_id
    AND `variantId` = @seed_inventory_variant_id
    AND `previewUrl` = 'https://res.cloudinary.com/teestudio/image/upload/v1/previews/seed-inventory-approved-design.jpg'
);

-- Ghi nhận tồn kho khởi tạo cho biến thể test để dễ đối chiếu khi xem lịch sử kho.
INSERT INTO `InventoryTransaction`
  (`variantId`, `orderId`, `supplierId`, `quantityChanged`, `transactionType`, `reason`)
SELECT
  @seed_inventory_variant_id,
  NULL,
  NULL,
  20,
  'IMPORT',
  'Seed tồn kho ban đầu cho SKU TST-TONKHO-TRANG-M'
WHERE NOT EXISTS (
  SELECT 1
  FROM `InventoryTransaction`
  WHERE `variantId` = @seed_inventory_variant_id
    AND `transactionType` = 'IMPORT'
    AND `reason` = 'Seed tồn kho ban đầu cho SKU TST-TONKHO-TRANG-M'
);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- XÁC NHẬN KẾT QUẢ
-- ============================================================
SELECT 'Account'        AS bang, COUNT(*) AS so_ban_ghi FROM Account
UNION ALL
SELECT 'Product',        COUNT(*) FROM Product
UNION ALL
SELECT 'ProductVariant', COUNT(*) FROM ProductVariant
UNION ALL
SELECT 'CustomDesign',   COUNT(*) FROM CustomDesign
UNION ALL
SELECT 'InventoryTransaction', COUNT(*) FROM InventoryTransaction
UNION ALL
SELECT 'CustomerOrder',  COUNT(*) FROM CustomerOrder
UNION ALL
SELECT 'OrderHistory',    COUNT(*) FROM OrderHistory
UNION ALL
SELECT 'OrderItem',      COUNT(*) FROM OrderItem
UNION ALL
SELECT 'Payment',        COUNT(*) FROM Payment;
