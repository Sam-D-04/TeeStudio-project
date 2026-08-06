/**
 * design.controller.js – Nhận request HTTP, gọi service, trả response.
 *
 * Quy tắc: Controller không chứa SQL hay logic nghiệp vụ phức tạp.
 * Chỉ làm: đọc params/body → gọi service → trả JSON.
 */

const designService = require("./admin.design.service");

const uploadService = require("../uploads/upload.service");
const { guiBaoCaoExcel } = require("../../common/utils/excel-report");

async function uploadAnhInNeuCan(payload) {
  if (payload.printImageFront?.startsWith("data:image")) {
    payload.printFileUrlFront = await uploadService.uploadBase64Image(
      payload.printImageFront,
      "print-files"
    );
  } else if (payload.printImageFront === null) {
    payload.printFileUrlFront = null;
  }

  if (payload.printImageBack?.startsWith("data:image")) {
    payload.printFileUrlBack = await uploadService.uploadBase64Image(
      payload.printImageBack,
      "print-files"
    );
  } else if (payload.printImageBack === null) {
    payload.printFileUrlBack = null;
  }

  delete payload.printImageFront;
  delete payload.printImageBack;
  return payload;
}


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
 * Query params: page, limit, design_id, tu_khoa, trang_thai, vi_tri_in, tu_ngay, den_ngay
 */
