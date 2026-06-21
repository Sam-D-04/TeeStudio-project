const createCategorySchema = {
  body: {
    name: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 200,
    },
  },
};

const categoryIdParamSchema = {
  params: {
    id: {
      required: true,
      type: "integer",
      min: 1,
    },
  },
};

module.exports = {
  createCategorySchema,
  categoryIdParamSchema,
};
