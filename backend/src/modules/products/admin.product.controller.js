/**
 * product.controller.js – Nhận request HTTP, gọi service, trả response.
 * Không chứa logic nghiệp vụ hay câu SQL – chỉ điều phối.
 */

const productService = require("./admin.product.service");

// =====================================================================
// KPI THỐNG KÊ
// =====================================================================

/**
 * GET /api/admin/products/stats
 * Trả về 4 thẻ KPI thống kê đầu trang quản lý phôi áo.
 */
const getThongKe = async (req, res, next) => {
  try {
    const data = await productService.layThongKe();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// DANH MỤC
// =====================================================================

/**
 * GET /api/admin/products/categories
 * Lấy danh sách danh mục cho dropdown filter.
 */
const getDanhMuc = async (req, res, next) => {
  try {
    const data = await productService.layDanhMuc();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CẢNH BÁO TỒN KHO
// =====================================================================

/**
 * GET /api/admin/products/inventory-alerts
 * Lấy danh sách biến thể sắp hết / hết hàng cho panel cảnh báo.
 */
const getCanhBaoTonKho = async (req, res, next) => {
  try {
    const data = await productService.layCanhBaoTonKho();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// DANH SÁCH SẢN PHẨM (có phân trang + lọc)
// =====================================================================

/**
 * GET /api/admin/products
 * Lấy danh sách phôi áo có phân trang và bộ lọc.
 * Query params: trang, soMoiTrang, tuKhoa, danhMuc, trangThai,
 * tonKho (tat_ca | ban_chay | con_hang | sap_het | het_hang)
 */
const getDanhSachSanPham = async (req, res, next) => {
  try {
    const data = await productService.layDanhSachSanPham(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CHI TIẾT SẢN PHẨM
// =====================================================================

/**
 * GET /api/admin/products/:id
 * Lấy chi tiết 1 phôi áo theo ID (kèm biến thể và ảnh).
 */
const getChiTietSanPham = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }
    const data = await productService.layChiTietSanPham(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// TẠO SẢN PHẨM MỚI
// =====================================================================

/**
 * POST /api/admin/products
 * Tạo phôi áo mới (chưa có biến thể, thêm biến thể sau).
 * Body: { categoryId, name, basePrice, material, form, madeIn, description, slug? }
 */
const taoSanPham = async (req, res, next) => {
  try {
    const data = await productService.taoSanPham(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo phôi áo thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CẬP NHẬT SẢN PHẨM
// =====================================================================

/**
 * PUT /api/admin/products/:id
 * Cập nhật thông tin phôi áo (tên, giá, chất liệu,...).
 * Body: { categoryId?, name?, basePrice?, material?, form?, madeIn?, description? }
 */
const capNhatSanPham = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }
    const data = await productService.capNhatSanPham(id, req.body);
    res.json({
      success: true,
      message: "Cập nhật phôi áo thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CẬP NHẬT TRẠNG THÁI HIỂN THỊ
// =====================================================================

/**
 * PATCH /api/admin/products/:id/status
 * Bật/tắt hiển thị phôi áo trên cửa hàng.
 * Body: { trangThai: "dang_hien_thi" | "dang_an" }
 */
const capNhatTrangThai = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }
    const { trangThai } = req.body;
    if (!trangThai) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu trường trangThai" });
    }
    const data = await productService.capNhatTrangThai(id, trangThai);
    res.json({
      success: true,
      message: "Cập nhật trạng thái hiển thị thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// XÓA SẢN PHẨM
// =====================================================================

/**
 * DELETE /api/admin/products/:id
 * Xóa phôi áo (sẽ lỗi nếu còn đơn hàng dùng biến thể này).
 */
const xoaSanPham = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || id < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }
    const data = await productService.xoaSanPham(id);
    res.json({
      success: true,
      message: data.message || "Xóa/ẩn phôi áo thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// BIẾN THỂ
// =====================================================================

/**
 * POST /api/admin/products/:id/variants
 * Thêm biến thể (màu + size) mới vào phôi áo.
 * Body: { color, size, sku, stockQty }
 */
const themBienThe = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    if (!productId || productId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }
    const data = await productService.themBienThe(productId, req.body);
    res.status(201).json({
      success: true,
      message: "Thêm biến thể thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/products/:id/variants/:variantId
 * Cập nhật biến thể (màu, size, SKU, tồn kho).
 * Body: { color?, size?, sku?, stockQty? }
 */
const capNhatBienThe = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const variantId = parseInt(req.params.variantId);
    if (!productId || productId < 1 || !variantId || variantId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }
    const data = await productService.capNhatBienThe(productId, variantId, req.body);
    res.json({
      success: true,
      message: "Cập nhật biến thể thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getThongKe,
  getDanhMuc,
  getCanhBaoTonKho,
  getDanhSachSanPham,
  getChiTietSanPham,
  taoSanPham,
  capNhatSanPham,
  capNhatTrangThai,
  xoaSanPham,
  themBienThe,
  capNhatBienThe,
};
