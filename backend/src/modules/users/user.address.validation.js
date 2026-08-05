const addressFields = {
  recipientName: {
    label: "Tên người nhận",
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 255,
  },
  phone: {
    label: "Số điện thoại",
    required: true,
    type: "string",
    minLength: 9,
    maxLength: 20,
    pattern: /^(?=.*\d)[0-9+\s().-]+$/,
  },
  addressLine: {
    label: "Số nhà, tên đường",
    required: true,
    type: "string",
    minLength: 3,
    maxLength: 500,
  },
  city: {
    label: "Tỉnh/Thành phố",
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 100,
  },
  ward: {
    label: "Phường/Xã",
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 100,
  },
  isDefault: {
    label: "Đặt làm mặc định",
    required: false,
    type: "boolean",
  },
};

const createAddressSchema = { body: addressFields };
const updateAddressSchema = { body: addressFields };

module.exports = {
  createAddressSchema,
  updateAddressSchema,
};
