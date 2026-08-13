/**
 * admin.statistics.ai.service.js
 *
 * Thu thập số liệu thống kê từ DB rồi gửi lên Gemini API
 * để nhận nhận xét / phân tích doanh thu bằng tiếng Việt.
 *
 * Route phục vụ: POST /api/admin/statistics/phan-tich-ai
 */

"use strict";

const db = require("../../database/mysql");

// =====================================================================
// TIỆN ÍCH NỘI BỘ (copy từ admin.statistics.service để tự chủ)
// =====================================================================

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
// GOM SỐ LIỆU CHO AI
// =====================================================================

/**
 * Truy vấn SQL để lấy toàn bộ số liệu cần thiết cho AI phân tích.
 * @param {string} tuNgay
 * @param {string} denNgay
 */
async function layDuLieuChoAI(tuNgay, denNgay) {
  const [batDau, ketThuc] = chuanHoaKhoangNgay(tuNgay, denNgay);

  // 1. Chỉ số tổng hợp kỳ hiện tại
  const [[rowTongHop]] = await db.pool.query(
    `SELECT
       COALESCE(SUM(co.totalAmount), 0) AS doanhThu,
       COUNT(*)                         AS soDonHoanTat
     FROM CustomerOrder co
     ${JOIN_PAYMENT_HOAN_THANH}
     WHERE co.status = 'COMPLETED'
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?`,
    [batDau, ketThuc]
  );

  // 2. Tổng đơn hàng trong kỳ
  const [[rowDon]] = await db.pool.query(
    `SELECT
       COUNT(*) AS tongSoDon,
       SUM(CASE WHEN status = 'CANCELLED' AND (cancelReason IS NULL OR cancelReason NOT LIKE '[TECH_ADJUST]%') THEN 1 ELSE 0 END) AS soDonHuy
     FROM CustomerOrder
     WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ?`,
    [batDau, ketThuc]
  );

  // 3. Top 5 sản phẩm bán chạy
  const [rowsTop] = await db.pool.query(
    `SELECT
       p.name AS tenSanPham,
       COALESCE(SUM(oi.quantity), 0) AS soLuong,
       COALESCE(SUM(oi.lineTotal), 0) AS doanhThu
     FROM OrderItem oi
     JOIN ProductVariant pv ON pv.id = oi.variantId
     JOIN Product p          ON p.id  = pv.productId
     JOIN CustomerOrder co   ON co.id = oi.orderId
     ${JOIN_PAYMENT_HOAN_THANH}
     WHERE co.status = 'COMPLETED'
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?
     GROUP BY p.id, p.name
     ORDER BY doanhThu DESC
     LIMIT 5`,
    [batDau, ketThuc]
  );

  // 4. Biểu đồ doanh thu theo tháng (hoặc ngày nếu khoảng <= 60 ngày)
  const [rowsBieuDo] = await db.pool.query(
    `SELECT
       DATE_FORMAT(
         GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt)),
         '%Y-%m'
       ) AS thang,
       COALESCE(SUM(co.totalAmount), 0) AS doanhThu,
       COUNT(*) AS soDon
     FROM CustomerOrder co
     ${JOIN_PAYMENT_HOAN_THANH}
     WHERE co.status = 'COMPLETED'
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) >= ?
       AND DATE(GREATEST(co.updatedAt, COALESCE(pRevenue.fullyPaidAt, co.updatedAt))) <= ?
     GROUP BY thang
     ORDER BY thang ASC`,
    [batDau, ketThuc]
  );

  const doanhThu = Number(rowTongHop[0]?.doanhThu) || 0;
  const soDonHoanTat = Number(rowTongHop[0]?.soDonHoanTat) || 0;
  const tongSoDon = Number(rowDon[0]?.tongSoDon) || 0;
  const soDonHuy = Number(rowDon[0]?.soDonHuy) || 0;
  const tyLeHuy = tongSoDon > 0 ? ((soDonHuy / tongSoDon) * 100).toFixed(1) : "0";
  const giaTriTB = soDonHoanTat > 0 ? Math.round(doanhThu / soDonHoanTat) : 0;

  return {
    khoangThoiGian: { tuNgay: batDau, denNgay: ketThuc },
    doanhThuVnd: doanhThu,
    soDonHoanTat,
    tongSoDon,
    soDonHuy,
    tyLeHuyPhanTram: parseFloat(tyLeHuy),
    giaTriTrungBinhDon: giaTriTB,
    topSanPham: rowsTop.map((r) => ({
      ten: r.tenSanPham,
      soLuong: Number(r.soLuong),
      doanhThu: Number(r.doanhThu),
    })),
    bieuDoThang: rowsBieuDo.map((r) => ({
      thang: r.thang,
      doanhThu: Number(r.doanhThu),
      soDon: Number(r.soDon),
    })),
  };
}

