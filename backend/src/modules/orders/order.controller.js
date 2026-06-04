/**
 * order.controller.js – Nhận request HTTP, gọi service, trả response.
 * Không chứa logic nghiệp vụ hay câu SQL – chỉ điều phối.
 */

const orderService = require("./order.service");

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
 *
 * Query params:
 *   trang, soMoiTrang, trangThai, thanhToan, thoiGian, loai, tuKhoa
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
 * Lấy chi tiết 1 đơn hàng theo ID (dùng cho Drawer chi tiết).
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
 *
 * Body: { trangThai: "da_xac_nhan" }
 */
const capNhatTrangThai = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { trangThai } = req.body;
    const data = await orderService.capNhatTrangThai(id, trangThai);
    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/cancel
 * Hủy đơn hàng kèm lý do.
 *
 * Body: { lyDo: "Khách yêu cầu hủy" }
 */
const huyDonHang = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { lyDo } = req.body;
    const data = await orderService.huyDonHang(id, lyDo);
    res.json({
      success: true,
      message: "Đã hủy đơn hàng",
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
};
