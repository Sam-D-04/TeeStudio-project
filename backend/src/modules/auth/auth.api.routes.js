const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const authController = require("./auth.api.controller");
const validate = require("../../common/middlewares/validate.middleware");
const { verifyToken } = require("../../common/middlewares/auth.middleware");
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
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

// Giới hạn nhẹ hơn cho các endpoint được gọi tự động (refresh/logout từ interceptor,
// verify-email khi bấm link) — vẫn cần chặn vì trước đây các route này không có
// rate limit nào.
const lightRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều lần thử, vui lòng thử lại sau ít phút.",
  },
});

// Giới hạn chặt cho các endpoint gửi email chủ động (chống spam hộp thư người khác).
const emailActionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu, vui lòng thử lại sau.",
  },
});

router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/refresh", lightRateLimiter, authController.refresh);
router.post("/logout", lightRateLimiter, authController.logout);
router.post("/logout-all", verifyToken, authController.logoutAll);
router.get("/me", verifyToken, authController.me);
router.put(
  "/me",
  verifyToken,
  validate(updateProfileSchema),
  authController.updateProfile
);
router.put(
  "/me/password",
  authRateLimiter,
  verifyToken,
  validate(changePasswordSchema),
  authController.changePassword
);

router.post(
  "/verify-email",
  lightRateLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail
);
router.post(
  "/resend-verification",
  emailActionRateLimiter,
  verifyToken,
  authController.resendVerification
);
router.post(
  "/forgot-password",
  emailActionRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);

module.exports = router;
