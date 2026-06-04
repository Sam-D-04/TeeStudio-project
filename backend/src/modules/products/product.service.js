/**
 * product.service.js – Xử lý logic nghiệp vụ phôi áo (phía Admin).
 * Thực hiện truy vấn MySQL và trả về dữ liệu đã định dạng cho Frontend.
 */

const db = require("../../database/mysql");

// =====================================================================
// HẰNG SỐ
// =====================================================================
/** Ngưỡng cảnh báo sắp hết hàng */
const NGUONG_SAP_HET = 10;

// =====================================================================
// MAP TRẠNG THÁI: DB (tiếng Anh) ↔ Frontend (tiếng Việt snake_case)
// =====================================================================
const MAP_TRANG_THAI_DB_SANG_FE = {
  ACTIVE: "dang_hien_thi",
  INACTIVE: "dang_an",
};

const MAP_TRANG_THAI_FE_SANG_DB = {
  dang_hien_thi: "ACTIVE",
  dang_an: "INACTIVE",
};

/**
 * Tính trạng thái tồn kho từ số lượng
 */
function tinhTrangThaiTonKho(stockQty) {
  if (stockQty === 0) return "het_hang";
  if (stockQty <= NGUONG_SAP_HET) return "sap_het";
  return "con_hang";
}

/**
 * Sinh slug từ tên sản phẩm
 */
function sinhSlug(ten) {
  return ten
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    + "-" + Date.now();
}

// =====================================================================
// SERVICE 1: Thống kê KPI (4 thẻ đầu trang)
// =====================================================================
async function layThongKe() {
  const [rowsTong] = await db.pool.query(
    "SELECT COUNT(*) AS tong FROM Product"
  );
  const [rowsHienThi] = await db.pool.query(
    "SELECT COUNT(*) AS so_luong FROM Product WHERE status = 'ACTIVE'"
  );
  const [rowsBienThe] = await db.pool.query(
    "SELECT COUNT(*) AS so_luong FROM ProductVariant pv JOIN Product p ON p.id = pv.productId"
  );
  const [rowsSapHet] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong FROM ProductVariant WHERE stockQty > 0 AND stockQty <= ?`,
    [NGUONG_SAP_HET]
  );

  return {
    tongPhoi: rowsTong[0].tong,
    dangHienThi: rowsHienThi[0].so_luong,
    tongBienThe: rowsBienThe[0].so_luong,
    sapHetHang: rowsSapHet[0].so_luong,
  };
}

// =====================================================================
// SERVICE 2: Danh sách danh mục (cho dropdown filter)
// =====================================================================
async function layDanhMuc() {
  const [rows] = await db.pool.query(
    "SELECT id, name FROM Category ORDER BY name ASC"
  );
  return rows.map((r) => ({ id: r.id, ten: r.name }));
}

// =====================================================================
// SERVICE 3: Danh sách phôi áo (phân trang + lọc)
// =====================================================================
async function layDanhSachSanPham({ trang, soMoiTrang, tuKhoa, danhMuc, trangThai, tonKho }) {
  const trangHienTai = parseInt(trang) || 1;
  const soMoi = parseInt(soMoiTrang) || 10;
  const offset = (trangHienTai - 1) * soMoi;

  const dieuKien = [];
  const thamSo = [];

  if (tuKhoa && tuKhoa.trim()) {
    dieuKien.push("(p.name LIKE ? OR p.slug LIKE ?)");
    thamSo.push(`%${tuKhoa.trim()}%`, `%${tuKhoa.trim()}%`);
  }

  if (danhMuc && danhMuc.trim()) {
    dieuKien.push("c.name = ?");
    thamSo.push(danhMuc.trim());
  }

  if (trangThai && trangThai.trim()) {
    const statusDB = MAP_TRANG_THAI_FE_SANG_DB[trangThai];
    if (statusDB) {
      dieuKien.push("p.status = ?");
      thamSo.push(statusDB);
    }
  }

  const menh_de_where =
    dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";

  // Đếm tổng
  const sqlDem = `
    SELECT COUNT(DISTINCT p.id) AS tong_so
    FROM Product p
    LEFT JOIN Category c ON c.id = p.categoryId
    ${menh_de_where}
  `;
  const [rowsDem] = await db.pool.query(sqlDem, thamSo);
  const tongSo = rowsDem[0].tong_so;

  // Lấy danh sách sản phẩm
  const sqlData = `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.basePrice,
      p.material,
      p.form,
      p.status,
      c.name AS categoryName
    FROM Product p
    LEFT JOIN Category c ON c.id = p.categoryId
    ${menh_de_where}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;
  const [rowsProduct] = await db.pool.query(sqlData, [...thamSo, soMoi, offset]);

  if (rowsProduct.length === 0) {
    return { danhSach: [], tongSo, trang: trangHienTai, soMoiTrang: soMoi, tongSoTrang: Math.ceil(tongSo / soMoi) };
  }

  // Lấy biến thể của các sản phẩm này
  const productIds = rowsProduct.map((p) => p.id);
  const [rowsVariants] = await db.pool.query(
    `SELECT id, productId, color, size, sku, stockQty
     FROM ProductVariant
     WHERE productId IN (?)
     ORDER BY productId, color, size`,
    [productIds]
  );

  // Nhóm biến thể theo productId
  const variantMap = {};
  for (const v of rowsVariants) {
    if (!variantMap[v.productId]) variantMap[v.productId] = [];
    variantMap[v.productId].push(v);
  }

  // Lọc theo tồn kho (client-side sau khi lấy variants)
  let danhSach = rowsProduct.map((p) => {
    const variants = variantMap[p.id] || [];

    // Xác định màu hex từ tên màu (frontend dùng colorHex để vẽ chấm màu)
    const mappedVariants = variants.map((v) => ({
      id: v.id,
      colorName: v.color,
      colorHex: mapMauSangHex(v.color),
      size: v.size,
      sku: v.sku,
      stock: v.stockQty,
      inventoryStatus: tinhTrangThaiTonKho(v.stockQty),
    }));

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.categoryName || "",
      material: p.material,
      fit: p.form,
      basePrice: Number(p.basePrice),
      displayStatus: MAP_TRANG_THAI_DB_SANG_FE[p.status] || "dang_hien_thi",
      variants: mappedVariants,
    };
  });

  // Lọc theo tồn kho nếu có
  if (tonKho && tonKho !== "tat_ca") {
    danhSach = danhSach.filter((p) =>
      p.variants.some((v) => v.inventoryStatus === tonKho)
    );
  }

  return {
    danhSach,
    tongSo,
    trang: trangHienTai,
    soMoiTrang: soMoi,
    tongSoTrang: Math.ceil(tongSo / soMoi),
  };
}

