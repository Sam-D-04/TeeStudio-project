/**
 * admin.statistics.service.js – Xử lý nghiệp vụ & truy vấn DB cho trang Theo dõi & Thống kê.
 *
 * Gồm 4 nhóm chức năng:
 *   1. layChiSoTongHop     – 4 thẻ chỉ số tổng hợp + so sánh kỳ trước
 *   2. layBieuDoDoanhThu   – dữ liệu biểu đồ doanh thu (ngày/tháng tự chọn)
 *   3. layTopSanPham       – top sản phẩm bán chạy kèm ảnh thumbnail
 *   4. layPhanBoTrangThai  – phân bổ trạng thái đơn hàng & thanh toán
 */

"use strict";

const db = require("../../database/mysql");

// =====================================================================
// TIỆN ÍCH NỘI BỘ
// =====================================================================

/** Kiểm tra chuỗi ngày có hợp lệ định dạng YYYY-MM-DD không. */
function laNgayHopLe(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [nam, thang, ngay] = value.split("-").map(Number);
  const d = new Date(Date.UTC(nam, thang - 1, ngay));
  return (
    d.getUTCFullYear() === nam &&
    d.getUTCMonth() === thang - 1 &&
    d.getUTCDate() === ngay
  );
}

/**
 * Chuẩn hoá khoảng ngày. Mặc định: tháng hiện tại (01 → hôm nay).
 * Trả về [batDau, ketThuc] đã đảm bảo batDau <= ketThuc.
 */
function chuanHoaKhoangNgay(tuNgay, denNgay) {
  const homNay = new Date();
  const nam = homNay.getFullYear();
  const thang = String(homNay.getMonth() + 1).padStart(2, "0");
  const ngay = String(homNay.getDate()).padStart(2, "0");
  const macDinhTuNgay = `${nam}-${thang}-01`;
  const macDinhDenNgay = `${nam}-${thang}-${ngay}`;
  const batDau = laNgayHopLe(tuNgay) ? tuNgay : macDinhTuNgay;
  const ketThuc = laNgayHopLe(denNgay) ? denNgay : macDinhDenNgay;
  return batDau <= ketThuc ? [batDau, ketThuc] : [ketThuc, batDau];
}

/**
 * Tính khoảng kỳ trước có cùng số ngày, liền kề với kỳ hiện tại.
 * Ví dụ: [01/07, 10/07] → kỳ trước = [21/06, 30/06]
 */
function tinhKyTruoc(batDau, ketThuc) {
  const start = new Date(`${batDau}T00:00:00Z`);
  const end = new Date(`${ketThuc}T00:00:00Z`);
  const soNgay = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  const kyTruocKetThuc = new Date(start);
  kyTruocKetThuc.setUTCDate(kyTruocKetThuc.getUTCDate() - 1);

  const kyTruocBatDau = new Date(kyTruocKetThuc);
  kyTruocBatDau.setUTCDate(kyTruocBatDau.getUTCDate() - soNgay + 1);

  const fmt = (d) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return [fmt(kyTruocBatDau), fmt(kyTruocKetThuc)];
}

/**
 * Tính phần trăm thay đổi: ((hienTai - kyTruoc) / kyTruoc) × 100
 * Trả về 0 nếu kỳ trước = 0.
 */
function tinhPhanTramThayDoi(hienTai, kyTruoc) {
  if (kyTruoc === 0) return hienTai > 0 ? 100 : 0;
  return Math.round(((hienTai - kyTruoc) / kyTruoc) * 1000) / 10;
}

/**
 * Xác định đơn vị nhóm biểu đồ:
 *  - Cùng một ngày: nhóm theo ngày (bar đơn)
 *  - Từ 2 – 60 ngày: nhóm theo ngày
 *  - Trên 60 ngày: nhóm theo tháng
 */
function xacDinhDonViNhom(batDau, ketThuc) {
  const startDate = new Date(`${batDau}T00:00:00Z`);
  const endDate = new Date(`${ketThuc}T00:00:00Z`);
  const soNgay = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
  return soNgay > 60 ? "month" : "day";
}

// SQL subquery chung để chỉ lấy đơn đã thu đủ tiền (không tính cọc).
const JOIN_PAYMENT_HOAN_THANH = `
  JOIN (
    SELECT orderId, MAX(paidAt) AS fullyPaidAt
    FROM Payment
    WHERE status = 'COMPLETED'
      AND paymentType <> 'DEPOSIT'
    GROUP BY orderId
  ) pRevenue ON pRevenue.orderId = co.id
`;

