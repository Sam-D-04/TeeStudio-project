/**
 * admin.dashboard.service.js – Xử lý nghiệp vụ & truy vấn DB cho Tổng quan vận hành.
 *
 * Gồm 5 nhóm chức năng:
 *   1. Thẻ chỉ số tổng quan (7 chỉ số: doanh thu, đơn hàng, thiết kế, tồn kho, v.v.)
 *   2. Dữ liệu biểu đồ doanh thu theo ngày
 *   3. Danh sách thiết kế cần xử lý (PENDING_REVIEW / NEEDS_REVISION / Gấp)
 *   4. Tồn kho cảnh báo (variant dưới ngưỡng tối thiểu)
 *   5. Top sản phẩm bán chạy (theo doanh thu)
 */

"use strict";

const db = require("../../database/mysql");

// =====================================================================
// TIỆN ÍCH NỘI BỘ
// =====================================================================

/**
 * Kiểm tra chuỗi ngày có hợp lệ định dạng YYYY-MM-DD không.
 */
function laNgayHopLe(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [nam, thang, ngay] = value.split("-").map(Number);
  const d = new Date(Date.UTC(nam, thang - 1, ngay));
  return (
    d.getUTCFullYear() === nam &&
    d.getUTCMonth() === thang - 1 &&
    d.getUTCDate() === ngay
  );
}

/**
 * Trả về khoảng ngày [tuNgay, denNgay] đã được kiểm tra.
 * Nếu không hợp lệ → mặc định tháng hiện tại.
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

  // Đảm bảo batDau <= ketThuc
  return batDau <= ketThuc ? [batDau, ketThuc] : [ketThuc, batDau];
}

/**
 * Định dạng ngày sang chuỗi "DD/MM/YYYY"
 */
function formatNgay(date) {
  if (!date) return null;
  const d = new Date(date);
  const ngay = String(d.getDate()).padStart(2, "0");
  const thang = String(d.getMonth() + 1).padStart(2, "0");
  const nam = d.getFullYear();
  return `${ngay}/${thang}/${nam}`;
}

// =====================================================================
// SERVICE 1: Lấy thẻ chỉ số tổng quan
// =====================================================================

/**
 * Tính toán 7 chỉ số cho dashboard trong khoảng [tuNgay, denNgay]:
 *  - Doanh thu tháng (tổng totalAmount đơn COMPLETED)
 *  - Doanh thu từ thiết kế (tổng designFee trong khoảng)
 *  - Đơn hàng mới (PENDING trong khoảng)
 *  - Tồn kho mức thấp (variant stockQty <= 15, bất kể thời gian)
 *  - Giá trị trung bình đơn (AOV = tổng / số đơn COMPLETED)
 *  - Tỷ lệ đơn hàng thành công (COMPLETED / (COMPLETED + CANCELLED))
 *  - Doanh thu khác / đền bù + Tỷ lệ hủy
 */
