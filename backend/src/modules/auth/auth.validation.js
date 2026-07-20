// Rule mật khẩu dùng chung cho đăng ký và đặt lại mật khẩu.
const passwordRule = {
  label: "Mật khẩu",
  required: true,
  type: "string",
  minLength: 8,
  maxLength: 100,
  pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
};

const registerSchema = {
  body: {
    email: {
      label: "Email",
      required: true,
      type: "string",
      email: true,
      maxLength: 255,
    },
    password: passwordRule,
    fullName: {
      label: "Họ và tên",
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 255,
      custom: (value) => value.trim().length >= 2 || "Họ và tên không hợp lệ",
    },
    phone: {
      label: "Số điện thoại",
      required: true,
      type: "string",
      minLength: 9,
      maxLength: 20,
      pattern: /^(?=.*\d)[0-9+\s().-]+$/,
    },
  },
};

const loginSchema = {
  body: {
    email: {
      label: "Email",
      required: true,
      type: "string",
      email: true,
      maxLength: 255,
    },
    password: {
      label: "Mật khẩu",
      required: true,
      type: "string",
      minLength: 1,
      maxLength: 100,
    },
  },
};

const refreshTokenSchema = {
  body: {
    refreshToken: {
      label: "Refresh token",
      required: true,
      type: "string",
      minLength: 20,
      maxLength: 500,
    },
  },
};

const verifyEmailSchema = {
  body: {
    token: {
      label: "Token",
      required: true,
      type: "string",
      minLength: 20,
      maxLength: 200,
    },
  },
};

const forgotPasswordSchema = {
  body: {
    email: {
      label: "Email",
      required: true,
      type: "string",
      email: true,
      maxLength: 255,
    },
  },
};

const resetPasswordSchema = {
  body: {
    token: {
      label: "Token",
      required: true,
      type: "string",
      minLength: 20,
      maxLength: 200,
    },
    newPassword: passwordRule,
  },
};

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
