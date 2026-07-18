/**
 * promotion.service.js – Logic áp dụng 1 mã khuyến mãi, DÙNG CHUNG bởi:
 *  - customer.promotion.service.js (validate mã lúc khách nhập ở checkout,
 *    chỉ xem trước số tiền giảm, KHÔNG ghi PromotionUsage)
 *  - customer.order.service.js (áp dụng thật lúc tạo đơn, CÓ ghi PromotionUsage)
 *
 * Tách chung để 2 nơi không bao giờ lệch luật hay lệch cách tính - sửa quy tắc
 * ở 1 chỗ duy nhất, cả bước xem trước lẫn bước tạo đơn thật đều tự động nhất quán.
 */

const db = require("../../database/mysql");

function taoLoi(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * apDungMaGiamGia - Kiểm tra 1 dòng Promotion (đã SELECT sẵn từ DB) có áp dụng
 * được cho khách hàng + đơn hàng hiện tại hay không, và tính số tiền giảm.
 *
 * @param {object} promo - 1 dòng từ bảng Promotion: id, code, discountType,
 *   discountValue, minOrderAmount, usageLimit, usedCount, startDate, endDate,
 *   status, isNewCustomerOnly.
 * @param {object} ctx
 * @param {number} ctx.userId
 * @param {number} ctx.orderBaseAmount - subtotal + tổng phí thiết kế (chưa gồm phí ship)
 * @returns {Promise<{ discountAmount: number, mienPhiVanChuyen: boolean }>}
 *   discountAmount đã làm tròn 2 chữ số thập phân, không vượt quá orderBaseAmount.
 *   mienPhiVanChuyen = true nếu discountType là FREE_SHIPPING (nơi gọi tự quyết
 *   định set shippingFee = 0, hàm này không đụng vào shippingFee).
 * @throws lỗi có statusCode (400) kèm thông báo tiếng Việt nếu không áp dụng được.
 */
async function apDungMaGiamGia(promo, { userId, orderBaseAmount }) {
  const now = new Date();

  if (promo.status !== "ACTIVE") {
    throw taoLoi("Mã khuyến mãi không còn hiệu lực");
  }

  if (
    new Date(promo.startDate) > now ||
    (promo.endDate && new Date(promo.endDate) < now)
  ) {
    throw taoLoi("Mã khuyến mãi đã hết hạn hoặc chưa đến ngày áp dụng");
  }

  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    throw taoLoi("Mã khuyến mãi đã hết lượt sử dụng");
  }

  if (promo.isNewCustomerOnly) {
    const [rowsExistingOrders] = await db.pool.query(
      "SELECT id FROM CustomerOrder WHERE userId = ? LIMIT 1",
      [userId]
    );
    if (rowsExistingOrders.length > 0) {
      throw taoLoi("Mã khuyến mãi này chỉ dành cho khách hàng chưa từng đặt hàng");
    }
  }

  if (orderBaseAmount < Number(promo.minOrderAmount)) {
    throw taoLoi(
      `Đơn hàng cần tối thiểu ${Number(promo.minOrderAmount).toLocaleString("vi-VN")}₫ để áp dụng mã khuyến mãi này`
    );
  }

  const [rowsUsed] = await db.pool.query(
    "SELECT id FROM PromotionUsage WHERE promotionId = ? AND userId = ? LIMIT 1",
    [promo.id, userId]
  );
  if (rowsUsed.length > 0) {
    throw taoLoi(
      `Khách hàng này đã sử dụng mã khuyến mãi "${promo.code}" trước đó. Mỗi khách chỉ được dùng mỗi mã 1 lần`
    );
  }

  let discountAmount = 0;
  let mienPhiVanChuyen = false;
  if (promo.discountType === "PERCENT") {
    discountAmount = orderBaseAmount * (Number(promo.discountValue) / 100);
  } else if (promo.discountType === "FIXED") {
    discountAmount = Number(promo.discountValue);
  } else if (promo.discountType === "FREE_SHIPPING") {
    mienPhiVanChuyen = true;
  }
  discountAmount = Math.min(discountAmount, orderBaseAmount);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return { discountAmount, mienPhiVanChuyen };
}

module.exports = { apDungMaGiamGia, taoLoi };
