const {
  toMoney,
  calculatePercentAmount,
  calculateFixedAmount,
  clampDiscount,
} = require("./pricing.utils");
const db = require("../../database/mysql");

const DEFAULT_CONFIGURATION = {
  defaultShippingFee: 30000,
  freeShippingThreshold: 500000,
  vatPercent: 0,
};

const ROUNDING_UNIT = 1000;

const getPricingConfiguration = async () => {
  const [rows] = await db.pool.query(
    `SELECT defaultShippingFee, freeShippingThreshold, vatPercent
     FROM PricingConfiguration WHERE id = 1 LIMIT 1`
  );
  if (!rows.length) return DEFAULT_CONFIGURATION;
  return {
    defaultShippingFee: Number(rows[0].defaultShippingFee),
    freeShippingThreshold: Number(rows[0].freeShippingThreshold),
    vatPercent: Number(rows[0].vatPercent),
  };
};

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

  if (promotion.discountType === "FREE_SHIPPING") {
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

const calculateDesignQuote = async ({
  basePrice,
  quantity,
  designFee = 0,
  printPositions = [],
  bulkDiscountPercent = 0,
  promotion = null,
}) => {
  const configuration = await getPricingConfiguration();
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
  const amountAfterPromotion = toMoney(
    Math.max(amountAfterBulkDiscount - promotionDiscount, 0)
  );
  const promotionEligible =
    promotion &&
    amountAfterBulkDiscount >= Number(promotion.minOrderAmount || 0);
  const shippingFee =
    (promotionEligible && promotion.discountType === "FREE_SHIPPING") ||
    (configuration.freeShippingThreshold > 0 &&
      amountAfterPromotion >= configuration.freeShippingThreshold)
      ? 0
      : configuration.defaultShippingFee;
  const vatAmount = toMoney(
    (amountAfterPromotion * configuration.vatPercent) / 100
  );
  const amountBeforeRounding = toMoney(
    amountAfterPromotion + shippingFee + vatAmount
  );
  const totalAmount = toMoney(
    Math.round(amountBeforeRounding / ROUNDING_UNIT) * ROUNDING_UNIT
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
    shippingFee: toMoney(shippingFee),
    vatAmount,
    amountBeforeRounding,
    pricingConfiguration: configuration,
    totalAmount,
  };
};

module.exports = {
  calculateDesignQuote,
};
