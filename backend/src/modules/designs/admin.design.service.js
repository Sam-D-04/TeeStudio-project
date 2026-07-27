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
const { taoBaoCaoExcel } = require("../../common/utils/excel-report");


// =====================================================================
// MAP TRẠNG THÁI: DB → Frontend (snake_case tiếng Việt)
// =====================================================================

/** CustomDesign.status → FE trangThai */
const MAP_TRANG_THAI_THIET_KE_DB_FE = {
  PENDING_REVIEW: "cho_kiem_tra",
  NEEDS_REVISION: "can_chinh_sua",
  APPROVED: "da_duyet",
  DRAFT: "nhap",
};

/** FE trangThai → DB status (dùng khi nhận request cập nhật) */
const MAP_TRANG_THAI_THIET_KE_FE_DB = {
  cho_kiem_tra: "PENDING_REVIEW",
  can_chinh_sua: "NEEDS_REVISION",
  da_duyet: "APPROVED",
  nhap: "DRAFT",
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
const TRANG_THAI_THIET_KE_DUOC_SUA = new Set([
  "PENDING_REVIEW",
  "NEEDS_REVISION",
]);
const TRANG_THAI_SAN_XUAT_DUOC_SUA = new Set([
  "WAITING_DESIGN_APPROVAL",
  "APPROVED",
  "PROCESSING",
  "READY_TO_PRINT",
]);
const TRANG_THAI_DON_HANG_KHOA_SUA = new Set([
  "PRINTING",
  "READY_TO_SHIP",
  "SHIPPED",
  "SHIPPING",
  "COMPLETED",
]);
const TRANG_THAI_SAN_XUAT_KHOA_SUA = new Set(["PRINTING", "PRINTED", "PACKED"]);
const THONG_BAO_THIET_KE_DA_SAN_XUAT =
  "Thiết kế đã được đưa vào sản xuất, không thể chỉnh sửa.";
const TEN_TRANG_THAI_THIET_KE_DB = {
  DRAFT: "Bản nháp",
  PENDING_REVIEW: "Chờ duyệt",
  NEEDS_REVISION: "Cần sửa",
  APPROVED: "Đã duyệt",
};
const TEN_TRANG_THAI_DON_HANG_DB = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  PRINTING: "Đang xử lý in",
  READY_TO_SHIP: "Chờ giao",
  SHIPPING: "Đang giao hàng",
  SHIPPED: "Đang giao hàng",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};
const TEN_TRANG_THAI_SAN_XUAT_DB = {
  WAITING_DESIGN_APPROVAL: "Chờ duyệt thiết kế",
  APPROVED: "Đã duyệt thiết kế",
  PROCESSING: "Chờ gửi xưởng",
  READY_TO_PRINT: "Chờ gửi xưởng",
  PRINTING: "Đang in",
  PRINTED: "Đã in xong",
  PACKED: "Đã đóng gói",
};

const MAU_AO_MAC_DINH = {
  black: "#000000",
  den: "#000000",
  white: "#ffffff",
  trang: "#ffffff",
  navy: "#1d4ed8",
  "xanh navy": "#1d4ed8",
  blue: "#0066cc",
  "xanh duong": "#0066cc",
  gray: "#9ca3af",
  grey: "#9ca3af",
  xam: "#9ca3af",
  brown: "#8b4513",
  nau: "#8b4513",
  beige: "#d6b89a",
  be: "#d6b89a",
};

function laMaMauHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function chuanHoaMaMauHex(value) {
  const hex = String(value || "").trim().toLowerCase();
  if (["#1a1a1a", "#0a0a0a", "#111111", "#18181b"].includes(hex)) {
    return "#000000";
  }
  return hex;
}

function chuanHoaKhoaMau(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\s+/g, " ");
}

function chuanHoaMauAo(...candidates) {
  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (!value) continue;
    if (laMaMauHex(value)) return chuanHoaMaMauHex(value);

    const mapped = MAU_AO_MAC_DINH[chuanHoaKhoaMau(value)];
    if (mapped) return mapped;
  }
  return "#ffffff";
}

function layMaMauTuongDuong(color) {
  const normalized = chuanHoaMauAo(color);
  const values = [String(color || "").trim().toLowerCase(), normalized];
  if (normalized === "#000000") {
    values.push("#1a1a1a", "#0a0a0a", "#111111", "#18181b");
  }
  return [...new Set(values.filter(Boolean))];
}

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

async function timSanPhamTheoLoaiAo(shirtType, executor = db.pool) {
  const tenGanDung = {
    tshirt: "%Áo Thun%",
    polo: "%Polo%",
    hoodie: "%Hoodie%",
  }[shirtType];

  const [rows] = await executor.query(
    "SELECT id FROM Product WHERE name LIKE ? AND status = 'ACTIVE' ORDER BY id LIMIT 1",
    [tenGanDung]
  );
  if (!rows.length) {
    throw taoLoi("Không tìm thấy phôi áo phù hợp với loại áo đã chọn", 400);
  }
  return rows[0].id;
}

async function layBienTheTaoThietKe(shirtType, shirtColor) {
  if (!LOAI_AO_HOP_LE.has(shirtType)) {
    throw taoLoi("Loại áo không hợp lệ", 400);
  }
  if (!shirtColor || !String(shirtColor).trim()) {
    throw taoLoi("Màu áo không hợp lệ", 400);
  }

  const productId = await timSanPhamTheoLoaiAo(shirtType);
  const [products] = await db.pool.query(
    "SELECT name FROM Product WHERE id = ? LIMIT 1",
    [productId]
  );
  const colorCandidates = layMaMauTuongDuong(shirtColor);
  const [variants] = await db.pool.query(
    `SELECT id, color, colorHex, size, stockQty
     FROM ProductVariant
     WHERE productId = ?
       AND LOWER(colorHex) IN (?)
       AND (status IS NULL OR status = 'ACTIVE')
     ORDER BY FIELD(size, 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'), size, id`,
    [productId, colorCandidates]
  );

  return {
    productId,
    productName: products[0]?.name || "",
    variants: variants.map((variant) => ({
      id: Number(variant.id),
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex,
      stockQty: Number(variant.stockQty),
    })),
  };
}

/** Hai vị trí in cố định được hỗ trợ trên giao diện thiết kế. */
const MAP_VI_TRI_IN_FE_DB = {
  mat_truoc: "MAT_TRUOC",
  mat_sau: "MAT_SAU",
};

