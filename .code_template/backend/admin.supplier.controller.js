/**
 * admin.supplier.controller.js – Nhận request HTTP, gọi service, trả response.
 * Không chứa logic nghiệp vụ hay câu SQL – chỉ điều phối.
 */

"use strict";

const supplierService = require("./admin.supplier.service");

// =====================================================================
// CONTROLLER 1: Lấy danh sách
// =====================================================================
const getAll = async (req, res, next) => {
    try {
        // Gọi nhân viên Service đi lấy data về
        const rows = await supplierService.getAllSuppliers();
        // Trả data cho Frontend theo chuẩn dự án (có success: true)
        res.json({ success: true, data: rows });
    } catch (error) {
        // Nếu lỗi, đẩy cho middleware lỗi tổng xử lý
        next(error);
    }
};

// =====================================================================
// CONTROLLER 2: Thêm mới
// =====================================================================
const create = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        await supplierService.createSupplier(name, phone);
        res.json({ success: true, message: "Thêm thành công!" });
    } catch (error) {
        next(error);
    }
};

// =====================================================================
// CONTROLLER 3: Xóa
// =====================================================================
const deleteSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        await supplierService.deleteSupplier(id);
        res.json({ success: true, message: "Xóa thành công!" });
    } catch (error) {
        next(error);
    }
};
// =====================================================================
// CONTROLLER 4: Sửa (Cập nhật)
// =====================================================================
const update = async (req, res, next) => {
    try {
        const { id } = req.params; // Lấy ID từ trên đường dẫn URL
        const { name, phone } = req.body; // Lấy dữ liệu mới do Frontend gửi lên

        // Truyền ID, Tên mới, SĐT mới sang cho Service để nó gọi DB
        await supplierService.updateSupplier(id, name, phone);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (error) {
        next(error);
    }
};

// =====================================================================
// CONTROLLER 5: Tìm kiếm
// =====================================================================
const search = async (req, res, next) => {
    try {
        // Frontend sẽ gửi chữ lên URL theo kiểu /search?keyword=vải
        // Nên ta dùng req.query để lấy chữ "vải" đó ra
        const { keyword } = req.query;

        // Gọi Service đi tìm kiếm
        const rows = await supplierService.searchSuppliers(keyword || "");
        res.json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};


// =====================================================================
// EXPORTS
// =====================================================================
module.exports = {
    getAll,
    create,
    deleteSupplier,
    update, // <--- Thêm dòng này
    search  // <--- Thêm dòng này
};
