/**
 * admin.dashboard.controller.js – Nhận request HTTP, gọi service, trả response.
 * Không chứa logic nghiệp vụ hay câu SQL – chỉ điều phối.
 */

"use strict";

const dashboardService = require("./admin.dashboard.service");

// =====================================================================
// CONTROLLER 1: Thẻ chỉ số tổng quan
// =====================================================================

/**
 * GET /api/admin/dashboard/tong-quan
 * Trả về 7 chỉ số vận hành cho trang Tổng quan.
 * Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
 */
const getTongQuanChiSo = async (req, res, next) => {
  try {
    const { tuNgay, denNgay } = req.query;
    const data = await dashboardService.layTongQuanChiSo(tuNgay, denNgay);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CONTROLLER 2: Dữ liệu biểu đồ doanh thu
// =====================================================================

/**
 * GET /api/admin/dashboard/bieu-do-doanh-thu
 * Trả về doanh thu theo từng ngày trong khoảng thời gian.
 * Query params: tuNgay (YYYY-MM-DD), denNgay (YYYY-MM-DD)
 */
const getBieuDoDoanhThu = async (req, res, next) => {
  try {
    const { tuNgay, denNgay } = req.query;
    const data = await dashboardService.layDuLieuBieuDo(tuNgay, denNgay);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CONTROLLER 3: Thiết kế cần xử lý
// =====================================================================

/**
 * GET /api/admin/dashboard/thiet-ke-can-xu-ly
 * Trả về tối đa 5 thiết kế cần xử lý (PENDING_REVIEW / NEEDS_REVISION).
 */
const getThietKeCanXuLy = async (req, res, next) => {
  try {
    const data = await dashboardService.layThietKeCanXuLy();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CONTROLLER 4: Tồn kho cảnh báo
// =====================================================================

/**
 * GET /api/admin/dashboard/ton-kho-canh-bao
 * Trả về danh sách variant tồn kho thấp.
 * Query params: nguong (số nguyên, mặc định 15)
 */
const getTonKhoCanhBao = async (req, res, next) => {
  try {
    const nguong = parseInt(req.query.nguong) || 15;
    const limit = parseInt(req.query.limit) || 10;

    if (nguong < 0 || nguong > 10000) {
      return res.status(400).json({
        success: false,
        message: "Ngưỡng tồn kho không hợp lệ (phải từ 0 đến 10000)",
      });
    }

    const data = await dashboardService.layTonKhoCanhBao(nguong, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CONTROLLER 5: Top sản phẩm bán chạy
// =====================================================================

/**
 * GET /api/admin/dashboard/san-pham-ban-chay
 * Trả về top sản phẩm bán chạy nhất theo doanh thu.
 * Query params: tuNgay, denNgay, limit (mặc định 3)
 */
const getSanPhamBanChay = async (req, res, next) => {
  try {
    const { tuNgay, denNgay } = req.query;
    const limit = parseInt(req.query.limit) || 3;

    if (limit < 1 || limit > 20) {
      return res.status(400).json({
        success: false,
        message: "Số lượng sản phẩm không hợp lệ (phải từ 1 đến 20)",
      });
    }

    const data = await dashboardService.laySanPhamBanChay(tuNgay, denNgay, limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// EXPORTS
// =====================================================================

module.exports = {
  getTongQuanChiSo,
  getBieuDoDoanhThu,
  getThietKeCanXuLy,
  getTonKhoCanhBao,
  getSanPhamBanChay,
};
