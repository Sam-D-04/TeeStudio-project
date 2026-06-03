const updateProfileSchema = {
  body: {
    fullName: {
      type: "string",
      minLength: 2,
      maxLength: 255,
    },
    phone: {
      type: "string",
      minLength: 9,
      maxLength: 20,
    },
  },
};

const createAddressSchema = {
  body: {
    recipientName: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 255,
    },
    phone: {
      required: true,
      type: "string",
      minLength: 9,
      maxLength: 20,
    },
    addressLine: {
      required: true,
      type: "string",
      minLength: 5,
    },
    city: {
      required: true,
      type: "string",
      maxLength: 100,
    },
    district: {
      required: true,
      type: "string",
      maxLength: 100,
    },
    ward: {
      required: true,
      type: "string",
      maxLength: 100,
    },
    isDefault: {
      type: "boolean",
    },
  },
};

module.exports = {
  updateProfileSchema,
  createAddressSchema,
};
