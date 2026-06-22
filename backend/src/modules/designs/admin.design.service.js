/**
 * design.service.js – Xử lý logic nghiệp vụ module Thiết kế & In ấn (phía Admin).
 *
 * Các bảng DB sử dụng:
 *  - CustomDesign      → danh sách thiết kế khách hàng
 *  - OrderProduction   → đơn cần in (sau khi thiết kế được duyệt)
 *  - Sticker           → sticker có sẵn trong Design Studio
 *  - PrintPosition     → vị trí in được cấu hình
 *  - Account           → thông tin khách hàng
 *  - Product           → tên sản phẩm
 *  - CustomerOrder     → mã đơn hàng
 */

const db = require("../../database/mysql");

// =====================================================================
// MAP TRẠNG THÁI: DB → Frontend (snake_case tiếng Việt)
// =====================================================================

/** CustomDesign.status → FE trangThai */
const MAP_TRANG_THAI_THIET_KE_DB_FE = {
  PENDING_REVIEW: "cho_kiem_tra",
  NEEDS_REVISION: "can_chinh_sua",
  APPROVED: "da_duyet",
  DRAFT: "cho_kiem_tra", // DRAFT cũng coi là chờ kiểm tra
};

/** FE trangThai → DB status (dùng khi nhận request cập nhật) */
const MAP_TRANG_THAI_THIET_KE_FE_DB = {
  cho_kiem_tra: "PENDING_REVIEW",
  can_chinh_sua: "NEEDS_REVISION",
  da_duyet: "APPROVED",
};

/** OrderProduction.status → FE (đơn cần in) */
const MAP_TRANG_THAI_DON_IN_DB_FE = {
  WAITING_DESIGN_APPROVAL: "cho_gui_xuong",
  APPROVED: "cho_gui_xuong",
  PRINTING: "dang_in",
  PACKED: "da_in_xong",
};

/** FE → DB (đơn cần in) */
const MAP_TRANG_THAI_DON_IN_FE_DB = {
  cho_gui_xuong: "APPROVED",
  dang_in: "PRINTING",
  da_in_xong: "PACKED",
};

// =====================================================================
// Hàm tiện ích
// =====================================================================

/**
 * Format ngày thành chuỗi DD/MM/YYYY
 */
function formatNgay(date) {
  if (!date) return null;
  const d = new Date(date);
  const ngay = String(d.getDate()).padStart(2, "0");
  const thang = String(d.getMonth() + 1).padStart(2, "0");
  const nam = d.getFullYear();
  return `${ngay}/${thang}/${nam}`;
}

/**
 * Sinh lỗi có statusCode
 */
function taoLoi(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// =====================================================================
// SERVICE 1: Lấy thống kê KPI (4 thẻ đầu trang)
// GET /api/admin/designs/stats
// =====================================================================
async function layThongKe() {
  // Đếm thiết kế chờ kiểm tra
  const [rowsChoKiemTra] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong
     FROM CustomDesign
     WHERE status IN ('PENDING_REVIEW', 'DRAFT')`
  );

  // Đếm thiết kế cần chỉnh sửa
  const [rowsCanChinhSua] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong
     FROM CustomDesign
     WHERE status = 'NEEDS_REVISION'`
  );

  // Đếm đơn chờ gửi xưởng (OrderProduction với status APPROVED)
  const [rowsChoGuiXuong] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong
     FROM OrderProduction
     WHERE status = 'APPROVED'`
  );

  // Đếm đơn đang in (OrderProduction với status PRINTING)
  const [rowsDangIn] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong
     FROM OrderProduction
     WHERE status = 'PRINTING'`
  );

  return {
    soChoKiemTra: rowsChoKiemTra[0].so_luong,
    soCanChinhSua: rowsCanChinhSua[0].so_luong,
    soDonChoGuiXuong: rowsChoGuiXuong[0].so_luong,
    soDangIn: rowsDangIn[0].so_luong,
  };
}