/**
 * Map tên màu phổ biến sang mã hex (fallback cho dữ liệu DB không có hex)
 */
function mapMauSangHex(colorName) {
  const map = {
    "Đen": "#1a1a1a",
    "Trắng": "#ffffff",
    "Trắng sữa": "#f8f5f0",
    "Xám": "#6b7280",
    "Xám nhạt": "#d1d5db",
    "Navy": "#1e3a8a",
    "Xanh navy": "#1e3a8a",
    "Xanh dương": "#2563eb",
    "Xanh lá": "#16a34a",
    "Đỏ": "#dc2626",
    "Cam": "#ea580c",
    "Vàng": "#ca8a04",
    "Hồng": "#ec4899",
    "Tím": "#7c3aed",
    "Nâu": "#92400e",
    "Be": "#d4b896",
  };
  return map[colorName] || "#94a3b8";
}

// =====================================================================
// SERVICE 4: Cảnh báo tồn kho (panel bên phải)
// =====================================================================
async function layCanhBaoTonKho() {
  const [rows] = await db.pool.query(
    `SELECT
       pv.id,
       pv.color,
       pv.size,
       pv.sku,
       pv.stockQty,
       p.name AS tenSanPham
     FROM ProductVariant pv
     JOIN Product p ON p.id = pv.productId
     WHERE pv.stockQty <= ?
     ORDER BY pv.stockQty ASC, p.name ASC
     LIMIT 20`,
    [NGUONG_SAP_HET]
  );

  return rows.map((r) => ({
    id: r.id,
    productName: r.tenSanPham,
    colorName: r.color,
    colorHex: mapMauSangHex(r.color),
    size: r.size,
    sku: r.sku,
    stock: r.stockQty,
    severity: tinhTrangThaiTonKho(r.stockQty),
  }));
}

