const createDesignSchema = {
  body: {
    productId: {
      required: true,
      type: "integer",
      min: 1,
    },
    baseColor: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 20,
    },
    canvasData: {
      required: true,
      custom: (canvasData) => {
        const isValid =
          typeof canvasData === "object" || typeof canvasData === "string";
        return isValid || "canvasData must be an object or JSON string";
      },
    },
    previewUrl: {
      type: "string",
      maxLength: 500,
    },
    designFee: {
      type: "number",
      min: 0,
    },
  },
};

const updateDesignStatusSchema = {
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
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
    },
  },
};

module.exports = {
  createDesignSchema,
  updateDesignStatusSchema,
};
