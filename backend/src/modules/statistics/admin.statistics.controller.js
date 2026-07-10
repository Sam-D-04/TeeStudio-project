/**
 * admin.statistics.controller.js – Nhận request HTTP, gọi service, trả response.
 * Không chứa logic nghiệp vụ hay câu SQL – chỉ điều phối.
 *
 * Các route được phục vụ (prefix: /api/admin/statistics):
 *   GET /chi-so          → 4 thẻ chỉ số + so sánh kỳ trước
 *   GET /bieu-do         → dữ liệu biểu đồ doanh thu
 *   GET /top-san-pham    → top sản phẩm bán chạy kèm ảnh
 *   GET /phan-bo         → phân bổ trạng thái đơn & thanh toán
 */

"use strict";

const statisticsService = require("./admin.statistics.service");

// =====================================================================
// CONTROLLER 1: Chỉ số tổng hợp
// =====================================================================

/**
 * GET /api/admin/statistics/chi-so
 * Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
 */
const getChiSoTongHop = async (req, res, next) => {
  try {
    const { tuNgay, denNgay } = req.query;
    const data = await statisticsService.layChiSoTongHop(tuNgay, denNgay);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CONTROLLER 2: Biểu đồ doanh thu
// =====================================================================

/**
 * GET /api/admin/statistics/bieu-do
 * Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
 * Backend tự chọn nhóm theo ngày hoặc tháng.
 */
const getBieuDoDoanhThu = async (req, res, next) => {
  try {
    const { tuNgay, denNgay } = req.query;
    const data = await statisticsService.layBieuDoDoanhThu(tuNgay, denNgay);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CONTROLLER 3: Top sản phẩm bán chạy
// =====================================================================

/**
 * GET /api/admin/statistics/top-san-pham
 * Query params: tuNgay, denNgay, limit (mặc định 5, tối đa 20)
 */
const getTopSanPham = async (req, res, next) => {
  try {
    const { tuNgay, denNgay } = req.query;
    const limit = parseInt(req.query.limit) || 5;

    if (limit < 1 || limit > 20) {
      return res.status(400).json({
        success: false,
        message: "Số lượng sản phẩm không hợp lệ (phải từ 1 đến 20).",
      });
    }

    const data = await statisticsService.layTopSanPham(tuNgay, denNgay, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CONTROLLER 4: Phân bổ trạng thái đơn hàng & thanh toán
// =====================================================================

/**
 * GET /api/admin/statistics/phan-bo
 * Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
 * Trả về cả phân bổ trạng thái đơn VÀ tình trạng thanh toán trong 1 lần gọi.
 */
const getPhanBoTrangThai = async (req, res, next) => {
  try {
    const { tuNgay, denNgay } = req.query;
    const data = await statisticsService.layPhanBoTrangThai(tuNgay, denNgay);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// EXPORTS
// =====================================================================

module.exports = {
  getChiSoTongHop,
  getBieuDoDoanhThu,
  getTopSanPham,
  getPhanBoTrangThai,
};
