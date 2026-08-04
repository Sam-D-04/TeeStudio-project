const userAddressService = require("./user.address.service");

const parseAddressId = (req, res) => {
  const addressId = parseInt(req.params.id, 10);
  if (!addressId) {
    res.status(400).json({ success: false, message: "ID địa chỉ không hợp lệ" });
    return null;
  }
  return addressId;
};

const getMyAddresses = async (req, res, next) => {
  try {
    const data = await userAddressService.getMyAddresses(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const data = await userAddressService.createAddress(req.user.id, req.body);
    res.status(201).json({ success: true, message: "Thêm địa chỉ thành công", data });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const addressId = parseAddressId(req, res);
    if (addressId === null) return;

    const data = await userAddressService.updateAddress(req.user.id, addressId, req.body);
    res.json({ success: true, message: "Cập nhật địa chỉ thành công", data });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const addressId = parseAddressId(req, res);
    if (addressId === null) return;

    await userAddressService.deleteAddress(req.user.id, addressId);
    res.json({ success: true, message: "Xoá địa chỉ thành công" });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const addressId = parseAddressId(req, res);
    if (addressId === null) return;

    const data = await userAddressService.setDefaultAddress(req.user.id, addressId);
    res.json({ success: true, message: "Đã đặt làm địa chỉ mặc định", data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
