/**
 * inventory.service.js – Xử lý nghiệp vụ Kho hàng.
 *
 * Chịu trách nhiệm:
 * - Lấy danh sách tồn kho (biến thể × ProductVariant) với phân trang + lọc.
 * - Tính toán thống kê KPI (tổng phôi, sắp hết, đã giữ, nhập tháng).
 * - Lấy lịch sử biến động (InventoryTransaction) theo biến thể.
 * - Lấy lịch sử toàn kho (InventoryTransaction toàn bộ) với phân trang + lọc.
 * - Lấy đơn hàng đang chờ xuất phôi theo biến thể.
 * - Ghi nhận giao dịch nhập/xuất/điều chỉnh kho.
 * - Lấy danh sách sản phẩm kèm biến thể phục vụ trang nhập kho.
 * - Lấy danh sách nhà cung cấp phục vụ trang nhập kho.
 */

const db = require("../../database/mysql");

// ────────────────────────────────────────────────────────────────────────────
// NGƯỠNG CẢNH BÁO TỒN KHO
// ────────────────────────────────────────────────────────────────────────────

/** Số lượng ≤ ngưỡng này → trạng thái "sap_het" */
const NGUONG_SAP_HET = 20;
const NGUONG_TON_THAP_DASHBOARD = 15;

const RESERVED_STOCK_JOIN = `
  LEFT JOIN (
    SELECT oi.variantId, SUM(oi.quantity) AS daGiu
    FROM OrderItem oi
    INNER JOIN CustomerOrder co ON co.id = oi.orderId
    WHERE co.status IN ('PENDING','CONFIRMED','PRINTING','PRINTED','PACKING')
    GROUP BY oi.variantId
  ) reservedStock ON reservedStock.variantId = pv.id
`;

const AVAILABLE_STOCK_SQL = `(pv.stockQty - COALESCE(reservedStock.daGiu, 0))`;

/**
 * Tính trạng thái tồn kho từ số lượng khả dụng.
 * @param {number} availableQty
 * @returns {"con_hang"|"sap_het"|"het_hang"}
 */
function tinhTrangThaiTonKho(availableQty) {
  if (availableQty <= 0) return "het_hang";
  if (availableQty <= NGUONG_SAP_HET) return "sap_het";
  return "con_hang";
}

