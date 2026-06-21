const updateProfileSchema = {
  body: {
    fullName: {
      label: "Họ và tên",
      type: "string",
      minLength: 2,
      maxLength: 255,
      custom: (value) => value.trim().length >= 2 || "Họ và tên không hợp lệ",
    },
    phone: {
      label: "Số điện thoại",
      type: "string",
      minLength: 9,
      maxLength: 20,
      pattern: /^(?=.*\d)[0-9+\s().-]+$/,
    },
  },
};

const createAddressSchema = {
  body: {
    recipientName: {
      label: "Tên người nhận",
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 255,
      custom: (value) => value.trim().length >= 2 || "Tên người nhận không hợp lệ",
    },
    phone: {
      label: "Số điện thoại",
      required: true,
      type: "string",
      minLength: 9,
      maxLength: 20,
    },
    addressLine: {
      label: "Địa chỉ",
      required: true,
      type: "string",
      minLength: 5,
    },
    city: {
      label: "Tỉnh/thành phố",
      required: true,
      type: "string",
      maxLength: 100,
    },
    district: {
      label: "Quận/huyện",
      required: true,
      type: "string",
      maxLength: 100,
    },
    ward: {
      label: "Phường/xã",
      required: true,
      type: "string",
      maxLength: 100,
    },
    isDefault: {
      label: "Địa chỉ mặc định",
      type: "boolean",
    },
  },
};

const createStaffSchema = {
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
      minLength: 8,
      maxLength: 100,
      pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
    },
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
    role: {
      label: "Vai trò",
      required: true,
      type: "string",
      enum: ["ADMIN", "WAREHOUSE", "PRODUCTION"],
    },
  },
};

const updateStaffSchema = {
  params: {
    id: {
      label: "ID nhân sự",
      required: true,
      type: "integer",
      min: 1,
    },
  },
  body: {
    role: {
      label: "Vai trò",
      type: "string",
      enum: ["ADMIN", "WAREHOUSE", "PRODUCTION"],
    },
    status: {
      label: "Trạng thái",
      type: "string",
      enum: ["ACTIVE", "INACTIVE"],
    },
  },
};

module.exports = {
  updateProfileSchema,
  createAddressSchema,
  createStaffSchema,
  updateStaffSchema,
};
