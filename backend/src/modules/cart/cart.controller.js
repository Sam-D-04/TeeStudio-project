const cartService = require("./cart.service");

const layGioHang = async (req, res, next) => {
  try {
    const items = await cartService.layGioHang(req.user.id);
    res.json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
};

const themVaoGioHang = async (req, res, next) => {
  try {
    const { variantId, quantity = 1, designId } = req.body;
    const result = await cartService.themVaoGioHang(req.user.id, { variantId, quantity, designId });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const capNhatSoLuong = async (req, res, next) => {
  try {
    const cartItemId = parseInt(req.params.id, 10);
    const { quantity } = req.body;
    await cartService.capNhatSoLuong(req.user.id, cartItemId, quantity);
    res.json({ success: true, message: "Đã cập nhật số lượng" });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
};

const xoaKhoiGioHang = async (req, res, next) => {
  try {
    const cartItemId = parseInt(req.params.id, 10);
    await cartService.xoaKhoiGioHang(req.user.id, cartItemId);
    res.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
};

const xoaToanBoGioHang = async (req, res, next) => {
  try {
    await cartService.xoaToanBoGioHang(req.user.id);
    res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (err) {
    next(err);
  }
};

const dongBoGioHang = async (req, res, next) => {
  try {
    const { items } = req.body;
    const result = await cartService.dongBoGioHang(req.user.id, items);
    res.json({ success: true, data: { items: result } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  layGioHang,
  themVaoGioHang,
  capNhatSoLuong,
  xoaKhoiGioHang,
  xoaToanBoGioHang,
  dongBoGioHang,
};
