/**
 * order.service.js – Xử lý logic nghiệp vụ đơn hàng (phía Admin).
 * Thực hiện truy vấn MySQL và trả về dữ liệu đã được định dạng cho Frontend.
 */

const db = require("../../database/mysql");
const {
  taoLinkThanhToanVnpay,
  taoMaGiaoDichVnpayMoi,
} = require("../payments/vnpay.service");

const DEPOSIT_PERCENT = 50;
const ACTION_CUSTOMER_CREATED = "Khách hàng đặt đơn";
const ACTION_ADMIN_CREATED = "Tạo đơn cho khách";
const CREATION_ACTIONS = new Set([
  "CREATED",
  ACTION_CUSTOMER_CREATED,
  ACTION_ADMIN_CREATED,
]);

function tinhThongTinThanhToan(totalAmount, paymentMethod, paymentType) {
  const depositAmount =
    paymentType === "DEPOSIT"
      ? Math.round(totalAmount * (DEPOSIT_PERCENT / 100))
      : 0;
  const codAmount =
    (paymentMethod === "COD" || paymentType === "DEPOSIT") 
      ? Math.max(0, totalAmount - depositAmount) 
      : 0;
  const paymentAmount =
    paymentType === "DEPOSIT"
      ? depositAmount
      : paymentMethod === "COD"
        ? codAmount
        : totalAmount;

  return {
    depositPercent: DEPOSIT_PERCENT,
    depositAmount,
    codAmount,
    paymentAmount,
  };
}

// =====================================================================
// MAP TRẠNG THÁI: DB (tiếng Anh) → Frontend (tiếng Việt snake_case)
// =====================================================================
const MAP_TRANG_THAI_DB_SANG_FE = {
  PENDING: "cho_xac_nhan",
  CONFIRMED: "da_xac_nhan",
  PROCESSING: "dang_xu_ly_in",
  PRINTING: "dang_xu_ly_in",
  READY_TO_SHIP: "cho_giao",
  SHIPPING: "dang_giao",
  COMPLETED: "hoan_tat",
  CANCELLED: "da_huy",
};

// MAP ngược lại: Frontend → DB (dùng khi nhận request cập nhật)
const MAP_TRANG_THAI_FE_SANG_DB = {
  cho_xac_nhan: "PENDING",
  da_xac_nhan: "CONFIRMED",
  dang_xu_ly_in: "PROCESSING",
  cho_giao: "READY_TO_SHIP",
  dang_giao: "SHIPPING",
  hoan_tat: "COMPLETED",
  da_huy: "CANCELLED",
};

const MAP_TEN_TRANG_THAI_DB = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý in",
  PRINTING: "Đang xử lý in",
  READY_TO_SHIP: "Chờ giao",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

function layTenTrangThai(status) {
  return MAP_TEN_TRANG_THAI_DB[status] || status || "Không rõ";
}

function laPhanDiaChiTam(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "khac" || normalized === "kh\u00e1c";
}

function ghepDiaChiGiaoHang({ addressLine, ward, district, city }) {
  const parts = [addressLine, ward, district, city]
    .map((part) => String(part || "").trim())
    .filter((part) => part && !laPhanDiaChiTam(part));

  return parts.length > 0 ? parts.join(", ") : "Chưa có địa chỉ";
}

function taoActorHistory(actor, fallbackName = "Hệ thống") {
  return {
    actorId: null,
    actorRole: actor?.role || "SYSTEM",
    actorName: actor?.fullName || actor?.email || fallbackName,
  };
}

function taoLichSuTaoDon(actor) {
  const action =
    actor?.role === "CUSTOMER"
      ? ACTION_CUSTOMER_CREATED
      : ACTION_ADMIN_CREATED;

  return { action, note: action };
}

function laHanhDongTaoDon(action) {
  return CREATION_ACTIONS.has(action);
}

function chuanHoaGiaTriSoSanh(value) {
  return String(value || "").trim().toLowerCase();
}

function parseGatewayResponse(gatewayResponse) {
  if (!gatewayResponse) return {};
  if (typeof gatewayResponse === "object") return gatewayResponse;

  try {
    return JSON.parse(gatewayResponse);
  } catch {
    return {};
  }
}

function taoMoTaHistory({ action, fromStatus, toStatus, note }) {
  if (note) return note;

  if (laHanhDongTaoDon(action)) {
    return action === "CREATED" ? "Tạo đơn hàng mới" : action;
  }

  if (action === "CANCELLED") {
    return `Đã hủy đơn hàng${fromStatus ? ` từ trạng thái ${layTenTrangThai(fromStatus)}` : ""}`;
  }

  if (action === "STATUS_CHANGED") {
    return `Cập nhật trạng thái: ${layTenTrangThai(fromStatus)} → ${layTenTrangThai(toStatus)}`;
  }

  return layTenTrangThai(toStatus);
}