// =====================================================================
// SERVICE 2: Lấy danh sách thiết kế (có lọc + phân trang)
// GET /api/admin/designs
// =====================================================================
async function layDanhSachThietKe({ page, limit, tu_khoa, trang_thai, vi_tri_in }) {
  const trangHienTai = parseInt(page) || 1;
  const soMoi = parseInt(limit) || 10;
  const offset = (trangHienTai - 1) * soMoi;

  // Xây dựng điều kiện WHERE động
  const dieuKien = [];
  const thamSo = [];

  // Lọc theo trạng thái
  if (trang_thai) {
    const statusDB = MAP_TRANG_THAI_THIET_KE_FE_DB[trang_thai];
    if (statusDB) {
      if (trang_thai === "cho_kiem_tra") {
        dieuKien.push("cd.status IN ('PENDING_REVIEW', 'DRAFT')");
      } else {
        dieuKien.push("cd.status = ?");
        thamSo.push(statusDB);
      }
    }
  }

  // Lọc theo vị trí in (so sánh với PrintPosition.name, LIKE)
  if (vi_tri_in) {
    const mapViTri = {
      nguc_trai: "ngực trái",
      nguc_phai: "ngực phải",
      sau_lung: "sau lưng",
      tay_trai: "tay trái",
      tay_phai: "tay phải",
    };
    const tenViTri = mapViTri[vi_tri_in] || vi_tri_in;
    dieuKien.push("pp.name LIKE ?");
    thamSo.push(`%${tenViTri}%`);
  }

  // Tìm kiếm theo từ khóa (mã TK hoặc tên khách)
  if (tu_khoa && tu_khoa.trim()) {
    const tk = tu_khoa.trim();
    dieuKien.push("(cd.id LIKE ? OR a.fullName LIKE ?)");
    thamSo.push(`%${tk}%`, `%${tk}%`);
  }

  const menh_de_where =
    dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";

  // Query đếm tổng
  const sqlDem = `
    SELECT COUNT(DISTINCT cd.id) AS tong_so
    FROM CustomDesign cd
    JOIN Account a ON a.id = cd.userId
    JOIN Product p ON p.id = cd.productId
    LEFT JOIN DesignPrintPosition dpp ON dpp.designId = cd.id
    LEFT JOIN PrintPosition pp ON pp.id = dpp.printPositionId
    ${menh_de_where}
  `;
  const [rowsDem] = await db.pool.query(sqlDem, thamSo);
  const tongSo = rowsDem[0].tong_so;

  // Query lấy dữ liệu
  const sqlData = `
    SELECT
      cd.id,
      cd.previewUrl        AS urlPreview,
      cd.baseColor         AS mauAo,
      cd.status,
      cd.createdAt         AS ngayGui,
      cd.adminNote,
      a.fullName           AS tenKhachHang,
      a.phone              AS soDienThoai,
      p.name               AS tenSanPham,
      pv.color             AS tenMauAo,
      pp.name              AS viTriIn
    FROM CustomDesign cd
    JOIN Account a ON a.id = cd.userId
    JOIN Product p ON p.id = cd.productId
    LEFT JOIN ProductVariant pv ON pv.id = cd.variantId
    LEFT JOIN DesignPrintPosition dpp ON dpp.designId = cd.id
    LEFT JOIN PrintPosition pp ON pp.id = dpp.printPositionId
    ${menh_de_where}
    GROUP BY cd.id
    ORDER BY cd.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.pool.query(sqlData, [...thamSo, soMoi, offset]);

  const danhSach = rows.map((row, idx) => ({
    id: row.id,
    maThietKe: `TK-${String(row.id).padStart(4, "0")}`,
    urlPreview: row.urlPreview || null,
    mauAo: row.mauAo || "#ffffff",
    tenKhachHang: row.tenKhachHang || "Khách hàng",
    soDienThoai: row.soDienThoai || null,
    tenSanPham: row.tenSanPham || "Sản phẩm",
    tenMauAo: row.tenMauAo || "Không rõ",
    viTriIn: row.viTriIn || "Chưa xác định",
    trangThai: MAP_TRANG_THAI_THIET_KE_DB_FE[row.status] || "cho_kiem_tra",
    ngayGui: formatNgay(row.ngayGui),
  }));

  return {
    danhSach,
    tongSo,
    trang: trangHienTai,
    soTrangMoiTrang: soMoi,
    tongSoTrang: Math.ceil(tongSo / soMoi),
  };
}

// =====================================================================
// SERVICE 3: Duyệt thiết kế
// PATCH /api/admin/designs/:id/duyet
// =====================================================================
async function duyetThietKe(id) {
  // Kiểm tra tồn tại
  const [rows] = await db.pool.query(
    "SELECT id, status FROM CustomDesign WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    throw taoLoi("Không tìm thấy thiết kế", 404);
  }

  const thietKe = rows[0];
  if (thietKe.status === "APPROVED") {
    throw taoLoi("Thiết kế này đã được duyệt trước đó", 400);
  }

  // Cập nhật trạng thái
  await db.pool.query(
    "UPDATE CustomDesign SET status = 'APPROVED' WHERE id = ?",
    [id]
  );

  // Tự động cập nhật OrderProduction nếu có thiết kế này trong đơn hàng
  // Chuyển các bản ghi OrderProduction liên quan từ WAITING_DESIGN_APPROVAL → APPROVED
  await db.pool.query(
    `UPDATE OrderProduction op
     JOIN OrderItem oi ON oi.id = op.orderItemId
     SET op.status = 'APPROVED', op.approvedAt = NOW()
     WHERE oi.designId = ? AND op.status = 'WAITING_DESIGN_APPROVAL'`,
    [id]
  );

  return {
    id: Number(id),
    maThietKe: `TK-${String(id).padStart(4, "0")}`,
    trangThai: "da_duyet",
  };
}

// =====================================================================
// SERVICE 4: Yêu cầu khách chỉnh sửa thiết kế
// PATCH /api/admin/designs/:id/yeu-cau-chinh-sua
// =====================================================================
async function yeuCauChinhSua(id, ghiChu) {
  // Kiểm tra tồn tại
  const [rows] = await db.pool.query(
    "SELECT id, status FROM CustomDesign WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    throw taoLoi("Không tìm thấy thiết kế", 404);
  }

  // Cập nhật trạng thái + ghi chú admin
  await db.pool.query(
    "UPDATE CustomDesign SET status = 'NEEDS_REVISION', adminNote = ? WHERE id = ?",
    [ghiChu || null, id]
  );

  return {
    id: Number(id),
    trangThai: "can_chinh_sua",
  };
}

// =====================================================================
// SERVICE 5: Lấy danh sách đơn cần in
// GET /api/admin/designs/don-can-in
// =====================================================================
async function layDanhSachDonCanIn({ page, limit, trang_thai }) {
  const trangHienTai = parseInt(page) || 1;
  const soMoi = parseInt(limit) || 10;
  const offset = (trangHienTai - 1) * soMoi;

  const dieuKien = [];
  const thamSo = [];

  if (trang_thai) {
    const statusDB = MAP_TRANG_THAI_DON_IN_FE_DB[trang_thai];
    if (statusDB) {
      dieuKien.push("op.status = ?");
      thamSo.push(statusDB);
    }
  } else {
    // Mặc định: chỉ lấy các đơn đã duyệt thiết kế trở lên (không lấy WAITING_DESIGN_APPROVAL)
    dieuKien.push("op.status IN ('APPROVED', 'PRINTING', 'PACKED')");
  }

  const menh_de_where =
    dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";

  // Đếm tổng
  const sqlDem = `
    SELECT COUNT(DISTINCT op.id) AS tong_so
    FROM OrderProduction op
    JOIN OrderItem oi ON oi.id = op.orderItemId
    JOIN CustomerOrder co ON co.id = oi.orderId
    JOIN Account a ON a.id = co.userId
    LEFT JOIN CustomDesign cd ON cd.id = oi.designId
    ${menh_de_where}
  `;
  const [rowsDem] = await db.pool.query(sqlDem, thamSo);
  const tongSo = rowsDem[0].tong_so;

  // Lấy dữ liệu
  const sqlData = `
    SELECT
      op.id,
      co.orderCode         AS maDon,
      oi.designId,
      cd.id                AS thietKeId,
      cd.previewUrl        AS urlPreview,
      cd.baseColor         AS mauAo,
      a.fullName           AS tenKhachHang,
      oi.quantity          AS soLuong,
      pp.name              AS viTriIn,
      op.status,
      op.createdAt         AS ngayTao
    FROM OrderProduction op
    JOIN OrderItem oi ON oi.id = op.orderItemId
    JOIN CustomerOrder co ON co.id = oi.orderId
    JOIN Account a ON a.id = co.userId
    LEFT JOIN CustomDesign cd ON cd.id = oi.designId
    LEFT JOIN DesignPrintPosition dpp ON dpp.designId = cd.id
    LEFT JOIN PrintPosition pp ON pp.id = dpp.printPositionId
    ${menh_de_where}
    GROUP BY op.id
    ORDER BY op.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.pool.query(sqlData, [...thamSo, soMoi, offset]);

  const danhSach = rows.map((row) => ({
    id: row.id,
    maDon: row.maDon || `DH-${String(row.id).padStart(4, "0")}`,
    maThietKe: row.thietKeId
      ? `TK-${String(row.thietKeId).padStart(4, "0")}`
      : "Không có",
    urlPreview: row.urlPreview || null,
    mauAo: row.mauAo || "#ffffff",
    tenKhachHang: row.tenKhachHang || "Khách hàng",
    soLuong: row.soLuong || 1,
    viTriIn: row.viTriIn || "Chưa xác định",
    trangThai: MAP_TRANG_THAI_DON_IN_DB_FE[row.status] || "cho_gui_xuong",
    ngayTao: formatNgay(row.ngayTao),
  }));

  return {
    danhSach,
    tongSo,
    trang: trangHienTai,
    soTrangMoiTrang: soMoi,
    tongSoTrang: Math.ceil(tongSo / soMoi),
  };
}

