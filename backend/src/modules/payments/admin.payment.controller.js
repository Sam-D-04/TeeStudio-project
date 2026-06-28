/**
 * payment.controller.js – Nhận request HTTP, gọi service, trả response.
 *
 * Bao gồm:
 * - Phần 1: VNPAY Return / IPN (giữ nguyên từ trước)
 * - Phần 2: Admin quản lý thanh toán (mới)
 */

const paymentService = require("./admin.payment.service");
const paymentReportService = require("./admin.payment.report.service");
const { guiBaoCaoExcel } = require("../../common/utils/excel-report");

// =====================================================================
// PHẦN 1: VNPAY RETURN / IPN (GIỮ NGUYÊN)
// =====================================================================

const xacThucKetQuaTraVeVnpay = async (req, res, next) => {
  try {
    const data = await paymentService.xacThucKetQuaTraVeVnpay(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const xuLyIpnVnpay = async (req, res, next) => {
  try {
    const result = await paymentService.xuLyIpnVnpay(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// PHẦN 2: ADMIN QUẢN LÝ THANH TOÁN (MỚI)
// =====================================================================

/**
 * GET /api/admin/payments/stats
 * Trả về thống kê KPI cho 3 thẻ đầu trang.
 */
const getThongKeThanhToan = async (req, res, next) => {
  try {
    const data = await paymentService.layThongKeThanhToan();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/payments
 * Lấy danh sách giao dịch có phân trang và lọc.
 */
const getDanhSachThanhToan = async (req, res, next) => {
  try {
    const data = await paymentService.layDanhSachThanhToan(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const exportBaoCaoThanhToan = async (req, res, next) => {
  try {
    const report = await paymentReportService.taoBaoCaoThanhToan(req.query);
    return guiBaoCaoExcel(res, report);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/admin/payments/:id
 * Lấy chi tiết 1 giao dịch.
 */
const getChiTietThanhToan = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }
    const data = await paymentService.layChiTietThanhToan(id);
    res.json({ success: true, data });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/admin/payments/:id/confirm-cod
 * Xác nhận đã thu tiền COD.
 */
const xacNhanThuCod = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }
    const data = await paymentService.xacNhanThuCod(id);
    res.json({ success: true, message: "Đã xác nhận thu COD", data });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * PATCH /api/admin/payments/:id/note
 * Lưu ghi chú kế toán.
 */
const luuGhiChu = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });
    }
    const { note } = req.body;
    const data = await paymentService.luuGhiChu(id, note);
    res.json({ success: true, message: "Đã lưu ghi chú", data });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  // VNPAY Return / IPN
  xacThucKetQuaTraVeVnpay,
  xuLyIpnVnpay,
  // Admin quản lý thanh toán
  getThongKeThanhToan,
  getDanhSachThanhToan,
  exportBaoCaoThanhToan,
  getChiTietThanhToan,
  xacNhanThuCod,
  luuGhiChu,
};