// =====================================================================
// GỌI GEMINI API
// =====================================================================

/**
 * Gửi số liệu thống kê lên Gemini API và trả về nhận xét bằng tiếng Việt.
 * @param {string} tuNgay
 * @param {string} denNgay
 * @returns {Promise<string>} - Nội dung phân tích từ AI
 */
async function phanTichDoanhThu(tuNgay, denNgay) {
  const apiKey = process.env.GEMINI_API_KEY_ADMIN;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình trong file .env");
  }

  // 1. Lấy số liệu từ DB
  const duLieu = await layDuLieuChoAI(tuNgay, denNgay);

  // 2. Định dạng tiền VNĐ
  const formatTien = (n) => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")} tỷ đồng`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.?0+$/, "")} triệu đồng`;
    return n.toLocaleString("vi-VN") + " đồng";
  };

  // 3. Xây dựng prompt
  const topSanPhamText = duLieu.topSanPham
    .map((sp, i) => `  ${i + 1}. ${sp.ten}: ${sp.soLuong} cái – Doanh thu ${formatTien(sp.doanhThu)}`)
    .join("\n");

  const bieuDoText = duLieu.bieuDoThang
    .map((m) => `  ${m.thang}: Doanh thu ${formatTien(m.doanhThu)}, ${m.soDon} đơn`)
    .join("\n");

  const prompt = `Bạn là chuyên gia phân tích kinh doanh cho cửa hàng áo in theo yêu cầu TeeStudio.
Dưới đây là số liệu thống kê doanh thu trong khoảng thời gian từ ${duLieu.khoangThoiGian.tuNgay} đến ${duLieu.khoangThoiGian.denNgay}:

📊 CHỈ SỐ TỔNG HỢP:
- Tổng doanh thu: ${formatTien(duLieu.doanhThuVnd)}
- Số đơn hoàn tất: ${duLieu.soDonHoanTat} đơn
- Tổng số đơn hàng phát sinh: ${duLieu.tongSoDon} đơn
- Số đơn bị hủy: ${duLieu.soDonHuy} đơn (tỷ lệ hủy: ${duLieu.tyLeHuyPhanTram}%)
- Giá trị trung bình mỗi đơn: ${formatTien(duLieu.giaTriTrungBinhDon)}

🏆 TOP SẢN PHẨM BÁN CHẠY:
${topSanPhamText || "  (Không có dữ liệu)"}

📈 DOANH THU THEO THÁNG:
${bieuDoText || "  (Không có dữ liệu)"}

Hãy phân tích và đưa ra nhận xét ngắn gọn (5-8 câu) bằng tiếng Việt, gồm:
1. Đánh giá tình hình doanh thu tổng thể (tốt/xấu, xu hướng).
2. Nhận xét về sản phẩm bán chạy nhất và xu hướng.
3. Đưa ra 2-3 lời khuyên cụ thể giúp tăng doanh thu cho tháng tiếp theo.

Trả lời bằng văn xuôi tự nhiên, thân thiện, không dùng markdown hay bullet list.`;

  // 4. Gọi Gemini API
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API lỗi ${response.status}: ${errText}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini API không trả về nội dung.");
  }

  return { nhanXet: text, duLieu };
}

// =====================================================================
// EXPORTS
// =====================================================================

module.exports = { phanTichDoanhThu };
