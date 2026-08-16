const express = require('express');
const router = express.Router();

// Import cái controller vừa tạo ở trên
const supplierController = require('./admin.supplier.controller');

// Định nghĩa: Gửi GET thì lấy danh sách, POST thì thêm, DELETE thì xóa
router.get('/', supplierController.getAll);
router.post('/', supplierController.create);
router.delete('/:id', supplierController.deleteSupplier);
router.put('/:id', supplierController.update);  // <--- Thêm dòng này
router.get('/search', supplierController.search); // <--- Thêm dòng này


module.exports = router;
