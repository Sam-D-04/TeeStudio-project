const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../../common/middlewares/auth.middleware');

// Các API CRUD User (ch? ADMIN)
// router.get('/', verifyToken, verifyRole(['ADMIN']), userController.getAll);

module.exports = router;
