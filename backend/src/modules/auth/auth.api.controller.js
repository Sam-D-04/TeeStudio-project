const authService = require("./auth.service");

const REFRESH_COOKIE_NAME = "refresh_token";
const REFRESH_COOKIE_PATH = "/api/auth";

const getSessionMetadata = (req) => ({
  userAgent: req.get("user-agent") || null,
  ipAddress: req.ip || null,
});

// Refresh token không còn trả về trong JSON body — được set làm cookie
// HttpOnly để giảm rủi ro bị đánh cắp qua XSS (frontend chỉ đọc được qua request).
const setRefreshCookie = (res, refreshToken, refreshTokenExpiresAt) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    // "none" để trình duyệt vẫn gửi cookie khi frontend (Vercel) và backend (Render)
    // khác domain nhau (cross-site); "none" bắt buộc phải đi kèm secure: true.
    sameSite: isProduction ? "none" : "lax",
    path: REFRESH_COOKIE_PATH,
    expires: new Date(refreshTokenExpiresAt),
  });
};

const clearRefreshCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: REFRESH_COOKIE_PATH,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};

const respondWithSession = (res, statusCode, message, session) => {
  const { refreshToken, refreshTokenExpiresAt, ...data } = session;
  setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
  res.status(statusCode).json({ success: true, message, data });
};

const login = async (req, res, next) => {
  try {
    const session = await authService.login(req.body, getSessionMetadata(req));
    respondWithSession(res, 200, "Đăng nhập thành công", session);
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const session = await authService.register(req.body, getSessionMetadata(req));
    respondWithSession(res, 201, "Đăng ký thành công", session);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy phiên đăng nhập",
      });
    }

    const session = await authService.refresh(refreshToken, getSessionMetadata(req));
    respondWithSession(res, 200, "Làm mới phiên đăng nhập thành công", session);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(refreshToken);
    clearRefreshCookie(res);
    res.json({ success: true, message: "Đăng xuất thành công" });
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    await authService.logoutAll(req.user.id);
    clearRefreshCookie(res);
    res.json({ success: true, message: "Đã đăng xuất khỏi tất cả thiết bị" });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const data = await authService.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: "Cập nhật thông tin thành công", data });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    clearRefreshCookie(res);
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmailToken(req.body.token);
    res.json({ success: true, message: "Xác minh email thành công" });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const result = await authService.resendVerification(req.user.id, req.ip);
    res.json({
      success: true,
      message: result.alreadyVerified
        ? "Email của bạn đã được xác minh"
        : "Đã gửi lại email xác minh",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email, req.ip);
    res.json({
      success: true,
      message: "Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  refresh,
  logout,
  logoutAll,
  me,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};
