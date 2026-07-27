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

/**
 * GET /api/admin/products/categories/all
 * Lấy toàn bộ danh mục kèm số lượng sản phẩm (dùng cho trang quản lý).
 */
const getDanhSachDanhMuc = async (req, res, next) => {
  try {
    const data = await productService.layDanhSachDanhMuc();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/products/categories
 * Tạo danh mục mới.
 * Body: { ten }
 */
const taoDanhMuc = async (req, res, next) => {
  try {
    const { ten } = req.body;
    const data = await productService.taoDanhMuc(ten);
    res.status(201).json({ success: true, message: "Tạo danh mục thành công", data });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/products/categories/:categoryId
 * Cập nhật tên danh mục.
 * Body: { ten }
 */
const capNhatDanhMuc = async (req, res, next) => {
  try {
    const id = parseInt(req.params.categoryId);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: "ID danh mục không hợp lệ" });
    }
    const { ten } = req.body;
    const data = await productService.capNhatDanhMuc(id, ten);
    res.json({ success: true, message: "Cập nhật danh mục thành công", data });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/products/categories/:categoryId
 * Xóa danh mục.
 */
const xoaDanhMuc = async (req, res, next) => {
  try {
    const id = parseInt(req.params.categoryId);
    if (!id || id < 1) {
      return res.status(400).json({ success: false, message: "ID danh mục không hợp lệ" });
    }
    const data = await productService.xoaDanhMuc(id);
    res.json({ success: true, message: "Xóa danh mục thành công", data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/products/colors
 * Lấy các màu đã dùng để tái sử dụng trong Creatable Select.
 */
const getBangMau = async (req, res, next) => {
  try {
    const data = await productService.layBangMau();
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

const taiAnhSanPham = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    if (!productId || productId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID san pham khong hop le" });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Vui long chon it nhat 1 anh phoi ao" });
    }

    let metadata = [];
    if (req.body.metadata) {
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch (error) {
        return res
          .status(400)
          .json({ success: false, message: "Metadata anh khong hop le" });
      }
    }

    if (!Array.isArray(metadata) || metadata.length !== files.length) {
      return res.status(400).json({
        success: false,
        message: "So luong metadata phai khop voi so luong anh",
      });
    }

    const data = await productService.taiAnhSanPham(productId, files, metadata);
    res.status(201).json({
      success: true,
      message: "Tai anh phoi ao thanh cong",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const datAnhChinh = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const imageId = parseInt(req.params.imageId);
    if (!productId || productId < 1 || !imageId || imageId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID khong hop le" });
    }

    const data = await productService.datAnhChinh(productId, imageId);
    res.json({
      success: true,
      message: "Dat anh chinh thanh cong",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const xoaAnhSanPham = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const imageId = parseInt(req.params.imageId);
    if (!productId || productId < 1 || !imageId || imageId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID khong hop le" });
    }

    const data = await productService.xoaAnhSanPham(productId, imageId);
    res.json({
      success: true,
      message: "Xoa anh phoi ao thanh cong",
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
 * Body: { color, colorHex, size, sku }
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
 * Cập nhật thông tin biến thể (không cập nhật tồn kho).
 * Body: { color?, colorHex?, size?, sku?, status? }
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
  getBangMau,
  getCanhBaoTonKho,
  getDanhSachSanPham,
  getChiTietSanPham,
  taoSanPham,
  taiAnhSanPham,
  datAnhChinh,
  xoaAnhSanPham,
  capNhatSanPham,
  capNhatTrangThai,
  xoaSanPham,
  themBienThe,
  capNhatBienThe,
  // CRUD danh mục
  getDanhSachDanhMuc,
  taoDanhMuc,
  capNhatDanhMuc,
  xoaDanhMuc,
};
