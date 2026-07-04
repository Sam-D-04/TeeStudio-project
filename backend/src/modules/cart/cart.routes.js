const router = require("express").Router();
const { verifyToken } = require("../../common/middlewares/auth.middleware");
const validate = require("../../common/middlewares/validate.middleware");
const controller = require("./cart.controller");

const addItemSchema = {
  body: {
    variantId: { required: true, type: "integer", min: 1 },
    quantity: { type: "integer", min: 1 },
    designId: { type: "integer", min: 1 },
  },
};

const updateItemSchema = {
  params: { id: { required: true, type: "integer", min: 1 } },
  body: { quantity: { required: true, type: "integer", min: 1 } },
};

const syncSchema = {
  body: {
    items: {
      required: true,
      type: "array",
      custom: (items) => {
        if (!Array.isArray(items)) return "items phải là mảng";
        for (const item of items) {
          if (!item.variantId || typeof item.variantId !== "number") return "variantId không hợp lệ";
          if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1) return "quantity phải là số nguyên dương";
        }
        return true;
      },
    },
  },
};

// Tất cả cart routes yêu cầu đăng nhập
router.use(verifyToken);

// GET /api/cart - lấy giỏ hàng
router.get("/", controller.layGioHang);

// POST /api/cart/items - thêm sản phẩm
router.post("/items", validate(addItemSchema), controller.themVaoGioHang);

// PUT /api/cart/items/:id - cập nhật số lượng
router.put("/items/:id", validate(updateItemSchema), controller.capNhatSoLuong);

// DELETE /api/cart/items/:id - xóa 1 sản phẩm
router.delete("/items/:id", controller.xoaKhoiGioHang);

// DELETE /api/cart - xóa toàn bộ giỏ hàng
router.delete("/", controller.xoaToanBoGioHang);

// POST /api/cart/sync - đồng bộ giỏ hàng localStorage lên DB khi đăng nhập
router.post("/sync", validate(syncSchema), controller.dongBoGioHang);

module.exports = router;
