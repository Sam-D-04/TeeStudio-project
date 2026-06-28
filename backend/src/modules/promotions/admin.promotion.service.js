const db = require("../../database/mysql");

const DEFAULT_FORMULA = {
  defaultShippingFee: 30000,
  freeShippingThreshold: 500000,
  vatPercent: 0,
};

const ROUNDING_UNIT = 1000;

const taoLoi = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const chuanHoaNgay = (value, cuoiNgay = false) => {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw taoLoi("Ngày áp dụng không hợp lệ");
  }
  return `${value} ${cuoiNgay ? "23:59:59" : "00:00:00"}`;
};

const trangThaiSql = `
  CASE
    WHEN p.status = 'INACTIVE' THEN 'tam_dung'
    WHEN p.startDate > NOW() THEN 'sap_dien_ra'
    WHEN (p.endDate IS NOT NULL AND p.endDate < NOW())
      OR (p.usageLimit IS NOT NULL AND p.usedCount >= p.usageLimit)
      THEN 'het_han'
    ELSE 'dang_hoat_dong'
  END
`;

const chuanHoaPromotionInput = (data) => {
  const discountType = data.discountType;
  const discountValue =
    discountType === "FREE_SHIPPING" ? 0 : Number(data.discountValue);
  const startDate = chuanHoaNgay(data.startDate);
  const endDate = chuanHoaNgay(data.endDate, true);

  if (discountType === "PERCENT" && (discountValue <= 0 || discountValue > 100)) {
    throw taoLoi("Giảm theo phần trăm phải lớn hơn 0 và không vượt quá 100%");
  }
  if (discountType === "FIXED" && discountValue <= 0) {
    throw taoLoi("Số tiền giảm phải lớn hơn 0");
  }
  if (endDate && startDate > endDate) {
    throw taoLoi("Ngày kết thúc phải bằng hoặc sau ngày bắt đầu");
  }

  return {
    code: String(data.code).trim().toUpperCase(),
    discountType,
    discountValue,
    minOrderAmount: Number(data.minOrderAmount || 0),
    startDate,
    endDate,
    usageLimit:
      data.usageLimit === undefined || data.usageLimit === null || data.usageLimit === ""
        ? null
        : Number(data.usageLimit),
    isNewCustomerOnly: data.isNewCustomerOnly ? 1 : 0,
    status: data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
};

const mapPromotion = (row) => ({
  id: row.id,
  ma: row.code,
  loaiGiam:
    row.discountType === "PERCENT"
      ? "phan_tram"
      : row.discountType === "FIXED"
        ? "so_tien"
        : "mien_phi_van_chuyen",
  giaTriGiam: Number(row.discountValue),
  donToiThieu: Number(row.minOrderAmount),
  ngayBatDau: row.ngayBatDau,
  ngayKetThuc: row.ngayKetThuc || null,
  daSuDung: Number(row.usedCount),
  gioiHanLuot: row.usageLimit === null ? null : Number(row.usageLimit),
  chiDanhChoKhachMoi: Boolean(row.isNewCustomerOnly),
  trangThai: row.trangThai,
});

async function layThongKeKhuyenMai() {
  const [[activeRows], [expiringRows], [usageRows], [discountRows]] =
    await Promise.all([
      db.pool.query(
        `SELECT COUNT(*) AS tong
         FROM Promotion p
         WHERE p.status = 'ACTIVE'
           AND p.startDate <= NOW()
           AND (p.endDate IS NULL OR p.endDate >= NOW())
           AND (p.usageLimit IS NULL OR p.usedCount < p.usageLimit)`
      ),
      db.pool.query(
        `SELECT COUNT(*) AS tong
         FROM Promotion p
         WHERE p.status = 'ACTIVE'
           AND p.startDate <= NOW()
           AND p.endDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
           AND (p.usageLimit IS NULL OR p.usedCount < p.usageLimit)`
      ),
      db.pool.query(
        `SELECT COUNT(*) AS tong
         FROM PromotionUsage
         WHERE usedAt >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
           AND usedAt < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)`
      ),
      db.pool.query(
        `SELECT COALESCE(SUM(discountAmount), 0) AS tong
         FROM CustomerOrder
         WHERE promotionId IS NOT NULL
           AND createdAt >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
           AND createdAt < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)`
      ),
    ]);

  return {
    dangHoatDong: Number(activeRows[0].tong),
    sapHetHan: Number(expiringRows[0].tong),
    luotDungThangNay: Number(usageRows[0].tong),
    tongTienDaGiamThangNay: Number(discountRows[0].tong),
  };
}

async function layDanhSachKhuyenMai({
  trang,
  soMoiTrang,
  tuKhoa,
  trangThai,
  loaiGiam,
  tuNgay,
  denNgay,
  hetHanTrongNgay,
  kySuDung,
  kyGiamGia,
}) {
  const page = Math.max(1, Number(trang) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(soMoiTrang) || 10));
  const offset = (page - 1) * pageSize;
  const conditions = [];
  const params = [];

  if (tuKhoa && tuKhoa.trim()) {
    conditions.push("p.code LIKE ?");
    params.push(`%${tuKhoa.trim()}%`);
  }
  if (loaiGiam) {
    conditions.push("p.discountType = ?");
    params.push(loaiGiam);
  }
  if (trangThai) {
    conditions.push(`${trangThaiSql} = ?`);
    params.push(trangThai);
  }
  if (tuNgay) {
    conditions.push("(p.endDate IS NULL OR p.endDate >= ?)");
    params.push(chuanHoaNgay(tuNgay));
  }
  if (denNgay) {
    conditions.push("p.startDate <= ?");
    params.push(chuanHoaNgay(denNgay, true));
  }
  if (hetHanTrongNgay) {
    conditions.push(`p.status = 'ACTIVE'`);
    conditions.push("p.startDate <= NOW()");
    conditions.push(
      "p.endDate BETWEEN NOW() AND TIMESTAMPADD(DAY, ?, NOW())"
    );
    conditions.push("(p.usageLimit IS NULL OR p.usedCount < p.usageLimit)");
    params.push(Number(hetHanTrongNgay));
  }
  if (kySuDung === "THIS_MONTH") {
    conditions.push(
      `EXISTS (
         SELECT 1
         FROM PromotionUsage pu
         WHERE pu.promotionId = p.id
           AND pu.usedAt >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
           AND pu.usedAt < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
       )`
    );
  }
  if (kyGiamGia === "THIS_MONTH") {
    conditions.push(
      `EXISTS (
         SELECT 1
         FROM CustomerOrder co
         WHERE co.promotionId = p.id
           AND co.discountAmount > 0
           AND co.createdAt >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
           AND co.createdAt < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)
       )`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [countRows] = await db.pool.query(
    `SELECT COUNT(*) AS tong FROM Promotion p ${where}`,
    params
  );
  const [rows] = await db.pool.query(
    `SELECT p.id, p.code, p.discountType, p.discountValue, p.minOrderAmount,
            DATE_FORMAT(p.startDate, '%Y-%m-%d') AS ngayBatDau,
            DATE_FORMAT(p.endDate, '%Y-%m-%d') AS ngayKetThuc,
            p.usageLimit, p.usedCount, p.isNewCustomerOnly,
            ${trangThaiSql} AS trangThai
     FROM Promotion p
     ${where}
     ORDER BY p.createdAt DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const tongSo = Number(countRows[0].tong);
  return {
    danhSach: rows.map(mapPromotion),
    tongSo,
    trang: page,
    soMoiTrang: pageSize,
    tongSoTrang: Math.max(1, Math.ceil(tongSo / pageSize)),
  };
}

async function taoKhuyenMai(data) {
  const input = chuanHoaPromotionInput(data);
  try {
    const [result] = await db.pool.query(
      `INSERT INTO Promotion
         (code, discountType, discountValue, minOrderAmount, startDate, endDate,
          usageLimit, isNewCustomerOnly, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.code,
        input.discountType,
        input.discountValue,
        input.minOrderAmount,
        input.startDate,
        input.endDate,
        input.usageLimit,
        input.isNewCustomerOnly,
        input.status,
      ]
    );
    return { id: result.insertId };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw taoLoi("Mã khuyến mãi đã tồn tại");
    }
    throw error;
  }
}