async function layTongQuanChiSo(tuNgay, denNgay) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);

  // --- Doanh thu tháng: tổng totalAmount các đơn COMPLETED trong khoảng ---
  const [rowsDoanhThu] = await db.pool.query(
    `SELECT COALESCE(SUM(totalAmount), 0) AS doanh_thu
     FROM CustomerOrder
     WHERE status = 'COMPLETED'
       AND DATE(updatedAt) >= ? AND DATE(updatedAt) <= ?`,
    [batDau, ketThuc]
  );

  // --- Doanh thu từ thiết kế: tổng designFee trong OrderItem thuộc đơn COMPLETED ---
  const [rowsDoanhThuThietKe] = await db.pool.query(
    `SELECT COALESCE(SUM(oi.designFee), 0) AS doanh_thu_thiet_ke
     FROM OrderItem oi
     JOIN CustomerOrder co ON co.id = oi.orderId
     WHERE co.status = 'COMPLETED'
       AND oi.designFee > 0
       AND DATE(co.updatedAt) >= ? AND DATE(co.updatedAt) <= ?`,
    [batDau, ketThuc]
  );

  // --- Đơn hàng mới (PENDING) tạo trong khoảng thời gian ---
  const [rowsDonMoi] = await db.pool.query(
    `SELECT COUNT(*) AS so_don_moi
     FROM CustomerOrder
     WHERE status = 'PENDING'
       AND DATE(createdAt) >= ? AND DATE(createdAt) <= ?`,
    [batDau, ketThuc]
  );

  // --- Tồn kho mức thấp: variant có stockQty <= 15 (bất kể thời gian) ---
  const NGUONG_TON_KHO = 15;
  const [rowsTonKho] = await db.pool.query(
    `SELECT COUNT(*) AS so_variant_thap
     FROM ProductVariant
     WHERE stockQty >= 0 AND stockQty <= ?`,
    [NGUONG_TON_KHO]
  );

  // --- Thống kê đơn hàng trong khoảng: COMPLETED vs CANCELLED (tính AOV + tỷ lệ) ---
  const [rowsThongKeDon] = await db.pool.query(
    `SELECT
       COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)  AS so_hoan_tat,
       COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END)  AS so_da_huy,
       COUNT(CASE WHEN status NOT IN ('CANCELLED') THEN 1 END) AS so_hop_le
     FROM CustomerOrder
     WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ?`,
    [batDau, ketThuc]
  );

  // --- Doanh thu khác / đền bù: tổng Payment loại REFUND hoặc COMPENSATION ---
  const [rowsDoanhThuKhac] = await db.pool.query(
    `SELECT COALESCE(SUM(p.amount), 0) AS doanh_thu_khac
     FROM Payment p
     JOIN CustomerOrder co ON co.id = p.orderId
     WHERE p.paymentType IN ('REFUND', 'COMPENSATION')
       AND p.status = 'COMPLETED'
       AND DATE(p.paidAt) >= ? AND DATE(p.paidAt) <= ?`,
    [batDau, ketThuc]
  );

  // Tính toán chỉ số
  const doanhThu = Number(rowsDoanhThu[0].doanh_thu) || 0;
  const doanhThuThietKe = Number(rowsDoanhThuThietKe[0].doanh_thu_thiet_ke) || 0;
  const soDonMoi = Number(rowsDonMoi[0].so_don_moi) || 0;
  const soVariantThap = Number(rowsTonKho[0].so_variant_thap) || 0;

  const soHoanTat = Number(rowsThongKeDon[0].so_hoan_tat) || 0;
  const soDaHuy = Number(rowsThongKeDon[0].so_da_huy) || 0;
  const soHopLe = Number(rowsThongKeDon[0].so_hop_le) || 0;

  const doanhThuKhac = Number(rowsDoanhThuKhac[0].doanh_thu_khac) || 0;

  // AOV = doanh thu / số đơn hoàn tất
  const aov = soHoanTat > 0 ? Math.round(doanhThu / soHoanTat) : 0;

  // Tỷ lệ thành công: COMPLETED / (tổng đơn không hủy)
  const tyLeThanhCong = soHopLe > 0
    ? Math.round((soHoanTat / soHopLe) * 1000) / 10 // 1 chữ số thập phân
    : 0;

  // Tỷ lệ hủy
  const tongDon = soHopLe + soDaHuy;
  const tyLeHuy = tongDon > 0
    ? Math.round((soDaHuy / tongDon) * 1000) / 10
    : 0;

  return {
    doanhThuThangVnd: doanhThu,
    doanhThuThietKeVnd: doanhThuThietKe,
    soDonMoi,
    soVariantTonKhoThap: soVariantThap,
    giaTriTrungBinhDonVnd: aov,
    tyLeThanhCongPhanTram: tyLeThanhCong,
    doanhThuKhacDenBuVnd: doanhThuKhac,
    tyLeHuyPhanTram: tyLeHuy,
    khoangThoiGian: { tuNgay: batDau, denNgay: ketThuc },
  };
}

// =====================================================================
// SERVICE 2: Dữ liệu biểu đồ doanh thu theo ngày
// =====================================================================

/**
 * Trả về mảng doanh thu theo từng ngày trong khoảng [tuNgay, denNgay].
 * Luôn trả đủ các ngày trong khoảng, kể cả ngày không có doanh thu, để biểu đồ
 * phía frontend không bị nhảy cột hoặc thiếu mốc thời gian.
 * Mỗi phần tử: { ngay: "YYYY-MM-DD", nhan: "DD/MM", doanhThuVnd: number, soDonHoanTat: number }
 */
