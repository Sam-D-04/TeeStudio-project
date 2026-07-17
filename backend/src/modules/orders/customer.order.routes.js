/**
 * customer.order.routes.js – Route đặt hàng và xem đơn hàng dành cho Customer.
 * POST /api/orders      – Khách hàng đặt hàng (yêu cầu đăng nhập, role CUSTOMER)
 * GET  /api/orders      – Khách hàng xem danh sách đơn hàng của chính mình
 * GET  /api/orders/:id  – Khách hàng xem chi tiết 1 đơn hàng của chính mình
 */

const router = require("express").Router();
const { verifyToken, requireRoles } = require("../../common/middlewares/auth.middleware");
const { ROLES } = require("../../common/constants/roles");
const validate = require("../../common/middlewares/validate.middleware");
const orderService = require("./customer.order.service");

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
    city: {
      type: "string",
      maxLength: 255,
    },
    ward: {
      type: "string",
      maxLength: 255,
    },
    note: {
      type: "string",
      maxLength: 1000,
    },
    paymentMethod: {
      required: true,
      type: "string",
      enum: ["COD", "VNPAY", "MOMO"],
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
          // designId (tuỳ chọn) – ID thiết kế POD
          if (item.designId !== undefined &&
              (typeof item.designId !== "number" || item.designId < 1)) {
            return "designId không hợp lệ";
          }
          // printImage (tuỳ chọn) – ảnh in print-ready dạng base64 data URI
          if (item.printImage !== undefined &&
              (typeof item.printImage !== "string" || !item.printImage.startsWith("data:image"))) {
            return "printImage phải là chuỗi base64 ảnh (data:image/...)";
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
      const result = await orderService.createOrderAsCustomer(data, req.user, req.ip);
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

/**
 * Schema kiểm tra query string khi khách xem danh sách đơn hàng của mình.
 * page/limit đều không bắt buộc - không truyền thì dùng giá trị mặc định.
 */
const danhSachDonHangSchema = {
  query: {
    page: {
      type: "integer",
      min: 1,
    },
    limit: {
      type: "integer",
      min: 1,
      max: 50,
    },
  },
};

/**
 * GET /api/orders
 * Khách hàng xem danh sách đơn hàng của chính mình (có phân trang).
 * Dùng cho trang "Đơn hàng của tôi" ở frontend.
 */
router.get(
  "/",
  verifyToken,
  requireRoles(ROLES.CUSTOMER),
  validate(danhSachDonHangSchema),
  async (req, res, next) => {
    try {
      const result = await orderService.layDanhSachDonHangCuaKhach(req.user.id, {
        page: req.query.page,
        limit: req.query.limit,
      });
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/orders/:id
 * Khách hàng xem chi tiết 1 đơn hàng - chỉ xem được đơn của chính mình.
 * Service đã kiểm tra userId ngay trong câu WHERE nên không cần kiểm tra lại
 * ở đây, nhưng vẫn validate id truyền vào phải là số nguyên dương hợp lệ.
 */
router.get(
  "/:id",
  verifyToken,
  requireRoles(ROLES.CUSTOMER),
  async (req, res, next) => {
    try {
      const orderId = Number(req.params.id);
      if (!Number.isInteger(orderId) || orderId < 1) {
        return res.status(400).json({
          success: false,
          message: "ID đơn hàng không hợp lệ",
        });
      }
      const result = await orderService.layChiTietDonHangCuaKhach(orderId, req.user.id);
      res.json({
        success: true,
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