async function capNhatKhuyenMai(id, data) {
  const input = chuanHoaPromotionInput(data);
  try {
    const [result] = await db.pool.query(
      `UPDATE Promotion
       SET code = ?, discountType = ?, discountValue = ?, minOrderAmount = ?,
           startDate = ?, endDate = ?, usageLimit = ?, isNewCustomerOnly = ?, status = ?
       WHERE id = ?`,
      [
        input.code,
        input.discountType,
        input.discountValue,
        input.minOrderAmount,
        input.startDate,
        input.endDate,
        input.usageLimit,
        input.isNewCustomerOnly,
        input.status,
        id,
      ]
    );
    if (!result.affectedRows) throw taoLoi("Không tìm thấy mã khuyến mãi", 404);
    return { id: Number(id) };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw taoLoi("Mã khuyến mãi đã tồn tại");
    }
    throw error;
  }
}

async function capNhatTrangThaiKhuyenMai(id, status) {
  const [result] = await db.pool.query(
    "UPDATE Promotion SET status = ? WHERE id = ?",
    [status, id]
  );
  if (!result.affectedRows) throw taoLoi("Không tìm thấy mã khuyến mãi", 404);
  return { id: Number(id), status };
}

async function xoaKhuyenMai(id) {
  const [rows] = await db.pool.query(
    `SELECT p.id, p.usedCount,
            EXISTS(SELECT 1 FROM CustomerOrder co WHERE co.promotionId = p.id) AS daGanDon,
            EXISTS(SELECT 1 FROM PromotionUsage pu WHERE pu.promotionId = p.id) AS daCoLuotDung
     FROM Promotion p WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) throw taoLoi("Không tìm thấy mã khuyến mãi", 404);
  if (
    Number(rows[0].usedCount) > 0 ||
    Boolean(rows[0].daGanDon) ||
    Boolean(rows[0].daCoLuotDung)
  ) {
    throw taoLoi("Không thể xóa mã đã được sử dụng. Hãy chuyển mã sang trạng thái tạm dừng");
  }
  await db.pool.query("DELETE FROM Promotion WHERE id = ?", [id]);
  return { id: Number(id) };
}

async function layDanhSachSanPhamGiaSoLuong() {
  const [rows] = await db.pool.query(
    `SELECT p.id, p.name, p.basePrice, p.status, COUNT(bp.id) AS soMucGia
     FROM Product p
     LEFT JOIN BulkPricing bp ON bp.productId = p.id
     GROUP BY p.id, p.name, p.basePrice, p.status
     ORDER BY p.status = 'ACTIVE' DESC, p.name ASC`
  );
  return rows.map((row) => ({
    id: row.id,
    ten: row.name,
    giaCoBan: Number(row.basePrice),
    dangHoatDong: row.status === "ACTIVE",
    soMucGia: Number(row.soMucGia),
  }));
}

async function layGiaSoLuong(productId) {
  const [products] = await db.pool.query(
    "SELECT id, name, basePrice FROM Product WHERE id = ? LIMIT 1",
    [productId]
  );
  if (!products.length) throw taoLoi("Không tìm thấy sản phẩm", 404);
  const [rows] = await db.pool.query(
    `SELECT id, productId, minQty, discountPercent
     FROM BulkPricing WHERE productId = ? ORDER BY minQty ASC`,
    [productId]
  );
  return {
    sanPham: {
      id: products[0].id,
      ten: products[0].name,
      giaCoBan: Number(products[0].basePrice),
    },
    danhSach: rows.map((row, index) => ({
      id: row.id,
      productId: row.productId,
      tuSoLuong: Number(row.minQty),
      denSoLuong: rows[index + 1] ? Number(rows[index + 1].minQty) - 1 : null,
      phanTramGiam: Number(row.discountPercent),
      donGiaSauGiam:
        Number(products[0].basePrice) * (1 - Number(row.discountPercent) / 100),
    })),
  };
}

async function kiemTraMucGiaSoLuong({ id = null, productId, minQty, discountPercent }) {
  const [products] = await db.pool.query(
    "SELECT id FROM Product WHERE id = ? LIMIT 1",
    [productId]
  );
  if (!products.length) throw taoLoi("Không tìm thấy sản phẩm", 404);

  const [rows] = await db.pool.query(
    `SELECT id, minQty, discountPercent
     FROM BulkPricing
     WHERE productId = ? ${id ? "AND id <> ?" : ""}
     ORDER BY minQty ASC`,
    id ? [productId, id] : [productId]
  );
  const all = [
    ...rows.map((row) => ({
      minQty: Number(row.minQty),
      discountPercent: Number(row.discountPercent),
    })),
    { minQty: Number(minQty), discountPercent: Number(discountPercent) },
  ].sort((a, b) => a.minQty - b.minQty);

  for (let index = 1; index < all.length; index += 1) {
    if (all[index - 1].minQty === all[index].minQty) {
      throw taoLoi("Số lượng tối thiểu đã tồn tại cho sản phẩm này");
    }
    if (all[index - 1].discountPercent > all[index].discountPercent) {
      throw taoLoi("Mức giảm phải tăng dần hoặc giữ nguyên khi số lượng tăng");
    }
  }
}

async function taoGiaSoLuong(data) {
  await kiemTraMucGiaSoLuong(data);
  try {
    const [result] = await db.pool.query(
      "INSERT INTO BulkPricing (productId, minQty, discountPercent) VALUES (?, ?, ?)",
      [data.productId, data.minQty, data.discountPercent]
    );
    return { id: result.insertId };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw taoLoi("Số lượng tối thiểu đã tồn tại cho sản phẩm này");
    }
    throw error;
  }
}

async function capNhatGiaSoLuong(id, data) {
  const [current] = await db.pool.query(
    "SELECT id FROM BulkPricing WHERE id = ? LIMIT 1",
    [id]
  );
  if (!current.length) throw taoLoi("Không tìm thấy mức giá số lượng", 404);
  await kiemTraMucGiaSoLuong({ id, ...data });
  await db.pool.query(
    "UPDATE BulkPricing SET productId = ?, minQty = ?, discountPercent = ? WHERE id = ?",
    [data.productId, data.minQty, data.discountPercent, id]
  );
  return { id: Number(id) };
}

async function xoaGiaSoLuong(id) {
  const [result] = await db.pool.query("DELETE FROM BulkPricing WHERE id = ?", [id]);
  if (!result.affectedRows) throw taoLoi("Không tìm thấy mức giá số lượng", 404);
  return { id: Number(id) };
}

async function layDanhSachPhuPhi() {
  const [[positions], [methods]] = await Promise.all([
    db.pool.query(
      `SELECT id, code, name, extraCost, isActive, maxWidth, maxHeight
       FROM PrintPosition ORDER BY name ASC`
    ),
    db.pool.query(
      `SELECT id, code, name, extraCost, isActive
       FROM PrintMethod ORDER BY name ASC`
    ),
  ]);
  const mapItem = (row, loai) => ({
    id: row.id,
    loai,
    ma: row.code,
    ten: row.name,
    moTa:
      loai === "VI_TRI_IN"
        ? row.maxWidth && row.maxHeight
          ? `Vùng in tối đa ${Number(row.maxWidth)} x ${Number(row.maxHeight)}`
          : "Phụ phí theo vị trí in"
        : "Phụ phí theo phương pháp in",
    giaTri: Number(row.extraCost),
    dangBat: Boolean(row.isActive),
  });
  return {
    viTriIn: positions.map((row) => mapItem(row, "VI_TRI_IN")),
    phuongPhapIn: methods.map((row) => mapItem(row, "PHUONG_PHAP_IN")),
  };
}

async function capNhatPhuPhi(id, { loai, extraCost, isActive }) {
  const table = loai === "VI_TRI_IN" ? "PrintPosition" : "PrintMethod";
  const [result] = await db.pool.query(
    `UPDATE ${table} SET extraCost = ?, isActive = ? WHERE id = ?`,
    [extraCost, isActive ? 1 : 0, id]
  );
  if (!result.affectedRows) throw taoLoi("Không tìm thấy phụ phí", 404);
  return { id: Number(id), loai };
}

const mapFormula = (row) => ({
  defaultShippingFee: Number(row.defaultShippingFee),
  freeShippingThreshold: Number(row.freeShippingThreshold),
  vatPercent: Number(row.vatPercent),
});

const taoXemTruocCongThuc = (formula) => {
  const giaPhoiMau = 80000;
  const phuPhiInMau = 30000;
  const tamTinh = giaPhoiMau + phuPhiInMau;
  const thueVat = Math.round(tamTinh * (formula.vatPercent / 100));
  const phiVanChuyen =
    formula.freeShippingThreshold > 0 && tamTinh >= formula.freeShippingThreshold
      ? 0
      : formula.defaultShippingFee;
  const truocLamTron = tamTinh + thueVat + phiVanChuyen;
  const tongCong = Math.round(truocLamTron / ROUNDING_UNIT) * ROUNDING_UNIT;
  return { giaPhoiMau, phuPhiInMau, tamTinh, thueVat, phiVanChuyen, truocLamTron, tongCong };
};

async function layCongThucBaoGia() {
  const [rows] = await db.pool.query(
    `SELECT defaultShippingFee, freeShippingThreshold, vatPercent
     FROM PricingConfiguration WHERE id = 1 LIMIT 1`
  );
  const formula = rows.length ? mapFormula(rows[0]) : DEFAULT_FORMULA;
  return { cauHinh: formula, xemTruoc: taoXemTruocCongThuc(formula) };
}

async function capNhatCongThucBaoGia(data) {
  const formula = {
    defaultShippingFee: Number(data.defaultShippingFee),
    freeShippingThreshold: Number(data.freeShippingThreshold),
    vatPercent: Number(data.vatPercent),
  };
  await db.pool.query(
    `INSERT INTO PricingConfiguration
       (id, defaultShippingFee, freeShippingThreshold, vatPercent)
     VALUES (1, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       defaultShippingFee = VALUES(defaultShippingFee),
       freeShippingThreshold = VALUES(freeShippingThreshold),
       vatPercent = VALUES(vatPercent)`,
    [
      formula.defaultShippingFee,
      formula.freeShippingThreshold,
      formula.vatPercent,
    ]
  );
  return { cauHinh: formula, xemTruoc: taoXemTruocCongThuc(formula) };
}

module.exports = {
  layThongKeKhuyenMai,
  layDanhSachKhuyenMai,
  taoKhuyenMai,
  capNhatKhuyenMai,
  capNhatTrangThaiKhuyenMai,
  xoaKhuyenMai,
  layDanhSachSanPhamGiaSoLuong,
  layGiaSoLuong,
  taoGiaSoLuong,
  capNhatGiaSoLuong,
  xoaGiaSoLuong,
  layDanhSachPhuPhi,
  capNhatPhuPhi,
  layCongThucBaoGia,
  capNhatCongThucBaoGia,
};