// =====================================================================
// SERVICE 5: Chi tiết 1 phôi áo
// =====================================================================
async function layChiTietSanPham(id) {
  const [rows] = await db.pool.query(
    `SELECT p.*, c.name AS categoryName
     FROM Product p
     LEFT JOIN Category c ON c.id = p.categoryId
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy phôi áo");
    err.statusCode = 404;
    throw err;
  }

  const p = rows[0];

  const [variants] = await db.pool.query(
    "SELECT id, color, size, sku, stockQty FROM ProductVariant WHERE productId = ? ORDER BY color, size",
    [id]
  );

  const [images] = await db.pool.query(
    "SELECT id, imageUrl, altText, sortOrder, isPrimary FROM ProductImage WHERE productId = ? ORDER BY sortOrder ASC",
    [id]
  );

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.categoryName || "",
    categoryId: p.categoryId,
    material: p.material,
    fit: p.form,
    madeIn: p.madeIn,
    description: p.description,
    basePrice: Number(p.basePrice),
    displayStatus: MAP_TRANG_THAI_DB_SANG_FE[p.status] || "dang_hien_thi",
    variants: variants.map((v) => ({
      id: v.id,
      colorName: v.color,
      colorHex: mapMauSangHex(v.color),
      size: v.size,
      sku: v.sku,
      stock: v.stockQty,
      inventoryStatus: tinhTrangThaiTonKho(v.stockQty),
    })),
    images: images.map((img) => ({
      id: img.id,
      url: img.imageUrl,
      altText: img.altText,
      laChinh: img.isPrimary === 1,
    })),
  };
}

// =====================================================================
// SERVICE 6: Tạo phôi áo mới
// =====================================================================
async function taoSanPham({ categoryId, name, basePrice, material, form, madeIn, description, slug }) {
  // Kiểm tra danh mục tồn tại
  const [catRows] = await db.pool.query("SELECT id FROM Category WHERE id = ?", [categoryId]);
  if (!catRows || catRows.length === 0) {
    const err = new Error("Danh mục không tồn tại");
    err.statusCode = 400;
    throw err;
  }

  // Sinh slug nếu không có
  const finalSlug = slug || sinhSlug(name);

  // Kiểm tra slug trùng
  const [slugRows] = await db.pool.query("SELECT id FROM Product WHERE slug = ?", [finalSlug]);
  if (slugRows && slugRows.length > 0) {
    const err = new Error("Slug đã tồn tại, vui lòng dùng tên khác");
    err.statusCode = 409;
    throw err;
  }

  const result = await db.execute(
    `INSERT INTO Product (categoryId, name, slug, basePrice, material, form, madeIn, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
    [categoryId, name, finalSlug, basePrice, material, form, madeIn, description]
  );

  return { id: result.insertId, name, slug: finalSlug, trangThai: "dang_hien_thi" };
}

// =====================================================================
// SERVICE 7: Cập nhật phôi áo
// =====================================================================
async function capNhatSanPham(id, { categoryId, name, basePrice, material, form, madeIn, description }) {
  // Kiểm tra tồn tại
  const [rows] = await db.pool.query("SELECT id FROM Product WHERE id = ?", [id]);
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy phôi áo");
    err.statusCode = 404;
    throw err;
  }

  const fields = [];
  const params = [];

  if (categoryId !== undefined) { fields.push("categoryId = ?"); params.push(categoryId); }
  if (name !== undefined) { fields.push("name = ?"); params.push(name); }
  if (basePrice !== undefined) { fields.push("basePrice = ?"); params.push(basePrice); }
  if (material !== undefined) { fields.push("material = ?"); params.push(material); }
  if (form !== undefined) { fields.push("form = ?"); params.push(form); }
  if (madeIn !== undefined) { fields.push("madeIn = ?"); params.push(madeIn); }
  if (description !== undefined) { fields.push("description = ?"); params.push(description); }

  if (fields.length === 0) {
    const err = new Error("Không có trường nào để cập nhật");
    err.statusCode = 400;
    throw err;
  }

  params.push(id);
  await db.execute(`UPDATE Product SET ${fields.join(", ")} WHERE id = ?`, params);

  return layChiTietSanPham(id);
}

// =====================================================================
// SERVICE 8: Cập nhật trạng thái hiển thị
// =====================================================================
async function capNhatTrangThai(id, trangThaiFE) {
  const statusDB = MAP_TRANG_THAI_FE_SANG_DB[trangThaiFE];
  if (!statusDB) {
    const err = new Error(`Trạng thái "${trangThaiFE}" không hợp lệ`);
    err.statusCode = 400;
    throw err;
  }

  const [rows] = await db.pool.query("SELECT id FROM Product WHERE id = ?", [id]);
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy phôi áo");
    err.statusCode = 404;
    throw err;
  }

  await db.execute("UPDATE Product SET status = ? WHERE id = ?", [statusDB, id]);
  return { id: Number(id), trangThai: trangThaiFE };
}