const getDanhSachThietKe = async (req, res, next) => {
  try {
    const data = await designService.layDanhSachThietKe(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/designs/:id - Chi tiết một thiết kế khách hàng. */
const getChiTietThietKe = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID thiết kế không hợp lệ" });
    }

    const data = await designService.layChiTietThietKe(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/designs/:id/canvas
 * Lấy canvasData để load vào Editor (chỉ dùng khi Admin mở trang sửa thiết kế).
 * Tách riêng khỏi getChiTietThietKe vì canvasData là JSON lớn, không cần ở mọi nơi.
 */
const getCanvasDataThietKe = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID thiết kế không hợp lệ" });
    }

    const data = await designService.layCanvasDataThietKe(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/designs/:id/sua
 * Admin sửa thiết kế của khách: ghi đè canvasData + previewUrl, giữ nguyên status.
 *
 * Body: { canvasData: object|string, previewUrl: string (base64 hoặc URL Cloudinary) }
 */
const suaThietKeChoKhach = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID thiết kế không hợp lệ" });
    }

    const payload = { ...req.body };

    // Nếu previewUrl là base64 → upload lên Cloudinary để lấy URL bền vững
    if (payload.previewUrl?.startsWith("data:image")) {
      payload.previewUrl = await uploadService.uploadBase64Image(
        payload.previewUrl,
        "user-designs"
      );
    }
    await uploadAnhInNeuCan(payload);

    const data = await designService.suaThietKeChoKhach(id, payload);
    res.json({
      success: true,
      message: `Đã lưu thiết kế ${data.maThietKe}`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/admin/designs/:id/customer - Doi khach hang so huu thiet ke. */
const doiKhachHangThietKe = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID thiet ke khong hop le" });
    }

    const data = await designService.doiKhachHangThietKe(id, req.body.customerId);
    res.json({
      success: true,
      message: "Da doi khach hang cho thiet ke",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/admin/designs/:id/customer - Go thiet ke khoi tai khoan khach hang. */
const goKhachHangKhoiThietKe = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID thiet ke khong hop le" });
    }

    const data = await designService.goKhachHangKhoiThietKe(id);
    res.json({
      success: true,
      message: "Da go khach hang khoi thiet ke",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/designs/customer-draft-variants - Các size hợp lệ theo loại áo và màu. */
const getBienTheTaoThietKe = async (req, res, next) => {
  try {
    const data = await designService.layBienTheTaoThietKe(
      req.query.shirtType,
      req.query.shirtColor,
      req.query.productId
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/** POST /api/admin/designs/customer-drafts - Admin tạo bản nháp cho một khách hàng. */
const taoThietKeChoKhach = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.previewUrl?.startsWith("data:image")) {
      payload.previewUrl = await uploadService.uploadBase64Image(
        payload.previewUrl,
        "user-designs"
      );
    }
    await uploadAnhInNeuCan(payload);

    const data = await designService.taoThietKeChoKhach(payload);
    res.status(201).json({
      success: true,
      message: data.userId
        ? "Đã tạo thiết kế và gắn vào tài khoản khách hàng"
        : "Đã tạo thiết kế chưa gán khách hàng",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/admin/designs/assets - Upload ảnh dùng trong canvas, trả URL bền vững. */
const taiAnhThietKe = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh" });
    }
    const url = await uploadService.uploadImageBuffer(req.file.buffer, "design-assets");
    res.status(201).json({ success: true, data: { url } });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/designs/print-methods - Danh sách phương pháp in đang hoạt động. */
const getDanhSachPhuongPhapIn = async (req, res, next) => {
  try {
    const data = await designService.layDanhSachPhuongPhapIn();
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
 * Query params: page, limit, trang_thai, tu_ngay, den_ngay
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
 * GET /api/admin/designs/don-can-in/:id/techpack
 * Lay phieu thong so in cua mot dong san xuat de xuong in tai file va canh kich thuoc.
 */
const getTechpackDonCanIn = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID don in khong hop le" });
    }

    const data = await designService.layTechpackDonCanIn(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/designs/don-can-in/xuat-excel
 * Xuất file Excel "thông số in" cho xưởng in - lọc giống hệt màn hình "Đơn cần
 * in" hiện tại (không phân trang, tối đa 5000 dòng), kèm link ảnh in cả 2 mặt.
 *
 * Query params: tu_khoa, trang_thai, tu_ngay, den_ngay
 */
const exportDonCanIn = async (req, res, next) => {
  try {
    const report = await designService.xuatDonCanIn(req.query);
    return guiBaoCaoExcel(res, report);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/admin/designs/don-can-in/:id/trang-thai
 * Cập nhật tuần tự tiến độ của một mặt hàng cần in.
 */
const capNhatTrangThaiDonIn = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id <= 0) {
      return res.status(400).json({ success: false, message: "ID đơn in không hợp lệ" });
    }

    const { trangThai } = req.body || {};
    const data = await designService.capNhatTrangThaiDonIn(id, trangThai, req.user);
    res.json({
      success: true,
      message: trangThai === "da_in_xong"
        ? "Đã xác nhận in xong sản phẩm"
        : "Đã bắt đầu in sản phẩm",
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
 * Multipart body: { ten, loai, anh }
 * Ảnh được upload lên Cloudinary trước khi URL được lưu vào database.
 */
const themSticker = async (req, res, next) => {
  try {
    const { ten, loai } = req.body;

    if (!ten || !ten.trim()) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tên sticker" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn ảnh sticker" });
    }
    if (!["logo", "hinh_ve", "chu_viet"].includes(loai)) {
      return res.status(400).json({ success: false, message: "Loại sticker không hợp lệ" });
    }

    const urlAnh = await uploadService.uploadImageBuffer(req.file.buffer, "stickers");
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

module.exports = {
  getThongKe,
  getDanhSachThietKe,
  getChiTietThietKe,
  getCanvasDataThietKe,
  suaThietKeChoKhach,
  doiKhachHangThietKe,
  goKhachHangKhoiThietKe,
  getBienTheTaoThietKe,
  taoThietKeChoKhach,
  taiAnhThietKe,
  duyetThietKe,
  yeuCauChinhSua,
  getDanhSachDonCanIn,
  getTechpackDonCanIn,
  exportDonCanIn,
  capNhatTrangThaiDonIn,
  getDanhSachSticker,
  themSticker,
  xoaSticker,
  getDanhSachViTriInCongKhai,
  getDanhSachPhuongPhapIn,
};
