/**
 * public.controller.js – Controller cho các route công khai (không yêu cầu auth).
 */

const publicService = require("./public.service");

/**
 * GET /api/public/products
 * Trả danh sách phôi áo đang ACTIVE để hiển thị ở trang chủ.
 */
const getDanhSachSanPham = async (req, res, next) => {
  try {
    const data = await publicService.layDanhSachSanPhamCongKhai();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/products/colors
 * Trả danh sách màu áo nổi bật (còn hàng) theo từng loại để hiển thị ở trang chủ.
 */
const getMauAoNoiBat = async (req, res, next) => {
  try {
    const data = await publicService.layMauAoNoiBat();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDanhSachSanPham,
  getMauAoNoiBat,
};
