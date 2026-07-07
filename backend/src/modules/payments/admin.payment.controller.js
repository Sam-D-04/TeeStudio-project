/**
 * payment.controller.js – Nhận request HTTP, gọi service, trả response.
 *
 * Bao gồm:
 * - Phần 1: Return / IPN dùng chung cho VNPAY và MoMo
 * - Phần 2: Admin quản lý thanh toán
 */

const paymentService = require("./admin.payment.service");
const paymentReportService = require("./admin.payment.report.service");
const { guiBaoCaoExcel } = require("../../common/utils/excel-report");

// =====================================================================
// PHẦN 1: RETURN / IPN DÙNG CHUNG CHO CÁC CỔNG THANH TOÁN ONLINE
// =====================================================================

const ONLINE_GATEWAY_HANDLERS = Object.freeze({
  vnpay: {
    verifyReturn: paymentService.xacThucKetQuaTraVeVnpay,
    processIpn: paymentService.xuLyIpnVnpay,
  },
  momo: {
    verifyReturn: paymentService.xacThucKetQuaTraVeMomo,
    processIpn: paymentService.xuLyIpnMomo,
  },
});

function getOnlineGatewayHandler(gateway) {
  const handler = ONLINE_GATEWAY_HANDLERS[String(gateway || "").toLowerCase()];
  if (!handler) {
    const error = new Error("Cổng thanh toán không được hỗ trợ");
    error.statusCode = 404;
    throw error;
  }
  return handler;
}

const xacThucKetQuaTraVe = async (req, res, next) => {
  try {
    const handler = getOnlineGatewayHandler(req.params.gateway);
    const data = await handler.verifyReturn(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const xuLyIpn = async (req, res, next) => {
  try {
    const gateway = String(req.params.gateway || "").toLowerCase();
    const handler = getOnlineGatewayHandler(gateway);
    const result = await handler.processIpn(gateway === "momo" ? req.body : req.query);

    if (gateway === "momo") {
      return res.status(204).send();
    }
    return res.json(result);
  } catch (error) {
    return next(error);
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
  // Return / IPN dùng chung
  xacThucKetQuaTraVe,
  xuLyIpn,
  // Admin quản lý thanh toán
  getThongKeThanhToan,
  getDanhSachThanhToan,
  exportBaoCaoThanhToan,
  getChiTietThanhToan,
  xacNhanThuCod,
  luuGhiChu,
};
