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
const { calculateBoundingBoxAreaFee } = require("../pricing/admin.pricing.service");

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
  READY_TO_PRINT: "cho_gui_xuong",
  PROCESSING: "cho_gui_xuong",
  PRINTING: "dang_in",
  PRINTED: "da_in_xong",
  PACKED: "da_in_xong",
};

/** FE → DB (đơn cần in) */
const MAP_TRANG_THAI_DON_IN_FE_DB = {
  cho_gui_xuong: "READY_TO_PRINT",
  dang_in: "PRINTING",
  da_in_xong: "PRINTED",
};

// Chuẩn hóa dữ liệu cũ (APPROVED/PROCESSING/PACKED) về ba mốc nghiệp vụ mới.
// OrderItem.productionStatus là nguồn chính; OrderProduction chỉ là fallback cho
// các đơn đã tồn tại trước khi luồng này được sửa.
const BIEU_THUC_TRANG_THAI_DON_IN = `(CASE
  WHEN oi.productionStatus = 'READY_TO_PRINT' THEN 'READY_TO_PRINT'
  WHEN oi.productionStatus = 'PRINTING' THEN 'PRINTING'
  WHEN oi.productionStatus IN ('PRINTED', 'PACKED') THEN 'PRINTED'
  WHEN op.status = 'PRINTING' THEN 'PRINTING'
  WHEN op.status IN ('PRINTED', 'PACKED') THEN 'PRINTED'
  WHEN oi.productionStatus IN ('APPROVED', 'PROCESSING') THEN 'READY_TO_PRINT'
  WHEN op.status = 'APPROVED'
    OR (op.status = 'WAITING_DESIGN_APPROVAL' AND cd.status = 'APPROVED')
    THEN 'READY_TO_PRINT'
  ELSE NULL
END)`;

const DIEU_KIEN_CHO_GUI_XUONG = `${BIEU_THUC_TRANG_THAI_DON_IN} = 'READY_TO_PRINT'`;

const LOAI_AO_HOP_LE = new Set(["tshirt", "polo", "hoodie"]);

function chuanHoaCanvasData(canvasData, shirtType) {
  let data = canvasData;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      throw taoLoi("Dữ liệu thiết kế không phải JSON hợp lệ", 400);
    }
  }

  if (!data || typeof data !== "object" || !Array.isArray(data.elements)) {
    throw taoLoi("Dữ liệu thiết kế phải chứa danh sách elements", 400);
  }
  if (data.elements.length > 200) {
    throw taoLoi("Thiết kế không được vượt quá 200 phần tử", 400);
  }

  return {
    ...data,
    version: Number(data.version) || 1,
    shirtType,
    shirtView: data.shirtView === "back" ? "back" : "front",
    logicalCanvas: { width: 500, height: 600 },
  };
}