// =====================================================================
// SERVICE 1: Chỉ số tổng hợp (4 thẻ + so sánh kỳ trước)
// =====================================================================

/**
 * Truy vấn 3 chỉ số cho một khoảng thời gian:
 *  - doanhThu    : tổng totalAmount đơn COMPLETED đã thu đủ tiền
 *  - soDon       : tổng số đơn hàng được tạo (mọi trạng thái)
 *  - soSanPham   : tổng số lượng sản phẩm từ đơn COMPLETED
 *  - giaTriTB    : doanh thu / số đơn hoàn tất
 */
async function _queryMetrics(batDau, ketThuc) {
  const [[rowDoanhThu], [rowDon], [rowSanPham]] = await Promise.all([
    db.pool.query(
      `SELECT
         COALESCE(SUM(co.totalAmount), 0) AS doanhThu,
         COUNT(*)                         AS soDonHoanTat
       FROM CustomerOrder co
       ${JOIN_PAYMENT_HOAN_THANH}
       WHERE co.status = 'COMPLETED'
         AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
         AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?`,
      [batDau, ketThuc]
    ),
    db.pool.query(
      `SELECT SUM(CASE WHEN status != 'CANCELLED' OR cancelReason IS NULL OR cancelReason NOT LIKE '[TECH_ADJUST]%' THEN 1 ELSE 0 END) AS soDon
       FROM CustomerOrder
       WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ?`,
      [batDau, ketThuc]
    ),
    db.pool.query(
      `SELECT COALESCE(SUM(oi.quantity), 0) AS soSanPham
       FROM OrderItem oi
       JOIN CustomerOrder co ON co.id = oi.orderId
       ${JOIN_PAYMENT_HOAN_THANH}
       WHERE co.status = 'COMPLETED'
         AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
         AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?`,
      [batDau, ketThuc]
    ),
  ]);

  const doanhThu = Number(rowDoanhThu[0]?.doanhThu) || 0;
  const soDonHoanTat = Number(rowDoanhThu[0]?.soDonHoanTat) || 0;
  const soDon = Number(rowDon[0]?.soDon) || 0;
  const soSanPham = Number(rowSanPham[0]?.soSanPham) || 0;
  const giaTriTB = soDonHoanTat > 0 ? Math.round(doanhThu / soDonHoanTat) : 0;

  return { doanhThu, soDon, soSanPham, giaTriTB };
}

async function _queryDoiSoatBaoCao(batDau, ketThuc) {
  const [rows] = await db.pool.query(
    `SELECT
       SUM(CASE WHEN co.status != 'CANCELLED' OR co.cancelReason IS NULL OR co.cancelReason NOT LIKE '[TECH_ADJUST]%' THEN 1 ELSE 0 END) AS tongSoDon,
       COALESCE(SUM(co.totalAmount), 0) AS tongGiaTriDonHang,
       COALESCE(SUM(COALESCE(paymentSummary.totalPaidAmount, 0)), 0) AS tienDaThu,
       COALESCE(SUM(COALESCE(paymentSummary.pendingCodAmount, 0)), 0) AS codDangTreo,
       COALESCE(SUM(
         CASE
           WHEN co.status = 'COMPLETED'
            AND (
              co.paymentStatus = 'PAID'
              OR COALESCE(paymentSummary.totalPaidAmount, 0) >= co.totalAmount
            )
           THEN co.totalAmount
           ELSE 0
         END
       ), 0) AS doanhThuGhiNhan,
       SUM(CASE WHEN co.status = 'COMPLETED' THEN 1 ELSE 0 END) AS soDonHoanTat,
       SUM(
         CASE
           WHEN co.paymentStatus = 'PAID'
             OR COALESCE(paymentSummary.totalPaidAmount, 0) >= co.totalAmount
           THEN 1
           ELSE 0
         END
       ) AS soDonDaThanhToanDu,
       SUM(
         CASE
           WHEN COALESCE(paymentSummary.pendingCodAmount, 0) > 0 THEN 1
           ELSE 0
         END
       ) AS soDonChoDoiSoatCod,
       SUM(CASE WHEN co.status = 'CANCELLED' AND (co.cancelReason IS NULL OR co.cancelReason NOT LIKE '[TECH_ADJUST]%') THEN 1 ELSE 0 END) AS soDonDaHuy
     FROM CustomerOrder co
     LEFT JOIN (
       SELECT orderId,
              SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) AS totalPaidAmount,
              SUM(CASE WHEN status = 'PENDING_RECONCILIATION' AND paymentMethod = 'COD' THEN amount ELSE 0 END) AS pendingCodAmount
       FROM Payment
       GROUP BY orderId
     ) paymentSummary ON paymentSummary.orderId = co.id
     WHERE co.createdAt >= ? AND co.createdAt < DATE_ADD(?, INTERVAL 1 DAY)`,
    [batDau, ketThuc]
  );

  const row = rows[0] || {};
  const tongSoDon = Number(row.tongSoDon) || 0;
  const soDonDaHuy = Number(row.soDonDaHuy) || 0;

  return {
    doanhThuGhiNhanVnd: Number(row.doanhThuGhiNhan) || 0,
    tienDaThuTrongKyVnd: Number(row.tienDaThu) || 0,
    dongTienCodDangTreoVnd: Number(row.codDangTreo) || 0,
    tongGiaTriDonHangVnd: Number(row.tongGiaTriDonHang) || 0,
    soDonHoanTat: Number(row.soDonHoanTat) || 0,
    soDonDaThanhToanDu: Number(row.soDonDaThanhToanDu) || 0,
    soDonChoDoiSoatCod: Number(row.soDonChoDoiSoatCod) || 0,
    tyLeHuyDon: tongSoDon > 0 ? Math.round((soDonDaHuy / tongSoDon) * 10000) / 100 : 0,
  };
}

