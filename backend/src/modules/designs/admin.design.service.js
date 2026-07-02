/**
 * design.service.js – Xử lý logic nghiệp vụ module Thiết kế & In ấn (phía Admin).
 *
 * Các bảng DB sử dụng:
 *  - CustomDesign      → danh sách thiết kế khách hàng
 *  - OrderProduction   → đơn cần in (sau khi thiết kế được duyệt)
 *  - Sticker           → sticker có sẵn trong Design Studio
 *  - PrintPosition     → hai vị trí in cố định (mặt trước, mặt sau)
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

// Tương thích các OrderProduction cũ được tạo sau khi thiết kế đã duyệt nhưng
// vẫn mang trạng thái WAITING_DESIGN_APPROVAL do lỗi ở luồng tạo đơn.
const DIEU_KIEN_CHO_GUI_XUONG = `(
  op.status = 'APPROVED'
  OR (op.status = 'WAITING_DESIGN_APPROVAL' AND cd.status = 'APPROVED')
)`;

/** Hai vị trí in cố định được hỗ trợ trên giao diện thiết kế. */
const MAP_VI_TRI_IN_FE_DB = {
  mat_truoc: "MAT_TRUOC",
  mat_sau: "MAT_SAU",
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

function kiemTraKhoangNgay(tuNgay, denNgay) {
  const dinhDangNgay = /^\d{4}-\d{2}-\d{2}$/;
  const laNgayHopLe = (giaTri) => {
    if (!dinhDangNgay.test(giaTri)) return false;
    const [nam, thang, ngay] = giaTri.split("-").map(Number);
    const date = new Date(Date.UTC(nam, thang - 1, ngay));
    return date.getUTCFullYear() === nam
      && date.getUTCMonth() === thang - 1
      && date.getUTCDate() === ngay;
  };

  if (tuNgay && !laNgayHopLe(tuNgay)) {
    throw taoLoi("Ngày bắt đầu không hợp lệ. Định dạng yêu cầu: YYYY-MM-DD.");
  }
  if (denNgay && !laNgayHopLe(denNgay)) {
    throw taoLoi("Ngày kết thúc không hợp lệ. Định dạng yêu cầu: YYYY-MM-DD.");
  }
  if (tuNgay && denNgay && tuNgay > denNgay) {
    throw taoLoi("Ngày bắt đầu không được sau ngày kết thúc.");
  }
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
     WHERE status = 'PENDING_REVIEW'`
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
     FROM OrderProduction op
     LEFT JOIN CustomDesign cd ON cd.id = op.designId
     WHERE ${DIEU_KIEN_CHO_GUI_XUONG}`
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
async function layDanhSachThietKe({
  page, limit, tu_khoa, trang_thai, vi_tri_in, tu_ngay, den_ngay,
}) {
  const trangHienTai = parseInt(page) || 1;
  const soMoi = parseInt(limit) || 10;
  const offset = (trangHienTai - 1) * soMoi;

  // Xây dựng điều kiện WHERE động
  // Trang Admin chỉ quản lý các thiết kế khách đã gửi hoặc đã được xử lý.
  // DRAFT là bản khách còn đang soạn nên không được hiển thị hay tính là "Chờ kiểm tra".
  const dieuKien = [
    "cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION', 'APPROVED')",
  ];
  const thamSo = [];

  kiemTraKhoangNgay(tu_ngay, den_ngay);
  if (tu_ngay) {
    dieuKien.push("cd.createdAt >= ?");
    thamSo.push(`${tu_ngay} 00:00:00`);
  }
  if (den_ngay) {
    dieuKien.push("cd.createdAt < DATE_ADD(?, INTERVAL 1 DAY)");
    thamSo.push(`${den_ngay} 00:00:00`);
  }

  // Lọc theo trạng thái
  if (trang_thai) {
    const statusDB = MAP_TRANG_THAI_THIET_KE_FE_DB[trang_thai];
    if (statusDB) {
      dieuKien.push("cd.status = ?");
      thamSo.push(statusDB);
    }
  }

  // Lọc theo một trong hai vị trí in cố định.
  if (vi_tri_in) {
    const codeViTri = MAP_VI_TRI_IN_FE_DB[vi_tri_in];
    if (!codeViTri) {
      throw taoLoi("Vị trí in không hợp lệ. Chỉ hỗ trợ mặt trước hoặc mặt sau.");
    }
    dieuKien.push("pp.code = ?");
    thamSo.push(codeViTri);
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
//
// Bảng trung tâm là OrderProduction (mỗi dòng = 1 mặt hàng cần in).
//      Bộ lọc ngày và cột ngayDatDon hiển thị đều dùng CustomerOrder.createdAt
//      (ngày khách đặt đơn), KHÔNG phải OrderProduction.createdAt.
//      Lý do: nhân viên xưởng in cần biết "hôm nay có bao nhiêu áo cần in
//      để kịp giao cho khách" → họ quan tâm ngày khách bấm đặt hàng.
// =====================================================================
async function layDanhSachDonCanIn({ page, limit, trang_thai, tu_ngay, den_ngay }) {
  const trangHienTai = parseInt(page) || 1;
  const soMoi = parseInt(limit) || 10;
  const offset = (trangHienTai - 1) * soMoi;

  const dieuKien = [];
  const thamSo = [];

  kiemTraKhoangNgay(tu_ngay, den_ngay);
  // Lọc theo ngày ĐẶT ĐƠN (CustomerOrder.createdAt), không phải ngày tạo OrderProduction.
  if (tu_ngay) {
    dieuKien.push("co.createdAt >= ?");
    thamSo.push(`${tu_ngay} 00:00:00`);
  }
  if (den_ngay) {
    dieuKien.push("co.createdAt < DATE_ADD(?, INTERVAL 1 DAY)");
    thamSo.push(`${den_ngay} 00:00:00`);
  }

  if (trang_thai) {
    if (trang_thai === "cho_gui_xuong") {
      dieuKien.push(DIEU_KIEN_CHO_GUI_XUONG);
    } else {
      const statusDB = MAP_TRANG_THAI_DON_IN_FE_DB[trang_thai];
      if (!statusDB) throw taoLoi("Trạng thái đơn in không hợp lệ.");
      dieuKien.push("op.status = ?");
      thamSo.push(statusDB);
    }
  } else {
    dieuKien.push(`(${DIEU_KIEN_CHO_GUI_XUONG} OR op.status IN ('PRINTING', 'PACKED'))`);
  }

  const menh_de_where =
    dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";

  // OrderProduction.orderItemId là UNIQUE nên COUNT(*) chính là số dòng sản xuất.
  const sqlDem = `
    SELECT COUNT(*) AS tong_so
    FROM OrderProduction op
    JOIN OrderItem oi ON oi.id = op.orderItemId
    JOIN CustomerOrder co ON co.id = oi.orderId
    LEFT JOIN CustomDesign cd ON cd.id = oi.designId
    ${menh_de_where}
  `;
  const [rowsDem] = await db.pool.query(sqlDem, thamSo);
  const tongSo = rowsDem[0].tong_so;

  // Không JOIN trực tiếp DesignPrintPosition để tránh nhân bản rồi GROUP BY các dòng sản xuất.
  const sqlData = `
    SELECT
      op.id,
      oi.id                AS orderItemId,
      co.orderCode         AS maDon,
      oi.designId,
      cd.id                AS thietKeId,
      cd.previewUrl        AS urlPreview,
      cd.baseColor         AS mauAo,
      a.fullName           AS tenKhachHang,
      oi.quantity          AS soLuong,
      (
        SELECT GROUP_CONCAT(DISTINCT pp.name ORDER BY pp.id SEPARATOR ', ')
        FROM DesignPrintPosition dpp
        JOIN PrintPosition pp ON pp.id = dpp.printPositionId
        WHERE dpp.designId = oi.designId
      )                    AS viTriIn,
      CASE
        WHEN op.status = 'WAITING_DESIGN_APPROVAL' AND cd.status = 'APPROVED'
          THEN 'APPROVED'
        ELSE op.status
      END                  AS status,
      co.createdAt         AS ngayDatDon
    FROM OrderProduction op
    JOIN OrderItem oi ON oi.id = op.orderItemId
    JOIN CustomerOrder co ON co.id = oi.orderId
    JOIN Account a ON a.id = co.userId
    LEFT JOIN CustomDesign cd ON cd.id = oi.designId
    ${menh_de_where}
    ORDER BY co.createdAt DESC, op.id DESC
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
    ngayDatDon: formatNgay(row.ngayDatDon),
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
    `SELECT op.id, op.status, cd.status AS designStatus
     FROM OrderProduction op
     LEFT JOIN CustomDesign cd ON cd.id = op.designId
     WHERE op.id = ?`,
    [id]
  );
  if (!rows || rows.length === 0) {
    throw taoLoi("Không tìm thấy đơn cần in", 404);
  }

  const donHienTai = rows[0];
  const laDonCuDaDuocDuyet = donHienTai.status === "WAITING_DESIGN_APPROVAL"
    && donHienTai.designStatus === "APPROVED";
  if (donHienTai.status !== "APPROVED" && !laDonCuDaDuocDuyet) {
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
// GET /api/vi-tri-in
// =====================================================================
async function layDanhSachViTriIn({ chiLayDangBat = false } = {}) {
  let sql = `
    SELECT id, name AS ten, extraCost AS moTa, isActive AS dangHoatDong
    FROM PrintPosition
    WHERE code IN ('MAT_TRUOC', 'MAT_SAU')
  `;

  if (chiLayDangBat) {
    sql += " AND isActive = 1";
  }
  sql += " ORDER BY FIELD(code, 'MAT_TRUOC', 'MAT_SAU')";

  const [rows] = await db.pool.query(sql);

  return rows.map((row) => ({
    id: row.id,
    ten: row.ten,
    moTa: row.moTa !== null ? `Phụ phí: ${Number(row.moTa).toLocaleString("vi-VN")}đ` : "Không có phụ phí",
    dangHoatDong: row.dangHoatDong === 1 || row.dangHoatDong === true,
  }));
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
};