async function layDuLieuBieuDo(tuNgay, denNgay) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);

  const [rows] = await db.pool.query(
    `SELECT
       DATE_FORMAT(updatedAt, '%Y-%m-%d') AS ngay_raw,
       COALESCE(SUM(totalAmount), 0)      AS doanh_thu,
       COUNT(*)                           AS so_don_hoan_tat
     FROM CustomerOrder
     WHERE status = 'COMPLETED'
       AND DATE(updatedAt) >= ? AND DATE(updatedAt) <= ?
     GROUP BY DATE_FORMAT(updatedAt, '%Y-%m-%d')
     ORDER BY DATE_FORMAT(updatedAt, '%Y-%m-%d') ASC`,
    [batDau, ketThuc]
  );

  const doanhThuTheoNgay = new Map(
    rows.map((row) => [
      row.ngay_raw,
      {
        doanhThuVnd: Number(row.doanh_thu) || 0,
        soDonHoanTat: Number(row.so_don_hoan_tat) || 0,
      },
    ])
  );

  const danhSachNgay = [];
  const [namBatDau, thangBatDau, ngayBatDau] = batDau.split("-").map(Number);
  const [namKetThuc, thangKetThuc, ngayKetThuc] = ketThuc.split("-").map(Number);
  const cursor = new Date(Date.UTC(namBatDau, thangBatDau - 1, ngayBatDau));
  const endDate = new Date(Date.UTC(namKetThuc, thangKetThuc - 1, ngayKetThuc));

  while (cursor <= endDate) {
    const nam = cursor.getUTCFullYear();
    const thang = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const ngay = String(cursor.getUTCDate()).padStart(2, "0");
    const ngayRaw = `${nam}-${thang}-${ngay}`;
    const thongKe = doanhThuTheoNgay.get(ngayRaw) || {
      doanhThuVnd: 0,
      soDonHoanTat: 0,
    };

    danhSachNgay.push({
      ngay: ngayRaw,
      nhan: `${ngay}/${thang}`,
      doanhThuVnd: thongKe.doanhThuVnd,
      soDonHoanTat: thongKe.soDonHoanTat,
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const tongDoanhThuVnd = danhSachNgay.reduce((sum, r) => sum + r.doanhThuVnd, 0);
  const tongDonHoanTat = danhSachNgay.reduce((sum, r) => sum + r.soDonHoanTat, 0);
  const doanhThuLonNhatVnd = danhSachNgay.reduce(
    (max, r) => Math.max(max, r.doanhThuVnd),
    0
  );

  return {
    danhSach: danhSachNgay,
    tongDoanhThuVnd,
    tongDonHoanTat,
    doanhThuLonNhatVnd,
    khoangThoiGian: { tuNgay: batDau, denNgay: ketThuc },
  };
}

// =====================================================================
// SERVICE 3: Thiết kế cần xử lý
// =====================================================================

/**
 * Lấy tối đa 5 CustomDesign có status PENDING_REVIEW hoặc NEEDS_REVISION,
 * mới nhất trước.
 * Kết quả gồm: mã đơn liên quan, tên khách hàng, phương pháp in (kỹ thuật),
 * trạng thái thiết kế.
 */
async function layThietKeCanXuLy() {
  const [rows] = await db.pool.query(
    `SELECT
       cd.id                     AS designId,
       cd.status                 AS trangThaiThietKe,
       cd.createdAt              AS ngayTao,
       a.fullName                AS tenKhachHang,
       co.orderCode              AS maDon,
       co.id                     AS orderId,
       -- Lấy phương pháp in đầu tiên (nếu có)
       (
         SELECT pm.name
         FROM DesignPrintMethod dpm
         JOIN PrintMethod pm ON pm.id = dpm.printMethodId
         WHERE dpm.designId = cd.id
         LIMIT 1
       ) AS kyThuat
     FROM CustomDesign cd
     JOIN Account a ON a.id = cd.userId
     -- Tìm đơn hàng chứa thiết kế này (nếu có)
     LEFT JOIN OrderItem oi ON oi.designId = cd.id
     LEFT JOIN CustomerOrder co ON co.id = oi.orderId
     WHERE cd.status IN ('PENDING_REVIEW', 'NEEDS_REVISION')
     ORDER BY cd.updatedAt DESC
     LIMIT 5`
  );

  return rows.map((row) => {
    // Map trạng thái DB → key frontend (khớp với StatusBadge)
    const mapTrangThai = {
      PENDING_REVIEW: "pending",
      NEEDS_REVISION: "revision",
    };

    return {
      designId: row.designId,
      code: row.maDon || `DESIGN-${row.designId}`,
      orderId: row.orderId || null,
      customerName: row.tenKhachHang || "Khách hàng",
      technique: row.kyThuat || "Chưa xác định",
      status: mapTrangThai[row.trangThaiThietKe] || "pending",
      isUrgent: false, // Có thể mở rộng sau theo logic nghiệp vụ
      ngayTao: formatNgay(row.ngayTao),
    };
  });
}

// =====================================================================
// SERVICE 4: Tồn kho cảnh báo
// =====================================================================

/**
 * Lấy danh sách ProductVariant có stockQty <= nguong,
 * sắp xếp theo stockQty tăng dần (nguy hiểm nhất trước).
 */
async function layTonKhoCanhBao(nguong = 15, limit = 10) {
  const [rows] = await db.pool.query(
    `SELECT
       pv.id          AS variantId,
       p.name         AS tenSanPham,
       pv.color       AS mauSac,
       pv.size        AS kichCo,
       pv.sku         AS sku,
       pv.stockQty    AS soLuongTon
     FROM ProductVariant pv
     JOIN Product p ON p.id = pv.productId
     WHERE pv.stockQty >= 0 AND pv.stockQty <= ?
       AND p.status = 'ACTIVE'
     ORDER BY pv.stockQty ASC
     LIMIT ?`,
    [nguong, limit]
  );

  return rows.map((row) => ({
    variantId: row.variantId,
    name: row.tenSanPham,
    detail: `Màu: ${row.mauSac} | Cỡ: ${row.kichCo}`,
    sku: row.sku,
    quantity: Number(row.soLuongTon),
  }));
}

// =====================================================================
// SERVICE 5: Top sản phẩm bán chạy
// =====================================================================

/**
 * Lấy top `limit` sản phẩm bán chạy nhất theo tổng doanh thu (lineTotal)
 * trong khoảng [tuNgay, denNgay], chỉ tính đơn COMPLETED hoặc SHIPPING.
 */
async function laySanPhamBanChay(tuNgay, denNgay, limit = 3) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);

  const [rows] = await db.pool.query(
    `SELECT
       p.id                          AS productId,
       p.name                        AS tenSanPham,
       -- Ghép màu & cỡ bán chạy nhất cho product này
       (
         SELECT CONCAT(pvBest.color, ' / Cỡ ', pvBest.size)
         FROM OrderItem oiBest
         JOIN ProductVariant pvBest ON pvBest.id = oiBest.variantId
         JOIN CustomerOrder coBest ON coBest.id = oiBest.orderId
         WHERE pvBest.productId = p.id
           AND coBest.status IN ('COMPLETED', 'SHIPPING')
           AND DATE(coBest.updatedAt) >= ? AND DATE(coBest.updatedAt) <= ?
         GROUP BY pvBest.id
         ORDER BY SUM(oiBest.quantity) DESC
         LIMIT 1
       ) AS bienThePhoBien,
       COALESCE(SUM(oi.lineTotal), 0)   AS tongDoanhThu,
       COALESCE(SUM(oi.quantity), 0)    AS tongSoLuong
     FROM OrderItem oi
     JOIN ProductVariant pv ON pv.id = oi.variantId
     JOIN Product p          ON p.id  = pv.productId
     JOIN CustomerOrder co   ON co.id = oi.orderId
     WHERE co.status IN ('COMPLETED', 'SHIPPING')
       AND DATE(co.updatedAt) >= ? AND DATE(co.updatedAt) <= ?
     GROUP BY p.id, p.name
     ORDER BY tongDoanhThu DESC
     LIMIT ?`,
    [batDau, ketThuc, batDau, ketThuc, limit]
  );

  // Bảng màu thumbnail (xoay vòng, chỉ dùng cho giao diện)
  const mauThumbnail = [
    { bg: "bg-sky-100", text: "text-sky-700" },
    { bg: "bg-emerald-100", text: "text-emerald-700" },
    { bg: "bg-indigo-100", text: "text-indigo-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
    { bg: "bg-rose-100", text: "text-rose-700" },
  ];

  return rows.map((row, index) => {
    const mau = mauThumbnail[index % mauThumbnail.length];
    return {
      productId: row.productId,
      name: row.tenSanPham,
      variant: row.bienThePhoBien || "—",
      revenue: Number(row.tongDoanhThu),
      soldQty: Number(row.tongSoLuong),
      thumbnailClassName: `${mau.bg} ${mau.text}`,
    };
  });
}

// =====================================================================
// EXPORTS
// =====================================================================

module.exports = {
  layTongQuanChiSo,
  layDuLieuBieuDo,
  layThietKeCanXuLy,
  layTonKhoCanhBao,
  laySanPhamBanChay,
};