/**
 * Lấy 4 thẻ chỉ số thống kê + tỷ lệ so sánh kỳ trước.
 * @param {string} tuNgay  - YYYY-MM-DD
 * @param {string} denNgay - YYYY-MM-DD
 */
async function layChiSoTongHop(tuNgay, denNgay) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);
  const [kyTruocBatDau, kyTruocKetThuc] = tinhKyTruoc(batDau, ketThuc);

  const [hienTai, kyTruoc, doiSoatBaoCao] = await Promise.all([
    _queryMetrics(batDau, ketThuc),
    _queryMetrics(kyTruocBatDau, kyTruocKetThuc),
    _queryDoiSoatBaoCao(batDau, ketThuc),
  ]);

  return {
    doanhThuVnd: hienTai.doanhThu,
    soDonHang: hienTai.soDon,
    soSanPhamBanRa: hienTai.soSanPham,
    giaTriTrungBinhDonVnd: hienTai.giaTriTB,
    soSanhKyTruoc: {
      doanhThuPhanTram: tinhPhanTramThayDoi(hienTai.doanhThu, kyTruoc.doanhThu),
      soDonPhanTram: tinhPhanTramThayDoi(hienTai.soDon, kyTruoc.soDon),
      soSanPhamPhanTram: tinhPhanTramThayDoi(hienTai.soSanPham, kyTruoc.soSanPham),
      giaTriTBDonPhanTram: tinhPhanTramThayDoi(hienTai.giaTriTB, kyTruoc.giaTriTB),
    },
    doiSoatBaoCao,
    khoangThoiGian: { tuNgay: batDau, denNgay: ketThuc },
  };
}

// =====================================================================
// SERVICE 2: Dữ liệu biểu đồ doanh thu (ngày / tháng tự động)
// =====================================================================

/**
 * Lấy dữ liệu biểu đồ doanh thu, tự chọn nhóm theo ngày hoặc tháng.
 * @param {string} tuNgay
 * @param {string} denNgay
 */
