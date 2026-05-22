-- --------------------------------------------
-- DANH MỤC CHUNG
-- --------------------------------------------

CREATE TABLE DonViTinh (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maDv NVARCHAR(50) UNIQUE,
  tenDv NVARCHAR(200) NULL
);


CREATE TABLE DanhMucHang (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maDanhMuc NVARCHAR(50) UNIQUE,
  tenDanhMuc NVARCHAR(200) NOT NULL,  -- áo quần, phụ kiện gì đó
);

CREATE TABLE HangHoa (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maHang NVARCHAR(50) UNIQUE,
  tenHang NVARCHAR(300) NOT NULL,
  danhMucId INT NULL,
  moTa NVARCHAR(MAX) NULL,
  trangThai NVARCHAR(50) NULL,        -- còn bán hay ngưng bán
  FOREIGN KEY (danhMucId) REFERENCES DanhMucHang(id),
  FOREIGN KEY (donViTinhId) REFERENCES DonViTinh(id)
);

-- Chi tiết
CREATE TABLE ChiTietHangHoa (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maHang INT NOT NULL,
  mauSac NVARCHAR(100) NULL,
  chatLieu NVARCHAR(100) NOT NULL,
  size NVARCHAR(50) NULL,
  giaVon NUMERIC NULL,
  giaBan NUMERIC NULL,
  FOREIGN KEY (hangHoaId) REFERENCES HangHoa(id) ON DELETE CASCADE
);

-- --------------------------------------------
-- KHO HÀNG
-- --------------------------------------------

CREATE TABLE TonKho (
  id INT IDENTITY(1,1) PRIMARY KEY,
  cuaHangId INT NOT NULL UNIQUE,
  hangHoaId INT NOT NULL UNIQUE,
  soLuongTon DECIMAL(18,4) NOT NULL DEFAULT 0,

 FOREIGN KEY (cuaHangId) REFERENCES CuaHang(id),
   FOREIGN KEY (hangHoaId) REFERENCES ChiTietHangHoa(id),

);

--Đặt ở trên để k lỗi
CREATE TABLE NhaCungCap (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maNcc NVARCHAR(50) UNIQUE,
  tenNcc NVARCHAR(300) NULL,
  maSoThue NVARCHAR(100) NULL,
  diaChi NVARCHAR(500) NULL,
  dienThoai NVARCHAR(50) NULL,
  trangThai NVARCHAR(50) NULL,

);
-- Nhập xuất phiếu
CREATE TABLE PhieuKho (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maPhieu NVARCHAR(100) UNIQUE,
  loai NVARCHAR(20) NOT NULL,  -- nhap, xuat, chuyen
  ngayLap DATE NULL,
  cuaHangNguonId INT NULL,
  cuaHangDichId INT NULL,
  nhaCungCapId INT NULL,
  ghiChu NVARCHAR(500) NULL,
  FOREIGN KEY (cuaHangNguonId) REFERENCES CuaHang(id),
 FOREIGN KEY (cuaHangDichId) REFERENCES CuaHang(id),
  FOREIGN KEY (nhaCungCapId) REFERENCES NhaCungCap(id),
  CONSTRAINT CHK_PhieuKho_Loai CHECK (loai IN ('NHAP','XUAT','CHUYEN'))
);

CREATE TABLE ChiTietPhieuKho (
  id INT IDENTITY(1,1) PRIMARY KEY,
  phieuKhoId INT NOT NULL,
  hangHoaId INT NOT NULL,
  soLuong DECIMAL(18,4) NOT NULL,
  donGia NUMERIC NULL,
  ghiChu NVARCHAR(300) NULL,
 FOREIGN KEY (phieuKhoId) REFERENCES PhieuKho(id) ON DELETE CASCADE,
  FOREIGN KEY (hangHoaId) REFERENCES ChiTietHangHoa(id)
);

-- --------------------------------------------
-- ĐỐI TÁC MUA BÁN
-- --------------------------------------------
CREATE TABLE KhachHang (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maKh NVARCHAR(50) UNIQUE,
  tenKh NVARCHAR(300) NULL,
  dienThoai NVARCHAR(50) NULL,
  email NVARCHAR(200) NULL,
  ngaySinh DATE NULL,
  diaChi NVARCHAR(500) NULL,
  diem INT NOT NULL DEFAULT 0,        -- Điểm tích lũy khuyến mãi
  tongDoanhSo NUMERIC NULL,
  trangThai NVARCHAR(50) NULL,
);

