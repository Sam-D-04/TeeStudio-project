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
    const data = await publicService.layDanhSachSanPhamCongKhai(req.query.search);
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
    const data = await publicService.laySanPhamNoiBat();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/public/products/:id
 * Trả chi tiết 1 sản phẩm ACTIVE (không cần auth) dùng cho trang Product Detail.
 */
const getChiTietSanPhamCongKhai = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }
    const data = await publicService.layChiTietSanPhamCongKhai(id);
    res.json({ success: true, data });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getDanhSachSanPham,
  getMauAoNoiBat,
  getChiTietSanPhamCongKhai,
  getThietKeMau,
  getChiTietThietKeMau,
};

/**
 * GET /api/public/showcase-designs
 * Trả danh sách thiết kế mẫu từ account admin để hiển thị trên trang chủ.
 */
async function getThietKeMau(req, res, next) {
  try {
    const data = await publicService.layThietKeMauTuAdmin(12);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/public/showcase-designs/:id
 * Trả canvasData của 1 thiết kế mẫu để load vào Design Studio.
 */
async function getChiTietThietKeMau(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }
    const data = await publicService.layChiTietThietKeMau(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thiết kế mẫu" });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

