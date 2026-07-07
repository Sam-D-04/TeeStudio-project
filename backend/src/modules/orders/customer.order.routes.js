/**
 * customer.order.routes.js – Route tạo đơn hàng dành cho Customer.
 * POST /api/orders  – Khách hàng đặt hàng (yêu cầu đăng nhập, role CUSTOMER)
 */

const router = require("express").Router();
const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");
const validate = require("../../common/middlewares/validate.middleware");
const orderService = require("./admin.order.service");

/**
 * Schema kiểm tra dữ liệu đầu vào khi customer đặt hàng.
 * Items phải chứa variantId (ID trong bảng ProductVariant) và quantity.
 */
const customerCheckoutSchema = {
  body: {
    recipientName: {
      required: true,
      type: "string",
      maxLength: 255,
    },
    phone: {
      required: true,
      type: "string",
      maxLength: 20,
    },
    email: {
      type: "string",
      maxLength: 255,
    },
    addressLine: {
      required: true,
      type: "string",
    },
    note: {
      type: "string",
      maxLength: 1000,
    },
    paymentMethod: {
      required: true,
      type: "string",
      enum: ["COD", "VNPAY"],
    },
    items: {
      required: true,
      type: "array",
      custom: (items) => {
        if (!Array.isArray(items) || items.length === 0) {
          return "Đơn hàng phải có ít nhất 1 sản phẩm";
        }
        for (const item of items) {
          if (!item.variantId || typeof item.variantId !== "number" || item.variantId < 1) {
            return "variantId không hợp lệ";
          }
          if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1) {
            return "quantity phải là số nguyên dương";
          }
        }
        return true;
      },
    },
    shippingFee: {
      type: "number",
      min: 0,
    },
    promotionId: {
      type: "integer",
      min: 1,
    },
  },
};

/**
 * POST /api/orders
 * Đặt hàng – yêu cầu đăng nhập và có role CUSTOMER.
 * Backend tự lấy userId từ req.user (token đã xác thực).
 */
router.post(
  "/",
  verifyToken,
  requireRoles(ROLES.CUSTOMER),
  validate(customerCheckoutSchema),
  async (req, res, next) => {
    try {
      // Gán userId từ token xác thực, không tin giá trị frontend gửi lên
      const data = {
        ...req.body,
        userId: req.user.id,
      };
      const result = await orderService.taoMoiDonHang(data, req.user, req.ip);
      res.status(201).json({
        success: true,
        message: "Đặt hàng thành công",
        data: result,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
);

module.exports = router;