async function timSanPhamTheoLoaiAo(shirtType) {
  const tenGanDung = {
    tshirt: "%Áo Thun%",
    polo: "%Polo%",
    hoodie: "%Hoodie%",
  }[shirtType];

  const [rows] = await db.pool.query(
    "SELECT id FROM Product WHERE name LIKE ? ORDER BY id LIMIT 1",
    [tenGanDung]
  );
  if (!rows.length) {
    throw taoLoi("Không tìm thấy phôi áo phù hợp với loại áo đã chọn", 400);
  }
  return rows[0].id;
}

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
     JOIN OrderItem oi ON oi.id = op.orderItemId
     LEFT JOIN CustomDesign cd ON cd.id = op.designId
     WHERE ${DIEU_KIEN_CHO_GUI_XUONG}`
  );

  // Đếm đơn đang in (OrderProduction với status PRINTING)
  const [rowsDangIn] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong
     FROM OrderProduction op
     JOIN OrderItem oi ON oi.id = op.orderItemId
     LEFT JOIN CustomDesign cd ON cd.id = op.designId
     WHERE ${BIEU_THUC_TRANG_THAI_DON_IN} = 'PRINTING'`
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
  page, limit, design_id, tu_khoa, trang_thai, vi_tri_in, tu_ngay, den_ngay,
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
  if (design_id !== undefined && design_id !== "") {
    const designId = Number(design_id);
    if (!Number.isInteger(designId) || designId <= 0) {
      throw taoLoi("ID thiết kế không hợp lệ.");
    }
    dieuKien.push("cd.id = ?");
    thamSo.push(designId);
  }
  if (tu_ngay) {
    dieuKien.push("cd.createdAt >= ?");
    thamSo.push(`${tu_ngay} 00:00:00`);
  }
  if (den_ngay) {
    dieuKien.push("cd.createdAt < DATE_ADD(?, INTERVAL 1 DAY)");
    thamSo.push(`${den_ngay} 00:00:00`);
  }

  // Khi có từ khóa, tìm trên toàn bộ trạng thái thiết kế.
  if (trang_thai && !(tu_khoa && tu_khoa.trim())) {
    if (trang_thai === "can_xu_ly") {
      dieuKien.push("cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION')");
    } else {
      const statusDB = MAP_TRANG_THAI_THIET_KE_FE_DB[trang_thai];
      if (statusDB) {
        dieuKien.push("cd.status = ?");
        thamSo.push(statusDB);
      }
    }
  }

  // Lọc theo một vị trí hoặc yêu cầu thiết kế có đồng thời cả hai mặt.
  if (vi_tri_in) {
    if (vi_tri_in === "in_2_mat") {
      dieuKien.push(`EXISTS (
        SELECT 1
        FROM DesignPrintPosition dppHaiMat
        JOIN PrintPosition ppHaiMat ON ppHaiMat.id = dppHaiMat.printPositionId
        WHERE dppHaiMat.designId = cd.id
          AND ppHaiMat.code IN ('MAT_TRUOC', 'MAT_SAU')
        GROUP BY dppHaiMat.designId
        HAVING COUNT(DISTINCT ppHaiMat.code) = 2
      )`);
    } else {
      const codeViTri = MAP_VI_TRI_IN_FE_DB[vi_tri_in];
      if (!codeViTri) {
        throw taoLoi("Vị trí in không hợp lệ. Chỉ hỗ trợ mặt trước, mặt sau hoặc in 2 mặt.");
      }
      dieuKien.push("pp.code = ?");
      thamSo.push(codeViTri);
    }
  }

  // Tìm kiếm theo từ khóa (mã TK hoặc tên khách)
  if (tu_khoa && tu_khoa.trim()) {
    const tk = tu_khoa.trim();
    dieuKien.push(`(
      CONCAT('TK-', LPAD(cd.id, 4, '0')) LIKE ?
      OR CAST(cd.id AS CHAR) LIKE ?
      OR a.fullName LIKE ?
    )`);
    thamSo.push(`%${tk}%`, `%${tk}%`, `%${tk}%`);
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
      (
        SELECT GROUP_CONCAT(DISTINCT ppViTri.name ORDER BY ppViTri.id SEPARATOR ', ')
        FROM DesignPrintPosition dppViTri
        JOIN PrintPosition ppViTri ON ppViTri.id = dppViTri.printPositionId
        WHERE dppViTri.designId = cd.id
      )                    AS viTriIn
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
// SERVICE 2.1: Lấy chi tiết một thiết kế
// GET /api/admin/designs/:id
// =====================================================================
async function layChiTietThietKe(id) {
  const [rows] = await db.pool.query(
    `SELECT
       cd.id,
       cd.previewUrl AS urlPreview,
       cd.baseColor AS mauAo,
       cd.status,
       cd.createdAt AS ngayGui,
       cd.adminNote AS ghiChu,
       a.fullName AS tenKhachHang,
       a.phone AS soDienThoai,
       p.name AS tenSanPham,
       pv.color AS tenMauAo,
       (
         SELECT GROUP_CONCAT(DISTINCT pp.name ORDER BY pp.name SEPARATOR ', ')
         FROM DesignPrintPosition dpp
         JOIN PrintPosition pp ON pp.id = dpp.printPositionId
         WHERE dpp.designId = cd.id
       ) AS viTriIn
     FROM CustomDesign cd
     JOIN Account a ON a.id = cd.userId
     JOIN Product p ON p.id = cd.productId
     LEFT JOIN ProductVariant pv ON pv.id = cd.variantId
     WHERE cd.id = ?
       AND cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION', 'APPROVED')`,
    [id]
  );

  if (!rows.length) {
    throw taoLoi("Không tìm thấy thiết kế", 404);
  }

  const row = rows[0];
  return {
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
    ghiChu: row.ghiChu || null,
  };
}

// =====================================================================
// SERVICE 2.2: Admin tạo thiết kế nháp và gắn vào tài khoản khách hàng
// POST /api/admin/designs/customer-drafts
// =====================================================================
async function taoThietKeChoKhach({ userId, name, shirtType, shirtColor, canvasData, previewUrl }) {
  const customerId = Number(userId);
  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw taoLoi("Vui lòng chọn khách hàng", 400);
  }
  if (!name || !String(name).trim()) {
    throw taoLoi("Vui lòng nhập tên thiết kế", 400);
  }
  if (!LOAI_AO_HOP_LE.has(shirtType)) {
    throw taoLoi("Loại áo không hợp lệ", 400);
  }

  const [accounts] = await db.pool.query(
    "SELECT id FROM Account WHERE id = ? AND role = 'CUSTOMER' AND status = 'ACTIVE' LIMIT 1",
    [customerId]
  );
  if (!accounts.length) {
    throw taoLoi("Không tìm thấy tài khoản khách hàng đang hoạt động", 404);
  }

  const productId = await timSanPhamTheoLoaiAo(shirtType);
  const normalizedCanvas = chuanHoaCanvasData(canvasData, shirtType);
  const dataStr = JSON.stringify(normalizedCanvas);
  const designFee = calculateBoundingBoxAreaFee({ layers: normalizedCanvas.elements });

  const [result] = await db.pool.query(
    `INSERT INTO CustomDesign
       (userId, name, productId, baseColor, canvasData, previewUrl, status, designFee)
     VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
    [
      customerId,
      String(name).trim().slice(0, 100),
      productId,
      shirtColor || "#ffffff",
      dataStr,
      previewUrl || "",
      designFee,
    ]
  );

  return {
    id: result.insertId,
    userId: customerId,
    name: String(name).trim().slice(0, 100),
    status: "DRAFT",
    previewUrl: previewUrl || "",
  };
}

// =====================================================================
// SERVICE 3: Duyệt thiết kế
// PATCH /api/admin/designs/:id/duyet
// =====================================================================
async function duyetThietKe(id) {
  return db.transaction(async (conn) => {
    const [rows] = await conn.query(
      "SELECT id, status FROM CustomDesign WHERE id = ? FOR UPDATE",
      [id]
    );
    if (!rows || rows.length === 0) {
      throw taoLoi("Không tìm thấy thiết kế", 404);
    }

    const thietKe = rows[0];
    if (thietKe.status === "APPROVED") {
      throw taoLoi("Thiết kế này đã được duyệt trước đó", 400);
    }

    await conn.query(
      "UPDATE CustomDesign SET status = 'APPROVED' WHERE id = ?",
      [id]
    );

    // Không đưa thiết kế xuống xưởng tại đây. Hàng chờ in chỉ được tạo
    // trong transaction xác nhận đơn hàng để tránh đơn PENDING đã đi sản xuất.

    return {
      id: Number(id),
      maThietKe: `TK-${String(id).padStart(4, "0")}`,
      trangThai: "da_duyet",
    };
  });
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
async function layDanhSachDonCanIn({ page, limit, tu_khoa, trang_thai, tu_ngay, den_ngay }) {
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

  if (tu_khoa && tu_khoa.trim()) {
    const tuKhoa = `%${tu_khoa.trim()}%`;
    dieuKien.push(`(
      CONCAT('TK-', LPAD(cd.id, 4, '0')) LIKE ?
      OR CAST(cd.id AS CHAR) LIKE ?
      OR co.orderCode LIKE ?
      OR a.fullName LIKE ?
      OR a.phone LIKE ?
    )`);
    thamSo.push(tuKhoa, tuKhoa, tuKhoa, tuKhoa, tuKhoa);
  }

  // Khi có từ khóa, tìm trên toàn bộ tiến độ và bỏ qua bộ lọc trạng thái hiện tại.
  if (trang_thai && !(tu_khoa && tu_khoa.trim())) {
    if (trang_thai === "cho_gui_xuong") {
      dieuKien.push(DIEU_KIEN_CHO_GUI_XUONG);
    } else {
      const statusDB = MAP_TRANG_THAI_DON_IN_FE_DB[trang_thai];
      if (!statusDB) throw taoLoi("Trạng thái đơn in không hợp lệ.");
      dieuKien.push(`${BIEU_THUC_TRANG_THAI_DON_IN} = ?`);
      thamSo.push(statusDB);
    }
  } else {
    dieuKien.push(`${BIEU_THUC_TRANG_THAI_DON_IN} IS NOT NULL`);
  }

  const menh_de_where =
    dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";

  // OrderProduction.orderItemId là UNIQUE nên COUNT(*) chính là số dòng sản xuất.
  const sqlDem = `
    SELECT COUNT(*) AS tong_so
    FROM OrderProduction op
    JOIN OrderItem oi ON oi.id = op.orderItemId
    JOIN CustomerOrder co ON co.id = oi.orderId
    JOIN Account a ON a.id = co.userId
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
      ${BIEU_THUC_TRANG_THAI_DON_IN} AS status,
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
// SERVICE 6: Cập nhật tiến độ in theo đúng thứ tự
// PATCH /api/admin/designs/don-can-in/:id/trang-thai
// =====================================================================
async function capNhatTrangThaiDonIn(id, trangThaiMoi) {
  const TRANG_THAI_TIEP_THEO = {
    READY_TO_PRINT: "PRINTING",
    PRINTING: "PRINTED",
  };
  const statusMoiDB = MAP_TRANG_THAI_DON_IN_FE_DB[trangThaiMoi];
  if (!statusMoiDB || statusMoiDB === "READY_TO_PRINT") {
    throw taoLoi("Trạng thái tiến độ in mới không hợp lệ.");
  }

  return db.transaction(async (conn) => {
    const [rows] = await conn.query(
      `SELECT op.id, op.orderItemId, op.status AS legacyStatus,
              oi.productionStatus, cd.status AS designStatus
       FROM OrderProduction op
       JOIN OrderItem oi ON oi.id = op.orderItemId
       LEFT JOIN CustomDesign cd ON cd.id = oi.designId
       WHERE op.id = ?
       FOR UPDATE`,
      [id]
    );
    if (!rows || rows.length === 0) {
      throw taoLoi("Không tìm thấy đơn cần in", 404);
    }

    const donHienTai = rows[0];
    if (donHienTai.designStatus !== "APPROVED") {
      throw taoLoi("Thiết kế chưa được duyệt nên chưa thể cập nhật tiến độ in.");
    }

    let statusHienTai;
    if (donHienTai.productionStatus === "READY_TO_PRINT") {
      statusHienTai = "READY_TO_PRINT";
    } else if (donHienTai.productionStatus === "PRINTING") {
      statusHienTai = "PRINTING";
    } else if (["PRINTED", "PACKED"].includes(donHienTai.productionStatus)) {
      statusHienTai = "PRINTED";
    } else if (donHienTai.legacyStatus === "PRINTING") {
      statusHienTai = "PRINTING";
    } else if (["PRINTED", "PACKED"].includes(donHienTai.legacyStatus)) {
      statusHienTai = "PRINTED";
    } else if (["APPROVED", "PROCESSING"].includes(donHienTai.productionStatus)) {
      statusHienTai = "READY_TO_PRINT";
    } else if (["APPROVED", "WAITING_DESIGN_APPROVAL"].includes(donHienTai.legacyStatus)) {
      statusHienTai = "READY_TO_PRINT";
    }

    if (TRANG_THAI_TIEP_THEO[statusHienTai] !== statusMoiDB) {
      throw taoLoi("Chỉ được cập nhật tiến độ in sang mốc kế tiếp, không thể bỏ qua hoặc lùi trạng thái.");
    }

    await conn.query(
      "UPDATE OrderItem SET productionStatus = ? WHERE id = ?",
      [statusMoiDB, donHienTai.orderItemId]
    );

    if (statusMoiDB === "PRINTING") {
      await conn.query(
        "UPDATE OrderProduction SET status = 'PRINTING' WHERE id = ?",
        [id]
      );
    } else {
      await conn.query(
        "UPDATE OrderProduction SET status = 'PRINTED', printedAt = NOW() WHERE id = ?",
        [id]
      );
    }

    return {
      id: Number(id),
      trangThai: trangThaiMoi,
      productionStatus: statusMoiDB,
    };
  });
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
  layChiTietThietKe,
  taoThietKeChoKhach,
  duyetThietKe,
  yeuCauChinhSua,
  layDanhSachDonCanIn,
  capNhatTrangThaiDonIn,
  layDanhSachSticker,
  themSticker,
  xoaSticker,
  layDanhSachViTriIn,
};
