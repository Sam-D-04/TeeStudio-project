const userService = require("./admin.user.service");

const getProfile = async (req, res, next) => {
  try {
    const data = await userService.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const data = await userService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: "Cập nhật hồ sơ thành công", data });
  } catch (error) {
    next(error);
  }
};

const listStaff = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const data = await userService.listStaff({ page, limit, search, status });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const data = await userService.createStaff(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo nhân sự và gửi email thông tin đăng nhập thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateStaff = async (req, res, next) => {
  try {
    const data = await userService.updateStaff(
      Number(req.params.id),
      req.body,
      req.user.id
    );
    res.json({ success: true, message: "Cập nhật nhân sự thành công", data });
  } catch (error) {
    next(error);
  }
};

const listCustomers = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const data = await userService.listCustomers({ page, limit, search, status });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const data = await userService.createCustomer(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo tài khoản khách hàng và gửi email thông tin đăng nhập thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const data = await userService.updateCustomer(Number(req.params.id), req.body);
    res.json({ success: true, message: "Cập nhật tài khoản khách hàng thành công", data });
  } catch (error) {
    next(error);
  }
};

const softDeleteCustomer = async (req, res, next) => {
  try {
    const { targetStatus } = req.body;
    const data = await userService.softDeleteCustomer(
      Number(req.params.id),
      targetStatus || "INACTIVE"
    );
    res.json({ success: true, message: "Vô hiệu hóa tài khoản thành công", data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  listStaff,
  createStaff,
  updateStaff,
  listCustomers,
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
};
