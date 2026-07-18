/**
 * customer.promotion.service.js – Validate mã khuyến mãi cho khách hàng lúc
 * checkout (xem trước số tiền giảm trước khi đặt hàng thật).
 *
 * POST /api/promotions/validate
 */

const db = require("../../database/mysql");
const { apDungMaGiamGia, taoLoi } = require("./promotion.service");

/**
 * validateMaGiamGia - Tra mã theo `code` (không phân biệt hoa/thường, tự trim
 * + uppercase khớp đúng cách `code` được chuẩn hoá lúc admin tạo mã - xem
 * chuanHoaPromotionInput trong admin.promotion.service.js), rồi áp dụng cùng
 * bộ quy tắc với lúc tạo đơn thật (apDungMaGiamGia).
 *
 * LƯU Ý: orderAmount ở đây là subtotal khách đang thấy ở checkout (tổng
 * price × quantity của giỏ hàng), CHƯA gồm phí thiết kế riêng (Design Studio
 * POD) vì giỏ hàng phía frontend hiện chưa lưu phí này. Đây là số xem trước
 * cho khách quyết định có nhập mã hay không; số tiền giảm THẬT SỰ áp dụng vẫn
 * do customer.order.service.js tính lại độc lập từ dữ liệu DB lúc tạo đơn
 * (không tin số liệu từ client), nên khách không thể "gian lận" mã giảm giá
 * bằng cách gửi orderAmount sai - chỉ có thể khiến bước xem trước không khớp
 * 100% với đơn thật trong trường hợp có phí thiết kế, đơn tạo ra vẫn đúng.
 */
async function validateMaGiamGia({ code, userId, orderAmount }) {
  const maChuanHoa = String(code || "").trim().toUpperCase();
  if (!maChuanHoa) {
    throw taoLoi("Vui lòng nhập mã khuyến mãi");
  }

  const [rowsPromo] = await db.pool.query(
    `SELECT id, code, discountType, discountValue, minOrderAmount,
            usageLimit, usedCount, startDate, endDate, status, isNewCustomerOnly
     FROM Promotion
     WHERE code = ? LIMIT 1`,
    [maChuanHoa]
  );
  if (rowsPromo.length === 0) {
    throw taoLoi("Mã khuyến mãi không tồn tại", 404);
  }
  const promo = rowsPromo[0];

  const { discountAmount, mienPhiVanChuyen } = await apDungMaGiamGia(promo, {
    userId,
    orderBaseAmount: Number(orderAmount) || 0,
  });

  return {
    promotionId: promo.id,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: Number(promo.discountValue),
    discountAmount,
    mienPhiVanChuyen,
  };
}

module.exports = { validateMaGiamGia };
