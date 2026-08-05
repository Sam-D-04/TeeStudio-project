/**
 * public.service.js – Các service công khai (không yêu cầu auth).
 * Dùng cho trang chủ và các trang khách hàng.
 */

const db = require("../../database/mysql");

// =====================================================================
// SERVICE 1: Lấy danh sách phôi áo (theo form: tshirt, polo, hoodie)
// Dùng cho section "Tạo thiết kế mới" ở trang chủ (ProductCategories)
// =====================================================================
async function layDanhSachSanPhamCongKhai(search) {
  const params = [];
  let whereExtra = "";
  if (search && search.trim()) {
    whereExtra = " AND (p.name LIKE ? OR p.material LIKE ? OR c.name LIKE ?)";
    const like = `%${search.trim()}%`;
    params.push(like, like, like);
  }

  const [rows] = await db.pool.query(
    `SELECT
       p.id,
       p.name,
       p.form,
       p.basePrice,
       p.material,
       c.name AS categoryName,
       (SELECT imageUrl FROM ProductImage pi WHERE pi.productId = p.id AND pi.isPrimary = 1 LIMIT 1) AS imageUrl
     FROM Product p
     LEFT JOIN Category c ON c.id = p.categoryId
     WHERE p.status = 'ACTIVE'${whereExtra}
     ORDER BY p.id ASC`,
    params
  );

  if (rows.length === 0) return rows;

  // Lấy ảnh mặt trước theo từng màu (altText dạng "{Màu}-front") để FE có thể
  // xoay vòng ảnh màu khác khi hover — ảnh chính (imageUrl) luôn đứng đầu danh sách.
  const productIds = rows.map((r) => r.id);
  const [frontImages] = await db.pool.query(
    `SELECT productId, imageUrl, isPrimary
     FROM ProductImage
     WHERE productId IN (?) AND altText LIKE '%-front'
     ORDER BY productId, isPrimary DESC, sortOrder ASC`,
    [productIds]
  );

  const imagesByProduct = new Map();
  for (const img of frontImages) {
    if (!imagesByProduct.has(img.productId)) imagesByProduct.set(img.productId, []);
    imagesByProduct.get(img.productId).push(img.imageUrl);
  }

  return rows.map((r) => ({
    ...r,
    images: imagesByProduct.get(r.id) ?? (r.imageUrl ? [r.imageUrl] : []),
  }));
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

  // Lấy tất cả variants còn hoạt động
  const [variants] = await db.pool.query(
    `SELECT id, color, colorHex, size, sku, stockQty
     FROM ProductVariant
     WHERE productId = ? AND status = 'ACTIVE'
     ORDER BY color, size ASC`,
    [id]
  );

  // Lấy ảnh sản phẩm (colorHex/view dùng để Design Studio tra đúng ảnh mockup theo màu)
  const [images] = await db.pool.query(
    `SELECT id, imageUrl, altText, sortOrder, isPrimary, colorHex, view
     FROM ProductImage
     WHERE productId = ?
     ORDER BY sortOrder ASC`,
    [id]
  );

  // Lấy bảng ưu đãi số lượng (nếu có) - đúng các mốc dùng để tự động giảm giá
  // khi tạo đơn (xem customer.order.service.js), hiển thị công khai để khách
  // biết trước khi đặt hàng thay vì chỉ áp dụng ngầm.
  const [bulkPricing] = await db.pool.query(
    `SELECT minQty, discountPercent
     FROM BulkPricing
     WHERE productId = ?
     ORDER BY minQty ASC`,
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
      colorHex: v.colorHex,
      size: v.size,
      sku: v.sku,
      stockQty: v.stockQty,
    })),
    images: images.map((img) => ({
      id: img.id,
      url: img.imageUrl,
      altText: img.altText || p.name,
      isPrimary: img.isPrimary === 1,
      colorHex: img.colorHex,
      view: img.view,
    })),
    bulkPricing: bulkPricing.map((b) => ({
      minQty: b.minQty,
      discountPercent: Number(b.discountPercent),
    })),
  };
}

module.exports = {
  layDanhSachSanPhamCongKhai,
  laySanPhamNoiBat,
  layChiTietSanPhamCongKhai,
};
