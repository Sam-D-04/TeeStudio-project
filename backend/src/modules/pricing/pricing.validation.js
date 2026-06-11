const calculateQuoteSchema = {
  body: {
    basePrice: {
      required: true,
      type: "number",
      min: 0,
    },
    quantity: {
      required: true,
      type: "integer",
      min: 1,
    },
    designFee: {
      type: "number",
      min: 0,
    },
    printPositions: {
      type: "array",
      custom: (positions) => {
        const isValid = positions.every((position) => {
          return (
            position &&
            !Number.isNaN(Number(position.extraCost || 0))
          );
        });

        return isValid || "printPositions extraCost must be numeric";
      },
    },
    bulkDiscountPercent: {
      type: "number",
      min: 0,
      max: 100,
    },
    promotion: {
      type: "object",
      custom: (promotion) => {
        if (!promotion) {
          return true;
        }

        const discountTypes = ["PERCENT", "FIXED", "FREE_SHIPPING"];
        const hasValidType = discountTypes.includes(promotion.discountType);
        const hasValidValue =
          promotion.discountType === "FREE_SHIPPING" ||
          !Number.isNaN(Number(promotion.discountValue));

        if (!hasValidType) {
          return "promotion.discountType phải là PERCENT, FIXED hoặc FREE_SHIPPING";
        }

        if (!hasValidValue) {
          return "promotion.discountValue must be numeric";
        }

        return true;
      },
    },
  },
};

module.exports = {
  calculateQuoteSchema,
};