// =====================================================================
// SERVICE 6: Gửi đơn đến xưởng in
// PATCH /api/admin/designs/don-can-in/:id/gui-xuong
// =====================================================================
async function guiDonXuongIn(id) {
  // Kiểm tra tồn tại
  const [rows] = await db.pool.query(
    "SELECT id, status FROM OrderProduction WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    throw taoLoi("Không tìm thấy đơn cần in", 404);
  }

  const donHienTai = rows[0];
  if (donHienTai.status !== "APPROVED") {
    throw taoLoi("Chỉ có thể gửi xưởng các đơn đang ở trạng thái chờ gửi xưởng", 400);
  }

  await db.pool.query(
    "UPDATE OrderProduction SET status = 'PRINTING', printedAt = NOW() WHERE id = ?",
    [id]
  );

  return {
    id: Number(id),
    trangThai: "dang_in",
    ngayGuiXuong: formatNgay(new Date()),
  };
}

// =====================================================================
// SERVICE 7: Lấy danh sách sticker
// GET /api/admin/designs/stickers (và /api/stickers)
// =====================================================================
async function layDanhSachSticker() {
  const [rows] = await db.pool.query(
    `SELECT id, name AS ten, imageUrl AS urlAnh, category AS loai
     FROM Sticker
     WHERE isActive = 1
     ORDER BY sortOrder ASC, id ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    ten: row.ten,
    urlAnh: row.urlAnh,
    loai: row.loai,
  }));
}

// =====================================================================
// SERVICE 8: Thêm sticker mới
// POST /api/admin/designs/stickers
// =====================================================================
async function themSticker({ ten, urlAnh, loai }) {
  // Validate
  if (!ten || !ten.trim()) throw taoLoi("Vui lòng nhập tên sticker");
  if (!urlAnh) throw taoLoi("Vui lòng cung cấp URL ảnh sticker");
  if (!["logo", "hinh_ve", "chu_viet"].includes(loai)) {
    throw taoLoi("Loại sticker không hợp lệ. Chỉ chấp nhận: logo, hinh_ve, chu_viet");
  }

  // Lấy sortOrder tiếp theo
  const [rowsMax] = await db.pool.query(
    "SELECT COALESCE(MAX(sortOrder), 0) + 1 AS next_order FROM Sticker"
  );
  const nextOrder = rowsMax[0].next_order;

  const [result] = await db.pool.query(
    `INSERT INTO Sticker (name, imageUrl, category, sortOrder, isActive)
     VALUES (?, ?, ?, ?, 1)`,
    [ten.trim(), urlAnh, loai, nextOrder]
  );

  return {
    id: result.insertId,
    ten: ten.trim(),
    urlAnh,
    loai,
  };
}

// =====================================================================
// SERVICE 9: Xóa sticker
// DELETE /api/admin/designs/stickers/:id
// =====================================================================
async function xoaSticker(id) {
  const [rows] = await db.pool.query(
    "SELECT id FROM Sticker WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    throw taoLoi("Không tìm thấy sticker", 404);
  }

  // Xóa mềm: đặt isActive = 0
  await db.pool.query(
    "UPDATE Sticker SET isActive = 0 WHERE id = ?",
    [id]
  );

  return { id: Number(id) };
}

// =====================================================================
// SERVICE 10: Lấy danh sách vị trí in
// GET /api/admin/designs/vi-tri-in (và /api/vi-tri-in)
// =====================================================================
async function layDanhSachViTriIn({ chiLayDangBat = false } = {}) {
  let sql = `
    SELECT id, name AS ten, extraCost AS moTa, isActive AS dangHoatDong
    FROM PrintPosition
  `;
  const thamSo = [];

  if (chiLayDangBat) {
    sql += " WHERE isActive = 1";
  }
  sql += " ORDER BY id ASC";

  const [rows] = await db.pool.query(sql, thamSo);

  return rows.map((row) => ({
    id: row.id,
    ten: row.ten,
    moTa: row.moTa !== null ? `Phụ phí: ${Number(row.moTa).toLocaleString("vi-VN")}đ` : "Không có phụ phí",
    dangHoatDong: row.dangHoatDong === 1 || row.dangHoatDong === true,
  }));
}

// =====================================================================
// SERVICE 11: Thêm vị trí in mới
// POST /api/admin/designs/vi-tri-in
// =====================================================================
async function themViTriIn({ ten, moTa, dangHoatDong }) {
  if (!ten || !ten.trim()) throw taoLoi("Vui lòng nhập tên vị trí in");

  // Sinh code từ tên (slug hóa đơn giản)
  const code = ten
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // Kiểm tra code trùng
  const [existing] = await db.pool.query(
    "SELECT id FROM PrintPosition WHERE code = ?",
    [code]
  );
  if (existing && existing.length > 0) {
    throw taoLoi(`Vị trí in với tên tương tự đã tồn tại`, 409);
  }

  const isActive = dangHoatDong !== false ? 1 : 0;

  const [result] = await db.pool.query(
    `INSERT INTO PrintPosition (code, name, extraCost, isActive)
     VALUES (?, ?, 0, ?)`,
    [code, ten.trim(), isActive]
  );

  return {
    id: result.insertId,
    ten: ten.trim(),
    moTa: moTa || "",
    dangHoatDong: isActive === 1,
  };
}

// =====================================================================
// SERVICE 12: Bật/tắt vị trí in
// PATCH /api/admin/designs/vi-tri-in/:id
// =====================================================================
async function batTatViTriIn(id, dangHoatDong) {
  const [rows] = await db.pool.query(
    "SELECT id, isActive FROM PrintPosition WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    throw taoLoi("Không tìm thấy vị trí in", 404);
  }

  const isActive = dangHoatDong ? 1 : 0;
  await db.pool.query(
    "UPDATE PrintPosition SET isActive = ? WHERE id = ?",
    [isActive, id]
  );

  return { id: Number(id), dangHoatDong: isActive === 1 };
}

// =====================================================================
// SERVICE 13: Xóa vị trí in
// DELETE /api/admin/designs/vi-tri-in/:id
// =====================================================================
async function xoaViTriIn(id) {
  const [rows] = await db.pool.query(
    "SELECT id FROM PrintPosition WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    throw taoLoi("Không tìm thấy vị trí in", 404);
  }

  // Kiểm tra ràng buộc: có thiết kế nào đang dùng vị trí này không?
  const [designs] = await db.pool.query(
    "SELECT COUNT(*) AS so_luong FROM DesignPrintPosition WHERE printPositionId = ?",
    [id]
  );
  if (designs[0].so_luong > 0) {
    throw taoLoi(
      `Không thể xóa: có ${designs[0].so_luong} thiết kế đang sử dụng vị trí in này. Hãy tắt thay vì xóa.`,
      409
    );
  }

  await db.pool.query("DELETE FROM PrintPosition WHERE id = ?", [id]);

  return { id: Number(id) };
}

module.exports = {
  layThongKe,
  layDanhSachThietKe,
  duyetThietKe,
  yeuCauChinhSua,
  layDanhSachDonCanIn,
  guiDonXuongIn,
  layDanhSachSticker,
  themSticker,
  xoaSticker,
  layDanhSachViTriIn,
  themViTriIn,
  batTatViTriIn,
  xoaViTriIn,
};