const MAP_SHIRT_VIEW_PRINT_POSITION_CODE = {
  front: "MAT_TRUOC",
  back: "MAT_SAU",
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

function layTenTrangThai(map, status) {
  return map[status] || status || "Không rõ";
}

function moTaDonHang(don) {
  return don?.orderCode ? `Đơn ${don.orderCode}` : "Đơn hàng liên quan";
}

function moTaTrangThaiDonLienQuan(donHang) {
  if (!donHang.length) return "Không tìm thấy đơn hàng liên quan.";

  return donHang
    .slice(0, 3)
    .map((don) => {
      const trangThaiDon = layTenTrangThai(TEN_TRANG_THAI_DON_HANG_DB, don.orderStatus);
      const trangThaiSanXuat = layTenTrangThai(
        TEN_TRANG_THAI_SAN_XUAT_DB,
        don.productionStatus || don.productionOrderStatus
      );
      return `${moTaDonHang(don)}: đơn hàng ${trangThaiDon}, sản xuất ${trangThaiSanXuat}`;
    })
    .join("; ");
}

function taoLyDoKhoaKhongCoDon(designStatus) {
  const tenTrangThai = layTenTrangThai(TEN_TRANG_THAI_THIET_KE_DB, designStatus);
  if (designStatus === "APPROVED") {
    return `Thiết kế đang ở trạng thái ${tenTrangThai} nhưng chưa gắn đơn hàng. Chỉ bản nháp DRAFT chưa tạo đơn mới được sửa tự do.`;
  }
  if (designStatus === "PENDING_REVIEW" || designStatus === "NEEDS_REVISION") {
    return `Thiết kế đang ở trạng thái ${tenTrangThai} nhưng hệ thống chưa tìm thấy đơn hàng liên quan. Vui lòng kiểm tra liên kết đơn hàng trước khi sửa.`;
  }
  return `Thiết kế đang ở trạng thái ${tenTrangThai}; chỉ bản nháp DRAFT chưa tạo đơn mới được sửa tự do.`;
}

function taoLyDoKhoaTheoDonHang(donHang) {
  const khoaTheoDonHang = donHang.find((don) =>
    TRANG_THAI_DON_HANG_KHOA_SUA.has(don.orderStatus)
  );
  if (khoaTheoDonHang) {
    const trangThai = layTenTrangThai(TEN_TRANG_THAI_DON_HANG_DB, khoaTheoDonHang.orderStatus);
    return `${moTaDonHang(khoaTheoDonHang)} đang ở trạng thái ${trangThai}, không thể sửa thiết kế.`;
  }

  const khoaTheoSanXuat = donHang.find((don) =>
    TRANG_THAI_SAN_XUAT_KHOA_SUA.has(don.productionStatus)
    || TRANG_THAI_SAN_XUAT_KHOA_SUA.has(don.productionOrderStatus)
  );
  if (khoaTheoSanXuat) {
    const status = TRANG_THAI_SAN_XUAT_KHOA_SUA.has(khoaTheoSanXuat.productionStatus)
      ? khoaTheoSanXuat.productionStatus
      : khoaTheoSanXuat.productionOrderStatus;
    const trangThai = layTenTrangThai(TEN_TRANG_THAI_SAN_XUAT_DB, status);
    return `${moTaDonHang(khoaTheoSanXuat)} có trạng thái sản xuất ${trangThai}, không thể sửa thiết kế.`;
  }

  return THONG_BAO_THIET_KE_DA_SAN_XUAT;
}

function tinhQuyenSuaThietKe({ designStatus, donHang = [] }) {
  if (!donHang.length) {
    return {
      hasOrder: false,
      canEdit: designStatus === "DRAFT",
      lockReason: designStatus === "DRAFT"
        ? null
        : taoLyDoKhoaKhongCoDon(designStatus),
    };
  }

  const biKhoa = donHang.some((don) =>
    TRANG_THAI_DON_HANG_KHOA_SUA.has(don.orderStatus)
    || TRANG_THAI_SAN_XUAT_KHOA_SUA.has(don.productionStatus)
    || TRANG_THAI_SAN_XUAT_KHOA_SUA.has(don.productionOrderStatus)
  );
  if (biKhoa) {
    return {
      hasOrder: true,
      canEdit: false,
      lockReason: taoLyDoKhoaTheoDonHang(donHang),
    };
  }

  const duocSua =
    TRANG_THAI_THIET_KE_DUOC_SUA.has(designStatus)
    || donHang.some((don) =>
      TRANG_THAI_SAN_XUAT_DUOC_SUA.has(don.productionStatus)
      || TRANG_THAI_SAN_XUAT_DUOC_SUA.has(don.productionOrderStatus)
    );

  return {
    hasOrder: true,
    canEdit: duocSua,
    lockReason: duocSua
      ? null
      : designStatus === "APPROVED"
        ? `Thiết kế đã duyệt nhưng dòng đơn chưa ở trạng thái cho phép sửa phút chót. ${moTaTrangThaiDonLienQuan(donHang)}. Chỉ cho sửa khi sản xuất còn WAITING_DESIGN_APPROVAL/APPROVED/PROCESSING/READY_TO_PRINT.`
        : `Thiết kế chỉ được sửa khi đang Chờ duyệt/Cần sửa hoặc dòng đơn còn trước in. Trạng thái thiết kế hiện tại: ${layTenTrangThai(TEN_TRANG_THAI_THIET_KE_DB, designStatus)}. ${moTaTrangThaiDonLienQuan(donHang)}.`,
  };
}

async function layTrangThaiLienQuanThietKe(conn, designId, { forUpdate = false } = {}) {
  const lockClause = forUpdate ? " FOR UPDATE" : "";
  const [rows] = await conn.query(
    `SELECT id, status
     FROM CustomDesign
     WHERE id = ?${lockClause}`,
    [designId]
  );
  if (!rows.length) {
    throw taoLoi("Không tìm thấy thiết kế", 404);
  }

  const [donHang] = await conn.query(
    `SELECT
       oi.id AS orderItemId,
       oi.productionStatus,
       co.orderCode,
       co.status AS orderStatus,
       op.status AS productionOrderStatus
     FROM OrderItem oi
     JOIN CustomerOrder co ON co.id = oi.orderId
     LEFT JOIN OrderProduction op ON op.orderItemId = oi.id
     WHERE oi.designId = ?${lockClause}`,
    [designId]
  );

  const quyenSua = tinhQuyenSuaThietKe({
    designStatus: rows[0].status,
    donHang,
  });

  return {
    id: rows[0].id,
    status: rows[0].status,
    donHang,
    ...quyenSua,
  };
}

function chanSuaThietKeNeuBiKhoa(thongTinQuyen) {
  if (!thongTinQuyen.canEdit) {
    throw taoLoi(thongTinQuyen.lockReason || THONG_BAO_THIET_KE_DA_SAN_XUAT, 403);
  }
}

async function layQuyenSuaNhieuThietKe(designIds) {
  const ids = [...new Set(designIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (!ids.length) return new Map();

  const [designRows] = await db.pool.query(
    `SELECT id, status
     FROM CustomDesign
     WHERE id IN (?)`,
    [ids]
  );
  const [orderRows] = await db.pool.query(
    `SELECT
       oi.designId,
       oi.id AS orderItemId,
       oi.productionStatus,
       co.orderCode,
       co.status AS orderStatus,
       op.status AS productionOrderStatus
     FROM OrderItem oi
     JOIN CustomerOrder co ON co.id = oi.orderId
     LEFT JOIN OrderProduction op ON op.orderItemId = oi.id
     WHERE oi.designId IN (?)`,
    [ids]
  );

  const ordersByDesignId = new Map();
  for (const order of orderRows) {
    const designId = Number(order.designId);
    if (!ordersByDesignId.has(designId)) ordersByDesignId.set(designId, []);
    ordersByDesignId.get(designId).push(order);
  }

  const result = new Map();
  for (const design of designRows) {
    const designId = Number(design.id);
    result.set(
      designId,
      tinhQuyenSuaThietKe({
        designStatus: design.status,
        donHang: ordersByDesignId.get(designId) || [],
      })
    );
  }
  return result;
}

async function dongBoViTriInTheoMatAo(conn, designId, shirtView) {
  const code = MAP_SHIRT_VIEW_PRINT_POSITION_CODE[shirtView === "back" ? "back" : "front"];
  const [positions] = await conn.query(
    "SELECT id, extraCost FROM PrintPosition WHERE code = ? AND isActive = 1 LIMIT 1",
    [code]
  );
  if (!positions.length) {
    throw taoLoi("Không tìm thấy vị trí in phù hợp với mặt áo đã chọn", 400);
  }

  await conn.query(
    "DELETE FROM DesignPrintPosition WHERE designId = ?",
    [designId]
  );
  await conn.query(
    `INSERT INTO DesignPrintPosition (designId, printPositionId, extraCost)
     VALUES (?, ?, ?)`,
    [designId, positions[0].id, positions[0].extraCost || 0]
  );
}

function layDanhSachMaViTriInTuCanvas(canvasData) {
  const fallbackSide = canvasData?.shirtView === "back" ? "back" : "front";
  const elements = Array.isArray(canvasData?.elements) ? canvasData.elements : [];
  const sides = elements.length
    ? new Set(elements.map((element) => (
      element.side === "back" ? "back" : element.side === "front" ? "front" : fallbackSide
    )))
    : new Set([fallbackSide]);

  return [...sides].map((side) => MAP_SHIRT_VIEW_PRINT_POSITION_CODE[side]);
}

async function dongBoViTriInTheoCanvas(conn, designId, canvasData) {
  const codes = layDanhSachMaViTriInTuCanvas(canvasData);
  const [positions] = await conn.query(
    "SELECT id, code, extraCost FROM PrintPosition WHERE code IN (?) AND isActive = 1",
    [codes]
  );
  if (positions.length !== codes.length) {
    throw taoLoi("Khong tim thay vi tri in phu hop voi mat ao da chon", 400);
  }

  await conn.query(
    "DELETE FROM DesignPrintPosition WHERE designId = ?",
    [designId]
  );
  const values = positions.map((position) => [designId, position.id, position.extraCost || 0]);
  await conn.query(
    `INSERT INTO DesignPrintPosition (designId, printPositionId, extraCost)
     VALUES ?`,
    [values]
  );
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

  const dieuKien = [];
  const thamSo = [];

  kiemTraKhoangNgay(tu_ngay, den_ngay);

  let coTuKhoaHayId = false;

  if (design_id !== undefined && design_id !== "") {
    const designId = Number(design_id);
    if (!Number.isInteger(designId) || designId <= 0) {
      throw taoLoi("ID thiết kế không hợp lệ.");
    }
    dieuKien.push("cd.id = ?");
    thamSo.push(designId);
    coTuKhoaHayId = true;
  }
  if (tu_ngay) {
    dieuKien.push("cd.createdAt >= ?");
    thamSo.push(`${tu_ngay} 00:00:00`);
  }
  if (den_ngay) {
    dieuKien.push("cd.createdAt < DATE_ADD(?, INTERVAL 1 DAY)");
    thamSo.push(`${den_ngay} 00:00:00`);
  }

  const hasTuKhoa = tu_khoa && tu_khoa.trim();
  if (hasTuKhoa) {
    coTuKhoaHayId = true;
  }

  if (coTuKhoaHayId || trang_thai === "tat_ca") {
    dieuKien.push("cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'DRAFT')");
  } else if (trang_thai === "nhap") {
    dieuKien.push("cd.status = 'DRAFT'");
  } else if (trang_thai === "can_xu_ly") {
    dieuKien.push("cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION')");
  } else if (trang_thai && MAP_TRANG_THAI_THIET_KE_FE_DB[trang_thai]) {
    dieuKien.push("cd.status = ?");
    thamSo.push(MAP_TRANG_THAI_THIET_KE_FE_DB[trang_thai]);
  } else {
    dieuKien.push("cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION', 'APPROVED')");
  }

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

  if (hasTuKhoa) {
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
    LEFT JOIN Account a ON a.id = cd.userId
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
      pv.colorHex          AS mauAoHex,
      (
        SELECT GROUP_CONCAT(DISTINCT ppViTri.name ORDER BY ppViTri.id SEPARATOR ', ')
        FROM DesignPrintPosition dppViTri
        JOIN PrintPosition ppViTri ON ppViTri.id = dppViTri.printPositionId
        WHERE dppViTri.designId = cd.id
      )                    AS viTriIn
    FROM CustomDesign cd
    LEFT JOIN Account a ON a.id = cd.userId
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
  const quyenSuaTheoThietKe = await layQuyenSuaNhieuThietKe(rows.map((row) => row.id));

  const danhSach = rows.map((row, idx) => {
    const quyenSua = quyenSuaTheoThietKe.get(Number(row.id)) || {
      hasOrder: false,
      canEdit: false,
      lockReason: null,
    };
    return {
      id: row.id,
      maThietKe: `TK-${String(row.id).padStart(4, "0")}`,
      urlPreview: row.urlPreview || null,
      mauAo: chuanHoaMauAo(row.mauAoHex, row.mauAo, row.tenMauAo),
      tenKhachHang: row.tenKhachHang || "Chưa gán khách",
      soDienThoai: row.soDienThoai || null,
      tenSanPham: row.tenSanPham || "Sản phẩm",
      tenMauAo: row.tenMauAo || "Không rõ",
      viTriIn: row.viTriIn || "Chưa xác định",
      trangThai: MAP_TRANG_THAI_THIET_KE_DB_FE[row.status] || "cho_kiem_tra",
      ngayGui: formatNgay(row.ngayGui),
      coDonHang: quyenSua.hasOrder,
      duocPhepSua: quyenSua.canEdit,
      lyDoKhoaSua: quyenSua.lockReason,
    };
  });

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
       cd.name AS tenThietKe,
       cd.productId,
       cd.variantId,
       cd.previewUrl AS urlPreview,
       cd.baseColor AS mauAo,
       cd.status,
       cd.createdAt AS ngayGui,
       cd.updatedAt AS ngayCapNhat,
       cd.adminNote AS ghiChu,
       cd.designFee AS phiThietKe,
       a.id AS khachHangId,
       a.fullName AS tenKhachHang,
       a.email AS emailKhachHang,
       a.phone AS soDienThoai,
       p.id AS sanPhamId,
       p.name AS tenSanPham,
       pv.color AS tenMauAo,
       pv.colorHex AS mauAoHex,
       pv.size AS sizeAo,
       pv.sku AS skuAo,
       pv.stockQty AS tonKhoBienThe,
       (
         SELECT GROUP_CONCAT(DISTINCT pp.name ORDER BY pp.name SEPARATOR ', ')
         FROM DesignPrintPosition dpp
         JOIN PrintPosition pp ON pp.id = dpp.printPositionId
         WHERE dpp.designId = cd.id
       ) AS viTriIn,
       (
         SELECT COALESCE(SUM(dpp.extraCost), 0)
         FROM DesignPrintPosition dpp
         WHERE dpp.designId = cd.id
       ) AS phiViTriIn,
       (
         SELECT co.orderCode
         FROM OrderItem oi
         JOIN CustomerOrder co ON co.id = oi.orderId
         WHERE oi.designId = cd.id
         ORDER BY co.createdAt DESC, co.id DESC
         LIMIT 1
       ) AS maDonHang
     FROM CustomDesign cd
     LEFT JOIN Account a ON a.id = cd.userId
     JOIN Product p ON p.id = cd.productId
     LEFT JOIN ProductVariant pv ON pv.id = cd.variantId
     WHERE cd.id = ?
       AND cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'DRAFT')`,
    [id]
  );

  if (!rows.length) {
    throw taoLoi("Không tìm thấy thiết kế", 404);
  }

  const row = rows[0];
  const [rowsDonHang] = await db.pool.query(
    `SELECT
       oi.id AS orderItemId,
       oi.orderId,
       co.orderCode AS maDonHang,
       co.status AS trangThaiDonHang,
       co.createdAt AS ngayDatDon,
       oi.quantity AS soLuong,
       oi.unitPrice AS donGia,
       oi.designFee AS phiThietKe,
       oi.lineTotal AS thanhTien,
       oi.productionStatus AS trangThaiSanXuat,
       pv.size AS sizeAo,
       pv.color AS tenMauAo,
       pv.colorHex AS mauAoHex,
       pv.sku AS skuAo
     FROM OrderItem oi
     JOIN CustomerOrder co ON co.id = oi.orderId
     LEFT JOIN ProductVariant pv ON pv.id = oi.variantId
     WHERE oi.designId = ?
     ORDER BY co.createdAt DESC, oi.id DESC`,
    [id]
  );

  return {
    id: row.id,
    maThietKe: `TK-${String(row.id).padStart(4, "0")}`,
    tenThietKe: row.tenThietKe || `Thiết kế ${row.id}`,
    khachHangId: row.khachHangId ? Number(row.khachHangId) : null,
    emailKhachHang: row.emailKhachHang || null,
    sanPhamId: Number(row.sanPhamId),
    productId: Number(row.productId),
    variantId: row.variantId ? Number(row.variantId) : null,
    urlPreview: row.urlPreview || null,
    mauAo: chuanHoaMauAo(row.mauAoHex, row.mauAo, row.tenMauAo),
    tenKhachHang: row.tenKhachHang || "Chưa gán khách",
    soDienThoai: row.soDienThoai || null,
    tenSanPham: row.tenSanPham || "Sản phẩm",
    tenMauAo: row.tenMauAo || "Không rõ",
    sizeAo: row.sizeAo || null,
    skuAo: row.skuAo || null,
    tonKhoBienThe: row.tonKhoBienThe !== null && row.tonKhoBienThe !== undefined
      ? Number(row.tonKhoBienThe)
      : null,
    viTriIn: row.viTriIn || "Chưa xác định",
    phiViTriIn: Number(row.phiViTriIn || 0),
    phiThietKe: Number(row.phiThietKe || 0),
    trangThai: MAP_TRANG_THAI_THIET_KE_DB_FE[row.status] || "cho_kiem_tra",
    ngayGui: formatNgay(row.ngayGui),
    ngayCapNhat: formatNgay(row.ngayCapNhat),
    maDonHang: row.maDonHang || null,
    donHangLienQuan: rowsDonHang.map((don) => ({
      orderItemId: Number(don.orderItemId),
      orderId: Number(don.orderId),
      maDonHang: don.maDonHang,
      trangThaiDonHang: don.trangThaiDonHang || null,
      ngayDatDon: formatNgay(don.ngayDatDon),
      soLuong: Number(don.soLuong || 0),
      donGia: Number(don.donGia || 0),
      phiThietKe: Number(don.phiThietKe || 0),
      thanhTien: Number(don.thanhTien || 0),
      trangThaiSanXuat: don.trangThaiSanXuat || null,
      sizeAo: don.sizeAo || null,
      tenMauAo: don.tenMauAo || null,
      mauAo: chuanHoaMauAo(don.mauAoHex, don.tenMauAo),
      skuAo: don.skuAo || null,
    })),
    ghiChu: row.ghiChu || null,
  };
}

// =====================================================================
// SERVICE 2.3: Lấy canvasData của một thiết kế (chỉ dùng khi mở Editor)
// GET /api/admin/designs/:id/canvas
//
// Tách riêng khỏi layChiTietThietKe để tránh trả JSON lớn ở mọi nơi.
// =====================================================================
async function layCanvasDataThietKe(id) {
  const [rows] = await db.pool.query(
    `SELECT
       cd.id,
       cd.canvasData,
       cd.baseColor AS mauAo,
       cd.status,
       cd.name      AS tenThietKe,
       cd.productId,
       cd.variantId,
       a.id         AS khachHangId,
       a.fullName   AS tenKhachHang,
       a.email      AS emailKhachHang,
       a.phone      AS soDienThoai,
       pv.colorHex  AS mauAoHex,
       pv.color     AS tenMauAo,
       pv.size      AS sizeAo,
       p.name       AS tenSanPham
     FROM CustomDesign cd
     LEFT JOIN Account a ON a.id = cd.userId
     JOIN Product p ON p.id = cd.productId
     LEFT JOIN ProductVariant pv ON pv.id = cd.variantId
     WHERE cd.id = ?
       AND cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'DRAFT')`,
    [id]
  );

  if (!rows.length) {
    throw taoLoi("Không tìm thấy thiết kế", 404);
  }

  const row = rows[0];

  // Parse canvasData từ chuỗi JSON → object (trả về null nếu lỗi)
  const quyenSua = await layTrangThaiLienQuanThietKe(db.pool, id);
  chanSuaThietKeNeuBiKhoa(quyenSua);

  let canvasData = null;
  if (row.canvasData) {
    try {
      canvasData = typeof row.canvasData === "string"
        ? JSON.parse(row.canvasData)
        : row.canvasData;
    } catch {
      canvasData = null;
    }
  }

  const mauAo = chuanHoaMauAo(
    canvasData?.shirtColor,
    row.mauAo,
    row.mauAoHex,
    row.tenMauAo
  );

  if (canvasData && typeof canvasData === "object") {
    canvasData = {
      ...canvasData,
      shirtColor: mauAo,
    };
  }

  return {
    id: row.id,
    maThietKe: `TK-${String(row.id).padStart(4, "0")}`,
    tenThietKe: row.tenThietKe || "Thiết kế chưa đặt tên",
    mauAo,
    productId: Number(row.productId),
    coDonHang: quyenSua.hasOrder,
    duocPhepSua: quyenSua.canEdit,
    lyDoKhoaSua: quyenSua.lockReason,
    variantId: row.variantId ? Number(row.variantId) : null,
    khachHangId: row.khachHangId ? Number(row.khachHangId) : null,
    tenKhachHang: row.tenKhachHang || "Chưa gán khách",
    emailKhachHang: row.emailKhachHang || null,
    soDienThoai: row.soDienThoai || null,
    sizeAo: row.sizeAo || null,
    tenSanPham: row.tenSanPham || "Sản phẩm",
    trangThai: MAP_TRANG_THAI_THIET_KE_DB_FE[row.status] || "cho_kiem_tra",
    canvasData, // object đã parse, hoặc null
  };
}

// =====================================================================
// SERVICE 2.4: Admin sửa thiết kế cho khách (ghi đè, giữ nguyên trạng thái)
// PUT /api/admin/designs/:id/sua
//
// Lưu đè đồng thời canvasData MỚI + previewUrl MỚI, không tự động
// chuyển status. Duyệt thiết kế vẫn là thao tác riêng qua /duyet.
// =====================================================================
async function suaThietKeChoKhach(
  id,
  { canvasData, previewUrl, shirtType, shirtColor, variantId, printFileUrlFront, printFileUrlBack }
) {
  let dataObj = canvasData;
  if (typeof dataObj === "string") {
    try {
      dataObj = JSON.parse(dataObj);
    } catch {
      throw taoLoi("Dữ liệu thiết kế không phải JSON hợp lệ", 400);
    }
  }
  if (!dataObj || !Array.isArray(dataObj.elements)) {
    throw taoLoi("Dữ liệu thiết kế phải chứa danh sách elements", 400);
  }

  const requestedShirtType = LOAI_AO_HOP_LE.has(shirtType)
    ? shirtType
    : LOAI_AO_HOP_LE.has(dataObj.shirtType)
      ? dataObj.shirtType
      : null;
  if (!requestedShirtType) {
    throw taoLoi("Loại áo không hợp lệ", 400);
  }


  dataObj = {
    ...dataObj,
    shirtType: requestedShirtType,
    shirtView: dataObj.shirtView === "back" ? "back" : "front",
  };

  // Ghi đè canvasData + previewUrl + cập nhật phí, giữ nguyên status hiện tại.
  let currentStatus = null;

  await db.transaction(async (conn) => {
    const quyenSua = await layTrangThaiLienQuanThietKe(conn, id, { forUpdate: true });
    chanSuaThietKeNeuBiKhoa(quyenSua);

    const [rows] = await conn.query(
      `SELECT cd.id, cd.status, cd.productId, cd.variantId, cd.baseColor, cd.canvasData, pv.colorHex, pv.color
       FROM CustomDesign cd
       LEFT JOIN ProductVariant pv ON pv.id = cd.variantId
       WHERE cd.id = ?
       FOR UPDATE`,
      [id]
    );
    if (!rows || rows.length === 0) {
      throw taoLoi("Không tìm thấy thiết kế", 404);
    }

    currentStatus = rows[0].status;

    let productId = Number(rows[0].productId);
    let selectedVariantId = rows[0].variantId ? Number(rows[0].variantId) : null;
    let normalizedColor = chuanHoaMauAo(rows[0].colorHex, rows[0].baseColor, rows[0].color);

    if (quyenSua.hasOrder) {
      let savedCanvasData = null;
      try {
        savedCanvasData = typeof rows[0].canvasData === "string"
          ? JSON.parse(rows[0].canvasData)
          : rows[0].canvasData;
      } catch {
        savedCanvasData = null;
      }

      dataObj = {
        ...dataObj,
        shirtType: LOAI_AO_HOP_LE.has(savedCanvasData?.shirtType)
          ? savedCanvasData.shirtType
          : requestedShirtType,
      };
    }

    if (!quyenSua.hasOrder) {
      productId = await timSanPhamTheoLoaiAo(requestedShirtType, conn);
      selectedVariantId = Number(variantId);
      if (!Number.isInteger(selectedVariantId) || selectedVariantId <= 0) {
        throw taoLoi("Vui lòng chọn size áo", 400);
      }

      const [variants] = await conn.query(
        `SELECT id, colorHex, color, size
         FROM ProductVariant
         WHERE id = ? AND productId = ? AND (status IS NULL OR status = 'ACTIVE')
         LIMIT 1`,
        [selectedVariantId, productId]
      );
      if (!variants.length) {
        throw taoLoi("Size da chon khong thuoc loai ao nay hoac khong con hoat dong", 400);
      }

      normalizedColor = chuanHoaMauAo(
        shirtColor,
        dataObj.shirtColor,
        variants[0].colorHex,
        variants[0].color,
        rows[0].baseColor
      );
      const variantColor = chuanHoaMauAo(variants[0].colorHex, variants[0].color);
      if (variantColor !== normalizedColor) {
        throw taoLoi("Size da chon khong phu hop voi mau ao", 400);
      }
    }
    dataObj = {
      ...dataObj,
      shirtColor: normalizedColor,
    };

    const dataStr = JSON.stringify(dataObj);
    const designFee = calculateBoundingBoxAreaFee({ layers: dataObj.elements });

    const setClauses = [
      "productId = ?",
      "variantId = ?",
      "canvasData = ?",
      "previewUrl = ?",
      "designFee = ?",
      "baseColor = ?",
    ];
    const params = [productId, selectedVariantId, dataStr, previewUrl || "", designFee, normalizedColor];

    if (printFileUrlFront !== undefined) {
      setClauses.push("printFileUrlFront = ?");
      params.push(printFileUrlFront);
    }
    if (printFileUrlBack !== undefined) {
      setClauses.push("printFileUrlBack = ?");
      params.push(printFileUrlBack);
    }

    params.push(id);
    await conn.query(
      `UPDATE CustomDesign
       SET ${setClauses.join(", ")}
       WHERE id = ?`,
      params
    );
    await dongBoViTriInTheoCanvas(conn, id, dataObj);
  });

  return {
    id: Number(id),
    maThietKe: `TK-${String(id).padStart(4, "0")}`,
    trangThai: MAP_TRANG_THAI_THIET_KE_DB_FE[currentStatus] || "cho_kiem_tra",
  };
}

// =====================================================================
// SERVICE 2.2: Admin go/doi khach hang so huu thiet ke
// PATCH/DELETE /api/admin/designs/:id/customer
// =====================================================================
async function goKhachHangKhoiThietKe(id) {
  const [rows] = await db.pool.query(
    "SELECT id FROM CustomDesign WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows.length) {
    throw taoLoi("Khong tim thay thiet ke", 404);
  }

  await db.pool.query(
    "UPDATE CustomDesign SET userId = NULL WHERE id = ?",
    [id]
  );

  return {
    id: Number(id),
    maThietKe: `TK-${String(id).padStart(4, "0")}`,
    khachHangId: null,
    tenKhachHang: "Chua gan khach",
  };
}

async function doiKhachHangThietKe(id, customerId) {
  const nextCustomerId = Number(customerId);
  if (!Number.isInteger(nextCustomerId) || nextCustomerId <= 0) {
    throw taoLoi("Vui long chon khach hang moi", 400);
  }

  const [accounts] = await db.pool.query(
    "SELECT id, fullName, email, phone FROM Account WHERE id = ? AND role = 'CUSTOMER' AND status = 'ACTIVE' LIMIT 1",
    [nextCustomerId]
  );
  if (!accounts.length) {
    throw taoLoi("Khong tim thay tai khoan khach hang dang hoat dong", 404);
  }

  const [result] = await db.pool.query(
    "UPDATE CustomDesign SET userId = ? WHERE id = ?",
    [nextCustomerId, id]
  );
  if (!result.affectedRows) {
    throw taoLoi("Khong tim thay thiet ke", 404);
  }

  const customer = accounts[0];
  return {
    id: Number(id),
    maThietKe: `TK-${String(id).padStart(4, "0")}`,
    khachHangId: Number(customer.id),
    tenKhachHang: customer.fullName || "Khach hang",
    emailKhachHang: customer.email || null,
    soDienThoai: customer.phone || null,
  };
}

// =====================================================================
// SERVICE 2.3: Admin tạo thiết kế nháp và gắn vào tài khoản khách hàng
// POST /api/admin/designs/customer-drafts
// =====================================================================
async function taoThietKeChoKhach({
  userId,
  name,
  shirtType,
  shirtColor,
  variantId,
  canvasData,
  previewUrl,
  printFileUrlFront,
  printFileUrlBack,
}) {
  const hasCustomer = userId !== undefined && userId !== null && userId !== "";
  const customerId = hasCustomer ? Number(userId) : null;
  if (hasCustomer && (!Number.isInteger(customerId) || customerId <= 0)) {
    throw taoLoi("Vui lòng chọn khách hàng hợp lệ", 400);
  }
  if (!name || !String(name).trim()) {
    throw taoLoi("Vui lòng nhập tên thiết kế", 400);
  }
  if (!LOAI_AO_HOP_LE.has(shirtType)) {
    throw taoLoi("Loại áo không hợp lệ", 400);
  }

  if (hasCustomer) {
    const [accounts] = await db.pool.query(
      "SELECT id FROM Account WHERE id = ? AND role = 'CUSTOMER' AND status = 'ACTIVE' LIMIT 1",
      [customerId]
    );
    if (!accounts.length) {
      throw taoLoi("Không tìm thấy tài khoản khách hàng đang hoạt động", 404);
    }
  }

  const productId = await timSanPhamTheoLoaiAo(shirtType);
  const selectedVariantId = Number(variantId);
  if (!Number.isInteger(selectedVariantId) || selectedVariantId <= 0) {
    throw taoLoi("Vui lòng chọn size áo", 400);
  }

  const [variants] = await db.pool.query(
    `SELECT id, colorHex, size
     FROM ProductVariant
     WHERE id = ? AND productId = ? AND (status IS NULL OR status = 'ACTIVE')
     LIMIT 1`,
    [selectedVariantId, productId]
  );
  if (!variants.length) {
    throw taoLoi("Size đã chọn không thuộc loại áo này hoặc không còn hoạt động", 400);
  }
  if (
    String(variants[0].colorHex || "").trim().toLowerCase() !==
    String(shirtColor || "").trim().toLowerCase()
  ) {
    throw taoLoi("Size đã chọn không phù hợp với màu áo", 400);
  }

  const normalizedColor = chuanHoaMauAo(variants[0].colorHex, shirtColor);
  const normalizedCanvas = {
    ...chuanHoaCanvasData(canvasData, shirtType),
    shirtColor: normalizedColor,
  };
  const dataStr = JSON.stringify(normalizedCanvas);
  const designFee = calculateBoundingBoxAreaFee({ layers: normalizedCanvas.elements });

  const result = await db.transaction(async (conn) => {
    const [insertResult] = await conn.query(
      `INSERT INTO CustomDesign
         (userId, name, productId, variantId, baseColor, canvasData, previewUrl, printFileUrlFront, printFileUrlBack, status, designFee)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?)`,
      [
        customerId,
        String(name).trim().slice(0, 100),
        productId,
        selectedVariantId,
        normalizedColor,
        dataStr,
        previewUrl || "",
        printFileUrlFront || null,
        printFileUrlBack || null,
        designFee,
      ]
    );
    await dongBoViTriInTheoCanvas(conn, insertResult.insertId, normalizedCanvas);
    return insertResult;
  });

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
// Dựng mệnh đề WHERE + tham số dùng chung cho cả "lấy danh sách có phân trang"
// (layDanhSachDonCanIn) và "xuất Excel toàn bộ" (xuatDonCanIn) - tách ra để 2
// nơi luôn lọc giống hệt nhau, tránh lệch bộ lọc giữa màn hình xem và file xuất.
function xayDungDieuKienDonCanIn({ tu_khoa, trang_thai, tu_ngay, den_ngay }) {
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

  const menhDeWhere = dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";
  return { menhDeWhere, thamSo };
}

async function layDanhSachDonCanIn({ page, limit, tu_khoa, trang_thai, tu_ngay, den_ngay }) {
  const trangHienTai = parseInt(page) || 1;
  const soMoi = parseInt(limit) || 10;
  const offset = (trangHienTai - 1) * soMoi;

  const { menhDeWhere: menh_de_where, thamSo } = xayDungDieuKienDonCanIn({
    tu_khoa, trang_thai, tu_ngay, den_ngay,
  });

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
      cd.printFileUrlFront AS urlFileIn,
      cd.printFileUrlBack  AS urlFileInBack,
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
    urlFileIn: row.urlFileIn || null,
    // Ảnh in mặt sau (nếu thiết kế có in cả 2 mặt) - null nếu chỉ in 1 mặt.
    urlFileInBack: row.urlFileInBack || null,
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
// SERVICE 5a.1: Lay chi tiet techpack cho mot dong "Don can in"
// GET /api/admin/designs/don-can-in/:id/techpack
//
// Chi doc du lieu da co trong DB: link file in Cloudinary, canvasData va
// thong tin don hang. Khong xu ly do hoa, khong upload anh.
// =====================================================================
async function layTechpackDonCanIn(id) {
  const [rows] = await db.pool.query(
    `SELECT
      op.id                AS id,
      oi.id                AS orderItemId,
      co.id                AS orderId,
      co.orderCode         AS maDon,
      co.createdAt         AS ngayDatDon,
      a.fullName           AS tenKhachHang,
      a.email              AS emailKhachHang,
      a.phone              AS soDienThoai,
      oi.quantity          AS soLuong,
      oi.designId          AS designId,
      cd.id                AS thietKeId,
      cd.name              AS tenThietKe,
      cd.canvasData        AS canvasData,
      cd.previewUrl        AS urlPreview,
      cd.printFileUrlFront AS urlFileInTruoc,
      cd.printFileUrlBack  AS urlFileInSau,
      cd.baseColor         AS mauAo,
      cd.status            AS designStatus,
      p.id                 AS productId,
      p.name               AS tenSanPham,
      p.shirtType          AS shirtType,
      pv.id                AS variantId,
      pv.sku               AS sku,
      pv.color             AS tenMauAo,
      pv.colorHex          AS mauAoHex,
      pv.size              AS sizeAo,
      (
        SELECT GROUP_CONCAT(DISTINCT pp.name ORDER BY pp.id SEPARATOR ', ')
        FROM DesignPrintPosition dpp
        JOIN PrintPosition pp ON pp.id = dpp.printPositionId
        WHERE dpp.designId = oi.designId
      )                    AS viTriIn,
      ${BIEU_THUC_TRANG_THAI_DON_IN} AS status
    FROM OrderProduction op
    JOIN OrderItem oi ON oi.id = op.orderItemId
    JOIN CustomerOrder co ON co.id = oi.orderId
    JOIN Account a ON a.id = co.userId
    JOIN ProductVariant pv ON pv.id = oi.variantId
    JOIN Product p ON p.id = pv.productId
    LEFT JOIN CustomDesign cd ON cd.id = oi.designId
    WHERE op.id = ?
      AND ${BIEU_THUC_TRANG_THAI_DON_IN} IS NOT NULL
    LIMIT 1`,
    [id]
  );

  if (!rows.length) {
    throw taoLoi("Khong tim thay don can in", 404);
  }

  const row = rows[0];
  let canvasData = null;
  if (row.canvasData) {
    try {
      canvasData = typeof row.canvasData === "string"
        ? JSON.parse(row.canvasData)
        : row.canvasData;
    } catch {
      canvasData = null;
    }
  }

  const [rowsViTri] = row.thietKeId
    ? await db.pool.query(
      `SELECT
        pp.code,
        pp.name,
        pp.maxWidth,
        pp.maxHeight,
        pp.printAreaX,
        pp.printAreaY,
        pp.printAreaWidth,
        pp.printAreaHeight
       FROM DesignPrintPosition dpp
       JOIN PrintPosition pp ON pp.id = dpp.printPositionId
       WHERE dpp.designId = ?
         AND pp.code IN ('MAT_TRUOC', 'MAT_SAU')
       ORDER BY FIELD(pp.code, 'MAT_TRUOC', 'MAT_SAU')`,
      [row.thietKeId]
    )
    : [[]];

  const viTriTheoMat = rowsViTri.reduce((acc, item) => {
    const side = item.code === "MAT_SAU" ? "back" : "front";
    acc[side] = {
      code: item.code,
      ten: item.name,
      maxWidthCm: item.maxWidth !== null ? Number(item.maxWidth) : null,
      maxHeightCm: item.maxHeight !== null ? Number(item.maxHeight) : null,
      printAreaX: item.printAreaX !== null ? Number(item.printAreaX) : null,
      printAreaY: item.printAreaY !== null ? Number(item.printAreaY) : null,
      printAreaWidth: item.printAreaWidth !== null ? Number(item.printAreaWidth) : null,
      printAreaHeight: item.printAreaHeight !== null ? Number(item.printAreaHeight) : null,
    };
    return acc;
  }, {});

  const mauAo = chuanHoaMauAo(
    canvasData?.shirtColor,
    row.mauAo,
    row.mauAoHex,
    row.tenMauAo
  );

  return {
    id: Number(row.id),
    orderItemId: Number(row.orderItemId),
    orderId: Number(row.orderId),
    maDon: row.maDon || `DH-${String(row.orderId).padStart(4, "0")}`,
    ngayDatDon: formatNgay(row.ngayDatDon),
    khachHang: {
      ten: row.tenKhachHang || "Khach hang",
      email: row.emailKhachHang || null,
      soDienThoai: row.soDienThoai || null,
    },
    sanPham: {
      productId: Number(row.productId),
      variantId: row.variantId ? Number(row.variantId) : null,
      ten: row.tenSanPham || "San pham",
      shirtType: row.shirtType || canvasData?.shirtType || "tshirt",
      sku: row.sku || null,
      size: row.sizeAo || null,
      tenMau: row.tenMauAo || null,
      mauAo,
    },
    thietKe: {
      id: row.thietKeId ? Number(row.thietKeId) : null,
      maThietKe: row.thietKeId ? `TK-${String(row.thietKeId).padStart(4, "0")}` : "Khong co",
      ten: row.tenThietKe || "Thiet ke chua dat ten",
      viTriIn: row.viTriIn || "Chua xac dinh",
      trangThai: MAP_TRANG_THAI_THIET_KE_DB_FE[row.designStatus] || null,
      urlPreview: row.urlPreview || null,
      canvasData,
    },
    fileIn: {
      front: {
        side: "front",
        tenMat: "Mat truoc",
        url: row.urlFileInTruoc || null,
        viTriIn: viTriTheoMat.front || null,
      },
      back: {
        side: "back",
        tenMat: "Mat sau",
        url: row.urlFileInSau || null,
        viTriIn: viTriTheoMat.back || null,
      },
    },
    soLuong: Number(row.soLuong || 1),
    trangThai: MAP_TRANG_THAI_DON_IN_DB_FE[row.status] || "cho_gui_xuong",
  };
}

// =====================================================================
// SERVICE 5b: Xuat file Excel "thong so in" cho xuong in
// GET /api/admin/designs/don-can-in/xuat-excel
//
// Loc giong het layDanhSachDonCanIn nhung khong phan trang, kem link anh in
// ca 2 mat de xuong in tai truc tiep. Gioi han 5000 dong de tranh file qua lon.
// =====================================================================
const GIOI_HAN_DONG_XUAT_EXCEL = 5000;

// ── Hàm tính thông số in (port từ printTechpackUtils.ts) ─────────────
const DEFAULT_CANVAS = { width: 500, height: 600 };
const DEFAULT_REAL_SIZE_CM = {
  front: { width: 30, height: 40 },
  back:  { width: 35, height: 45 },
};
const PRINT_AREA_CONFIG = {
  tshirt:  { front: { top: 0.31, left: 0.3,  width: 0.4,  height: 0.4  }, back: { top: 0.28, left: 0.28, width: 0.44, height: 0.46 } },
  polo:    { front: { top: 0.45, left: 0.27, width: 0.46, height: 0.4  }, back: { top: 0.27, left: 0.28, width: 0.44, height: 0.46 } },
  hoodie:  { front: { top: 0.34, left: 0.3,  width: 0.4,  height: 0.26 }, back: { top: 0.3,  left: 0.26, width: 0.48, height: 0.46 } },
};

function _toNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function _formatCm(value) {
  const r = Math.round(value * 10) / 10;
  return Number.isInteger(r) ? `${r}cm` : `${r.toFixed(1)}cm`;
}
function _estimateTextWidth(item) {
  const w = _toNum(item.width, 0);
  if (w > 0) return w;
  const fs = _toNum(item.fontSize, 28);
  const len = String(item.text || "").length || 8;
  return Math.max(fs * len * 0.55, fs * 2);
}
function _elementBox(item) {
  const x = _toNum(item.x, NaN), y = _toNum(item.y, NaN);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const fs = _toNum(item.fontSize, 28);
  const w = item.type === "text" ? _estimateTextWidth(item) : _toNum(item.width, 0);
  const h = _toNum(item.height, item.type === "text" ? fs * 1.25 : 0);
  if (w <= 0 || h <= 0) return null;
  return { x, y, width: w, height: h, rotation: _toNum(item.rotation, 0) };
}
function _rotatedBounds(box) {
  if (!box.rotation) return box;
  const rad = (box.rotation * Math.PI) / 180;
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const corners = [
    [box.x, box.y], [box.x + box.width, box.y],
    [box.x + box.width, box.y + box.height], [box.x, box.y + box.height],
  ].map(([px, py]) => ({
    x: cx + (px - cx) * Math.cos(rad) - (py - cy) * Math.sin(rad),
    y: cy + (px - cx) * Math.sin(rad) + (py - cy) * Math.cos(rad),
  }));
  const minX = Math.min(...corners.map(p => p.x));
  const minY = Math.min(...corners.map(p => p.y));
  return { x: minX, y: minY,
    width: Math.max(...corners.map(p => p.x)) - minX,
    height: Math.max(...corners.map(p => p.y)) - minY, rotation: box.rotation };
}
function _mergeBoxes(boxes) {
  if (!boxes.length) return null;
  return {
    x: Math.min(...boxes.map(b => b.x)),
    y: Math.min(...boxes.map(b => b.y)),
    width: Math.max(...boxes.map(b => b.x + b.width)) - Math.min(...boxes.map(b => b.x)),
    height: Math.max(...boxes.map(b => b.y + b.height)) - Math.min(...boxes.map(b => b.y)),
    rotation: 0,
  };
}

/**
 * Tính thông số in (summary + detail) từ canvasData, tương đương tinhThongSoInCm trên FE.
 * @param {object|null} canvasData
 * @param {"front"|"back"} side
 * @param {object|null} viTriIn  - { maxWidthCm, maxHeightCm } từ PrintPosition
 * @param {string} shirtTypeFallback
 * @returns {{ summary: string, detail: string } | null}
 */
function tinhThongSoInCm(canvasData, side, viTriIn, shirtTypeFallback) {
  if (!canvasData) return null;
  const rawItems = Array.isArray(canvasData.elements)
    ? canvasData.elements
    : Array.isArray(canvasData.layers) ? canvasData.layers : [];

  const sideItems = rawItems.filter(item => {
    const s = item.side;
    if (s === "back") return side === "back";
    if (s === "front") return side === "front";
    return (canvasData.shirtView === "back" ? "back" : "front") === side;
  });

  const boxes = sideItems
    .map(_elementBox)
    .filter(Boolean)
    .map(_rotatedBounds);
  const boundingBox = _mergeBoxes(boxes);
  if (!boundingBox) return null;

  const cw = _toNum(canvasData?.logicalCanvas?.width, DEFAULT_CANVAS.width);
  const ch = _toNum(canvasData?.logicalCanvas?.height, DEFAULT_CANVAS.height);
  const rawShirt = String(canvasData?.shirtType || shirtTypeFallback || "tshirt");
  const shirtType = (rawShirt === "polo" || rawShirt === "hoodie") ? rawShirt : "tshirt";
  const cfg = PRINT_AREA_CONFIG[shirtType][side];
  const printAreaPx = { top: cfg.top * ch, left: cfg.left * cw, width: cfg.width * cw, height: cfg.height * ch };
  const def = DEFAULT_REAL_SIZE_CM[side];
  const realW = (viTriIn && viTriIn.maxWidthCm) || def.width;
  const realH = (viTriIn && viTriIn.maxHeightCm) || def.height;
  const scaleX = realW / printAreaPx.width;
  const scaleY = realH / printAreaPx.height;
  const widthCm  = boundingBox.width  * scaleX;
  const heightCm = boundingBox.height * scaleY;
  const topCm    = (boundingBox.y - printAreaPx.top)  * scaleY;
  const leftCm   = (boundingBox.x - printAreaPx.left) * scaleX;
  return {
    summary: `In cách cổ ${_formatCm(topCm)}, chiều rộng hình ${_formatCm(widthCm)}`,
    detail:  `Cách mép trái vùng in ${_formatCm(leftCm)}, chiều cao hình ${_formatCm(heightCm)}`,
  };
}

async function xuatDonCanIn({ tu_khoa, trang_thai, tu_ngay, den_ngay }) {
  const { menhDeWhere, thamSo } = xayDungDieuKienDonCanIn({
    tu_khoa, trang_thai, tu_ngay, den_ngay,
  });

  const sql = `
    SELECT
      co.orderCode         AS maDon,
      cd.id                AS thietKeId,
      a.fullName           AS tenKhachHang,
      a.phone              AS soDienThoai,
      p.name               AS tenSanPham,
      p.shirtType          AS shirtType,
      pv.sku               AS sku,
      pv.color             AS mauSac,
      pv.size              AS kichCo,
      oi.quantity          AS soLuong,
      (
        SELECT GROUP_CONCAT(DISTINCT pp.name ORDER BY pp.id SEPARATOR ', ')
        FROM DesignPrintPosition dpp
        JOIN PrintPosition pp ON pp.id = dpp.printPositionId
        WHERE dpp.designId = oi.designId
      )                    AS viTriIn,
      ${BIEU_THUC_TRANG_THAI_DON_IN} AS status,
      co.createdAt         AS ngayDatDon,
      cd.printFileUrlFront AS urlFileInTruoc,
      cd.printFileUrlBack  AS urlFileInSau,
      cd.canvasData        AS canvasData,
      (
        SELECT pp2.maxWidth
        FROM DesignPrintPosition dpp2
        JOIN PrintPosition pp2 ON pp2.id = dpp2.printPositionId
        WHERE dpp2.designId = oi.designId AND pp2.code = 'MAT_TRUOC'
        LIMIT 1
      )                    AS maxWidthFront,
      (
        SELECT pp2.maxHeight
        FROM DesignPrintPosition dpp2
        JOIN PrintPosition pp2 ON pp2.id = dpp2.printPositionId
        WHERE dpp2.designId = oi.designId AND pp2.code = 'MAT_TRUOC'
        LIMIT 1
      )                    AS maxHeightFront,
      (
        SELECT pp2.maxWidth
        FROM DesignPrintPosition dpp2
        JOIN PrintPosition pp2 ON pp2.id = dpp2.printPositionId
        WHERE dpp2.designId = oi.designId AND pp2.code = 'MAT_SAU'
        LIMIT 1
      )                    AS maxWidthBack,
      (
        SELECT pp2.maxHeight
        FROM DesignPrintPosition dpp2
        JOIN PrintPosition pp2 ON pp2.id = dpp2.printPositionId
        WHERE dpp2.designId = oi.designId AND pp2.code = 'MAT_SAU'
        LIMIT 1
      )                    AS maxHeightBack
    FROM OrderProduction op
    JOIN OrderItem oi ON oi.id = op.orderItemId
    JOIN CustomerOrder co ON co.id = oi.orderId
    JOIN Account a ON a.id = co.userId
    JOIN ProductVariant pv ON pv.id = oi.variantId
    JOIN Product p ON p.id = pv.productId
    LEFT JOIN CustomDesign cd ON cd.id = oi.designId
    ${menhDeWhere}
    ORDER BY co.createdAt DESC, op.id DESC
    LIMIT ${GIOI_HAN_DONG_XUAT_EXCEL}
  `;
  const [rows] = await db.pool.query(sql, thamSo);

  return taoBaoCaoExcel(`don-can-in-${new Date().toISOString().slice(0, 10)}.xlsx`, [
    {
      name: "Đơn cần in",
      headers: [
        "Mã đơn", "Mã thiết kế", "Khách hàng", "Số điện thoại",
        "Sản phẩm", "SKU", "Màu", "Size", "Số lượng", "Vị trí in",
        "Thông số in",
        "Trạng thái", "Ngày đặt đơn", "Link ảnh in mặt trước", "Link ảnh in mặt sau",
      ],
      //           [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7] [8]  [9]  [10] [11] [12]  [13] [14]
      columnWidths: [16,  14,  22,  16,  26,  18,  14,   8,  10,  20,  46,  18,  15,  42,  42],
      wrapCols: [10],  // "Thông số in" – nhiều dòng
      rows: rows.map((row) => {
        // Parse canvasData
        let canvasData = null;
        if (row.canvasData) {
          try {
            canvasData = typeof row.canvasData === "string"
              ? JSON.parse(row.canvasData)
              : row.canvasData;
          } catch { canvasData = null; }
        }

        // Tính thông số in mặt trước
        const viTriFront = row.maxWidthFront != null ? {
          maxWidthCm: Number(row.maxWidthFront),
          maxHeightCm: Number(row.maxHeightFront),
        } : null;
        const viTriBack = row.maxWidthBack != null ? {
          maxWidthCm: Number(row.maxWidthBack),
          maxHeightCm: Number(row.maxHeightBack),
        } : null;

        const frontSpec = tinhThongSoInCm(canvasData, "front", viTriFront, row.shirtType);
        const backSpec  = tinhThongSoInCm(canvasData, "back",  viTriBack,  row.shirtType);

        const thongSoInParts = [];
        if (frontSpec) {
          thongSoInParts.push(`[Mặt trước] ${frontSpec.summary}`);
          thongSoInParts.push(frontSpec.detail);
        }
        if (backSpec) {
          thongSoInParts.push(`[Mặt sau] ${backSpec.summary}`);
          thongSoInParts.push(backSpec.detail);
        }
        const thongSoIn = thongSoInParts.join("\n") || "";

        return [
          row.maDon,
          row.thietKeId ? `TK-${String(row.thietKeId).padStart(4, "0")}` : "Không có",
          row.tenKhachHang || "",
          row.soDienThoai || "",
          row.tenSanPham || "",
          row.sku || "",
          row.mauSac || "",
          row.kichCo || "",
          Number(row.soLuong),
          row.viTriIn || "Chưa xác định",
          thongSoIn,
          MAP_TRANG_THAI_DON_IN_DB_FE[row.status] || "cho_gui_xuong",
          formatNgay(row.ngayDatDon),
          row.urlFileInTruoc || "",
          row.urlFileInSau || "",
        ];
      }),
    },
  ]);
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
  layCanvasDataThietKe,
  suaThietKeChoKhach,
  goKhachHangKhoiThietKe,
  doiKhachHangThietKe,
  layBienTheTaoThietKe,
  taoThietKeChoKhach,
  duyetThietKe,
  yeuCauChinhSua,
  layDanhSachDonCanIn,
  layTechpackDonCanIn,
  xuatDonCanIn,
  capNhatTrangThaiDonIn,
  layDanhSachSticker,
  themSticker,
  xoaSticker,
  layDanhSachViTriIn,
};
