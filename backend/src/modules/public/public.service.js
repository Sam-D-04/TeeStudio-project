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
      c.name AS categoryName,
      (SELECT imageUrl FROM ProductImage pi WHERE pi.productId = p.id AND pi.isPrimary = 1 LIMIT 1) AS imageUrl
    FROM Product p
    LEFT JOIN Category c ON c.id = p.categoryId
    WHERE p.status = 'ACTIVE'
    ORDER BY p.id ASC
  `);
  return rows;
}

// =====================================================================
// SERVICE 2: Lấy danh sách sản phẩm nổi bật (có nhóm màu, mỗi sp 1 dòng)
// Dùng cho section "Màu áo nổi bật" ở trang chủ (ProductShowcase)
// - Gom nhóm theo sản phẩm, lấy danh sách màu bằng GROUP_CONCAT
// - Chỉ lấy sản phẩm đang còn hàng (totalStock > 0)
// =====================================================================
async function laySanPhamNoiBat() {
  const [rows] = await db.pool.query(`
    SELECT
      p.id      AS productId,
      p.form,
      p.name    AS productName,
      p.basePrice,
      GROUP_CONCAT(DISTINCT pv.color SEPARATOR ',') AS colors,
      SUM(pv.stockQty) AS totalStock,
      (SELECT imageUrl FROM ProductImage pi WHERE pi.productId = p.id AND pi.isPrimary = 1 LIMIT 1) AS imageUrl
    FROM Product p
    JOIN ProductVariant pv ON p.id = pv.productId
    WHERE p.status = 'ACTIVE'
    GROUP BY p.id, p.form, p.name, p.basePrice
    HAVING totalStock > 0
    ORDER BY p.id ASC
  `);
  return rows;
}

// =====================================================================
// SERVICE 3: Lấy chi tiết 1 sản phẩm (public – không cần auth)
// Dùng cho trang Product Detail /product/[id]
// =====================================================================
async function layChiTietSanPhamCongKhai(id) {
  const [rows] = await db.pool.query(
    `SELECT p.id, p.name, p.basePrice, p.material, p.form,
            p.madeIn, p.description, p.status,
            c.name AS categoryName
     FROM Product p
     LEFT JOIN Category c ON c.id = p.categoryId
     WHERE p.id = ? AND p.status = 'ACTIVE'
     LIMIT 1`,
    [id]
  );

  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy sản phẩm");
    err.statusCode = 404;
    throw err;
  }

  const p = rows[0];

  // Lấy tất cả variants
  const [variants] = await db.pool.query(
    `SELECT id, color, size, sku, stockQty
     FROM ProductVariant
     WHERE productId = ?
     ORDER BY color, size ASC`,
    [id]
  );

  // Lấy ảnh sản phẩm
  const [images] = await db.pool.query(
    `SELECT id, imageUrl, altText, sortOrder, isPrimary
     FROM ProductImage
     WHERE productId = ?
     ORDER BY sortOrder ASC`,
    [id]
  );

  return {
    id: p.id,
    name: p.name,
    category: p.categoryName || "",
    material: p.material || "",
    form: p.form,
    madeIn: p.madeIn || "Việt Nam",
    description: p.description || "",
    basePrice: Number(p.basePrice),
    variants: variants.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      sku: v.sku,
      stockQty: v.stockQty,
    })),
    images: images.map((img) => ({
      id: img.id,
      url: img.imageUrl,
      altText: img.altText || p.name,
      isPrimary: img.isPrimary === 1,
    })),
  };
}

module.exports = {
  layDanhSachSanPhamCongKhai,
  laySanPhamNoiBat,
  layChiTietSanPhamCongKhai,
};
