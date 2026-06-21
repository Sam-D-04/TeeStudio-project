/**
 * order.controller.js – Nhận request HTTP, gọi service, trả response.
 * Không chứa logic nghiệp vụ hay câu SQL – chỉ điều phối.
 */

const orderService = require("./order.service");

// =====================================================================
// CONTROLLER DANH SÁCH / CHI TIẾT / TRẠNG THÁI (đã có từ trước)
// =====================================================================

/**
 * GET /api/admin/orders/stats
 * Trả về 4 thẻ KPI thống kê đầu trang.
 */
const getThongKe = async (req, res, next) => {
  try {
    const data = await orderService.layThongKe();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders
 * Lấy danh sách đơn hàng có phân trang và lọc.
 */
const getDanhSachDonHang = async (req, res, next) => {
  try {
    const data = await orderService.layDanhSachDonHang(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/:id
 * Lấy chi tiết 1 đơn hàng theo ID.
 */
const getChiTietDonHang = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = await orderService.layChiTietDonHang(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 * Cập nhật trạng thái đơn hàng.
 */
const capNhatTrangThai = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { trangThai, shippingCarrier, trackingCode } = req.body;
    const data = await orderService.capNhatTrangThai(id, trangThai, req.user, { shippingCarrier, trackingCode });
    res.json({ success: true, message: "Cập nhật trạng thái thành công", data });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/cancel
 * Hủy đơn hàng kèm lý do.
 */
const huyDonHang = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { lyDo } = req.body;
    const data = await orderService.huyDonHang(id, lyDo, req.user);
    res.json({ success: true, message: "Đã hủy đơn hàng", data });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/shipping-address
 * Cập nhật địa chỉ giao hàng của đơn.
 */
const capNhatDiaChiGiaoHang = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = await orderService.capNhatDiaChiGiaoHang(id, req.body, req.user);
    res.json({ success: true, message: "Cập nhật địa chỉ giao hàng thành công", data });
  } catch (error) {
    next(error);
  }
};

const taoLaiMaThanhToanVnpay = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = await orderService.taoLaiMaThanhToanVnpay(
      id,
      req.user,
      req.ip
    );
    res.json({
      success: true,
      message: "Đã tạo lại mã thanh toán VNPAY",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CONTROLLER HỖ TRỢ FORM TẠO ĐƠN MỚI
// =====================================================================

/**
 * GET /api/admin/orders/search/customers?q=<keyword>
 * Tìm kiếm khách hàng theo tên / SĐT / email.
 */
const timKhachHang = async (req, res, next) => {
  try {
    const keyword = req.query.q || "";
    const data = await orderService.timKiemKhachHang(keyword);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/customers/:userId/addresses
 * Lấy danh sách địa chỉ giao hàng của một khách hàng.
 */
const layDiaChi = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId || userId < 1) {
      return res.status(400).json({ success: false, message: "userId không hợp lệ" });
    }
    const data = await orderService.layDiaChiKhachHang(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/search/products?q=<keyword>
 * Tìm kiếm sản phẩm + biến thể + BulkPricing.
 */
const timSanPham = async (req, res, next) => {
  try {
    const keyword = req.query.q || "";
    const data = await orderService.timKiemSanPham(keyword);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/search/designs?userId=<id>&q=<keyword>
 * Tìm kiếm thiết kế APPROVED của khách hàng.
 */
const timThietKe = async (req, res, next) => {
  try {
    const userId = parseInt(req.query.userId);
    if (!userId || userId < 1) {
      return res.status(400).json({ success: false, message: "userId không hợp lệ" });
    }
    const keyword = req.query.q || "";
    const data = await orderService.timKiemThietKe(userId, keyword);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/promotions
 * Lấy danh sách mã khuyến mãi còn hiệu lực.
 */
const layKhuyenMai = async (req, res, next) => {
  try {
    const data = await orderService.layDanhSachKhuyenMai();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/orders
 * Tạo đơn hàng mới (Admin tạo thay cho khách).
 * Backend tự tính lại giá từ DB – không tin giá từ frontend.
 */
const taoMoiDonHang = async (req, res, next) => {
  try {
    const data = await orderService.taoMoiDonHang(req.body, req.user, req.ip);
    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getThongKe,
  getDanhSachDonHang,
  getChiTietDonHang,
  capNhatTrangThai,
  huyDonHang,
  capNhatDiaChiGiaoHang,
  taoLaiMaThanhToanVnpay,
  // Hỗ trợ form Tạo đơn mới
  timKhachHang,
  layDiaChi,
  timSanPham,
  timThietKe,
  layKhuyenMai,
  taoMoiDonHang,
};