async function ghiOrderHistory(
  executor,
  { orderId, fromStatus = null, toStatus, action, actor, note = null }
) {
  const actorInfo = taoActorHistory(actor);

  await executor.query(
    `INSERT INTO OrderHistory
       (orderId, fromStatus, toStatus, action, actorId, actorRole, actorName, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      fromStatus,
      toStatus,
      action,
      actorInfo.actorId,
      actorInfo.actorRole,
      actorInfo.actorName,
      note,
    ]
  );
}

function xayDungTimelineTuHistory(rowsHistory, trangThaiHienTai, donHang = null) {
  const timeline = rowsHistory.map((row, index) => ({
    moTa: taoMoTaHistory(row),
    thoiGian: formatNgayGio(row.createdAt),
    nguoiThucHien: row.actorName || row.actorRole || "Hệ thống",
    laDangHienTai: index === 0 && row.toStatus === trangThaiHienTai,
  }));

  if (donHang && !rowsHistory.some((row) => laHanhDongTaoDon(row.action))) {
    timeline.push({
      moTa: "Tạo đơn hàng mới",
      thoiGian: formatNgayGio(donHang.createdAt),
      nguoiThucHien: "Hệ thống",
      laDangHienTai: false,
    });
  }

  return timeline;
}

/**
 * Hàm định dạng ngày giờ sang chuỗi "HH:mm, DD/MM/YYYY"
 */
function formatNgayGio(date) {
  if (!date) return null;
  const d = new Date(date);
  const gio = String(d.getHours()).padStart(2, "0");
  const phut = String(d.getMinutes()).padStart(2, "0");
  const ngay = String(d.getDate()).padStart(2, "0");
  const thang = String(d.getMonth() + 1).padStart(2, "0");
  const nam = d.getFullYear();
  return `${gio}:${phut}, ${ngay}/${thang}/${nam}`;
}

function laNgayLocHopLe(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [nam, thang, ngay] = value.split("-").map(Number);
  const date = new Date(Date.UTC(nam, thang - 1, ngay));

  return (
    date.getUTCFullYear() === nam &&
    date.getUTCMonth() === thang - 1 &&
    date.getUTCDate() === ngay
  );
}

/**
 * Fallback cho đơn hàng cũ chưa có record trong OrderHistory.
 * Đơn mới/cập nhật mới sẽ dùng OrderHistory để hiển thị lịch sử thật.
 */
function xayDungTimeline(donHang, thanhToan) {
  const timeline = [];
  const trangThai = donHang.status;

  // Bước mới nhất (bước đang hiện tại) luôn ở trên cùng
  if (trangThai === "CANCELLED" && donHang.cancelReason) {
    timeline.push({
      moTa: `Đã hủy đơn hàng – Lý do: ${donHang.cancelReason}`,
      thoiGian: formatNgayGio(donHang.updatedAt),
      nguoiThucHien: "Admin",
      laDangHienTai: true,
    });
  } else if (trangThai === "COMPLETED" && donHang.deliveredAt) {
    timeline.push({
      moTa: "Giao hàng thành công – Đơn hàng hoàn tất",
      thoiGian: formatNgayGio(donHang.deliveredAt),
      nguoiThucHien: "Hệ thống",
      laDangHienTai: true,
    });
  } else if (
    (trangThai === "SHIPPING" || trangThai === "COMPLETED") &&
    donHang.shippedAt
  ) {
    timeline.push({
      moTa: `Đang giao hàng${donHang.trackingCode ? " – Mã vận đơn: " + donHang.trackingCode : ""}`,
      thoiGian: formatNgayGio(donHang.shippedAt),
      nguoiThucHien: donHang.shippingCarrier || "Đơn vị vận chuyển",
      laDangHienTai: trangThai === "SHIPPING",
    });
  } else if (["READY_TO_SHIP", "PRINTING", "PROCESSING"].includes(trangThai)) {
    timeline.push({
      moTa:
        trangThai === "READY_TO_SHIP"
          ? "Chờ giao hàng – Đơn đã đóng gói"
          : trangThai === "PRINTING"
            ? "Đang xử lý in – Đã xuất thông số"
            : "Đang xử lý in – Chờ xuất thông số",
      thoiGian: formatNgayGio(donHang.updatedAt),
      nguoiThucHien: "Admin",
      laDangHienTai: true,
    });
  } else if (trangThai === "CONFIRMED") {
    timeline.push({
      moTa: "Đã xác nhận đơn hàng",
      thoiGian: formatNgayGio(donHang.updatedAt),
      nguoiThucHien: "Admin",
      laDangHienTai: true,
    });
  } else {
    // PENDING
    timeline.push({
      moTa: ACTION_CUSTOMER_CREATED,
      thoiGian: formatNgayGio(donHang.createdAt),
      nguoiThucHien: "Khách hàng",
      laDangHienTai: true,
    });
  }

  // Thêm mốc đã thanh toán (nếu có)
  if (thanhToan && thanhToan.paidAt && thanhToan.status === "COMPLETED") {
    timeline.push({
      moTa: `Đã thanh toán qua ${thanhToan.paymentMethod}`,
      thoiGian: formatNgayGio(thanhToan.paidAt),
      nguoiThucHien: "Hệ thống",
      laDangHienTai: false,
    });
  }

  if (trangThai !== "PENDING") {
    timeline.push({
      moTa: ACTION_CUSTOMER_CREATED,
      thoiGian: formatNgayGio(donHang.createdAt),
      nguoiThucHien: "Khách hàng",
      laDangHienTai: false,
    });
  }

  return timeline;
}

// =====================================================================
// SERVICE 1: Lấy thống kê KPI (4 thẻ đầu trang)
// =====================================================================
async function layThongKe() {
  // Đếm đơn mới (PENDING)
  const [rowsDonMoi] = await db.pool.query(
    "SELECT COUNT(*) AS so_luong FROM CustomerOrder WHERE status = 'PENDING'"
  );

  // Đếm đơn đang xử lý in (PROCESSING + PRINTING)
  const [rowsDangIn] = await db.pool.query(
    "SELECT COUNT(*) AS so_luong FROM CustomerOrder WHERE status IN ('PROCESSING', 'PRINTING')"
  );

  // Đếm đơn chờ thanh toán: có Payment ở trạng thái PENDING
  const [rowsChoThanhToan] = await db.pool.query(
    `SELECT COUNT(DISTINCT co.id) AS so_luong
     FROM CustomerOrder co
     JOIN Payment p ON p.orderId = co.id
     WHERE p.status = 'PENDING'`
  );

  // Đếm đơn hoàn tất hôm nay
  const [rowsHoanTatHomNay] = await db.pool.query(
    `SELECT COUNT(*) AS so_luong
     FROM CustomerOrder
     WHERE status = 'COMPLETED'
       AND DATE(updatedAt) = CURDATE()`
  );

  return {
    donMoi: rowsDonMoi[0].so_luong,
    dangXuLyIn: rowsDangIn[0].so_luong,
    choThanhToan: rowsChoThanhToan[0].so_luong,
    hoanTatHomNay: rowsHoanTatHomNay[0].so_luong,
  };
}

// =====================================================================
// SERVICE 2: Lấy danh sách đơn hàng (phân trang + lọc)
// =====================================================================
async function layDanhSachDonHang({
  trang,
  soMoiTrang,
  trangThai,
  thanhToan,
  thoiGian,
  tuNgay,
  denNgay,
  kieuNgay,
  gio,
  loai,
  tuKhoa,
}) {
  const trangHienTai = parseInt(trang) || 1;
  const soMoi = parseInt(soMoiTrang) || 10;
  const offset = (trangHienTai - 1) * soMoi;

  // Xây dựng điều kiện WHERE động
  const dieuKien = [];
  const thamSo = [];

  // Lọc theo trạng thái (FE gửi key FE, cần chuyển sang DB)
  if (trangThai && trangThai !== "tat_ca") {
    // "dang_xu_ly_in" trên FE = PROCESSING + PRINTING trên DB
    if (trangThai === "dang_xu_ly_in") {
      dieuKien.push("co.status IN ('PROCESSING', 'PRINTING')");
    } else {
      const statusDB = MAP_TRANG_THAI_FE_SANG_DB[trangThai];
      if (statusDB) {
        dieuKien.push("co.status = ?");
        thamSo.push(statusDB);
      }
    }
  }

  // Lọc theo thanh toán
  if (thanhToan === "da_thanh_toan") {
    dieuKien.push("p.status = 'COMPLETED'");
  } else if (thanhToan === "cho_thanh_toan") {
    dieuKien.push("p.status = 'PENDING'");
  }

  // Lọc theo thời gian. Ưu tiên khoảng ngày cụ thể từ RangePicker.
  const tuNgayHopLe = laNgayLocHopLe(tuNgay) ? tuNgay : null;
  const denNgayHopLe = laNgayLocHopLe(denNgay) ? denNgay : null;
  const cotNgay = kieuNgay === "ngay_hoan_tat" ? "co.updatedAt" : "co.createdAt";
  if (tuNgayHopLe && denNgayHopLe) {
    const [ngayBatDau, ngayKetThuc] =
      tuNgayHopLe <= denNgayHopLe
        ? [tuNgayHopLe, denNgayHopLe]
        : [denNgayHopLe, tuNgayHopLe];

    dieuKien.push(`${cotNgay} >= ? AND ${cotNgay} < DATE_ADD(?, INTERVAL 1 DAY)`);
    thamSo.push(ngayBatDau, ngayKetThuc);
  } else if (tuNgayHopLe) {
    dieuKien.push(`${cotNgay} >= ?`);
    thamSo.push(tuNgayHopLe);
  } else if (denNgayHopLe) {
    dieuKien.push(`${cotNgay} < DATE_ADD(?, INTERVAL 1 DAY)`);
    thamSo.push(denNgayHopLe);
  } else if (thoiGian === "hom_nay") {
    dieuKien.push("DATE(co.createdAt) = CURDATE()");
  } else if (thoiGian === "tuan_nay") {
    dieuKien.push("YEARWEEK(co.createdAt, 1) = YEARWEEK(CURDATE(), 1)");
  } else if (thoiGian === "thang_nay") {
    dieuKien.push("MONTH(co.createdAt) = MONTH(CURDATE()) AND YEAR(co.createdAt) = YEAR(CURDATE())");
  }

  if (
    kieuNgay === "ngay_hoan_tat" &&
    typeof gio === "string" &&
    /^(?:[01]\d|2[0-3])$/.test(gio)
  ) {
    dieuKien.push(`DATE_FORMAT(${cotNgay}, '%H') = ?`);
    thamSo.push(gio);
  }

  // Lọc theo loại đơn (custom_design hay ao_mau)
  if (loai === "custom_design") {
    dieuKien.push(
      "EXISTS (SELECT 1 FROM OrderItem oiLoai WHERE oiLoai.orderId = co.id AND oiLoai.designId IS NOT NULL)"
    );
  } else if (loai === "ao_mau") {
    dieuKien.push(
      "NOT EXISTS (SELECT 1 FROM OrderItem oiLoai WHERE oiLoai.orderId = co.id AND oiLoai.designId IS NOT NULL)"
    );
  }

  // Tìm kiếm theo từ khóa (mã đơn, tên tài khoản hoặc tên người nhận của đơn)
  if (tuKhoa && tuKhoa.trim()) {
    dieuKien.push("(co.orderCode LIKE ? OR a.fullName LIKE ? OR ua.recipientName LIKE ?)");
    thamSo.push(`%${tuKhoa.trim()}%`, `%${tuKhoa.trim()}%`, `%${tuKhoa.trim()}%`);
  }

  const menh_de_where = dieuKien.length > 0 ? "WHERE " + dieuKien.join(" AND ") : "";

  // Query đếm tổng số bản ghi (để tính tổng trang)
  const sqlDem = `
    SELECT COUNT(DISTINCT co.id) AS tong_so
    FROM CustomerOrder co
    JOIN Account a ON a.id = co.userId
    LEFT JOIN UserAddress ua ON ua.id = co.addressId
    LEFT JOIN Payment p ON p.orderId = co.id
    LEFT JOIN OrderItem oi ON oi.orderId = co.id
    ${menh_de_where}
  `;
  const [rowsDem] = await db.pool.query(sqlDem, thamSo);
  const tongSo = rowsDem[0].tong_so;

  // Query lấy dữ liệu trang hiện tại
  const sqlData = `
    SELECT
      co.id,
      co.orderCode,
      co.createdAt,
      co.totalAmount,
      co.status,
      co.shippedAt,
      COALESCE(NULLIF(ua.recipientName, ''), a.fullName) AS tenKhachHang,
      COALESCE(NULLIF(ua.phone, ''), a.phone)            AS sdtKhachHang,
      p.paymentMethod,
      p.status         AS trangThaiThanhToan,
      p.paidAt,
      -- Lấy sản phẩm đầu tiên trong đơn (đơn thường chỉ có 1 loại áo)
      prFirst.name          AS tenSanPham,
      pvFirst.color         AS mauSac,
      pvFirst.size          AS kichCo,
      pi_img.imageUrl  AS anhUrl,
      oiFirst.designId,
      -- Kiểm tra đơn có nhiều size không
      (
        SELECT GROUP_CONCAT(DISTINCT pvSize.size ORDER BY pvSize.size SEPARATOR ', ')
        FROM OrderItem oiSize
        JOIN ProductVariant pvSize ON pvSize.id = oiSize.variantId
        WHERE oiSize.orderId = co.id
      ) AS tatCaSize,
      (
        SELECT COUNT(*)
        FROM OrderItem oiCount
        WHERE oiCount.orderId = co.id
      ) AS soDongSanPham,
      (
        SELECT COALESCE(SUM(oiQty.quantity), 0)
        FROM OrderItem oiQty
        WHERE oiQty.orderId = co.id
      ) AS tongSoLuongSanPham,
      EXISTS (
        SELECT 1
        FROM OrderItem oiCustom
        WHERE oiCustom.orderId = co.id AND oiCustom.designId IS NOT NULL
      ) AS coThietKe
    FROM CustomerOrder co
    JOIN Account a ON a.id = co.userId
    LEFT JOIN UserAddress ua ON ua.id = co.addressId
    LEFT JOIN Payment p ON p.orderId = co.id
    LEFT JOIN OrderItem oiFirst ON oiFirst.id = (
      SELECT oi2.id
      FROM OrderItem oi2
      WHERE oi2.orderId = co.id
      ORDER BY oi2.id ASC
      LIMIT 1
    )
    LEFT JOIN ProductVariant pvFirst ON pvFirst.id = oiFirst.variantId
    LEFT JOIN Product prFirst ON prFirst.id = pvFirst.productId
    LEFT JOIN ProductImage pi_img ON pi_img.productId = prFirst.id AND pi_img.isPrimary = 1
    ${menh_de_where}
    ORDER BY co.createdAt DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.pool.query(sqlData, [...thamSo, soMoi, offset]);

  // Định dạng dữ liệu trả về cho Frontend
  const danhSach = rows.map((row) => {
    const loaiDon = row.coThietKe ? "custom_design" : "ao_mau";
    const daThanh = row.trangThaiThanhToan === "COMPLETED";
    const soDongSanPham = Number(row.soDongSanPham || 0);

    return {
      id: row.id,
      maDonHang: row.orderCode,
      ngayTao: formatNgayGio(row.createdAt),
      tenKhachHang: row.tenKhachHang,
      sdtKhachHang: row.sdtKhachHang,
      sanPham: {
        ten: row.tenSanPham || "Sản phẩm",
        loai: loaiDon,
        sizes: row.tatCaSize ? `Cỡ ${row.tatCaSize}` : `Cỡ ${row.kichCo || ""}`,
        anhUrl: row.anhUrl || null,
        soSanPhamKhac: Math.max(0, soDongSanPham - 1),
        tongSoLuong: Number(row.tongSoLuongSanPham || 0),
      },
      tongTienVnd: Number(row.totalAmount),
      thanhToan: {
        phuongThuc: row.paymentMethod || "COD",
        daThanh: daThanh,
      },
      trangThai: MAP_TRANG_THAI_DB_SANG_FE[row.status] || "cho_xac_nhan",
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
// SERVICE 3: Lấy chi tiết 1 đơn hàng (dùng cho Drawer)
// =====================================================================
async function layChiTietDonHang(id) {
  // Query đơn hàng + khách hàng + địa chỉ + thanh toán
  const [rowsDonHang] = await db.pool.query(
    `SELECT
       co.*,
       COALESCE(NULLIF(ua.recipientName, ''), a.fullName) AS tenKhachHang,
       COALESCE(NULLIF(ua.phone, ''), a.phone)            AS sdtKhachHang,
       a.email      AS emailKhachHang,
       ua.recipientName,
       ua.phone     AS sdtNhanHang,
       ua.addressLine,
       ua.ward,
       ua.district,
       ua.city,
       p.paymentMethod,
       p.paymentType,
       p.amount      AS paymentAmount,
       p.status     AS trangThaiThanhToan,
       p.paidAt,
       p.transactionId,
       p.gatewayResponse
     FROM CustomerOrder co
     JOIN Account a ON a.id = co.userId
     LEFT JOIN UserAddress ua ON ua.id = co.addressId
     LEFT JOIN Payment p ON p.orderId = co.id
     WHERE co.id = ?
     LIMIT 1`,
    [id]
  );

  if (!rowsDonHang || rowsDonHang.length === 0) {
    const err = new Error("Không tìm thấy đơn hàng");
    err.statusCode = 404;
    throw err;
  }

  const donHang = rowsDonHang[0];

  // Query các mục trong đơn (sản phẩm, thiết kế)
  const [rowsItems] = await db.pool.query(
    `SELECT
       oi.id,
       oi.quantity,
       oi.unitPrice,
       oi.designFee,
       oi.lineTotal,
       oi.productionStatus,
       oi.designId,
       oi.variantId,
       pv.productId,
       pv.color,
       pv.size,
       pv.sku,
       pr.name AS tenSanPham,
       pi_img.imageUrl AS anhUrl,
       cd.previewUrl AS anhXemTruocThietKe,
       cd.baseColor,
       (
         SELECT GROUP_CONCAT(DISTINCT pp2.name ORDER BY pp2.name SEPARATOR ', ')
         FROM DesignPrintPosition dpp2
         JOIN PrintPosition pp2 ON pp2.id = dpp2.printPositionId
         WHERE dpp2.designId = cd.id
       ) AS viTriIn,
       (
         SELECT GROUP_CONCAT(DISTINCT pm2.name ORDER BY pm2.name SEPARATOR ', ')
         FROM DesignPrintMethod dpm2
         JOIN PrintMethod pm2 ON pm2.id = dpm2.printMethodId
         WHERE dpm2.designId = cd.id
       ) AS phuongPhapIn
     FROM OrderItem oi
     JOIN ProductVariant pv ON pv.id = oi.variantId
     JOIN Product pr ON pr.id = pv.productId
     LEFT JOIN ProductImage pi_img ON pi_img.productId = pr.id AND pi_img.isPrimary = 1
     LEFT JOIN CustomDesign cd ON cd.id = oi.designId
     WHERE oi.orderId = ?
     ORDER BY oi.id ASC`,
    [id]
  );

  // Lấy item đầu tiên để hiển thị thông tin sản phẩm chính
  const itemDau = rowsItems[0] || {};
  const coThietKe = rowsItems.some((item) => Boolean(item.designId));
  const loaiDon = coThietKe ? "custom_design" : "ao_mau";

  // Ghép địa chỉ giao hàng
  const diaChiGiaoHang = ghepDiaChiGiaoHang(donHang);

  // Ghép sizes từ tất cả items
  const tatCaSize = [...new Set(rowsItems.map((i) => i.size).filter(Boolean))].join(", ");

  // Tính tạm tính (subtotal = tổng unitPrice * quantity của các item)
  const tamTinh = rowsItems.reduce((tong, item) => tong + Number(item.unitPrice) * item.quantity, 0);
  const tongPhiThietKe = rowsItems.reduce((tong, item) => tong + Number(item.designFee || 0), 0);
  const items = rowsItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    designId: item.designId || null,
    tenSanPham: item.tenSanPham || "Sản phẩm",
    mauSac: item.color || "",
    kichCo: item.size || "",
    sku: item.sku || "",
    soLuong: Number(item.quantity || 0),
    donGiaVnd: Number(item.unitPrice || 0),
    phiThietKeVnd: Number(item.designFee || 0),
    thanhTienVnd: Number(item.lineTotal || 0),
    loai: item.designId ? "custom_design" : "ao_mau",
    anhUrl: item.anhUrl || null,
    anhXemTruocThietKe: item.anhXemTruocThietKe || null,
    viTriIn: item.viTriIn || null,
    phuongPhapIn: item.phuongPhapIn || null,
  }));

  const vnpayGatewayResponse = parseGatewayResponse(donHang.gatewayResponse);
  const thanhToan = {
    phuongThuc: donHang.paymentMethod || "COD",
    loai: donHang.paymentType || "FULL",
    soTienVnd: Number(donHang.paymentAmount || 0),
    daThanh: donHang.trangThaiThanhToan === "COMPLETED",
    paidAt: donHang.paidAt,
    status: donHang.trangThaiThanhToan,
    transactionId: donHang.transactionId || null,
    paymentUrl:
      donHang.paymentMethod === "VNPAY"
        ? vnpayGatewayResponse.paymentUrl || null
        : null,
    expiresAt:
      donHang.paymentMethod === "VNPAY"
        ? vnpayGatewayResponse.expiresAt || null
        : null,
  };

  const [rowsHistory] = await db.pool.query(
    `SELECT id, orderId, fromStatus, toStatus, action, actorRole, actorName, note, createdAt
     FROM OrderHistory
     WHERE orderId = ?
     ORDER BY createdAt DESC, id DESC`,
    [id]
  );
  const timeline = rowsHistory.length > 0
    ? xayDungTimelineTuHistory(rowsHistory, donHang.status, donHang)
    : xayDungTimeline(donHang, thanhToan);

  return {
    id: donHang.id,
    maDonHang: donHang.orderCode,
    ngayTao: formatNgayGio(donHang.createdAt),
    tenKhachHang: donHang.tenKhachHang,
    sdtKhachHang: donHang.sdtKhachHang,
    emailKhachHang: donHang.emailKhachHang,
    sanPham: {
      ten: itemDau.tenSanPham || "Sản phẩm",
      loai: loaiDon,
      sizes: tatCaSize ? `Cỡ ${tatCaSize}` : "",
      anhUrl: itemDau.anhUrl || null,
      soSanPhamKhac: Math.max(0, items.length - 1),
      tongSoLuong: items.reduce((tong, item) => tong + item.soLuong, 0),
    },
    items,
    tongTienVnd: Number(donHang.totalAmount),
    tamTinhVnd: tamTinh,
    phiThietKeVnd: tongPhiThietKe,
    phiVanChuyenVnd: Number(donHang.shippingFee || 0),
    giamGiaVnd: Number(donHang.discountAmount || 0),
    tienCocVnd: Number(donHang.depositAmount || 0),
    tienThuHoCodVnd: Number(donHang.codAmount || 0),
    thanhToan,
    trangThai: MAP_TRANG_THAI_DB_SANG_FE[donHang.status] || "cho_xac_nhan",
    diaChiGiaoHang,
    tenNguoiNhanGiaoHang: donHang.recipientName || "",
    sdtNguoiNhan: donHang.sdtNhanHang || "",
    addressLineRaw: donHang.addressLine || "",
    donViVanChuyen: donHang.shippingCarrier || "Chưa có thông tin",
    maVanDon: donHang.trackingCode || null,
    lyDoHuy: donHang.cancelReason || null,
    viTriIn: itemDau.viTriIn || null,
    phuongPhapIn: itemDau.phuongPhapIn || null,
    anhXemTruocThietKe: itemDau.anhXemTruocThietKe || null,
    thoiGianXuLy: timeline,
  };
}

// =====================================================================
// SERVICE 4: Cập nhật trạng thái đơn hàng
// =====================================================================
async function capNhatTrangThai(id, trangThaiFE, actor, shippingInfo = {}) {
  // Chuyển từ FE key sang DB status
  const trangThaiDB = MAP_TRANG_THAI_FE_SANG_DB[trangThaiFE];
  if (!trangThaiDB) {
    const err = new Error(`Trạng thái "${trangThaiFE}" không hợp lệ`);
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra đơn hàng tồn tại
  const [rows] = await db.pool.query(
    "SELECT id, status FROM CustomerOrder WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) {
    const err = new Error("Không tìm thấy đơn hàng");
    err.statusCode = 404;
    throw err;
  }

  const donHienTai = rows[0];
  if (donHienTai.status === trangThaiDB) {
    return { id: Number(id), trangThai: trangThaiFE };
  }

  if (trangThaiDB === "CANCELLED") {
    const err = new Error("Vui lòng sử dụng chức năng hủy đơn hàng");
    err.statusCode = 400;
    throw err;
  }

  // Không cho phép cập nhật đơn đã hủy hoặc đã hoàn tất
  if (donHienTai.status === "CANCELLED") {
    const err = new Error("Không thể cập nhật đơn hàng đã hủy");
    err.statusCode = 400;
    throw err;
  }
  if (donHienTai.status === "COMPLETED" && trangThaiDB !== "CANCELLED") {
    const err = new Error("Không thể thay đổi trạng thái đơn đã hoàn tất");
    err.statusCode = 400;
    throw err;
  }

  const capNhatThem = {};
  if (trangThaiDB === "SHIPPING") {
    capNhatThem.shippedAt = new Date();
    if (shippingInfo.shippingCarrier) {
      capNhatThem.shippingCarrier = shippingInfo.shippingCarrier;
    }
    if (shippingInfo.trackingCode) {
      capNhatThem.trackingCode = shippingInfo.trackingCode;
    }
  }
  if (trangThaiDB === "COMPLETED") {
    capNhatThem.deliveredAt = new Date();
  }

  const cotCapNhatThem = Object.keys(capNhatThem);
  const setClause = ["status = ?", ...cotCapNhatThem.map((k) => `${k} = ?`)].join(", ");

  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE CustomerOrder SET ${setClause} WHERE id = ?`,
      [trangThaiDB, ...Object.values(capNhatThem), id]
    );

    // Cập nhật productionStatus trong OrderItem nếu cần
    if (["PROCESSING", "PRINTING"].includes(trangThaiDB)) {
      await conn.query(
        "UPDATE OrderItem SET productionStatus = ? WHERE orderId = ?",
        [trangThaiDB, id]
      );
    }

    let noteString = `Cập nhật trạng thái: ${layTenTrangThai(donHienTai.status)} → ${layTenTrangThai(trangThaiDB)}`;
    if (trangThaiDB === "SHIPPING" && capNhatThem.shippingCarrier) {
      noteString += ` (ĐVVC: ${capNhatThem.shippingCarrier}`;
      if (capNhatThem.trackingCode) {
        noteString += ` - Mã: ${capNhatThem.trackingCode}`;
      }
      noteString += `)`;
    }

    await ghiOrderHistory(conn, {
      orderId: Number(id),
      fromStatus: donHienTai.status,
      toStatus: trangThaiDB,
      action: "STATUS_CHANGED",
      actor,
      note: noteString,
    });

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  return { id: Number(id), trangThai: trangThaiFE };
}

// =====================================================================
// SERVICE 5: Hủy đơn hàng
// =====================================================================
async function huyDonHang(id, lyDo, actor) {
  const lyDoHuy = lyDo || "Không có lý do";
  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT id, status FROM CustomerOrder WHERE id = ? LIMIT 1 FOR UPDATE",
      [id]
    );
    if (!rows || rows.length === 0) {
      const err = new Error("Không tìm thấy đơn hàng");
      err.statusCode = 404;
      throw err;
    }

    const donHienTai = rows[0];
    const khongTheHuy = ["COMPLETED", "CANCELLED"].includes(donHienTai.status);
    if (khongTheHuy) {
      const err = new Error(
        "Không thể hủy đơn hàng khi đã hoàn tất hoặc đã hủy"
      );
      err.statusCode = 400;
      throw err;
    }

    const [items] = await conn.query(
      `SELECT variantId, designId, quantity
       FROM OrderItem
       WHERE orderId = ?
       FOR UPDATE`,
      [id]
    );

    const returnableStockByVariant = new Map();
    for (const item of items) {
      const quantity = Number(item.quantity || 0);
      if (quantity <= 0) continue;

      const isCustomDesignItem = Boolean(item.designId);
      const shouldReturnStock = isCustomDesignItem
        ? donHienTai.status === "PENDING"
        : ["PENDING", "CONFIRMED", "PROCESSING", "PRINTING", "READY_TO_SHIP"].includes(
            donHienTai.status
          );

      if (!shouldReturnStock) continue;

      const variantId = Number(item.variantId);
      returnableStockByVariant.set(
        variantId,
        (returnableStockByVariant.get(variantId) || 0) + quantity
      );
    }

    for (const [variantId, quantityToReturn] of returnableStockByVariant.entries()) {
      await conn.query(
        "UPDATE ProductVariant SET stockQty = stockQty + ? WHERE id = ?",
        [quantityToReturn, variantId]
      );

      await conn.query(
        `INSERT INTO InventoryTransaction
           (variantId, orderId, supplierId, quantityChanged, transactionType, reason)
         VALUES (?, ?, NULL, ?, 'RETURN', ?)`,
        [
          variantId,
          id,
          quantityToReturn,
          `Hoàn kho khi hủy đơn #${id}`.slice(0, 300),
        ]
      );
    }

    await conn.query(
      "UPDATE CustomerOrder SET status = 'CANCELLED', cancelReason = ? WHERE id = ?",
      [lyDoHuy, id]
    );

    await conn.query(
      `UPDATE Payment
       SET status = 'CANCELLED'
       WHERE orderId = ?
         AND status = 'PENDING'`,
      [id]
    );

    await ghiOrderHistory(conn, {
      orderId: Number(id),
      fromStatus: donHienTai.status,
      toStatus: "CANCELLED",
      action: "CANCELLED",
      actor,
      note: `Đã hủy đơn hàng – Lý do: ${lyDoHuy}`,
    });

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  return { id: Number(id), trangThai: "da_huy" };
}

