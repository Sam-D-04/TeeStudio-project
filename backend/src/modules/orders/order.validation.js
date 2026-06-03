const checkoutSchema = {
  body: {
    addressId: {
      required: true,
      type: "integer",
      min: 1,
    },
    items: {
      required: true,
      type: "array",
      custom: (items) => {
        return items.length > 0 || "items must contain at least one item";
      },
    },
    paymentMethod: {
      required: true,
      type: "string",
      enum: ["COD", "VNPAY"],
    },
    promotionCode: {
      type: "string",
      maxLength: 50,
    },
  },
};

const updateOrderStatusSchema = {
  params: {
    id: {
      required: true,
      type: "integer",
      min: 1,
    },
  },
  body: {
    status: {
      required: true,
      type: "string",
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PRINTING",
        "SHIPPING",
        "COMPLETED",
        "CANCELLED",
      ],
    },
  },
};

module.exports = {
  checkoutSchema,
  updateOrderStatusSchema,
};
