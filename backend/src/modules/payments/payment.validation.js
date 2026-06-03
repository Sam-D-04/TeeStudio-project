const createPaymentSchema = {
  body: {
    orderId: {
      required: true,
      type: "integer",
      min: 1,
    },
    amount: {
      required: true,
      type: "number",
      min: 0,
    },
    paymentMethod: {
      required: true,
      type: "string",
      enum: ["COD", "VNPAY"],
    },
    paymentType: {
      required: true,
      type: "string",
      enum: ["FULL", "DEPOSIT"],
    },
  },
};

const updatePaymentStatusSchema = {
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
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"],
    },
  },
};

module.exports = {
  createPaymentSchema,
  updatePaymentStatusSchema,
};
