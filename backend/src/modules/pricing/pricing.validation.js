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

        const discountTypes = ["PERCENT", "FIXED"];
        const hasValidType = discountTypes.includes(promotion.discountType);
        const hasValidValue = !Number.isNaN(Number(promotion.discountValue));

        if (!hasValidType) {
          return "promotion.discountType must be PERCENT or FIXED";
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