async function layBieuDoDoanhThu(tuNgay, denNgay) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);
  const groupBy = xacDinhDonViNhom(batDau, ketThuc);

  let rows;
  let danhSach;

  if (groupBy === "month") {
    [rows] = await db.pool.query(
      `SELECT
         DATE_FORMAT(
           GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt)),
           '%Y-%m'
         )                              AS moc_raw,
         COALESCE(SUM(co.totalAmount), 0) AS doanhThu,
         COUNT(*)                         AS soDon
       FROM CustomerOrder co
       ${JOIN_PAYMENT_HOAN_THANH}
       WHERE co.status = 'COMPLETED'
         AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
         AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?
       GROUP BY moc_raw
       ORDER BY moc_raw ASC`,
      [batDau, ketThuc]
    );

    const banDo = new Map(
      rows.map((r) => [r.moc_raw, { doanhThu: Number(r.doanhThu), soDon: Number(r.soDon) }])
    );
    const [namBD, thangBD] = batDau.split("-").map(Number);
    const [namKT, thangKT] = ketThuc.split("-").map(Number);
    const cursor = new Date(Date.UTC(namBD, thangBD - 1, 1));
    const endMonth = new Date(Date.UTC(namKT, thangKT - 1, 1));
    const qua2Nam = namBD !== namKT;
    danhSach = [];

    while (cursor <= endMonth) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
      const t = banDo.get(`${y}-${m}`) || { doanhThu: 0, soDon: 0 };
      danhSach.push({
        nhan: qua2Nam ? `T${cursor.getUTCMonth() + 1}/${y}` : `Tháng ${cursor.getUTCMonth() + 1}`,
        doanhThuVnd: t.doanhThu,
        soDon: t.soDon,
      });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  } else {
    [rows] = await db.pool.query(
      `SELECT
         DATE_FORMAT(
           GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt)),
           '%Y-%m-%d'
         )                              AS moc_raw,
         COALESCE(SUM(co.totalAmount), 0) AS doanhThu,
         COUNT(*)                         AS soDon
       FROM CustomerOrder co
       ${JOIN_PAYMENT_HOAN_THANH}
       WHERE co.status = 'COMPLETED'
         AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
         AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?
       GROUP BY moc_raw
       ORDER BY moc_raw ASC`,
      [batDau, ketThuc]
    );

    const banDo = new Map(
      rows.map((r) => [r.moc_raw, { doanhThu: Number(r.doanhThu), soDon: Number(r.soDon) }])
    );
    const [namBD, thangBD, ngayBD] = batDau.split("-").map(Number);
    const [namKT, thangKT, ngayKT] = ketThuc.split("-").map(Number);
    const cursor = new Date(Date.UTC(namBD, thangBD - 1, ngayBD));
    const endDate = new Date(Date.UTC(namKT, thangKT - 1, ngayKT));
    danhSach = [];

    while (cursor <= endDate) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
      const d = String(cursor.getUTCDate()).padStart(2, "0");
      const t = banDo.get(`${y}-${m}-${d}`) || { doanhThu: 0, soDon: 0 };
      danhSach.push({
        nhan: `${d}/${m}`,
        doanhThuVnd: t.doanhThu,
        soDon: t.soDon,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return {
    danhSach,
    groupBy,
    khoangThoiGian: { tuNgay: batDau, denNgay: ketThuc },
  };
}

// =====================================================================
// SERVICE 3: Top sản phẩm bán chạy (kèm ảnh thumbnail)
// =====================================================================

/**
 * Lấy top `limit` sản phẩm bán chạy nhất theo tổng doanh thu.
 * Chỉ tính đơn COMPLETED đã thu đủ tiền, kèm ảnh primary của sản phẩm.
 * @param {string} tuNgay
 * @param {string} denNgay
 * @param {number} limit  - mặc định 5
 */
async function layTopSanPham(tuNgay, denNgay, limit = 5) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);

  const [rows] = await db.pool.query(
    `SELECT
       p.id   AS productId,
       p.name AS tenSanPham,
       (
         SELECT pi.imageUrl
         FROM ProductImage pi
         WHERE pi.productId = p.id AND pi.isPrimary = 1
         LIMIT 1
       ) AS imageUrl,
       (
         SELECT CONCAT(pvBest.color, ' / Cỡ ', pvBest.size)
         FROM OrderItem oiBest
         JOIN ProductVariant pvBest ON pvBest.id = oiBest.variantId
         JOIN CustomerOrder  coBest ON coBest.id = oiBest.orderId
         JOIN (
           SELECT orderId, MAX(paidAt) AS fullyPaidAt
           FROM Payment
           WHERE status = 'COMPLETED' AND paymentType <> 'DEPOSIT'
           GROUP BY orderId
         ) pRB ON pRB.orderId = coBest.id
         WHERE pvBest.productId = p.id
           AND coBest.status = 'COMPLETED'
           AND DATE(GREATEST(coBest.updatedAt, COALESCE(pRB.fullyPaidAt, coBest.updatedAt))) >= ?
           AND DATE(GREATEST(coBest.updatedAt, COALESCE(pRB.fullyPaidAt, coBest.updatedAt))) <= ?
         GROUP BY pvBest.id
         ORDER BY SUM(oiBest.quantity) DESC
         LIMIT 1
       ) AS bienThePhoBien,
       COALESCE(SUM(oi.lineTotal), 0)  AS tongDoanhThu,
       COALESCE(SUM(oi.quantity), 0)   AS tongSoLuong
     FROM OrderItem oi
     JOIN ProductVariant pv ON pv.id = oi.variantId
     JOIN Product p          ON p.id  = pv.productId
     JOIN CustomerOrder co   ON co.id = oi.orderId
     ${JOIN_PAYMENT_HOAN_THANH}
     WHERE co.status = 'COMPLETED'
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?
     GROUP BY p.id, p.name
     ORDER BY tongDoanhThu DESC
     LIMIT ?`,
    [batDau, ketThuc, batDau, ketThuc, limit]
  );

  return rows.map((row) => ({
    productId: row.productId,
    name: row.tenSanPham,
    imageUrl: row.imageUrl || null,
    bienThePhoBien: row.bienThePhoBien || "—",
    tongDoanhThu: Number(row.tongDoanhThu),
    tongSoLuong: Number(row.tongSoLuong),
  }));
}

