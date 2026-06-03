const createProductSchema = {
  body: {
    categoryId: {
      required: true,
      type: "integer",
      min: 1,
    },
    name: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 300,
    },
    slug: {
      type: "string",
      minLength: 2,
      maxLength: 300,
    },
    basePrice: {
      required: true,
      type: "number",
      min: 0,
    },
    material: {
      required: true,
      type: "string",
      maxLength: 200,
    },
    form: {
      required: true,
      type: "string",
      maxLength: 100,
    },
    madeIn: {
      required: true,
      type: "string",
      maxLength: 100,
    },
    description: {
      required: true,
      type: "string",
      minLength: 10,
    },
  },
};

const createVariantSchema = {
  body: {
    productId: {
      required: true,
      type: "integer",
      min: 1,
    },
    color: {
      required: true,
      type: "string",
      maxLength: 100,
    },
    size: {
      required: true,
      type: "string",
      maxLength: 20,
    },
    sku: {
      required: true,
      type: "string",
      maxLength: 100,
    },
    stockQty: {
      type: "integer",
      min: 0,
    },
  },
};

const updateProductStatusSchema = {
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
      enum: ["ACTIVE", "INACTIVE"],
    },
  },
};

module.exports = {
  createProductSchema,
  createVariantSchema,
  updateProductStatusSchema,
};