function laNgayHopLe(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// ────────────────────────────────────────────────────────────────────────────
// THỐNG KÊ KPI
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy 4 thẻ thống kê KPI đầu trang kho hàng.
 * - Tổng phôi còn tồn (SUM stockQty)
 * - Biến thể sắp hết (available > 0 AND <= NGUONG_SAP_HET)
 * - Cần xuất cho đơn in (tổng số áo đang bị giữ = quantityChanged âm chưa hoàn)
 * - Nhập kho trong tháng này (SUM quantityChanged > 0 trong tháng)
 */
async function layThongKeKho() {
  // Tổng phôi còn tồn
  const tongPhoi = await db.query(
    `SELECT COALESCE(SUM(stockQty), 0) AS tongPhoi FROM ProductVariant`
  );

  // Biến thể sắp hết
  const sapHet = await db.query(
    `SELECT COUNT(*) AS sapHet
     FROM ProductVariant pv
     ${RESERVED_STOCK_JOIN}
     WHERE ${AVAILABLE_STOCK_SQL} > 0
       AND ${AVAILABLE_STOCK_SQL} <= ?`,
    [NGUONG_SAP_HET]
  );

  // Số áo đang bị giữ = SUM của các giao dịch ORDER_EXPORT âm chưa RETURN
  // Đơn giản hóa: tổng số lượng đặt hàng đang chờ xử lý
  const daGiu = await db.query(
    `SELECT COALESCE(SUM(oi.quantity), 0) AS daGiu
     FROM OrderItem oi
     INNER JOIN CustomerOrder co ON co.id = oi.orderId
     WHERE co.status IN ('PENDING','CONFIRMED','PRINTING','PRINTED','PACKING')`
  );

  // Nhập kho trong tháng hiện tại
  const nhapThang = await db.query(
    `SELECT COALESCE(SUM(quantityChanged), 0) AS nhapThang
     FROM InventoryTransaction
     WHERE transactionType IN ('IMPORT')
       AND MONTH(createdAt) = MONTH(CURDATE())
       AND YEAR(createdAt) = YEAR(CURDATE())`
  );

  return {
    tongPhoi: Number(tongPhoi[0]?.tongPhoi ?? 0),
    sapHet: Number(sapHet[0]?.sapHet ?? 0),
    daGiu: Number(daGiu[0]?.daGiu ?? 0),
    nhapThang: Number(nhapThang[0]?.nhapThang ?? 0),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// DANH SÁCH TỒN KHO (có phân trang + lọc + tìm kiếm)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách biến thể tồn kho có phân trang + lọc.
 *
 * @param {object} params
 * @param {number}  [params.trang=1]        - Trang hiện tại
 * @param {number}  [params.soMoiTrang=10]  - Số dòng mỗi trang
 * @param {string}  [params.tuKhoa]         - Tìm theo SKU | tên | màu
 * @param {string}  [params.boLoc]          - "tat_ca" | "ton_thap" | "sap_het" | "het_hang" | "con_hang" | tên sản phẩm
 * @param {string}  [params.tuNgay]          - Chỉ lấy SKU có biến động kho từ ngày này
 * @param {string}  [params.denNgay]         - Chỉ lấy SKU có biến động kho đến ngày này
 * @returns {Promise<{danhSach: object[], tongSo: number, trang: number, soMoiTrang: number, tongSoTrang: number}>}
 */
async function layDanhSachTonKho(params = {}) {
  const trang = Math.max(1, parseInt(params.trang) || 1);
  const soMoiTrang = Math.min(100, Math.max(1, parseInt(params.soMoiTrang) || 10));
  const offset = (trang - 1) * soMoiTrang;
  const tuKhoa = params.tuKhoa ? params.tuKhoa.trim() : "";
  const boLoc = params.boLoc || "tat_ca";
  const tuNgay = laNgayHopLe(params.tuNgay) ? params.tuNgay : "";
  const denNgay = laNgayHopLe(params.denNgay) ? params.denNgay : "";

  const conditions = [];
  const values = [];

  // Lọc theo từ khóa tìm kiếm
  if (tuKhoa) {
    conditions.push(`(pv.sku LIKE ? OR p.name LIKE ? OR pv.color LIKE ?)`);
    const like = `%${tuKhoa}%`;
    values.push(like, like, like);
  }

  // Lọc theo trạng thái tồn kho
  if (boLoc === "ton_thap") {
    conditions.push(
      `${AVAILABLE_STOCK_SQL} <= ${NGUONG_TON_THAP_DASHBOARD}`
    );
  } else if (boLoc === "sap_het") {
    conditions.push(
      `${AVAILABLE_STOCK_SQL} > 0 AND ${AVAILABLE_STOCK_SQL} <= ${NGUONG_SAP_HET}`
    );
  } else if (boLoc === "het_hang") {
    conditions.push(`${AVAILABLE_STOCK_SQL} <= 0`);
  } else if (boLoc === "con_hang") {
    conditions.push(`${AVAILABLE_STOCK_SQL} > ${NGUONG_SAP_HET}`);
  } else if (boLoc !== "tat_ca") {
    // Lọc theo tên sản phẩm (partial match)
    conditions.push(`p.name LIKE ?`);
    values.push(`%${boLoc}%`);
  }

  if (tuNgay || denNgay) {
    const transactionConditions = ["it.variantId = pv.id"];
    if (tuNgay) {
      transactionConditions.push("DATE(it.createdAt) >= ?");
      values.push(tuNgay);
    }
    if (denNgay) {
      transactionConditions.push("DATE(it.createdAt) <= ?");
      values.push(denNgay);
    }
    conditions.push(
      `EXISTS (
        SELECT 1
        FROM InventoryTransaction it
        WHERE ${transactionConditions.join(" AND ")}
      )`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Đếm tổng bản ghi
  const [countRows] = await db.pool.query(
    `SELECT COUNT(*) AS total
     FROM ProductVariant pv
     INNER JOIN Product p ON p.id = pv.productId
     ${RESERVED_STOCK_JOIN}
     ${whereClause}`,
    values
  );
  const tongSo = Number(countRows[0]?.total ?? 0);

  // Lấy dữ liệu trang hiện tại
  const rows = await db.query(
    `SELECT
       pv.id,
       p.name AS ten,
       pv.color AS mau,
       pv.size,
       pv.sku,
       pv.stockQty AS tonHienTai,
       COALESCE(reservedStock.daGiu, 0) AS daGiu
     FROM ProductVariant pv
     INNER JOIN Product p ON p.id = pv.productId
     ${RESERVED_STOCK_JOIN}
     ${whereClause}
     ORDER BY p.name ASC, pv.color ASC, FIELD(pv.size,'XS','S','M','L','XL','XXL','2XL','3XL')
     LIMIT ? OFFSET ?`,
    [...values, soMoiTrang, offset]
  );

  const danhSach = rows.map((row) => {
    const daGiu = Number(row.daGiu);
    const tonHienTai = Number(row.tonHienTai);
    const khaDung = tonHienTai - daGiu;
    return {
      id: row.id,
      ten: row.ten,
      mau: row.mau,
      size: row.size,
      sku: row.sku,
      tonHienTai,
      daGiu,
      khaDung,
      trangThai: tinhTrangThaiTonKho(khaDung),
    };
  });

  return {
    danhSach,
    tongSo,
    trang,
    soMoiTrang,
    tongSoTrang: Math.max(1, Math.ceil(tongSo / soMoiTrang)),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// CHI TIẾT BIẾN THỂ
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy chi tiết tồn kho của một biến thể theo ID.
 * @param {number} variantId
 */
async function layChiTietBienThe(variantId) {
  const rows = await db.query(
    `SELECT
       pv.id,
       p.name AS ten,
       pv.color AS mau,
       pv.size,
       pv.sku,
       pv.stockQty AS tonHienTai,
       COALESCE(reservedStock.daGiu, 0) AS daGiu
     FROM ProductVariant pv
     INNER JOIN Product p ON p.id = pv.productId
     ${RESERVED_STOCK_JOIN}
     WHERE pv.id = ?`,
    [variantId]
  );

  if (!rows.length) {
    const error = new Error("Không tìm thấy biến thể");
    error.statusCode = 404;
    throw error;
  }

  const row = rows[0];
  const daGiu = Number(row.daGiu);
  const tonHienTai = Number(row.tonHienTai);
  const khaDung = tonHienTai - daGiu;

  return {
    id: row.id,
    ten: row.ten,
    mau: row.mau,
    size: row.size,
    sku: row.sku,
    tonHienTai,
    daGiu,
    khaDung,
    trangThai: tinhTrangThaiTonKho(khaDung),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// ĐƠN HÀNG ĐANG CHỜ XUẤT PHÔI (theo biến thể)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách đơn hàng đang chờ xuất phôi cho một biến thể.
 * @param {number} variantId
 */
async function layDonChoXuat(variantId) {
  const rows = await db.query(
    `SELECT
       co.orderCode AS id,
       oi.quantity AS soLuong
     FROM OrderItem oi
     INNER JOIN CustomerOrder co ON co.id = oi.orderId
     WHERE oi.variantId = ?
       AND co.status IN ('PENDING','CONFIRMED','PRINTING','PRINTED','PACKING')
     ORDER BY co.createdAt ASC
     LIMIT 20`,
    [variantId]
  );

  return rows.map((row) => ({
    id: row.id,
    soLuong: Number(row.soLuong),
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// LỊCH SỬ BIẾN ĐỘNG TỒN KHO (theo biến thể)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy 10 giao dịch kho gần nhất của một biến thể.
 * @param {number} variantId
 */
async function layLichSuBienDong(variantId) {
  const rows = await db.query(
    `SELECT
       it.id,
       it.quantityChanged,
       it.transactionType,
       it.reason,
       it.createdAt,
       co.orderCode
     FROM InventoryTransaction it
     LEFT JOIN CustomerOrder co ON co.id = it.orderId
     WHERE it.variantId = ?
     ORDER BY it.createdAt DESC
     LIMIT 10`,
    [variantId]
  );

  return rows.map((row) => {
    // Xác định loại biến động để hiển thị màu dot
    let loai = "xuat";
    if (row.quantityChanged > 0) loai = "nhap";
    else if (row.transactionType === "ORDER_EXPORT") loai = "giu";

    // Tạo mô tả dạng thân thiện tiếng Việt
    const soLuong = Math.abs(row.quantityChanged);
    let moTa = row.reason || "";
    if (row.transactionType === "IMPORT") {
      moTa = `+${soLuong} áo – ${row.reason}`;
    } else if (row.transactionType === "ORDER_EXPORT") {
      moTa = `-${soLuong} áo (Xuất cho đơn ${row.orderCode || ""})`;
    } else if (row.transactionType === "EXPORT") {
      moTa = `-${soLuong} áo – ${row.reason}`;
    } else if (row.transactionType === "RETURN") {
      moTa = `+${soLuong} áo (Hoàn trả) – ${row.reason}`;
    } else if (row.transactionType === "ADJUSTMENT") {
      const sign = row.quantityChanged >= 0 ? `+${soLuong}` : `-${soLuong}`;
      moTa = `${sign} áo (Điều chỉnh) – ${row.reason}`;
    }

    // Format thời gian sang tiếng Việt
    const d = new Date(row.createdAt);
    const now = new Date();
    const hom_nay = d.toDateString() === now.toDateString();
    const hom_qua = new Date(now - 86400000).toDateString() === d.toDateString();
    const gio = d.getHours().toString().padStart(2, "0");
    const phut = d.getMinutes().toString().padStart(2, "0");
    const buoiChieu = d.getHours() >= 12 ? "CH" : "SA";
    let thoiGian;
    if (hom_nay) {
      thoiGian = `Hôm nay, ${gio}:${phut} ${buoiChieu}`;
    } else if (hom_qua) {
      thoiGian = `Hôm qua, ${gio}:${phut} ${buoiChieu}`;
    } else {
      thoiGian = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}, ${gio}:${phut} ${buoiChieu}`;
    }

    return {
      id: row.id,
      moTa,
      thoiGian,
      loai,
    };
  });
}

// ────────────────────────────────────────────────────────────────────────────
// GHI GIAO DỊCH KHO (Nhập / Xuất / Điều chỉnh)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Ghi nhận một giao dịch kho và cập nhật stockQty của ProductVariant.
 *
 * @param {object} payload
 * @param {number}  payload.variantId       - ID biến thể
 * @param {number}  [payload.orderId]       - ID đơn hàng (nếu là ORDER_EXPORT)
 * @param {number}  [payload.supplierId]    - ID nhà cung cấp (nếu là IMPORT)
 * @param {number}  payload.quantityChanged - Dương = nhập, Âm = xuất
 * @param {string}  payload.transactionType - IMPORT | EXPORT | ADJUSTMENT | ORDER_EXPORT | RETURN
 * @param {string}  payload.reason          - Lý do / ghi chú
 */
async function ghiGiaoDichKho(payload) {
  const {
    variantId,
    orderId = null,
    supplierId = null,
    quantityChanged,
    transactionType,
    reason,
  } = payload;

  // Kiểm tra biến thể tồn tại
  const [variants] = await db.pool.query(
    `SELECT id, stockQty FROM ProductVariant WHERE id = ? FOR UPDATE`,
    [variantId]
  );

  if (!variants.length) {
    const error = new Error("Không tìm thấy biến thể phôi áo");
    error.statusCode = 404;
    throw error;
  }

  const variant = variants[0];
  const soLuongMoi = Number(variant.stockQty) + Number(quantityChanged);

  // Không cho phép xuất kho làm tồn kho về âm
  if (soLuongMoi < 0) {
    const error = new Error(
      `Tồn kho không đủ. Hiện có ${variant.stockQty} áo, yêu cầu xuất ${Math.abs(quantityChanged)} áo.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Thực hiện trong transaction để đảm bảo toàn vẹn dữ liệu
  const result = await db.transaction(async (connection) => {
    // Ghi giao dịch
    const [insertResult] = await connection.query(
      `INSERT INTO InventoryTransaction (variantId, orderId, supplierId, quantityChanged, transactionType, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [variantId, orderId, supplierId, quantityChanged, transactionType, reason]
    );

    // Cập nhật tồn kho
    await connection.query(
      `UPDATE ProductVariant SET stockQty = ? WHERE id = ?`,
      [soLuongMoi, variantId]
    );

    return {
      transactionId: insertResult.insertId,
      variantId,
      soLuongTruoc: Number(variant.stockQty),
      soLuongSau: soLuongMoi,
      quantityChanged: Number(quantityChanged),
      transactionType,
    };
  });

  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// DANH SÁCH SẢN PHẨM KÈM BIẾN THỂ (phục vụ trang nhập kho)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách sản phẩm đang ACTIVE cùng toàn bộ biến thể.
 * Dùng trên trang Nhập kho để admin chọn sản phẩm → màu → size → nhập số lượng.
 *
 * @returns {Promise<Array<{id, ten, danhSachBienThe: Array<{id, mau, size, sku, tonHienTai}>}>>}
 */
async function layDanhSachSanPhamVaBienThe() {
  // Lấy toàn bộ sản phẩm ACTIVE
  const sanPhams = await db.query(
    `SELECT id, name AS ten FROM Product WHERE status = 'ACTIVE' ORDER BY name ASC`
  );

  if (!sanPhams.length) return [];

  // Lấy toàn bộ biến thể của các sản phẩm đó
  const productIds = sanPhams.map((p) => p.id);
  const placeholders = productIds.map(() => "?").join(",");
  const bienThes = await db.query(
    `SELECT id, productId, color AS mau, size, sku, stockQty AS tonHienTai
     FROM ProductVariant
     WHERE productId IN (${placeholders})
     ORDER BY productId ASC, color ASC, FIELD(size,'XS','S','M','L','XL','XXL','2XL','3XL')`,
    productIds
  );

  // Gom biến thể vào từng sản phẩm
  const bienTheMap = {};
  for (const bt of bienThes) {
    if (!bienTheMap[bt.productId]) bienTheMap[bt.productId] = [];
    bienTheMap[bt.productId].push({
      id: bt.id,
      mau: bt.mau,
      size: bt.size,
      sku: bt.sku,
      tonHienTai: Number(bt.tonHienTai),
    });
  }

  return sanPhams.map((sp) => ({
    id: sp.id,
    ten: sp.ten,
    danhSachBienThe: bienTheMap[sp.id] || [],
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// DANH SÁCH NHÀ CUNG CẤP (phục vụ trang nhập kho)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách tất cả nhà cung cấp.
 * Dùng trên trang Nhập kho để admin chọn nhà cung cấp.
 *
 * @returns {Promise<Array<{id, ten, soDienThoai}>>}
 */
async function layDanhSachNhaCungCap() {
  const rows = await db.query(
    `SELECT id, name AS ten, phone AS soDienThoai FROM Supplier ORDER BY name ASC`
  );
  return rows.map((row) => ({
    id: row.id,
    ten: row.ten,
    soDienThoai: row.soDienThoai || "",
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// LỊCH SỬ TOÀN KHO (có phân trang + lọc loại GD + tìm kiếm SKU)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lấy lịch sử giao dịch kho TOÀN BỘ (không lọc theo biến thể cụ thể).
 * Hỗ trợ:
 *  - Phân trang (trang, soMoiTrang)
 *  - Lọc theo loại giao dịch (loaiGiaoDich)
 *  - Tìm kiếm theo SKU hoặc tên sản phẩm (tuKhoa)
 *
 * @param {object} params
 * @param {number}  [params.trang=1]
 * @param {number}  [params.soMoiTrang=20]
 * @param {string}  [params.loaiGiaoDich]  – "IMPORT" | "EXPORT" | "ADJUSTMENT" | "ORDER_EXPORT" | "RETURN" | "tat_ca"
 * @param {string}  [params.tuKhoa]        – Tìm theo SKU hoặc tên sản phẩm
 * @returns {Promise<{danhSach: object[], tongSo: number, trang: number, soMoiTrang: number, tongSoTrang: number}>}
 */
async function layLichSuKho(params = {}) {
  const trang = Math.max(1, parseInt(params.trang) || 1);
  const soMoiTrang = Math.min(50, Math.max(1, parseInt(params.soMoiTrang) || 20));
  const offset = (trang - 1) * soMoiTrang;
  const loaiGiaoDich = params.loaiGiaoDich || "tat_ca";
  const tuKhoa = params.tuKhoa ? params.tuKhoa.trim() : "";

  const conditions = [];
  const values = [];

  // Lọc theo loại giao dịch
  if (loaiGiaoDich && loaiGiaoDich !== "tat_ca") {
    conditions.push(`it.transactionType = ?`);
    values.push(loaiGiaoDich);
  }

  // Tìm kiếm theo SKU hoặc tên sản phẩm
  if (tuKhoa) {
    conditions.push(`(pv.sku LIKE ? OR p.name LIKE ?)`);
    const like = `%${tuKhoa}%`;
    values.push(like, like);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Đếm tổng
  const [countRows] = await db.pool.query(
    `SELECT COUNT(*) AS total
     FROM InventoryTransaction it
     INNER JOIN ProductVariant pv ON pv.id = it.variantId
     INNER JOIN Product p ON p.id = pv.productId
     ${whereClause}`,
    values
  );
  const tongSo = Number(countRows[0]?.total ?? 0);

  // Lấy dữ liệu
  const rows = await db.query(
    `SELECT
       it.id,
       it.quantityChanged,
       it.transactionType,
       it.reason,
       it.createdAt,
       pv.sku,
       pv.color  AS mau,
       pv.size,
       p.name    AS tenSanPham,
       co.orderCode,
       s.name    AS tenNhaCungCap
     FROM InventoryTransaction it
     INNER JOIN ProductVariant pv ON pv.id = it.variantId
     INNER JOIN Product p ON p.id = pv.productId
     LEFT JOIN CustomerOrder co ON co.id = it.orderId
     LEFT JOIN Supplier s ON s.id = it.supplierId
     ${whereClause}
     ORDER BY it.createdAt DESC
     LIMIT ? OFFSET ?`,
    [...values, soMoiTrang, offset]
  );

  const danhSach = rows.map((row) => {
    const soLuong = Math.abs(row.quantityChanged);
    const isNhap = row.quantityChanged > 0;

    // Nhãn loại giao dịch (tiếng Việt)
    const NHAN_LOAI = {
      IMPORT:       "Nhập kho",
      EXPORT:       "Xuất kho",
      ADJUSTMENT:   "Điều chỉnh",
      ORDER_EXPORT: "Xuất cho đơn",
      RETURN:       "Hoàn trả",
    };
    const nhanLoai = NHAN_LOAI[row.transactionType] || row.transactionType;

    // Mô tả chi tiết
    let moTa = row.reason || "";
    if (row.transactionType === "IMPORT") {
      moTa = `Nhập ${soLuong} áo${row.tenNhaCungCap ? ` từ ${row.tenNhaCungCap}` : ""}`;
      if (row.reason) moTa += ` – ${row.reason}`;
    } else if (row.transactionType === "ORDER_EXPORT") {
      moTa = `Xuất ${soLuong} áo cho đơn ${row.orderCode || "?"}` ;
    } else if (row.transactionType === "EXPORT") {
      moTa = `Xuất ${soLuong} áo – ${row.reason}`;
    } else if (row.transactionType === "RETURN") {
      moTa = `Hoàn trả ${soLuong} áo – ${row.reason}`;
    } else if (row.transactionType === "ADJUSTMENT") {
      const sign = isNhap ? `+${soLuong}` : `-${soLuong}`;
      moTa = `Điều chỉnh ${sign} áo – ${row.reason}`;
    }

    // Format ngày giờ
    const d = new Date(row.createdAt);
    const ngay = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    const gio  = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

    return {
      id: row.id,
      loaiGiaoDich: row.transactionType,
      nhanLoai,
      soLuong: row.quantityChanged,          // Giá trị có dấu (+/-)
      sku: row.sku,
      tenSanPham: row.tenSanPham,
      mau: row.mau,
      size: row.size,
      moTa,
      tenNhaCungCap: row.tenNhaCungCap || null,
      maDonHang: row.orderCode || null,
      ngay,
      gio,
      thoiGianISO: row.createdAt,
    };
  });

  return {
    danhSach,
    tongSo,
    trang,
    soMoiTrang,
    tongSoTrang: Math.max(1, Math.ceil(tongSo / soMoiTrang)),
  };
}

module.exports = {
  layThongKeKho,
  layDanhSachTonKho,
  layChiTietBienThe,
  layDonChoXuat,
  layLichSuBienDong,
  layLichSuKho,
  ghiGiaoDichKho,
  layDanhSachSanPhamVaBienThe,
  layDanhSachNhaCungCap,
};