// =====================================================================
// SERVICE 4: Phân bổ trạng thái đơn hàng & thanh toán
// =====================================================================

/**
 * Thống kê phân bổ trạng thái đơn hàng và tình trạng thanh toán
 * trong khoảng thời gian, trả về 2 mảng dữ liệu sẵn dùng cho DistributionPanel.
 * @param {string} tuNgay
 * @param {string} denNgay
 */
async function layPhanBoTrangThai(tuNgay, denNgay) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);

  const [[rowsDon], [rowsThanhToan]] = await Promise.all([
    // --- Phân bổ trạng thái đơn hàng ---
    db.pool.query(
      `SELECT
         SUM(CASE WHEN status IN ('PENDING','CONFIRMED','PROCESSING','PRINTING') THEN 1 ELSE 0 END) AS dangXuLy,
         SUM(CASE WHEN status IN ('READY_TO_SHIP','SHIPPING','DELIVERING')       THEN 1 ELSE 0 END) AS dangGiao,
         SUM(CASE WHEN status = 'COMPLETED'                                      THEN 1 ELSE 0 END) AS hoanTat,
         SUM(CASE WHEN status = 'CANCELLED' AND (cancelReason IS NULL OR cancelReason NOT LIKE '[TECH_ADJUST]%') THEN 1 ELSE 0 END) AS daHuy
       FROM CustomerOrder
       WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ?`,
      [batDau, ketThuc]
    ),
    // --- Phân bổ tình trạng thanh toán ---
    // "Đã thanh toán": đơn COMPLETED (đã thu tiền)
    // "Chờ thanh toán": đơn đang xử lý (chưa hoàn tất, chưa hủy)
    // "Thất bại / Hủy": đơn CANCELLED
    db.pool.query(
      `SELECT
         SUM(CASE WHEN status = 'COMPLETED'                            THEN 1 ELSE 0 END) AS daThanhToan,
         SUM(CASE WHEN status NOT IN ('COMPLETED','CANCELLED')         THEN 1 ELSE 0 END) AS choThanhToan,
         SUM(CASE WHEN status = 'CANCELLED' AND (cancelReason IS NULL OR cancelReason NOT LIKE '[TECH_ADJUST]%') THEN 1 ELSE 0 END) AS thatBaiHuy
       FROM CustomerOrder
       WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ?`,
      [batDau, ketThuc]
    ),
  ]);

  const d = rowsDon[0] || {};
  const p = rowsThanhToan[0] || {};

  const dangXuLy  = Number(d.dangXuLy)  || 0;
  const dangGiao  = Number(d.dangGiao)  || 0;
  const hoanTat   = Number(d.hoanTat)   || 0;
  const daHuy     = Number(d.daHuy)     || 0;

  const daThanhToan  = Number(p.daThanhToan)  || 0;
  const choThanhToan = Number(p.choThanhToan) || 0;
  const thatBaiHuy   = Number(p.thatBaiHuy)   || 0;

  return {
    trangThaiDon: [
      { label: "Đang xử lý", value: dangXuLy, displayValue: `${dangXuLy} đơn`,  color: "#0ea5e9" },
      { label: "Hoàn tất",   value: hoanTat,   displayValue: `${hoanTat} đơn`,   color: "#10b981" },
      { label: "Đang giao",  value: dangGiao,  displayValue: `${dangGiao} đơn`,  color: "#6366f1" },
      { label: "Đã hủy",     value: daHuy,     displayValue: `${daHuy} đơn`,     color: "#f97316" },
    ],
    trangThaiThanhToan: [
      { label: "Đã thanh toán",   value: daThanhToan,  displayValue: `${daThanhToan} đơn`,  color: "#10b981" },
      { label: "Chờ thanh toán",  value: choThanhToan, displayValue: `${choThanhToan} đơn`, color: "#f59e0b" },
      { label: "Thất bại / Hủy",  value: thatBaiHuy,   displayValue: `${thatBaiHuy} đơn`,   color: "#f97316" },
    ],
    khoangThoiGian: { tuNgay: batDau, denNgay: ketThuc },
  };
}

// =====================================================================
// EXPORTS
// =====================================================================

module.exports = {
  layChiSoTongHop,
  layBieuDoDoanhThu,
  layTopSanPham,
  layPhanBoTrangThai,
};
