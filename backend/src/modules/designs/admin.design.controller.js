/**
 * design.controller.js – Nhận request HTTP, gọi service, trả response.
 *
 * Quy tắc: Controller không chứa SQL hay logic nghiệp vụ phức tạp.
 * Chỉ làm: đọc params/body → gọi service → trả JSON.
 */

const designService = require("./admin.design.service");

// ─────────────────────────────────────────────────────────────────────────────
// KPI THỐNG KÊ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/designs/stats
 * Trả về 4 thẻ KPI đầu trang (chờ kiểm tra, cần chỉnh sửa, chờ gửi xưởng, đang in).
 */
const getThongKe = async (req, res, next) => {
  try {
    const data = await designService.layThongKe();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// THIẾT KẾ KHÁCH HÀNG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/designs
 * Danh sách thiết kế với lọc và phân trang.
 *
 * Query params: page, limit, tu_khoa, trang_thai, vi_tri_in
 */
const getDanhSachThietKe = async (req, res, next) => {
  try {
    const data = await designService.layDanhSachThietKe(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/designs/:id/duyet
 * Duyệt thiết kế (chuyển sang trạng thái "Đã duyệt").
 * Tự động cập nhật OrderProduction liên quan → APPROVED.
 */
const duyetThietKe = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID thiết kế không hợp lệ" });
    }

    const data = await designService.duyetThietKe(id);
    res.json({
      success: true,
      message: "Đã duyệt thiết kế thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/designs/:id/yeu-cau-chinh-sua
 * Yêu cầu khách chỉnh sửa thiết kế.
 *
 * Body: { ghiChu: string } (tùy chọn)
 */
const yeuCauChinhSua = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID thiết kế không hợp lệ" });
    }

    const { ghiChu } = req.body;
    const data = await designService.yeuCauChinhSua(id, ghiChu);
    res.json({
      success: true,
      message: "Đã gửi yêu cầu chỉnh sửa đến khách hàng",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ĐƠN CẦN IN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/designs/don-can-in
 * Danh sách đơn cần in (đã duyệt thiết kế, chờ/đang in).
 *
 * Query params: page, limit, trang_thai
 */
const getDanhSachDonCanIn = async (req, res, next) => {
  try {
    const data = await designService.layDanhSachDonCanIn(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/designs/don-can-in/:id/gui-xuong
 * Gửi đơn đến xưởng in (chuyển sang "Đang in").
 */
const guiDonXuongIn = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID đơn in không hợp lệ" });
    }

    const data = await designService.guiDonXuongIn(id);
    res.json({
      success: true,
      message: "Đã gửi đơn đến xưởng in thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STICKER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/designs/stickers
 * Danh sách sticker có sẵn cho Design Studio.
 */
const getDanhSachSticker = async (req, res, next) => {
  try {
    const data = await designService.layDanhSachSticker();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/designs/stickers
 * Thêm sticker mới.
 *
 * Body: { ten, urlAnh, loai }
 * (Upload file lên Cloudinary được xử lý bởi FE hoặc middleware upload riêng;
 *  controller chỉ nhận URL đã được upload)
 */
const themSticker = async (req, res, next) => {
  try {
    const { ten, urlAnh, loai } = req.body;

    if (!ten) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên sticker" });
    }
    if (!urlAnh) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp URL ảnh sticker" });
    }
    if (!loai) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn loại sticker" });
    }

    const data = await designService.themSticker({ ten, urlAnh, loai });
    res.status(201).json({
      success: true,
      message: "Thêm sticker thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/designs/stickers/:id
 * Xóa (ẩn) sticker.
 */
const xoaSticker = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID sticker không hợp lệ" });
    }

    await designService.xoaSticker(id);
    res.json({ success: true, message: "Đã xóa sticker thành công" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VỊ TRÍ IN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/designs/vi-tri-in
 * Danh sách tất cả vị trí in (kể cả đã tắt) – dành cho Admin.
 */
const getDanhSachViTriIn = async (req, res, next) => {
  try {
    const data = await designService.layDanhSachViTriIn({ chiLayDangBat: false });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/vi-tri-in (PUBLIC)
 * Danh sách vị trí in đang bật – dành cho Design Studio khách hàng.
 */
const getDanhSachViTriInCongKhai = async (req, res, next) => {
  try {
    const data = await designService.layDanhSachViTriIn({ chiLayDangBat: true });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/designs/vi-tri-in
 * Thêm vị trí in mới.
 *
 * Body: { ten, moTa, dangHoatDong }
 */
const themViTriIn = async (req, res, next) => {
  try {
    const { ten, moTa, dangHoatDong } = req.body;

    if (!ten) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên vị trí in" });
    }

    const data = await designService.themViTriIn({ ten, moTa, dangHoatDong });
    res.status(201).json({
      success: true,
      message: "Thêm vị trí in thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/designs/vi-tri-in/:id
 * Bật/tắt vị trí in.
 *
 * Body: { dangHoatDong: boolean }
 */
const batTatViTriIn = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID vị trí in không hợp lệ" });
    }

    const { dangHoatDong } = req.body;
    if (typeof dangHoatDong !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Trường dangHoatDong phải là true hoặc false",
      });
    }

    const data = await designService.batTatViTriIn(id, dangHoatDong);
    res.json({
      success: true,
      message: dangHoatDong ? "Đã bật vị trí in" : "Đã tắt vị trí in",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/designs/vi-tri-in/:id
 * Xóa vị trí in (chỉ xóa được khi không có thiết kế nào dùng).
 */
const xoaViTriIn = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID vị trí in không hợp lệ" });
    }

    await designService.xoaViTriIn(id);
    res.json({ success: true, message: "Đã xóa vị trí in thành công" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getThongKe,
  getDanhSachThietKe,
  duyetThietKe,
  yeuCauChinhSua,
  getDanhSachDonCanIn,
  guiDonXuongIn,
  getDanhSachSticker,
  themSticker,
  xoaSticker,
  getDanhSachViTriIn,
  getDanhSachViTriInCongKhai,
  themViTriIn,
  batTatViTriIn,
  xoaViTriIn,
};