-- Chương trình khuyến mãi
CREATE TABLE KhuyenMai (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maKm NVARCHAR(50) UNIQUE,
  tenKm NVARCHAR(400) NOT NULL,
  loai NVARCHAR(50) NULL,  --  theo phần trăm , số tiền , quà tặng, đổi điểm
  giaTriGiam NUMERIC NULL,
  ngayBatDau DATE NULL,
  ngayKetThuc DATE NULL,
  trangThai NVARCHAR(50) NULL,
);

-- --------------------------------------------
-- NHÂN VIÊN
-- --------------------------------------------

CREATE TABLE NhanVien (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maNv NVARCHAR(50) UNIQUE,
  hoTen NVARCHAR(300) NOT NULL,
  dienThoai NVARCHAR(50) NULL,
  email NVARCHAR(200) NULL,
  cuaHangId INT NULL,  -- Cửa hàng làm việc
  phongBanId INT NULL,
  chucVu NVARCHAR(100) NULL,  -- là qlý hay nv bth
  luongCoBan NUMERIC NULL,
  ngayVaoLam DATE NULL,
  trangThai NVARCHAR(50) NULL,
  FOREIGN KEY (cuaHangId) REFERENCES CuaHang(id),
  FOREIGN KEY (phongBanId) REFERENCES PhongBan(id)
);

-- --------------------------------------------
-- BÁN HÀNG
-- --------------------------------------------

CREATE TABLE DonBanHang (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maDon NVARCHAR(100) UNIQUE,
  ngayBan DATETIME NOT NULL DEFAULT GETDATE(),
  cuaHangId INT NOT NULL,
  khachHangId INT NULL,               
  kmId INT NULL,          -- Khuyến mãi áp dụng
  tongTienHang NUMERIC,
  tienGiam NUMERIC NULL,
  tongThanhToan NUMERIC NULL,
  trangThai NVARCHAR(50) NULL,   --Đã hoàn thành chưa hay đang ở khâu nào       
  FOREIGN KEY (cuaHangId) REFERENCES CuaHang(id),
  FOREIGN KEY (khachHangId) REFERENCES KhachHang(id),
  FOREIGN KEY (nhanVienId) REFERENCES NhanVien(id),
  FOREIGN KEY (kmId) REFERENCES KhuyenMai(id)
  FOREIGN KEY (diaChiGiaoHangId) REFERENCES DiaChiGiaoHang(id);
);

CREATE TABLE ChiTietDonBanHang (
  id INT IDENTITY(1,1) PRIMARY KEY,
  donBanHangId INT NOT NULL,
  hangHoaId INT NOT NULL,
  soLuong DECIMAL(18,4) NOT NULL,
  donGia NUMERIC NOT NULL,
  tienGiam NUMERIC NULL,
  thanhTien NUMERIC NULL,
  thietKeId       INT NULL,               -- NULL nếu mua áo sẵn, có giá trị nếu có custom design
  FOREIGN KEY (thietKeId) REFERENCES ThietKe(id);
  FOREIGN KEY (donBanHangId) REFERENCES DonBanHang(id) ON DELETE CASCADE,
  FOREIGN KEY (hangHoaId) REFERENCES ChiTietHangHoa(id)
);

-- Hóa đơn và công nợ bán
CREATE TABLE HoaDonBan (
  id INT IDENTITY(1,1) PRIMARY KEY,
  soHoaDon NVARCHAR(100) UNIQUE,
  donBanHangId INT NULL,
  ngayHoaDon DATE NULL,  --ngày lập hóa đơn
  ngayDenHan DATE NULL,	 --ngày đến hạn thanh toán
  tongTien NUMERIC NULL,
  daThu NUMERIC NULL DEFAULT 0,
  conNo NUMERIC NULL,
   FOREIGN KEY (donBanHangId) REFERENCES DonBanHang(id)
);

--------------------------------------------
-- THANH TOÁN
-- --------------------------------------------

CREATE TABLE PhieuThuChi (
  id INT IDENTITY(1,1) PRIMARY KEY,
  maPhieu NVARCHAR(100) UNIQUE,
  
  loaiPhieu TINYINT, --1 là phiếu chi, 0 là phiếu thu
  
  hoaDonMuaId INT NULL,
  nhaCungCapId INT NULL,
  
  hoaDonBanId INT NULL,
  khachHangId INT NULL,
  
  ngay DATE NULL,
  
  soTien NUMERIC NULL,
  hinhThuc NVARCHAR(100) NULL,
  FOREIGN KEY (hoaDonBanId) REFERENCES HoaDonBan(id),
  FOREIGN KEY (khachHangId) REFERENCES KhachHang(id)
);




