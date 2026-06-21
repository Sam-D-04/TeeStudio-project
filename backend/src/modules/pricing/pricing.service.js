const {
  toMoney,
  calculatePercentAmount,
  calculateFixedAmount,
  clampDiscount,
} = require("./pricing.utils");

const calculatePrintPositionsCost = (printPositions = []) => {
  return toMoney(
    printPositions.reduce((total, position) => {
      return total + Number(position.extraCost || 0);
    }, 0)
  );
};

const calculateBulkDiscount = (subtotal, bulkDiscountPercent = 0) => {
  return clampDiscount(
    subtotal,
    calculatePercentAmount(subtotal, bulkDiscountPercent)
  );
};

const calculatePromotionDiscount = (amountAfterBulkDiscount, promotion) => {
  if (!promotion) {
    return 0;
  }

  const minOrderAmount = Number(promotion.minOrderAmount || 0);
  if (amountAfterBulkDiscount < minOrderAmount) {
    return 0;
  }

  if (promotion.discountType === "PERCENT") {
    return clampDiscount(
      amountAfterBulkDiscount,
      calculatePercentAmount(
        amountAfterBulkDiscount,
        promotion.discountValue
      )
    );
  }

  return clampDiscount(
    amountAfterBulkDiscount,
    calculateFixedAmount(promotion.discountValue)
  );
};

const calculateDesignQuote = ({
  basePrice,
  quantity,
  designFee = 0,
  printPositions = [],
  bulkDiscountPercent = 0,
  promotion = null,
}) => {
  const printPositionsCost = calculatePrintPositionsCost(printPositions);
  const unitPriceBeforeDiscount = toMoney(
    Number(basePrice) + Number(designFee) + printPositionsCost
  );
  const subtotal = toMoney(unitPriceBeforeDiscount * Number(quantity));
  const bulkDiscount = calculateBulkDiscount(subtotal, bulkDiscountPercent);
  const amountAfterBulkDiscount = toMoney(subtotal - bulkDiscount);
  const promotionDiscount = calculatePromotionDiscount(
    amountAfterBulkDiscount,
    promotion
  );
  const totalAmount = toMoney(
    Math.max(amountAfterBulkDiscount - promotionDiscount, 0)
  );

  return {
    quantity: Number(quantity),
    basePrice: toMoney(basePrice),
    designFee: toMoney(designFee),
    printPositionsCost,
    unitPriceBeforeDiscount,
    subtotal,
    discounts: {
      bulkDiscount,
      promotionDiscount,
      totalDiscount: toMoney(bulkDiscount + promotionDiscount),
    },
    totalAmount,
  };
};

/**
 * Tính phụ phí thiết kế (designFee) dựa trên diện tích bao phủ (Bounding Box)
 * của toàn bộ chi tiết (Text, Image, Sticker) trên canvas thiết kế.
 *
 * Thuật toán:
 *   - Vẽ 1 hình chữ nhật ảo bao quanh tất cả các item (kể cả đè chồng lên nhau).
 *   - Chuyển đổi diện tích đó từ px² sang cm² (tỷ lệ: 1 cm = 15 px).
 *   - Đối chiếu với 3 bậc giá để trả về designFee.
 *
 * Bậc giá:
 *   - Mức 1: Bao phủ <= 100 cm²  → 0đ       (Cụm logo/chữ nhỏ)
 *   - Mức 2: Bao phủ <= 600 cm²  → 30.000đ  (Hình in cỡ A4)
 *   - Mức 3: Bao phủ >  600 cm²  → 60.000đ  (Hình in tràn áo)
 *
 * @param {object|string} canvasData - Dữ liệu JSON của canvas (có thể là object hoặc string)
 * @returns {number} designFee – Phụ phí thiết kế (VNĐ)
 */
const PIXELS_PER_CM = 4.67;

const FEE_TIERS = [
  { maxAreaCm2: 100, fee: 0 },
  { maxAreaCm2: 600, fee: 30000 },
];
const FEE_MAX = 60000;

const calculateBoundingBoxAreaFee = (canvasData) => {
  try {
    // Hỗ trợ cả dạng string JSON và object
    const data = typeof canvasData === 'string' ? JSON.parse(canvasData) : canvasData;

    // Tự nhận diện cấu trúc: ưu tiên 'objects' (Fabric.js chuẩn), fallback sang 'layers'
    const items = data.objects || data.layers || [];

    if (!items || items.length === 0) return 0;

    // Khởi tạo với giá trị đảo ngược để tìm min/max chính xác
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    items.forEach((item) => {
      // Lấy tọa độ và kích thước thực tế sau khi scale
      const left   = item.left   ?? item.x ?? 0;
      const top    = item.top    ?? item.y ?? 0;
      const scaleX = item.scaleX ?? 1;
      const scaleY = item.scaleY ?? 1;
      const w      = (item.width  ?? item.w ?? 0) * scaleX;
      const h      = (item.height ?? item.h ?? 0) * scaleY;

      // Fabric.js: tọa độ (left, top) là điểm trung tâm của object theo mặc định
      // => Góc trái-trên = left - w/2, góc phải-dưới = left + w/2
      const x1 = left - w / 2;
      const y1 = top  - h / 2;
      const x2 = left + w / 2;
      const y2 = top  + h / 2;

      if (x1 < minX) minX = x1;
      if (y1 < minY) minY = y1;
      if (x2 > maxX) maxX = x2;
      if (y2 > maxY) maxY = y2;
    });

    // Tính Bounding Box (px) và đổi sang cm²
    const boundingWidthCm  = Math.max(0, maxX - minX) / PIXELS_PER_CM;
    const boundingHeightCm = Math.max(0, maxY - minY) / PIXELS_PER_CM;
    const totalAreaCm2     = boundingWidthCm * boundingHeightCm;

    // Đối chiếu bậc giá
    for (const tier of FEE_TIERS) {
      if (totalAreaCm2 <= tier.maxAreaCm2) return tier.fee;
    }
    return FEE_MAX;

  } catch (err) {
    console.error('[pricing] calculateBoundingBoxAreaFee error:', err.message);
    return 0; // Nếu parse JSON lỗi thì miễn phí, không làm lỗi luồng lưu
  }
};

module.exports = {
  calculateDesignQuote,
  calculateBoundingBoxAreaFee,
  PIXELS_PER_CM,
  FEE_TIERS,
  FEE_MAX,
};
