const createStickerSchema = {
  body: {
    name: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 200,
    },
    category: {
      required: true,
      type: "string",
      maxLength: 100,
    },
    imageUrl: {
      required: true,
      type: "string",
      maxLength: 500,
    },
    sortOrder: {
      type: "integer",
      min: 0,
    },
    isActive: {
      type: "boolean",
    },
  },
};

module.exports = {
  createStickerSchema,
};
