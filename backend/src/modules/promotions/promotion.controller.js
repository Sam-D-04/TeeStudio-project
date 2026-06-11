const service = require("./promotion.service");

const dieuPhoi = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

const layThongKe = dieuPhoi(async (req, res) => {
  res.json({ success: true, data: await service.layThongKeKhuyenMai() });
});

const layDanhSach = dieuPhoi(async (req, res) => {
  res.json({ success: true, data: await service.layDanhSachKhuyenMai(req.query) });
});

const taoMoi = dieuPhoi(async (req, res) => {
  res.status(201).json({
    success: true,
    message: "Tạo mã khuyến mãi thành công",
    data: await service.taoKhuyenMai(req.body),
  });
});

const capNhat = dieuPhoi(async (req, res) => {
  res.json({
    success: true,
    message: "Cập nhật mã khuyến mãi thành công",
    data: await service.capNhatKhuyenMai(req.params.id, req.body),
  });
});

const capNhatTrangThai = dieuPhoi(async (req, res) => {
  res.json({
    success: true,
    message: "Cập nhật trạng thái khuyến mãi thành công",
    data: await service.capNhatTrangThaiKhuyenMai(req.params.id, req.body.status),
  });
});

const xoa = dieuPhoi(async (req, res) => {
  res.json({
    success: true,
    message: "Xóa mã khuyến mãi thành công",
    data: await service.xoaKhuyenMai(req.params.id),
  });
});

const laySanPhamGiaSoLuong = dieuPhoi(async (req, res) => {
  res.json({ success: true, data: await service.layDanhSachSanPhamGiaSoLuong() });
});

const layGiaSoLuong = dieuPhoi(async (req, res) => {
  res.json({ success: true, data: await service.layGiaSoLuong(req.query.productId) });
});

const taoGiaSoLuong = dieuPhoi(async (req, res) => {
  res.status(201).json({
    success: true,
    message: "Thêm mức giá số lượng thành công",
    data: await service.taoGiaSoLuong(req.body),
  });
});

const capNhatGiaSoLuong = dieuPhoi(async (req, res) => {
  res.json({
    success: true,
    message: "Cập nhật mức giá số lượng thành công",
    data: await service.capNhatGiaSoLuong(req.params.id, req.body),
  });
});

const xoaGiaSoLuong = dieuPhoi(async (req, res) => {
  res.json({
    success: true,
    message: "Xóa mức giá số lượng thành công",
    data: await service.xoaGiaSoLuong(req.params.id),
  });
});

const layPhuPhi = dieuPhoi(async (req, res) => {
  res.json({ success: true, data: await service.layDanhSachPhuPhi() });
});

const capNhatPhuPhi = dieuPhoi(async (req, res) => {
  res.json({
    success: true,
    message: "Cập nhật phụ phí thành công",
    data: await service.capNhatPhuPhi(req.params.id, req.body),
  });
});

const layCongThucBaoGia = dieuPhoi(async (req, res) => {
  res.json({ success: true, data: await service.layCongThucBaoGia() });
});

const capNhatCongThucBaoGia = dieuPhoi(async (req, res) => {
  res.json({
    success: true,
    message: "Lưu công thức báo giá thành công",
    data: await service.capNhatCongThucBaoGia(req.body),
  });
});

module.exports = {
  layThongKe,
  layDanhSach,
  taoMoi,
  capNhat,
  capNhatTrangThai,
  xoa,
  laySanPhamGiaSoLuong,
  layGiaSoLuong,
  taoGiaSoLuong,
  capNhatGiaSoLuong,
  xoaGiaSoLuong,
  layPhuPhi,
  capNhatPhuPhi,
  layCongThucBaoGia,
  capNhatCongThucBaoGia,
};
