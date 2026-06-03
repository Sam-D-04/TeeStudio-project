const uploadImageMetaSchema = {
  body: {
    folder: {
      type: "string",
      maxLength: 100,
    },
    altText: {
      type: "string",
      maxLength: 300,
    },
  },
};

module.exports = {
  uploadImageMetaSchema,
};
