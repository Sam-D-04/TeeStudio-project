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
const TRANG_THAI_DON_GIU_HANG =
  "'PENDING','CONFIRMED','PROCESSING','PRINTING','READY_TO_SHIP'";
const TRANG_THAI_DON_CHAN_XOA_AN =
  "'PENDING','CONFIRMED','PROCESSING','PRINTING','READY_TO_SHIP','SHIPPING'";

const RESERVED_STOCK_JOIN = `
  LEFT JOIN (
    SELECT oi.variantId, SUM(oi.quantity) AS reservedQty
    FROM OrderItem oi
    INNER JOIN CustomerOrder co ON co.id = oi.orderId
    WHERE co.status IN (${TRANG_THAI_DON_GIU_HANG})
    GROUP BY oi.variantId
  ) reservedStock ON reservedStock.variantId = pv.id
`;

// stockQty đã được giảm khi tạo đơn; reservedQty chỉ dùng để tham khảo.
const AVAILABLE_STOCK_SQL = "pv.stockQty";
const DEFAULT_COLOR_HEX = "#94a3b8";

function chuanHoaMaMau(colorHex) {
  const value = String(colorHex || "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(value) ? value : DEFAULT_COLOR_HEX;
}

function chuanHoaMaMauNhap(colorHex) {
  const value = String(colorHex || "").trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(value)) {
    throw taoLoi("Mã màu phải có định dạng #RRGGBB");
  }
  return value;
}

