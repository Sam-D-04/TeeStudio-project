const authService = require("./auth.service");

const getSessionMetadata = (req) => ({
  userAgent: req.get("user-agent") || null,
  ipAddress: req.ip || null,
});

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body, getSessionMetadata(req));
    res.json({ success: true, message: "Đăng nhập thành công", data });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body, getSessionMetadata(req));
    res.status(201).json({ success: true, message: "Đăng ký thành công", data });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const data = await authService.refresh(
      req.body.refreshToken,
      getSessionMetadata(req)
    );
    res.json({ success: true, message: "Làm mới phiên đăng nhập thành công", data });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ success: true, message: "Đăng xuất thành công" });
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    await authService.logoutAll(req.user.id);
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

module.exports = { login, register, refresh, logout, logoutAll, me };
