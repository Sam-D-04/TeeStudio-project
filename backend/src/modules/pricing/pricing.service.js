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

module.exports = {
  calculateDesignQuote,
};
