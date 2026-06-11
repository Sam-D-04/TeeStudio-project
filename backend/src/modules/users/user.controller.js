const userService = require("./user.service");

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
    const data = await userService.listStaff();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createStaff = async (req, res, next) => {
  try {
    const data = await userService.createStaff(req.body);
    res.status(201).json({ success: true, message: "Tạo nhân sự thành công", data });
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

module.exports = {
  getProfile,
  updateProfile,
  listStaff,
  createStaff,
  updateStaff,
};
