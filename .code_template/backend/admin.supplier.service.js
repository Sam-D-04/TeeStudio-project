// Import kết nối database của dự án
const db = require("../../database/mysql");

// =====================================================================
// SERVICE 1: Lấy danh sách
// =====================================================================
async function getAllSuppliers() {
    // Chỉ chạy SQL và trả data về, KHÔNG quan tâm req hay res
    const rows = await db.query('SELECT * FROM supplier');
    return rows;
}

// =====================================================================
// SERVICE 2: Thêm mới
// =====================================================================
async function createSupplier(name, phone) {
    const result = await db.execute('INSERT INTO supplier (name, phone) VALUES (?, ?)', [name, phone]);
    return result;
}

// =====================================================================
// SERVICE 3: Xóa
// =====================================================================
async function deleteSupplier(id) {
    const result = await db.query('DELETE FROM supplier WHERE id=?', [id]);
    return result;
}

// =====================================================================
// SERVICE 4: Sửa (Cập nhật)
// =====================================================================
async function updateSupplier(id, name, phone) {
    // Dùng câu lệnh UPDATE của SQL. Dấu ? sẽ được thay thế lần lượt bằng name, phone, id
    const result = await db.execute(
        'UPDATE supplier SET name = ?, phone = ? WHERE id = ?',
        [name, phone, id]
    );
    return result;
}

// =====================================================================
// SERVICE 5: Tìm kiếm
// =====================================================================
async function searchSuppliers(keyword) {
    // Dùng LIKE trong SQL để tìm kiếm gần đúng (chứa từ khóa là tìm ra).
    // Dấu % mang ý nghĩa là "bất kỳ ký tự nào trước hoặc sau từ khóa"
    const searchQuery = `%${keyword}%`;

    // Tìm những dòng mà Tên HOẶC Số điện thoại có chứa chữ được nhập vào
    const rows = await db.query(
        'SELECT * FROM supplier WHERE name LIKE ? OR phone LIKE ?',
        [searchQuery, searchQuery]
    );
    return rows;
}


// Export tất cả các hàm ra ngoài để Controller gọi
module.exports = {
    getAllSuppliers,
    createSupplier,
    deleteSupplier,
    updateSupplier,    // <--- Thêm dòng này
    searchSuppliers    // <--- Thêm dòng này
};
