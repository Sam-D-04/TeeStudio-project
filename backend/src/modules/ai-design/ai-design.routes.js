const router = require("express").Router();
const { verifyToken } = require("../../common/middlewares/auth.middleware");
const aiDesignController = require("./ai-design.controller");

// Yêu cầu đăng nhập — gọi Gemini tốn phí, tránh lạm dụng ẩn danh.
router.post("/generate", verifyToken, aiDesignController.generate);
router.post("/arrange", verifyToken, aiDesignController.arrange);

module.exports = router;
