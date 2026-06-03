const createInventoryTransactionSchema = {
  body: {
    variantId: {
      required: true,
      type: "integer",
      min: 1,
    },
    orderId: {
      type: "integer",
      min: 1,
    },
    quantityChanged: {
      required: true,
      type: "integer",
      custom: (quantityChanged) => {
        return Number(quantityChanged) !== 0 || "quantityChanged must not be 0";
      },
    },
    transactionType: {
      required: true,
      type: "string",
      enum: ["IMPORT", "EXPORT", "ADJUSTMENT", "ORDER_EXPORT", "RETURN"],
    },
    reason: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 300,
    },
  },
};

module.exports = {
  createInventoryTransactionSchema,
};
