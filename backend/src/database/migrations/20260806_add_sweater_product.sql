-- Chèn Product mới (nếu chưa có)
INSERT IGNORE INTO `Product` (`categoryId`, `shirtType`, `name`, `slug`, `basePrice`, `material`, `form`, `madeIn`, `description`, `status`) 
VALUES (5, 'sweater', 'Áo Sweater', 'ao-sweater', 250000, 'Nỉ bông', 'Oversize', 'Việt Nam', 'Áo Sweater chất liệu nỉ bông dày dặn, form rộng thoải mái, phù hợp cho mùa đông.', 'ACTIVE');

SELECT `id` INTO @sweater_id FROM `Product` WHERE `slug` = 'ao-sweater';

-- Danh sách màu
-- Beige: #D6B89A, Green: #15803D, Blue: #1E3A8A
-- Size: S, M, L, XL

-- Beige
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Beige', 'S', 100, '#D6B89A', CONCAT('SW-BGE-S-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Beige', 'M', 100, '#D6B89A', CONCAT('SW-BGE-M-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Beige', 'L', 100, '#D6B89A', CONCAT('SW-BGE-L-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Beige', 'XL', 100, '#D6B89A', CONCAT('SW-BGE-XL-', @sweater_id));

-- Green
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Green', 'S', 100, '#15803D', CONCAT('SW-GRN-S-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Green', 'M', 100, '#15803D', CONCAT('SW-GRN-M-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Green', 'L', 100, '#15803D', CONCAT('SW-GRN-L-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Green', 'XL', 100, '#15803D', CONCAT('SW-GRN-XL-', @sweater_id));

-- Blue
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Blue', 'S', 100, '#1E3A8A', CONCAT('SW-BLU-S-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Blue', 'M', 100, '#1E3A8A', CONCAT('SW-BLU-M-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Blue', 'L', 100, '#1E3A8A', CONCAT('SW-BLU-L-', @sweater_id));
INSERT INTO `ProductVariant` (`productId`, `color`, `size`, `stockQty`, `colorHex`, `sku`) VALUES (@sweater_id, 'Blue', 'XL', 100, '#1E3A8A', CONCAT('SW-BLU-XL-', @sweater_id));

-- Hình ảnh mockup
-- Beige
INSERT INTO `ProductImage` (`productId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `colorHex`, `view`) 
VALUES (@sweater_id, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785838102/Sweater-Beige-Front_i1lub9.png', 'Sweater-Beige-Front', 1, 1, '#D6B89A', 'front');

INSERT INTO `ProductImage` (`productId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `colorHex`, `view`) 
VALUES (@sweater_id, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785838093/Sweater-Beige-Back_hisnii.png', 'Sweater-Beige-Back', 2, 0, '#D6B89A', 'back');

-- Green
INSERT INTO `ProductImage` (`productId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `colorHex`, `view`) 
VALUES (@sweater_id, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785838102/Sweater-Green-Front_msn0kc.png', 'Sweater-Green-Front', 3, 0, '#15803D', 'front');

INSERT INTO `ProductImage` (`productId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `colorHex`, `view`) 
VALUES (@sweater_id, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785838093/Sweater-Green-Back_hbhnbm.png', 'Sweater-Green-Back', 4, 0, '#15803D', 'back');

-- Blue
INSERT INTO `ProductImage` (`productId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `colorHex`, `view`) 
VALUES (@sweater_id, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785838093/Sweater-Blue-Front_h4r0on.png', 'Sweater-Blue-Front', 5, 0, '#1E3A8A', 'front');

INSERT INTO `ProductImage` (`productId`, `imageUrl`, `altText`, `sortOrder`, `isPrimary`, `colorHex`, `view`) 
VALUES (@sweater_id, 'https://res.cloudinary.com/dwol6aarv/image/upload/v1785838093/Sweater-Blue-Back_qdebdv.png', 'Sweater-Blue-Back', 6, 0, '#1E3A8A', 'back');
