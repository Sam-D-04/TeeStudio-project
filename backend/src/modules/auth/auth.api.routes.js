const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const authController = require("./auth.api.controller");
const validate = require("../../common/middlewares/validate.middleware");
const { verifyToken } = require("../../common/middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} = require("./auth.validation");

// Chặn brute-force: tối đa 10 lần thử/15 phút cho mỗi IP trên các endpoint nhạy cảm.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều lần thử, vui lòng thử lại sau ít phút.",
  },
});

router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);
router.post("/logout", validate(refreshTokenSchema), authController.logout);
router.post("/logout-all", verifyToken, authController.logoutAll);
router.get("/me", verifyToken, authController.me);

module.exports = router;