function taoLoi(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function damBaoKhongSuaTonKhoTuModuleSanPham(payload) {
  if (Object.prototype.hasOwnProperty.call(payload, "stockQty")) {
    throw taoLoi(
      "Không thể cập nhật tồn kho từ module sản phẩm. Vui lòng thực hiện giao dịch kho."
    );
  }
}

async function kiemTraDieuKienAnSanPham(
  queryRunner,
  productId,
  { lockVariants = false } = {}
) {
  const [variantRows] = await queryRunner.query(
    `SELECT id, stockQty FROM ProductVariant WHERE productId = ?${
      lockVariants ? " FOR UPDATE" : ""
    }`,
    [productId]
  );

  const tongTonKho = variantRows.reduce(
    (sum, variant) => sum + Number(variant.stockQty || 0),
    0
  );

  const [activeOrderRows] = await queryRunner.query(
    `SELECT COUNT(DISTINCT oi.orderId) AS so_luong
     FROM OrderItem oi
     INNER JOIN CustomerOrder co ON co.id = oi.orderId
     INNER JOIN ProductVariant pv ON pv.id = oi.variantId
     WHERE pv.productId = ?
       AND co.status IN (${TRANG_THAI_DON_CHAN_XOA_AN})`,
    [productId]
  );

  if (Number(activeOrderRows[0]?.so_luong || 0) > 0) {
    throw taoLoi(
      "Không thể ẩn/xóa phôi áo vì đang có đơn hàng chờ xử lý",
      409
    );
  }

  if (tongTonKho > 0) {
    throw taoLoi(
      "Phôi áo vẫn còn hàng trong kho. Vui lòng xuất hết hàng trước khi ẩn",
      409
    );
  }

  return { variantRows, tongTonKho };
}

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
 * Tính trạng thái tồn kho từ số lượng khả dụng.
 */
function tinhTrangThaiTonKho(availableQty) {
  if (availableQty <= 0) return "het_hang";
  if (availableQty <= NGUONG_SAP_HET) return "sap_het";
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
    `SELECT COUNT(*) AS so_luong
     FROM ProductVariant pv
     ${RESERVED_STOCK_JOIN}
     WHERE ${AVAILABLE_STOCK_SQL} > 0
       AND ${AVAILABLE_STOCK_SQL} <= ?`,
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

async function layBangMau() {
  const [rows] = await db.pool.query(
    `SELECT
       color AS name,
       MAX(colorHex) AS hex
     FROM ProductVariant
     WHERE color IS NOT NULL AND TRIM(color) <> ''
     GROUP BY color
     ORDER BY color ASC`
  );

  return rows.map((row) => ({
    name: row.name,
    hex: chuanHoaMaMau(row.hex),
  }));
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
  const laLocBanChay = tonKho === "ban_chay";
  const bestSellerJoin = laLocBanChay
    ? `
      INNER JOIN (
        SELECT
          pvSales.productId,
          SUM(oiSales.lineTotal) AS salesRevenue
        FROM OrderItem oiSales
        INNER JOIN ProductVariant pvSales ON pvSales.id = oiSales.variantId
        INNER JOIN CustomerOrder coSales ON coSales.id = oiSales.orderId
        WHERE coSales.status IN ('COMPLETED', 'SHIPPING')
          AND DATE(coSales.updatedAt) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND DATE(coSales.updatedAt) <= LAST_DAY(CURDATE())
        GROUP BY pvSales.productId
        ORDER BY salesRevenue DESC
        LIMIT 3
      ) bestSeller ON bestSeller.productId = p.id
    `
    : "";

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

  if (tonKho && tonKho !== "tat_ca" && !laLocBanChay) {
    let dieuKienTonKho;
    if (tonKho === "het_hang") {
      dieuKienTonKho = `${AVAILABLE_STOCK_SQL} <= 0`;
    } else if (tonKho === "sap_het") {
      dieuKienTonKho =
        `${AVAILABLE_STOCK_SQL} > 0 AND ${AVAILABLE_STOCK_SQL} <= ?`;
    } else if (tonKho === "con_hang") {
      dieuKienTonKho = `${AVAILABLE_STOCK_SQL} > ?`;
    }

    if (dieuKienTonKho) {
      dieuKien.push(`
        EXISTS (
          SELECT 1
          FROM ProductVariant pv
          ${RESERVED_STOCK_JOIN}
          WHERE pv.productId = p.id
            AND ${dieuKienTonKho}
        )
      `);
      if (tonKho === "sap_het" || tonKho === "con_hang") {
        thamSo.push(NGUONG_SAP_HET);
      }
    }
  }

  const menh_de_where =
    dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";

  // Đếm tổng
  const sqlDem = `
    SELECT COUNT(DISTINCT p.id) AS tong_so
    FROM Product p
    LEFT JOIN Category c ON c.id = p.categoryId
    ${bestSellerJoin}
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
    ${bestSellerJoin}
    ${menh_de_where}
    ORDER BY ${laLocBanChay ? "bestSeller.salesRevenue DESC" : "p.id DESC"}
    LIMIT ? OFFSET ?
  `;
  const [rowsProduct] = await db.pool.query(sqlData, [...thamSo, soMoi, offset]);

  if (rowsProduct.length === 0) {
    return { danhSach: [], tongSo, trang: trangHienTai, soMoiTrang: soMoi, tongSoTrang: Math.ceil(tongSo / soMoi) };
  }

  // Lấy biến thể của các sản phẩm này
  const productIds = rowsProduct.map((p) => p.id);
  const [rowsVariants] = await db.pool.query(
    `SELECT
       pv.id,
       pv.productId,
       pv.color,
       pv.colorHex,
       pv.size,
       pv.sku,
       pv.stockQty,
       pv.status,
       COALESCE(reservedStock.reservedQty, 0) AS reservedQty
     FROM ProductVariant pv
     ${RESERVED_STOCK_JOIN}
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
  const danhSach = rowsProduct.map((p) => {
    const variants = variantMap[p.id] || [];

    const mappedVariants = variants.map((v) => {
      const stock = Number(v.stockQty);
      const reserved = Number(v.reservedQty);
      const available = stock;

      return {
        id: v.id,
        colorName: v.color,
        colorHex: chuanHoaMaMau(v.colorHex),
        size: v.size,
        sku: v.sku,
        stock,
        reserved,
        available,
        status: v.status || "ACTIVE",
        inventoryStatus: tinhTrangThaiTonKho(available),
      };
    });

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

  return {
    danhSach,
    tongSo,
    trang: trangHienTai,
    soMoiTrang: soMoi,
    tongSoTrang: Math.ceil(tongSo / soMoi),
  };
}

// =====================================================================
// SERVICE 4: Cảnh báo tồn kho (panel bên phải)
// =====================================================================
async function layCanhBaoTonKho() {
  const [rows] = await db.pool.query(
    `SELECT
       pv.id,
       pv.color,
       pv.colorHex,
       pv.size,
       pv.sku,
       pv.stockQty,
       COALESCE(reservedStock.reservedQty, 0) AS reservedQty,
       ${AVAILABLE_STOCK_SQL} AS availableQty,
       p.name AS tenSanPham
     FROM ProductVariant pv
     JOIN Product p ON p.id = pv.productId
     ${RESERVED_STOCK_JOIN}
     WHERE ${AVAILABLE_STOCK_SQL} <= ?
       AND p.status = 'ACTIVE'
       AND (pv.status IS NULL OR pv.status = 'ACTIVE')
     ORDER BY availableQty ASC, p.name ASC
     LIMIT 20`,
    [NGUONG_SAP_HET]
  );

  return rows.map((r) => {
    const stock = Number(r.stockQty);
    const reserved = Number(r.reservedQty);
    const available = stock;

    return {
      id: r.id,
      productName: r.tenSanPham,
      colorName: r.color,
      colorHex: chuanHoaMaMau(r.colorHex),
      size: r.size,
      sku: r.sku,
      stock,
      reserved,
      available,
      severity: tinhTrangThaiTonKho(available),
    };
  });
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
    `SELECT
       pv.id,
       pv.color,
       pv.colorHex,
       pv.size,
       pv.sku,
       pv.stockQty,
       pv.status,
       COALESCE(reservedStock.reservedQty, 0) AS reservedQty,
       EXISTS(SELECT 1 FROM InventoryTransaction it WHERE it.variantId = pv.id) as hasTransactions
     FROM ProductVariant pv
     ${RESERVED_STOCK_JOIN}
     WHERE pv.productId = ?
     ORDER BY pv.color, pv.size`,
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
    variants: variants.map((v) => {
      const stock = Number(v.stockQty);
      const reserved = Number(v.reservedQty);
      const available = stock;

      return {
        id: v.id,
        colorName: v.color,
        colorHex: chuanHoaMaMau(v.colorHex),
        size: v.size,
        sku: v.sku,
        stock,
        reserved,
        available,
        status: v.status || 'ACTIVE',
        hasTransactions: v.hasTransactions ? true : false,
        inventoryStatus: tinhTrangThaiTonKho(available),
      };
    }),
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
async function capNhatSanPham(id, { categoryId, name, basePrice, material, form, madeIn, description, displayStatus, variants }) {
  // Kiểm tra tồn tại
  const [rows] = await db.pool.query("SELECT id FROM Product WHERE id = ?", [id]);
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy phôi áo");
    err.statusCode = 404;
    throw err;
  }

  const fields = [];
  const params = [];
  const displayStatusDB =
    displayStatus !== undefined
      ? MAP_TRANG_THAI_FE_SANG_DB[displayStatus]
      : undefined;

  if (categoryId !== undefined) { fields.push("categoryId = ?"); params.push(categoryId); }
  if (name !== undefined) { fields.push("name = ?"); params.push(name); }
  if (basePrice !== undefined) { fields.push("basePrice = ?"); params.push(basePrice); }
  if (material !== undefined) { fields.push("material = ?"); params.push(material); }
  if (form !== undefined) { fields.push("form = ?"); params.push(form); }
  if (madeIn !== undefined) { fields.push("madeIn = ?"); params.push(madeIn); }
  if (description !== undefined) { fields.push("description = ?"); params.push(description); }

  if (fields.length > 0) {
    params.push(id);
    await db.execute(`UPDATE Product SET ${fields.join(", ")} WHERE id = ?`, params);
  }

  if (variants && Array.isArray(variants)) {
    for (const v of variants) {
      if (v.id) {
        await capNhatBienThe(id, v.id, v);
      } else {
        await themBienThe(id, v);
      }
    }
  }

  if (displayStatusDB) {
    if (displayStatusDB === "INACTIVE") {
      await kiemTraDieuKienAnSanPham(db.pool, id);
    }

    await db.execute("UPDATE Product SET status = ? WHERE id = ?", [
      displayStatusDB,
      id,
    ]);

    if (displayStatusDB === "INACTIVE") {
      await db.execute(
        "UPDATE ProductVariant SET status = 'INACTIVE' WHERE productId = ?",
        [id]
      );
    }
  }

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

  if (statusDB === "INACTIVE") {
    await db.transaction(async (connection) => {
      const [lockedRows] = await connection.query(
        "SELECT id FROM Product WHERE id = ? FOR UPDATE",
        [id]
      );
      if (!lockedRows || lockedRows.length === 0) {
        throw taoLoi("Không tìm thấy phôi áo", 404);
      }
      await kiemTraDieuKienAnSanPham(connection, id, { lockVariants: true });
      await connection.query("UPDATE Product SET status = ? WHERE id = ?", [
        statusDB,
        id,
      ]);
      await connection.query(
        "UPDATE ProductVariant SET status = 'INACTIVE' WHERE productId = ?",
        [id]
      );
    });
    return { id: Number(id), trangThai: trangThaiFE };
  }

  await db.execute("UPDATE Product SET status = ? WHERE id = ?", [statusDB, id]);
  return { id: Number(id), trangThai: trangThaiFE };
}

// =====================================================================
// SERVICE 9: Xóa phôi áo
// =====================================================================
async function xoaSanPham(id) {
  return db.transaction(async (connection) => {
    const [rows] = await connection.query(
      "SELECT id, name, status FROM Product WHERE id = ? FOR UPDATE",
      [id]
    );
    if (!rows || rows.length === 0) {
      throw taoLoi("Không tìm thấy phôi áo", 404);
    }

    const { variantRows } = await kiemTraDieuKienAnSanPham(connection, id, {
      lockVariants: true,
    });

    const [historyRows] = await connection.query(
      `SELECT
         (SELECT COUNT(*)
          FROM OrderItem oi
          INNER JOIN ProductVariant pv ON pv.id = oi.variantId
          WHERE pv.productId = ?) AS soDonHang,
         (SELECT COUNT(*)
          FROM InventoryTransaction it
          INNER JOIN ProductVariant pv ON pv.id = it.variantId
          WHERE pv.productId = ?) AS soGiaoDichKho,
         (SELECT COUNT(*)
          FROM CustomDesign cd
          WHERE cd.productId = ?
             OR EXISTS (
               SELECT 1
               FROM ProductVariant pv
               WHERE pv.id = cd.variantId
                 AND pv.productId = ?
             )) AS soThietKe`,
      [id, id, id, id]
    );

    const lichSu = historyRows[0] || {};
    const daPhatSinhDuLieu =
      Number(lichSu.soDonHang || 0) > 0 ||
      Number(lichSu.soGiaoDichKho || 0) > 0 ||
      Number(lichSu.soThietKe || 0) > 0;

    if (daPhatSinhDuLieu) {
      await connection.query("UPDATE Product SET status = 'INACTIVE' WHERE id = ?", [
        id,
      ]);
      await connection.query(
        "UPDATE ProductVariant SET status = 'INACTIVE' WHERE productId = ?",
        [id]
      );

      return {
        id: Number(id),
        action: "archived",
        affectedVariants: variantRows.length,
        message:
          "Đã ẩn phôi áo. Dữ liệu lịch sử vẫn được giữ để phục vụ báo cáo và kho.",
      };
    }

    await connection.query(
      `DELETE ci
       FROM CartItem ci
       INNER JOIN ProductVariant pv ON pv.id = ci.variantId
       WHERE pv.productId = ?`,
      [id]
    );
    await connection.query("DELETE FROM ProductImage WHERE productId = ?", [id]);
    await connection.query("DELETE FROM BulkPricing WHERE productId = ?", [id]);
    await connection.query("DELETE FROM ProductVariant WHERE productId = ?", [
      id,
    ]);
    await connection.query("DELETE FROM Product WHERE id = ?", [id]);

    return {
      id: Number(id),
      action: "deleted",
      affectedVariants: variantRows.length,
      message: "Đã xóa phôi áo sạch khỏi database.",
    };
  });
}

// =====================================================================
// SERVICE 10: Thêm biến thể
// =====================================================================
async function themBienThe(productId, payload = {}) {
  damBaoKhongSuaTonKhoTuModuleSanPham(payload);
  const { color, colorHex, size, sku } = payload;
  const normalizedColorHex = chuanHoaMaMauNhap(colorHex);

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
    "INSERT INTO ProductVariant (productId, color, colorHex, size, sku) VALUES (?, ?, ?, ?, ?)",
    [productId, color, normalizedColorHex, size, sku]
  );

  const stock = 0;

  return {
    id: result.insertId,
    colorName: color,
    colorHex: normalizedColorHex,
    size,
    sku,
    stock,
    reserved: 0,
    available: stock,
    inventoryStatus: tinhTrangThaiTonKho(stock),
  };
}

// =====================================================================
// SERVICE 11: Cập nhật biến thể
// =====================================================================
async function capNhatBienThe(productId, variantId, payload = {}) {
  damBaoKhongSuaTonKhoTuModuleSanPham(payload);
  const { color, colorHex, size, sku, status } = payload;

  const [rows] = await db.pool.query(
    `SELECT pv.id, pv.color, pv.colorHex, pv.size, pv.sku,
       EXISTS(SELECT 1 FROM InventoryTransaction it WHERE it.variantId = pv.id) as hasTransactions
     FROM ProductVariant pv WHERE pv.id = ? AND pv.productId = ?`,
    [variantId, productId]
  );
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy biến thể");
    err.statusCode = 404;
    throw err;
  }
  
  const currentVariant = rows[0];

  const fields = [];
  const params = [];

  // Khóa cập nhật Màu, Size, SKU nếu đã có giao dịch
  const isProtectedFieldChanged = (color !== undefined && color !== currentVariant.color) ||
                                  (colorHex !== undefined && chuanHoaMaMau(colorHex) !== chuanHoaMaMau(currentVariant.colorHex)) ||
                                  (size !== undefined && size !== currentVariant.size) || 
                                  (sku !== undefined && sku !== currentVariant.sku);
                                  
  if (currentVariant.hasTransactions && isProtectedFieldChanged) {
      const err = new Error("Không thể thay đổi Màu sắc, Kích thước hoặc SKU của biến thể đã có lịch sử nhập kho");
      err.statusCode = 403;
      throw err;
  }

  if (color !== undefined) { fields.push("color = ?"); params.push(color); }
  if (colorHex !== undefined) { fields.push("colorHex = ?"); params.push(chuanHoaMaMauNhap(colorHex)); }
  if (size !== undefined) { fields.push("size = ?"); params.push(size); }
  if (sku !== undefined) { fields.push("sku = ?"); params.push(sku); }
  if (status !== undefined) { fields.push("status = ?"); params.push(status); }

  if (fields.length === 0) {
    const err = new Error("Không có trường nào để cập nhật");
    err.statusCode = 400;
    throw err;
  }

  params.push(variantId);
  await db.execute(`UPDATE ProductVariant SET ${fields.join(", ")} WHERE id = ?`, params);

  const [updated] = await db.pool.query(
    `SELECT
       pv.id,
       pv.color,
       pv.colorHex,
       pv.size,
       pv.sku,
       pv.stockQty,
       pv.status,
       EXISTS(SELECT 1 FROM InventoryTransaction it WHERE it.variantId = pv.id) as hasTransactions,
       COALESCE(reservedStock.reservedQty, 0) AS reservedQty
     FROM ProductVariant pv
     ${RESERVED_STOCK_JOIN}
     WHERE pv.id = ?`,
    [variantId]
  );
  const v = updated[0];
  const stock = Number(v.stockQty);
  const reserved = Number(v.reservedQty);
  const available = stock;

  return {
    id: v.id,
    colorName: v.color,
    colorHex: chuanHoaMaMau(v.colorHex),
    size: v.size,
    sku: v.sku,
    stock,
    reserved,
    available,
    status: v.status || 'ACTIVE',
    hasTransactions: v.hasTransactions ? true : false,
    inventoryStatus: tinhTrangThaiTonKho(available),
  };
}
module.exports = {
  layThongKe,
  layDanhMuc,
  layBangMau,
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