// =====================================================================
// SERVICE 9: Xóa phôi áo
// =====================================================================
async function xoaSanPham(id) {
  const [rows] = await db.pool.query("SELECT id, name FROM Product WHERE id = ?", [id]);
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy phôi áo");
    err.statusCode = 404;
    throw err;
  }

  // Kiểm tra xem có đơn hàng đang dùng biến thể này không
  const [orderRows] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong
     FROM OrderItem oi
     JOIN ProductVariant pv ON pv.id = oi.variantId
     WHERE pv.productId = ?`,
    [id]
  );
  if (orderRows[0].so_luong > 0) {
    const err = new Error(
      "Không thể xóa phôi áo đang có trong đơn hàng. Vui lòng ẩn sản phẩm thay vì xóa."
    );
    err.statusCode = 409;
    throw err;
  }

  await db.execute("DELETE FROM Product WHERE id = ?", [id]);
  return { id: Number(id) };
}

// =====================================================================
// SERVICE 10: Thêm biến thể
// =====================================================================
async function themBienThe(productId, { color, size, sku, stockQty }) {
  // Kiểm tra sản phẩm tồn tại
  const [rows] = await db.pool.query("SELECT id FROM Product WHERE id = ?", [productId]);
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy phôi áo");
    err.statusCode = 404;
    throw err;
  }

  // Kiểm tra SKU trùng
  const [skuRows] = await db.pool.query("SELECT id FROM ProductVariant WHERE sku = ?", [sku]);
  if (skuRows && skuRows.length > 0) {
    const err = new Error(`SKU "${sku}" đã tồn tại`);
    err.statusCode = 409;
    throw err;
  }

  // Kiểm tra màu + size trùng trong sản phẩm
  const [dupRows] = await db.pool.query(
    "SELECT id FROM ProductVariant WHERE productId = ? AND color = ? AND size = ?",
    [productId, color, size]
  );
  if (dupRows && dupRows.length > 0) {
    const err = new Error(`Biến thể màu "${color}" – size "${size}" đã tồn tại`);
    err.statusCode = 409;
    throw err;
  }

  const result = await db.execute(
    "INSERT INTO ProductVariant (productId, color, size, sku, stockQty) VALUES (?, ?, ?, ?, ?)",
    [productId, color, size, sku, stockQty || 0]
  );

  return {
    id: result.insertId,
    colorName: color,
    colorHex: mapMauSangHex(color),
    size,
    sku,
    stock: stockQty || 0,
    inventoryStatus: tinhTrangThaiTonKho(stockQty || 0),
  };
}

// =====================================================================
// SERVICE 11: Cập nhật biến thể
// =====================================================================
async function capNhatBienThe(productId, variantId, { color, size, sku, stockQty }) {
  const [rows] = await db.pool.query(
    "SELECT id FROM ProductVariant WHERE id = ? AND productId = ?",
    [variantId, productId]
  );
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy biến thể");
    err.statusCode = 404;
    throw err;
  }

  const fields = [];
  const params = [];

  if (color !== undefined) { fields.push("color = ?"); params.push(color); }
  if (size !== undefined) { fields.push("size = ?"); params.push(size); }
  if (sku !== undefined) { fields.push("sku = ?"); params.push(sku); }
  if (stockQty !== undefined) { fields.push("stockQty = ?"); params.push(stockQty); }

  if (fields.length === 0) {
    const err = new Error("Không có trường nào để cập nhật");
    err.statusCode = 400;
    throw err;
  }

  params.push(variantId);
  await db.execute(`UPDATE ProductVariant SET ${fields.join(", ")} WHERE id = ?`, params);

  const [updated] = await db.pool.query(
    "SELECT id, color, size, sku, stockQty FROM ProductVariant WHERE id = ?",
    [variantId]
  );
  const v = updated[0];

  return {
    id: v.id,
    colorName: v.color,
    colorHex: mapMauSangHex(v.color),
    size: v.size,
    sku: v.sku,
    stock: v.stockQty,
    inventoryStatus: tinhTrangThaiTonKho(v.stockQty),
  };
}

module.exports = {
  layThongKe,
  layDanhMuc,
  layDanhSachSanPham,
  layCanhBaoTonKho,
  layChiTietSanPham,
  taoSanPham,
  capNhatSanPham,
  capNhatTrangThai,
  xoaSanPham,
  themBienThe,
  capNhatBienThe,
};
