/**
 * inventory.controller.js – Nhận request HTTP, gọi service, trả response.
 * Không chứa logic nghiệp vụ hay câu SQL – chỉ điều phối.
 */

const inventoryService = require("./admin.inventory.service");

// =====================================================================
// THỐNG KÊ KPI
// =====================================================================

/**
 * GET /api/admin/inventory/stats
 * Trả về 4 thẻ KPI thống kê đầu trang quản lý kho hàng.
 */
const getThongKeKho = async (req, res, next) => {
  try {
    const data = await inventoryService.layThongKeKho();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// DANH SÁCH TỒN KHO (phân trang + lọc + tìm kiếm)
// =====================================================================

/**
 * GET /api/admin/inventory
 * Lấy danh sách biến thể phôi áo có phân trang, tìm kiếm và lọc.
 *
 * Query params:
 *   trang         – trang hiện tại (mặc định: 1)
 *   soMoiTrang    – số dòng mỗi trang (mặc định: 10)
 *   tuKhoa        – tìm theo SKU, tên sản phẩm, hoặc màu sắc
 *   boLoc         – "tat_ca" | "sap_het" | "het_hang" | "con_hang" | <tên sản phẩm>
 *   tuNgay        – lọc SKU có biến động kho từ ngày YYYY-MM-DD
 *   denNgay       – lọc SKU có biến động kho đến ngày YYYY-MM-DD
 */
const getDanhSachTonKho = async (req, res, next) => {
  try {
    const data = await inventoryService.layDanhSachTonKho(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// CHI TIẾT BIẾN THỂ
// =====================================================================

/**
 * GET /api/admin/inventory/variants/:variantId
 * Lấy thông tin tồn kho chi tiết của một biến thể phôi áo.
 */
const getChiTietBienThe = async (req, res, next) => {
  try {
    const variantId = parseInt(req.params.variantId);
    if (!variantId || variantId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID biến thể không hợp lệ" });
    }
    const data = await inventoryService.layChiTietBienThe(variantId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// ĐƠN HÀNG CHỜ XUẤT PHÔI (theo biến thể)
// =====================================================================

/**
 * GET /api/admin/inventory/variants/:variantId/pending-orders
 * Lấy danh sách đơn hàng đang chờ xuất phôi áo cho biến thể này.
 */
const getDonChoXuat = async (req, res, next) => {
  try {
    const variantId = parseInt(req.params.variantId);
    if (!variantId || variantId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID biến thể không hợp lệ" });
    }
    const data = await inventoryService.layDonChoXuat(variantId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// LỊCH SỬ BIẾN ĐỘNG TỒN KHO (theo biến thể)
// =====================================================================

/**
 * GET /api/admin/inventory/variants/:variantId/history
 * Lấy lịch sử biến động tồn kho gần đây của một biến thể.
 */
const getLichSuBienDong = async (req, res, next) => {
  try {
    const variantId = parseInt(req.params.variantId);
    if (!variantId || variantId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "ID biến thể không hợp lệ" });
    }
    const data = await inventoryService.layLichSuBienDong(variantId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// GHI GIAO DỊCH KHO (Nhập / Xuất / Điều chỉnh)
// =====================================================================

/**
 * POST /api/admin/inventory/transactions
 * Ghi nhận giao dịch nhập/xuất/điều chỉnh kho và cập nhật tồn kho.
 *
 * Body:
 *   variantId       – ID biến thể phôi áo
 *   quantityChanged – Số lượng thay đổi (dương = nhập, âm = xuất)
 *   transactionType – "IMPORT" | "EXPORT" | "ADJUSTMENT" | "ORDER_EXPORT" | "RETURN"
 *   reason          – Lý do / ghi chú
 *   orderId?        – ID đơn hàng (nếu là ORDER_EXPORT)
 *   supplierId?     – ID nhà cung cấp (nếu là IMPORT)
 */
const ghiGiaoDich = async (req, res, next) => {
  try {
    const data = await inventoryService.ghiGiaoDichKho(req.body);
    res.status(201).json({
      success: true,
      message: "Ghi nhận giao dịch kho thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// DANH SÁCH SẢN PHẨM + BIẾN THỂ (phục vụ trang nhập kho)
// =====================================================================

/**
 * GET /api/admin/inventory/products-with-variants
 * Lấy danh sách sản phẩm đang ACTIVE kèm toàn bộ biến thể.
 * Admin dùng để chọn sản phẩm → màu + size khi nhập kho.
 */
const getDanhSachSanPhamVaBienThe = async (req, res, next) => {
  try {
    const data = await inventoryService.layDanhSachSanPhamVaBienThe();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// DANH SÁCH NHÀ CUNG CẤP (phục vụ trang nhập kho)
// =====================================================================

/**
 * GET /api/admin/inventory/suppliers
 * Lấy danh sách tất cả nhà cung cấp để hiển thị trong dropdown.
 */
const getDanhSachNhaCungCap = async (req, res, next) => {
  try {
    const data = await inventoryService.layDanhSachNhaCungCap();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/inventory/suppliers
 * Tạo nhanh nhà cung cấp mới từ trang nhập kho.
 */
const createNhaCungCap = async (req, res, next) => {
  try {
    const data = await inventoryService.taoNhaCungCap(req.body);
    res.status(201).json({
      success: true,
      message: "Thêm nhà cung cấp thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================================
// LỊCH SỬ TOÀN KHO (có phân trang + lọc + tìm kiếm)
// =====================================================================

/**
 * GET /api/admin/inventory/history
 * Lấy lịch sử giao dịch kho toàn bộ, hỗ trợ phân trang + lọc theo loại + tìm kiếm SKU.
 *
 * Query params:
 *   trang          – Trang hiện tại (mặc định: 1)
 *   soMoiTrang     – Số dòng mỗi trang (mặc định: 20)
 *   loaiGiaoDich   – "IMPORT" | "EXPORT" | "ADJUSTMENT" | "ORDER_EXPORT" | "RETURN" | "tat_ca"
 *   tuKhoa         – Tìm theo SKU hoặc tên sản phẩm
 */
const getLichSuKho = async (req, res, next) => {
  try {
    const data = await inventoryService.layLichSuKho(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getThongKeKho,
  getDanhSachTonKho,
  getChiTietBienThe,
  getDonChoXuat,
  getLichSuBienDong,
  getLichSuKho,
  ghiGiaoDich,
  getDanhSachSanPhamVaBienThe,
  getDanhSachNhaCungCap,
  createNhaCungCap,
};
