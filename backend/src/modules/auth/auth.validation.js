const registerSchema = {
  body: {
    email: {
      required: true,
      type: "string",
      email: true,
      maxLength: 255,
    },
    password: {
      required: true,
      type: "string",
      minLength: 6,
      maxLength: 100,
    },
    fullName: {
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
  },
};

const loginSchema = {
  body: {
    email: {
      required: true,
      type: "string",
      email: true,
      maxLength: 255,
    },
    password: {
      required: true,
      type: "string",
      minLength: 6,
      maxLength: 100,
    },
  },
};

const refreshTokenSchema = {
  body: {
    refreshToken: {
      required: true,
      type: "string",
      minLength: 20,
      maxLength: 500,
    },
  },
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
