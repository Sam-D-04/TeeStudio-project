const createPromotionSchema = {
  body: {
    code: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 50,
    },
    discountType: {
      required: true,
      type: "string",
      enum: ["PERCENT", "FIXED"],
    },
    discountValue: {
      required: true,
      type: "number",
      min: 0,
    },
    minOrderAmount: {
      type: "number",
      min: 0,
    },
    startDate: {
      required: true,
      type: "string",
    },
    endDate: {
      required: true,
      type: "string",
    },
    usageLimit: {
      required: true,
      type: "integer",
      min: 1,
    },
  },
};

const updatePromotionStatusSchema = {
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
      enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
    },
  },
};

module.exports = {
  createPromotionSchema,
  updatePromotionStatusSchema,
};
