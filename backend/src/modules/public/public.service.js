/**
 * public.service.js – Các service công khai (không yêu cầu auth).
 * Dùng cho trang chủ và các trang khách hàng.
 */

const db = require("../../database/mysql");

// =====================================================================
// SERVICE 1: Lấy danh sách phôi áo (theo form: tshirt, polo, hoodie)
// Dùng cho section "Tạo thiết kế mới" ở trang chủ (ProductCategories)
// =====================================================================
async function layDanhSachSanPhamCongKhai() {
  const [rows] = await db.pool.query(`
    SELECT
      p.id,
      p.name,
      p.form,
      p.basePrice,
      p.material,
      c.name AS categoryName
    FROM Product p
    LEFT JOIN Category c ON c.id = p.categoryId
    WHERE p.status = 'ACTIVE'
    ORDER BY p.id ASC
  `);
  return rows;
}

// =====================================================================
// SERVICE 2: Lấy danh sách màu áo nổi bật theo loại áo (form)
// Dùng cho section "Màu áo nổi bật" ở trang chủ (ProductShowcase)
// - Mỗi màu chỉ lấy 1 lần (DISTINCT), lấy tổng tồn kho của màu đó
// - Chỉ lấy màu đang còn hàng (totalStock > 0)
// =====================================================================
async function layMauAoNoiBat() {
  const [rows] = await db.pool.query(`
    SELECT
      pv.color,
      p.form,
      p.name    AS productName,
      p.basePrice,
      SUM(pv.stockQty) AS totalStock
    FROM ProductVariant pv
    JOIN Product p ON p.id = pv.productId
    WHERE p.status = 'ACTIVE'
    GROUP BY pv.color, p.form, p.name, p.basePrice
    HAVING totalStock > 0
    ORDER BY p.form, pv.color ASC
  `);
  return rows;
}

module.exports = {
  layDanhSachSanPhamCongKhai,
  layMauAoNoiBat,
};
