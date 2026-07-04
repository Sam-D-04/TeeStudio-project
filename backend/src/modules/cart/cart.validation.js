const addCartItemSchema = {
  body: {
    variantId: { required: true, type: "integer", min: 1 },
    quantity: { type: "integer", min: 1 },
    designId: { type: "integer", min: 1 },
  },
};

const updateCartItemQuantitySchema = {
  params: { id: { required: true, type: "integer", min: 1 } },
  body: { quantity: { required: true, type: "integer", min: 1 } },
};

module.exports = { addCartItemSchema, updateCartItemQuantitySchema };