async function capNhatDiaChiGiaoHang(id, addressData, actor) {
  const recipientName = String(addressData.recipientName || "").trim();
  const phone = String(addressData.phone || "").trim();
  const addressLine = String(addressData.addressLine || "").trim();
  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rowsOrder] = await conn.query(
      `SELECT
         co.userId,
         co.status,
         COALESCE(ua.recipientName, a.fullName) AS recipientName
       FROM CustomerOrder co
       JOIN Account a ON a.id = co.userId
       LEFT JOIN UserAddress ua ON ua.id = co.addressId
       WHERE co.id = ?
       LIMIT 1
       FOR UPDATE`,
      [id]
    );

    if (rowsOrder.length === 0) {
      const err = new Error("Đơn hàng không tồn tại");
      err.statusCode = 404;
      throw err;
    }

    const order = rowsOrder[0];

    if (!phone || !addressLine || !recipientName) {
      const err = new Error("Số điện thoại và địa chỉ giao hàng không được để trống");
      err.statusCode = 400;
      throw err;
    }

    const editableStatuses = new Set([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "PRINTING",
      "READY_TO_SHIP",
    ]);

    if (!editableStatuses.has(order.status)) {
      const err = new Error("Chỉ được sửa địa chỉ khi đơn ở trạng thái Chờ xác nhận hoặc Đã xác nhận");
      err.statusCode = 400;
      throw err;
    }

    const [resultAddress] = await conn.query(
      `INSERT INTO UserAddress (userId, recipientName, phone, addressLine, city, district, ward)
       VALUES (?, ?, ?, ?, '', '', '')`,
      [order.userId, recipientName, phone, addressLine]
    );
    const newAddressId = resultAddress.insertId;

    await conn.query(
      `UPDATE CustomerOrder SET addressId = ? WHERE id = ?`,
      [newAddressId, id]
    );

    await ghiOrderHistory(conn, {
      orderId: id,
      fromStatus: order.status,
      toStatus: order.status,
      action: "SHIPPING_ADDRESS_UPDATED",
      actor,
      note: `Cập nhật thông tin giao hàng: ${recipientName} - ${phone} - ${addressLine}`,
    });

    await conn.commit();

    return { id: Number(id), addressId: newAddressId };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function taoLaiMaThanhToanVnpay(id, actor, ipAddress) {
  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT
         co.id,
         co.orderCode,
         co.status AS orderStatus,
         p.id AS paymentId,
         p.amount,
         p.paymentMethod,
         p.status AS paymentStatus,
         p.gatewayResponse
       FROM CustomerOrder co
       JOIN Payment p ON p.orderId = co.id
       WHERE co.id = ?
       LIMIT 1
       FOR UPDATE`,
      [id]
    );

    if (rows.length === 0) {
      const err = new Error("Không tìm thấy đơn hàng hoặc thông tin thanh toán");
      err.statusCode = 404;
      throw err;
    }

    const payment = rows[0];
    if (payment.paymentMethod !== "VNPAY") {
      const err = new Error("Đơn hàng không sử dụng phương thức thanh toán VNPAY");
      err.statusCode = 400;
      throw err;
    }

    if (payment.orderStatus === "CANCELLED") {
      const err = new Error("Không thể tạo lại mã thanh toán cho đơn hàng đã hủy");
      err.statusCode = 400;
      throw err;
    }

    if (payment.paymentStatus === "COMPLETED") {
      const err = new Error("Đơn hàng đã thanh toán thành công");
      err.statusCode = 400;
      throw err;
    }

    if (payment.paymentStatus !== "PENDING") {
      const err = new Error("Mã thanh toán hiện tại không thể tạo lại");
      err.statusCode = 400;
      throw err;
    }

    const currentGatewayResponse = parseGatewayResponse(payment.gatewayResponse);
    const currentExpiresAt = Date.parse(currentGatewayResponse.expiresAt || "");
    if (Number.isFinite(currentExpiresAt) && currentExpiresAt > Date.now()) {
      const err = new Error("Mã thanh toán VNPAY hiện tại vẫn còn hiệu lực");
      err.statusCode = 400;
      throw err;
    }

    const vnpayPayment = taoLinkThanhToanVnpay({
      orderCode: payment.orderCode,
      amount: Number(payment.amount),
      ipAddress,
      transactionRef: taoMaGiaoDichVnpayMoi(payment.orderCode),
    });

    await conn.query(
      `UPDATE Payment
       SET transactionId = ?,
           gatewayResponse = ?,
           status = 'PENDING',
           paidAt = NULL
       WHERE id = ?
         AND status = 'PENDING'`,
      [
        vnpayPayment.transactionRef,
        JSON.stringify(vnpayPayment),
        payment.paymentId,
      ]
    );

    await ghiOrderHistory(conn, {
      orderId: Number(id),
      fromStatus: payment.orderStatus,
      toStatus: payment.orderStatus,
      action: "VNPAY_PAYMENT_RECREATED",
      actor,
      note: "Admin đã khởi tạo lại mã thanh toán VNPAY",
    });

    await conn.commit();

    return {
      paymentUrl: vnpayPayment.paymentUrl,
      paymentUrlExpiresAt: vnpayPayment.expiresAt,
      transactionId: vnpayPayment.transactionRef,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  layThongKe,
  layDanhSachDonHang,
  layChiTietDonHang,
  capNhatTrangThai,
  huyDonHang,
  capNhatDiaChiGiaoHang,
  taoLaiMaThanhToanVnpay,
  // ── Service hỗ trợ form Tạo đơn mới ──
  timKiemKhachHang,
  layDiaChiKhachHang,
  timKiemSanPham,
  timKiemThietKe,
  layDanhSachKhuyenMai,
  taoMoiDonHang,
};

// =====================================================================
// SERVICE 6: Tìm kiếm khách hàng (dùng cho form Tạo đơn mới)
// GET /api/admin/orders/search/customers?q=<keyword>
// =====================================================================
/**
 * Tìm kiếm Account theo tên / SĐT / email.
 * Trả về tối đa 20 kết quả để điền vào Select dropdown.
 */
async function timKiemKhachHang(keyword) {
  const q = `%${(keyword || "").trim()}%`;
  const [rows] = await db.pool.query(
    `SELECT id, fullName, phone, email
     FROM Account
     WHERE role = 'CUSTOMER'
       AND status = 'ACTIVE'
       AND (fullName LIKE ? OR phone LIKE ? OR email LIKE ?)
     ORDER BY fullName
     LIMIT 20`,
    [q, q, q]
  );
  return rows.map((r) => ({
    id: r.id,
    hoTen: r.fullName,
    soDienThoai: r.phone,
    email: r.email,
  }));
}

// =====================================================================
// SERVICE 7: Lấy danh sách địa chỉ của một khách hàng
// GET /api/admin/orders/customers/:userId/addresses
// =====================================================================
/**
 * Lấy tất cả UserAddress của userId.
 * Địa chỉ mặc định (isDefault = 1) sẽ được đặt lên đầu.
 */
async function layDiaChiKhachHang(userId) {
  const [rows] = await db.pool.query(
    `SELECT id, recipientName, phone, addressLine, ward, district, city, isDefault
     FROM UserAddress
     WHERE userId = ?
     ORDER BY isDefault DESC, id ASC`,
    [userId]
  );
  return rows.map((r) => ({
    id: r.id,
    tenNguoiNhan: r.recipientName,
    soDienThoai: r.phone,
    diaChiCuThe: r.addressLine,
    phuong: r.ward,
    quan: r.district,
    thanhPho: r.city,
    laMacDinh: !!r.isDefault,
    // Ghép chuỗi địa chỉ đầy đủ để hiển thị
    diaChiDayDu: [r.addressLine, r.ward, r.district, r.city]
      .filter(Boolean)
      .join(", "),
  }));
}

// =====================================================================
// SERVICE 8: Tìm kiếm sản phẩm + biến thể (dùng cho form Tạo đơn mới)
// GET /api/admin/orders/search/products?q=<keyword>
// =====================================================================
/**
 * Tìm kiếm Product theo tên, trả kèm:
 *   - Danh sách ProductVariant (color, size, stockQty)
 *   - Danh sách BulkPricing của sản phẩm đó
 * Frontend dùng để hiển thị tồn kho và preview BulkPricing.
 */
async function timKiemSanPham(keyword) {
  const q = `%${(keyword || "").trim()}%`;

  // Lấy sản phẩm đang ACTIVE
  const [products] = await db.pool.query(
    `SELECT p.id, p.name, p.basePrice, p.material, p.form,
            pi.imageUrl AS anhUrl
     FROM Product p
     LEFT JOIN ProductImage pi ON pi.productId = p.id AND pi.isPrimary = 1
     WHERE p.status = 'ACTIVE' AND p.name LIKE ?
     ORDER BY p.name
     LIMIT 20`,
    [q]
  );

  if (products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const placeholders = productIds.map(() => "?").join(",");

  // Lấy tất cả variants của các sản phẩm đó
  const [variants] = await db.pool.query(
    `SELECT id, productId, color, size, sku, stockQty
     FROM ProductVariant
     WHERE productId IN (${placeholders})
       AND (status IS NULL OR status = 'ACTIVE')
     ORDER BY productId, color, size`,
    productIds
  );

  // Lấy tất cả BulkPricing của các sản phẩm đó
  const [bulkPricings] = await db.pool.query(
    `SELECT id, productId, minQty, discountPercent
     FROM BulkPricing
     WHERE productId IN (${placeholders})
     ORDER BY productId, minQty ASC`,
    productIds
  );

  // Ghép dữ liệu theo productId
  return products.map((p) => ({
    id: p.id,
    ten: p.name,
    giaGoc: Number(p.basePrice),
    chatLieu: p.material,
    dang: p.form,
    anhUrl: p.anhUrl || null,
    bienThe: variants
      .filter((v) => v.productId === p.id)
      .map((v) => ({
        id: v.id,
        mau: v.color,
        kichCo: v.size,
        sku: v.sku,
        tonKho: v.stockQty,
      })),
    bangGiaSi: bulkPricings
      .filter((b) => b.productId === p.id)
      .map((b) => ({
        id: b.id,
        soLuongToiThieu: b.minQty,
        phanTramGiam: Number(b.discountPercent),
        // Preview giá sau giảm
        giaPreview: Number(p.basePrice) * (1 - Number(b.discountPercent) / 100),
      })),
  }));
}

// =====================================================================
// SERVICE 9: Tìm kiếm thiết kế của khách hàng (dùng cho form Tạo đơn POD)
// GET /api/admin/orders/search/designs?userId=<id>&q=<keyword>
// =====================================================================
/**
 * Lấy danh sách CustomDesign đã APPROVED của khách hàng.
 * Admin chỉ có thể gán thiết kế đã được duyệt vào đơn mới.
 */
async function timKiemThietKe(userId, keyword) {
  const params = [userId];
  let extraCondition = "";

  if (keyword && keyword.trim()) {
    extraCondition = " AND cd.id LIKE ?";
    params.push(`%${keyword.trim()}%`);
  }

  const [rows] = await db.pool.query(
    `SELECT cd.id, cd.productId, cd.variantId, cd.baseColor,
            cd.previewUrl, cd.designFee, cd.status, cd.createdAt,
            p.name AS tenSanPham, p.basePrice, p.material, p.form,
            pi.imageUrl AS anhUrl,
            pv.color AS mauSanPham
     FROM CustomDesign cd
     JOIN Product p ON p.id = cd.productId
     LEFT JOIN ProductImage pi ON pi.productId = p.id AND pi.isPrimary = 1
     LEFT JOIN ProductVariant pv ON pv.id = cd.variantId
     WHERE cd.userId = ?
       AND cd.status = 'APPROVED'
       AND p.status = 'ACTIVE'
       AND (cd.variantId IS NULL OR pv.status IS NULL OR pv.status = 'ACTIVE')
       ${extraCondition}
     ORDER BY cd.createdAt DESC
     LIMIT 30`,
    params
  );

  if (rows.length === 0) return [];

  const productIds = [...new Set(rows.map((r) => r.productId))];
  const placeholders = productIds.map(() => "?").join(",");

  const [variants] = await db.pool.query(
    `SELECT id, productId, color, size, sku, stockQty
     FROM ProductVariant
     WHERE productId IN (${placeholders})
       AND (status IS NULL OR status = 'ACTIVE')
     ORDER BY productId, color, size`,
    productIds
  );

  const [bulkPricings] = await db.pool.query(
    `SELECT id, productId, minQty, discountPercent
     FROM BulkPricing
     WHERE productId IN (${placeholders})
     ORDER BY productId, minQty ASC`,
    productIds
  );

  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    variantId: r.variantId,
    tenSanPham: r.tenSanPham,
    mauNen: r.baseColor,
    mauSanPham: r.mauSanPham || r.baseColor,
    anhXemTruoc: r.previewUrl,
    phiThietKe: Number(r.designFee),
    trangThai: r.status,
    ngayTao: r.createdAt,
    sanPham: {
      id: r.productId,
      ten: r.tenSanPham,
      giaGoc: Number(r.basePrice),
      chatLieu: r.material,
      dang: r.form,
      anhUrl: r.anhUrl || null,
      bienThe: variants
        .filter((v) => v.productId === r.productId)
        .map((v) => ({
          id: v.id,
          mau: v.color,
          kichCo: v.size,
          sku: v.sku,
          tonKho: v.stockQty,
        })),
      bangGiaSi: bulkPricings
        .filter((b) => b.productId === r.productId)
        .map((b) => ({
          id: b.id,
          soLuongToiThieu: b.minQty,
          phanTramGiam: Number(b.discountPercent),
          giaPreview: Number(r.basePrice) * (1 - Number(b.discountPercent) / 100),
        })),
    },
  }));
}

// =====================================================================
// SERVICE 10: Lấy danh sách khuyến mãi còn hiệu lực
// GET /api/admin/orders/promotions
// =====================================================================
/**
 * Trả về các Promotion đang ACTIVE, còn trong thời hạn, chưa hết lượt dùng.
 */
async function layDanhSachKhuyenMai() {
  const now = new Date();
  const [rows] = await db.pool.query(
    `SELECT id, code, discountType, discountValue, minOrderAmount,
            startDate, endDate, usageLimit, usedCount
     FROM Promotion
     WHERE status = 'ACTIVE'
       AND startDate <= ?
       AND (endDate IS NULL OR endDate >= ?)
       AND (usageLimit IS NULL OR usedCount < usageLimit)
     ORDER BY endDate IS NULL ASC, endDate ASC
     LIMIT 50`,
    [now, now]
  );
  return rows.map((r) => ({
    id: r.id,
    ma: r.code,
    loaiGiam: r.discountType,       // PERCENT | FIXED | FREE_SHIPPING
    giaTriGiam: Number(r.discountValue),
    donHangToiThieu: Number(r.minOrderAmount),
    ngayKetThuc: r.endDate || null,
    daUsed: r.usedCount,
    usageLimit: r.usageLimit === null ? null : r.usageLimit,
  }));
}

// =====================================================================
// SERVICE 11: Tạo đơn hàng mới (Admin tạo thay cho khách)
// POST /api/admin/orders
// =====================================================================
/**
 * Tạo đơn hàng trong MySQL Transaction.
 *
 * Các bước:
 *  1. Validate business logic (user, address, variants, design, promotion)
 *  2. Tính giá backend: BulkPricing, designFee, discountAmount, totalAmount
 *  3. BEGIN transaction
 *  4. INSERT CustomerOrder
 *  5. INSERT OrderItem (mỗi item)
 *  6. INSERT OrderProduction (nếu item có designId)
 *  7. INSERT Payment
 *  8. INSERT PromotionUsage + UPDATE Promotion.usedCount (nếu có)
 *  9. COMMIT
 *
 * Nghiệp vụ kho:
 *  - Kiểm tra stockQty >= quantity trước khi tạo đơn.
 *  - Trừ tồn kho ngay trong transaction tạo đơn để tránh admin tạo nhiều đơn vượt tồn.
 *  - Nếu transaction tạo đơn lỗi, việc trừ kho sẽ rollback cùng đơn hàng.
 *
 * @param {Object} data - dữ liệu từ request body đã validated
 */
async function taoMoiDonHang(data, actor, ipAddress) {
  const {
    userId,
    recipientName,
    phone,
    addressLine,
    items,
    paymentMethod,
    paymentType = "FULL",
    shippingFee: shippingFeeInput = 0,
    promotionId = null,
  } = data;

  // ─────────────────────────────────────────────
  // BƯỚC 1: Validate business logic (ngoài transaction)
  // ─────────────────────────────────────────────

  // 1a. Kiểm tra userId tồn tại và còn ACTIVE
  const [rowsUser] = await db.pool.query(
    "SELECT id, fullName FROM Account WHERE id = ? AND status = 'ACTIVE' LIMIT 1",
    [userId]
  );
  if (rowsUser.length === 0) {
    const err = new Error("Khách hàng không tồn tại hoặc đã bị vô hiệu hóa");
    err.statusCode = 400;
    throw err;
  }

  // (Bỏ qua bước kiểm tra addressId vì frontend gửi trực tiếp thông tin địa chỉ mới)

  // 1c. Validate từng item: variant tồn tại + đủ tồn kho
  const itemsEnriched = []; // sẽ chứa thông tin đầy đủ để tính giá

  for (const item of items) {
    const [rowsVariant] = await db.pool.query(
      `SELECT pv.id AS variantId, pv.productId, pv.color, pv.size, pv.stockQty,
              p.name AS tenSanPham, p.basePrice
       FROM ProductVariant pv
       JOIN Product p ON p.id = pv.productId
       WHERE pv.id = ?
         AND p.status = 'ACTIVE'
         AND (pv.status IS NULL OR pv.status = 'ACTIVE')
       LIMIT 1`,
      [item.variantId]
    );
    if (rowsVariant.length === 0) {
      const err = new Error(`Biến thể sản phẩm ID=${item.variantId} không tồn tại`);
      err.statusCode = 400;
      throw err;
    }

    const variant = rowsVariant[0];

    // Kiểm tra tồn kho trước khi tạo đơn.
    if (variant.stockQty < item.quantity) {
      const err = new Error(
        `Sản phẩm "${variant.tenSanPham}" (${variant.color}/${variant.size}) chỉ còn ${variant.stockQty} trong kho, không đủ ${item.quantity} sản phẩm`
      );
      err.statusCode = 400;
      throw err;
    }

    // ── Tính đơn giá theo BulkPricing ──
    // Chọn mức BulkPricing có minQty lớn nhất nhưng <= quantity của item này
    const [rowsBulk] = await db.pool.query(
      `SELECT discountPercent
       FROM BulkPricing
       WHERE productId = ? AND minQty <= ?
       ORDER BY minQty DESC
       LIMIT 1`,
      [variant.productId, item.quantity]
    );

    let unitPrice;
    if (rowsBulk.length > 0) {
      // Áp dụng BulkPricing: unitPrice = basePrice * (1 - discountPercent/100)
      unitPrice = Number(variant.basePrice) * (1 - Number(rowsBulk[0].discountPercent) / 100);
    } else {
      // Không có BulkPricing phù hợp → giữ nguyên basePrice
      unitPrice = Number(variant.basePrice);
    }

    // Làm tròn 2 chữ số thập phân
    unitPrice = Math.round(unitPrice * 100) / 100;

    itemsEnriched.push({
      variantId: item.variantId,
      productId: variant.productId,
      tenSanPham: variant.tenSanPham,
      color: variant.color,
      size: variant.size,
      quantity: item.quantity,
      unitPrice,
      designId: item.designId || null,
      designFee: 0, // sẽ cập nhật nếu có designId
    });
  }

  // 1d. Validate designId (nếu có) và lấy designFee
  for (const enriched of itemsEnriched) {
    if (!enriched.designId) continue;

    const [rowsDesign] = await db.pool.query(
      `SELECT cd.id, cd.userId AS designUserId, cd.productId, cd.variantId,
              cd.baseColor, cd.designFee, cd.status,
              pv.color AS designColor
       FROM CustomDesign cd
       LEFT JOIN ProductVariant pv ON pv.id = cd.variantId
       WHERE cd.id = ? LIMIT 1`,
      [enriched.designId]
    );

    if (rowsDesign.length === 0) {
      const err = new Error(`Thiết kế ID=${enriched.designId} không tồn tại`);
      err.statusCode = 400;
      throw err;
    }

    const design = rowsDesign[0];

    // Thiết kế phải thuộc đúng khách hàng đang đặt đơn
    if (design.designUserId !== userId) {
      const err = new Error(`Thiết kế ID=${enriched.designId} không thuộc khách hàng này`);
      err.statusCode = 400;
      throw err;
    }

    // Thiết kế phải đã được APPROVED
    if (design.status !== "APPROVED") {
      const err = new Error(
        `Thiết kế ID=${enriched.designId} chưa được duyệt (trạng thái: ${design.status}). Chỉ thiết kế APPROVED mới được gán vào đơn`
      );
      err.statusCode = 400;
      throw err;
    }

    // Phôi áo và màu của item phải khớp với thiết kế đã duyệt.
    if (design.productId !== enriched.productId) {
      const err = new Error(
        `Thiết kế ID=${enriched.designId} thuộc sản phẩm khác, không thể gán vào "${enriched.tenSanPham}"`
      );
      err.statusCode = 400;
      throw err;
    }

    const designColor = design.designColor || design.baseColor;
    if (
      designColor &&
      chuanHoaGiaTriSoSanh(designColor) !== chuanHoaGiaTriSoSanh(enriched.color)
    ) {
      const err = new Error(
        `Thiết kế ID=${enriched.designId} chỉ được đặt với màu "${designColor}", không thể chọn màu "${enriched.color}"`
      );
      err.statusCode = 400;
      throw err;
    }

    // Gán designFee từ DB
    enriched.designFee = Number(design.designFee);
  }

  // ─────────────────────────────────────────────
  // BƯỚC 2: Tính giá tổng đơn hàng
  // ─────────────────────────────────────────────

  // subtotal = tổng (unitPrice * quantity) của tất cả items (không gồm designFee và shippingFee)
  const subtotal = itemsEnriched.reduce(
    (tong, item) => tong + item.unitPrice * item.quantity,
    0
  );

  // Tổng phí thiết kế (nếu là đơn POD)
  const tongDesignFee = itemsEnriched.reduce(
    (tong, item) => tong + item.designFee,
    0
  );

  let shippingFee = Math.max(0, Number(shippingFeeInput) || 0);

  // Tính discountAmount từ promotion (nếu có)
  let discountAmount = 0;
  let promotionData = null;

  if (promotionId) {
    const now = new Date();
    const [rowsPromo] = await db.pool.query(
      `SELECT id, code, discountType, discountValue, minOrderAmount,
              usageLimit, usedCount, startDate, endDate, status, isNewCustomerOnly
       FROM Promotion
       WHERE id = ? LIMIT 1`,
      [promotionId]
    );

    if (rowsPromo.length === 0) {
      const err = new Error("Mã khuyến mãi không tồn tại");
      err.statusCode = 400;
      throw err;
    }

    const promo = rowsPromo[0];

    // Kiểm tra ACTIVE
    if (promo.status !== "ACTIVE") {
      const err = new Error("Mã khuyến mãi không còn hiệu lực");
      err.statusCode = 400;
      throw err;
    }

    // Kiểm tra thời hạn
    if (
      new Date(promo.startDate) > now ||
      (promo.endDate && new Date(promo.endDate) < now)
    ) {
      const err = new Error("Mã khuyến mãi đã hết hạn hoặc chưa đến ngày áp dụng");
      err.statusCode = 400;
      throw err;
    }

    // Kiểm tra số lượt dùng
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      const err = new Error("Mã khuyến mãi đã hết lượt sử dụng");
      err.statusCode = 400;
      throw err;
    }

    if (promo.isNewCustomerOnly) {
      const [rowsExistingOrders] = await db.pool.query(
        "SELECT id FROM CustomerOrder WHERE userId = ? LIMIT 1",
        [userId]
      );
      if (rowsExistingOrders.length > 0) {
        const err = new Error("Mã khuyến mãi này chỉ dành cho khách hàng chưa từng đặt hàng");
        err.statusCode = 400;
        throw err;
      }
    }

    // Kiểm tra đơn hàng đạt minOrderAmount
    // minOrderAmount tính trên subtotal (giá gốc sản phẩm), không gồm ship
    const orderBaseAmount = subtotal + tongDesignFee;
    if (orderBaseAmount < Number(promo.minOrderAmount)) {
      const err = new Error(
        `Đơn hàng cần tối thiểu ${Number(promo.minOrderAmount).toLocaleString("vi-VN")}₫ để áp dụng mã khuyến mãi này`
      );
      err.statusCode = 400;
      throw err;
    }

    // Kiểm tra khách hàng đã dùng mã này chưa (unique constraint promotionId + userId)
    const [rowsUsed] = await db.pool.query(
      "SELECT id FROM PromotionUsage WHERE promotionId = ? AND userId = ? LIMIT 1",
      [promotionId, userId]
    );
    if (rowsUsed.length > 0) {
      const err = new Error(
        `Khách hàng này đã sử dụng mã khuyến mãi "${promo.code}" trước đó. Mỗi khách chỉ được dùng mỗi mã 1 lần`
      );
      err.statusCode = 400;
      throw err;
    }

    // Tính giá trị giảm
    if (promo.discountType === "PERCENT") {
      discountAmount = orderBaseAmount * (Number(promo.discountValue) / 100);
    } else if (promo.discountType === "FIXED") {
      discountAmount = Number(promo.discountValue);
    } else if (promo.discountType === "FREE_SHIPPING") {
      shippingFee = 0;
    }
    discountAmount = Math.min(discountAmount, orderBaseAmount); // không giảm quá tổng đơn
    discountAmount = Math.round(discountAmount * 100) / 100;

    promotionData = promo;
  }

  // Tổng tiền cuối cùng
  const totalAmount = Math.max(
    0,
    Math.round((subtotal + tongDesignFee + shippingFee - discountAmount) * 100) / 100
  );
  const {
    depositPercent,
    depositAmount,
    codAmount,
    paymentAmount,
  } = tinhThongTinThanhToan(totalAmount, paymentMethod, paymentType);

  if (paymentMethod === "VNPAY" && paymentAmount <= 0) {
    const err = new Error("Số tiền thanh toán VNPAY phải lớn hơn 0");
    err.statusCode = 400;
    throw err;
  }

  // ─────────────────────────────────────────────
  // BƯỚC 3-9: Thực hiện trong MySQL Transaction
  // ─────────────────────────────────────────────

  // Lấy connection riêng để dùng transaction
  const conn = await db.pool.getConnection();

  try {
    await conn.beginTransaction();

    // ── Bước 3.1: Sinh orderCode duy nhất ──
    // Format: TS-YYYYMMDD-XXXXXX (X = random hex)
    const now = new Date();
    const dateStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("");
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderCode = `TS-${dateStr}-${randomPart}`;
    const vnpayPayment =
      paymentMethod === "VNPAY"
        ? taoLinkThanhToanVnpay({
            orderCode,
            amount: paymentAmount,
            ipAddress,
          })
        : null;

    // ── Bước 3.1.5: INSERT UserAddress để lấy addressId mới ──
    const [resultAddress] = await conn.query(
      `INSERT INTO UserAddress (userId, recipientName, phone, addressLine, city, district, ward)
       VALUES (?, ?, ?, ?, '', '', '')`,
      [userId, recipientName, phone, addressLine]
    );
    const addressId = resultAddress.insertId;


    // ── Bước 3.2: INSERT CustomerOrder ──
    const [resultOrder] = await conn.query(
      `INSERT INTO CustomerOrder
         (orderCode, userId, promotionId, addressId,
          subtotal, discountAmount, shippingFee,
          totalAmount, depositAmount, codAmount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        orderCode,
        userId,
        promotionId || null,
        addressId,
        Math.round(subtotal * 100) / 100,
        discountAmount,
        shippingFee,
        totalAmount,
        depositAmount,
        codAmount,
      ]
    );
    const orderId = resultOrder.insertId;
    const creationHistory = taoLichSuTaoDon(actor);

    await ghiOrderHistory(conn, {
      orderId,
      fromStatus: null,
      toStatus: "PENDING",
      action: creationHistory.action,
      actor,
      note: creationHistory.note,
    });

    // ── Bước 3.3: INSERT OrderItem, OrderProduction và giữ tồn kho ──
    for (const item of itemsEnriched) {
      // lineTotal = (unitPrice * quantity) + designFee của item này
      const lineTotal = Math.round(
        (item.unitPrice * item.quantity + item.designFee) * 100
      ) / 100;

      const [resultItem] = await conn.query(
        `INSERT INTO OrderItem
           (orderId, variantId, designId, quantity,
            unitPrice, designFee, lineTotal, productionStatus)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.variantId,
          item.designId,
          item.quantity,
          item.unitPrice,
          item.designFee,
          lineTotal,
          item.designId ? "WAITING_DESIGN_APPROVAL" : "WAITING_DESIGN_APPROVAL",
        ]
      );
      const orderItemId = resultItem.insertId;

      // Nếu item có thiết kế POD → tạo OrderProduction
      if (item.designId) {
        await conn.query(
          `INSERT INTO OrderProduction (orderItemId, designId, status)
           VALUES (?, ?, 'WAITING_DESIGN_APPROVAL')`,
          [orderItemId, item.designId]
        );
      }

      const [stockResult] = await conn.query(
        `UPDATE ProductVariant
         SET stockQty = stockQty - ?
         WHERE id = ? AND stockQty >= ?`,
        [item.quantity, item.variantId, item.quantity]
      );

      if (stockResult.affectedRows === 0) {
        const err = new Error(
          `Sản phẩm "${item.tenSanPham}" (${item.color}/${item.size}) không còn đủ tồn kho để tạo đơn`
        );
        err.statusCode = 400;
        throw err;
      }

      await conn.query(
        `INSERT INTO InventoryTransaction
           (variantId, orderId, supplierId, quantityChanged, transactionType, reason)
         VALUES (?, ?, NULL, ?, 'EXPORT', ?)`,
        [
          item.variantId,
          orderId,
          -item.quantity,
          `Tạo đơn hàng ${orderCode} - giữ tồn kho ngay khi tạo đơn`,
        ]
      );
    }

    // ── Bước 3.4: INSERT Payment ──
    await conn.query(
      `INSERT INTO Payment
         (orderId, amount, paymentMethod, paymentType, status, transactionId, gatewayResponse)
       VALUES (?, ?, ?, ?, 'PENDING', ?, ?)`,
      [
        orderId,
        paymentAmount,
        paymentMethod,
        paymentType,
        vnpayPayment?.transactionRef || null,
        vnpayPayment ? JSON.stringify(vnpayPayment) : null,
      ]
    );

    // ── Bước 3.5: Ghi nhận PromotionUsage và tăng usedCount ──
    if (promotionId && promotionData) {
      // INSERT PromotionUsage
      await conn.query(
        `INSERT INTO PromotionUsage (promotionId, userId, orderId)
         VALUES (?, ?, ?)`,
        [promotionId, userId, orderId]
      );

      // Tăng usedCount +1
      await conn.query(
        "UPDATE Promotion SET usedCount = usedCount + 1 WHERE id = ?",
        [promotionId]
      );
    }

    // ── COMMIT ──
    await conn.commit();

    return {
      id: orderId,
      orderCode,
      totalAmount,
      depositPercent,
      depositAmount,
      codAmount,
      paymentAmount,
      paymentUrl: vnpayPayment?.paymentUrl || null,
      paymentUrlExpiresAt: vnpayPayment?.expiresAt || null,
    };
  } catch (error) {
    // ── ROLLBACK nếu có lỗi ──
    await conn.rollback();
    throw error;
  } finally {
    // Trả connection về pool dù thành công hay thất bại
    conn.release();
  }
}
