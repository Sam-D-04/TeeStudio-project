const idParams = {
  id: {
    label: "ID",
    required: true,
    type: "integer",
    min: 1,
  },
};

const promotionBody = {
  code: {
    label: "Mã khuyến mãi",
    required: true,
    type: "string",
    minLength: 2,
    maxLength: 50,
    pattern: /^[A-Za-z0-9_-]+$/,
  },
  discountType: {
    label: "Loại giảm giá",
    required: true,
    type: "string",
    enum: ["PERCENT", "FIXED", "FREE_SHIPPING"],
  },
  discountValue: {
    label: "Giá trị giảm",
    required: true,
    type: "number",
    min: 0,
  },
  minOrderAmount: {
    label: "Đơn hàng tối thiểu",
    type: "number",
    min: 0,
  },
  startDate: {
    label: "Ngày bắt đầu",
    required: true,
    type: "string",
    pattern: /^\d{4}-\d{2}-\d{2}$/,
  },
  endDate: {
    label: "Ngày kết thúc",
    type: "string",
    pattern: /^\d{4}-\d{2}-\d{2}$/,
  },
  usageLimit: {
    label: "Giới hạn lượt dùng",
    type: "integer",
    min: 1,
  },
  isNewCustomerOnly: {
    label: "Chỉ dành cho khách hàng mới",
    type: "boolean",
  },
  status: {
    label: "Trạng thái",
    type: "string",
    enum: ["ACTIVE", "INACTIVE"],
  },
};

const listPromotionsSchema = {
  query: {
    trang: { label: "Trang", type: "integer", min: 1 },
    soMoiTrang: { label: "Số dòng mỗi trang", type: "integer", min: 1, max: 100 },
    tuKhoa: { label: "Từ khóa", type: "string", maxLength: 100 },
    trangThai: {
      label: "Trạng thái",
      type: "string",
      enum: ["dang_hoat_dong", "tam_dung", "het_han", "sap_dien_ra"],
    },
    loaiGiam: {
      label: "Loại giảm giá",
      type: "string",
      enum: ["PERCENT", "FIXED", "FREE_SHIPPING"],
    },
    tuNgay: { label: "Từ ngày", type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/ },
    denNgay: { label: "Đến ngày", type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/ },
    hetHanTrongNgay: {
      label: "Số ngày sắp hết hạn",
      type: "integer",
      min: 1,
      max: 365,
    },
    kySuDung: {
      label: "Kỳ sử dụng",
      type: "string",
      enum: ["THIS_MONTH"],
    },
    kyGiamGia: {
      label: "Kỳ giảm giá",
      type: "string",
      enum: ["THIS_MONTH"],
    },
  },
};

const createPromotionSchema = { body: promotionBody };
const updatePromotionSchema = { params: idParams, body: promotionBody };

const updatePromotionStatusSchema = {
  params: idParams,
  body: {
    status: {
      label: "Trạng thái",
      required: true,
      type: "string",
      enum: ["ACTIVE", "INACTIVE"],
    },
  },
};

const idSchema = { params: idParams };

const getBulkPricingSchema = {
  query: {
    productId: {
      label: "Sản phẩm",
      required: true,
      type: "integer",
      min: 1,
    },
  },
};

const bulkPricingBody = {
  productId: {
    label: "Sản phẩm",
    required: true,
    type: "integer",
    min: 1,
  },
  minQty: {
    label: "Số lượng tối thiểu",
    required: true,
    type: "integer",
    min: 2,
  },
  discountPercent: {
    label: "Phần trăm giảm",
    required: true,
    type: "number",
    min: 0.01,
    max: 100,
  },
};

const createBulkPricingSchema = { body: bulkPricingBody };
const updateBulkPricingSchema = { params: idParams, body: bulkPricingBody };

const updateSurchargeSchema = {
  params: idParams,
  body: {
    loai: {
      label: "Loại phụ phí",
      required: true,
      type: "string",
      enum: ["VI_TRI_IN", "PHUONG_PHAP_IN"],
    },
    extraCost: {
      label: "Phụ phí",
      required: true,
      type: "number",
      min: 0,
    },
    isActive: {
      label: "Trạng thái áp dụng",
      required: true,
      type: "boolean",
    },
  },
};

const updatePricingFormulaSchema = {
  body: {
    roundingUnit: {
      label: "Đơn vị làm tròn",
      required: true,
      type: "integer",
      min: 1,
      max: 1000000,
    },
    defaultShippingFee: {
      label: "Phí vận chuyển mặc định",
      required: true,
      type: "number",
      min: 0,
    },
    freeShippingThreshold: {
      label: "Ngưỡng miễn phí vận chuyển",
      required: true,
      type: "number",
      min: 0,
    },
    vatPercent: {
      label: "Thuế VAT",
      required: true,
      type: "number",
      min: 0,
      max: 30,
    },
  },
};

module.exports = {
  listPromotionsSchema,
  createPromotionSchema,
  updatePromotionSchema,
  updatePromotionStatusSchema,
  idSchema,
  getBulkPricingSchema,
  createBulkPricingSchema,
  updateBulkPricingSchema,
  updateSurchargeSchema,
  updatePricingFormulaSchema,
};
