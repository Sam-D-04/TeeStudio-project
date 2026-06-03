
---

## Module 16: Cài đặt Quản trị (`/admin/cai-dat`)

> **Tổng quan:** Trang Cài đặt là nơi quản trị viên cấu hình hệ thống, phân quyền nhân viên nội bộ và quản lý các thông số vận hành. Đây là module nhạy cảm – **chỉ Admin mới có quyền truy cập.**

---

### 16.1. Tổng quan màn hình

Trang Cài đặt gồm các khu vực chính:

1. **Tiêu đề trang** – Nút "Lưu thay đổi" và "Khôi phục mặc định"  
2. **4 thẻ KPI** – Thống kê tổng quan cấu hình hiện tại  
3. **Layout 2 cột:**  
   - Cột trái (3/12): Menu điều hướng cài đặt  
   - Cột phải (9/12): Nội dung tab đang chọn  

---

### 16.2. Cấu trúc file Frontend

```
frontend/src/
├── app/admin/cai-dat/
│   └── page.tsx                   ← Server Component, khai báo metadata
└── components/admin/settings/
    ├── SettingsClient.tsx          ← Client wrapper ("use client")
    ├── SettingsPage.tsx            ← Orchestrator chính (lắp ghép layout)
    ├── SettingStatCard.tsx         ← Thẻ thống kê KPI
    ├── SettingNavMenu.tsx          ← Menu điều hướng bên trái
    ├── SettingStaffTable.tsx       ← Bảng danh sách nhân viên
    ├── SettingRoleBadge.tsx        ← Badge vai trò nhân viên
    └── SettingStatusBadge.tsx      ← Badge trạng thái hoạt động
```

---

### 16.3. Các Tab trong Menu Cài đặt

| Key (Frontend)          | Nhãn hiển thị               | Mô tả                                    | Trạng thái FE |
|-------------------------|-----------------------------|------------------------------------------|---------------|
| `tai_khoan`             | Tài khoản & Phân quyền     | Quản lý nhân viên nội bộ, vai trò        | ✅ Hoàn thành  |
| `thong_tin_cua_hang`    | Thông tin cửa hàng          | Tên, địa chỉ, liên hệ cửa hàng          | 🔄 Placeholder |
| `trang_thai_quy_trinh`  | Trạng thái quy trình        | Các nhóm trạng thái trong quy trình SX  | 🔄 Placeholder |
| `phuong_thuc_thanh_toan`| Phương thức thanh toán      | Bật/tắt cổng VNPAY, COD                 | 🔄 Placeholder |
| `bao_mat`               | Bảo mật & Phiên đăng nhập  | Chính sách mật khẩu, log đăng nhập      | 🔄 Placeholder |

---

### 16.4. API – Tab "Tài khoản & Phân quyền" (Bảng nhân viên)

Đây là tab đã hoàn thành frontend. Backend cần cung cấp các API sau:

---

#### 16.4.1. Lấy danh sách nhân viên

```
GET /api/admin/staff
```

**Headers cần thiết:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters (tùy chọn):**

| Tham số     | Kiểu   | Mô tả                                         |
|-------------|--------|-----------------------------------------------|
| `page`      | number | Trang hiện tại (mặc định: 1)                  |
| `limit`     | number | Số bản ghi mỗi trang (mặc định: 10)           |
| `search`    | string | Tìm theo tên hoặc email                       |
| `vai_tro`   | string | Lọc theo vai trò: `admin`, `kho`, `san_xuat`, `ke_toan` |
| `trang_thai`| string | Lọc theo trạng thái: `hoat_dong`, `vo_hieu`  |

**Response mong đợi (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "danhSach": [
      {
        "id": 1,
        "hoTen": "Nguyễn Tuấn",
        "email": "tuan.nguyen@teestudio.vn",
        "vaiTro": "admin",
        "trangThai": "hoat_dong",
        "ngayTao": "12/10/2023"
      },
      {
        "id": 2,
        "hoTen": "Lê Hoàng",
        "email": "hoang.le@teestudio.vn",
        "vaiTro": "kho",
        "trangThai": "hoat_dong",
        "ngayTao": "15/10/2023"
      }
    ],
    "tongSo": 8,
    "trang": 1,
    "soTrangMoiTrang": 10,
    "tongSoTrang": 1
  }
}
```

**Giá trị hợp lệ của `vaiTro`:**

| Giá trị      | Hiển thị     | Màu sắc badge FE            |
|--------------|--------------|------------------------------|
| `admin`      | Admin        | Xanh sky blue (primary)      |
| `kho`        | Kho          | Xanh secondary nhạt          |
| `san_xuat`   | Sản xuất     | Xanh tertiary nhạt           |
| `ke_toan`    | Kế toán      | Xám trung tính               |

**Giá trị hợp lệ của `trangThai`:**

| Giá trị      | Hiển thị     | Màu sắc badge FE            |
|--------------|--------------|------------------------------|
| `hoat_dong`  | Hoạt động    | Xanh lá (success)            |
| `vo_hieu`    | Vô hiệu      | Xám (neutral)                |

---

#### 16.4.2. Thêm nhân viên mới

```
POST /api/admin/staff
```

**Request Body:**

```json
{
  "hoTen": "Nguyễn Văn A",
  "email": "a.nguyen@teestudio.vn",
  "matKhau": "matKhauTamThoi123",
  "vaiTro": "kho"
}
```

**Response (HTTP 201):**

```json
{
  "success": true,
  "message": "Thêm nhân viên thành công",
  "data": {
    "id": 9,
    "hoTen": "Nguyễn Văn A",
    "email": "a.nguyen@teestudio.vn",
    "vaiTro": "kho",
    "trangThai": "hoat_dong",
    "ngayTao": "02/06/2026"
  }
}
```

---

#### 16.4.3. Cập nhật thông tin nhân viên

```
PUT /api/admin/staff/:id
```

**Request Body (chỉ gửi các trường muốn cập nhật):**

```json
{
  "hoTen": "Nguyễn Văn B",
  "vaiTro": "san_xuat",
  "trangThai": "vo_hieu"
}
```

**Response (HTTP 200):**

```json
{
  "success": true,
  "message": "Cập nhật nhân viên thành công",
  "data": {
    "id": 9,
    "hoTen": "Nguyễn Văn B",
    "email": "a.nguyen@teestudio.vn",
    "vaiTro": "san_xuat",
    "trangThai": "vo_hieu",
    "ngayTao": "02/06/2026"
  }
}
```

---

#### 16.4.4. Xóa nhân viên

```
DELETE /api/admin/staff/:id
```

> **Lưu ý:** Chỉ nên xóa tài khoản không có lịch sử thao tác. Nên dùng `trangThai: "vo_hieu"` thay vì xóa hẳn để bảo toàn log.

**Response (HTTP 200):**

```json
{
  "success": true,
  "message": "Đã xóa nhân viên"
}
```

---

### 16.5. API – Thẻ Thống kê KPI (đầu trang)

```
GET /api/admin/settings/stats
```

**Response mong đợi (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "tongTaiKhoanNoiBo": 8,
    "tongVaiTro": 4,
    "tongNhomTrangThai": 3,
    "soPhuongThucThanhToanDangBat": 1
  }
}
```

---

### 16.6. Bảng Database liên quan

Bảng `users` (hoặc `admins` tùy thiết kế) cần có các cột sau để hỗ trợ đủ các tính năng frontend đã xây dựng:

```sql
-- Bảng quản lý tài khoản nhân viên nội bộ
CREATE TABLE admin_users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  ho_ten      VARCHAR(100)  NOT NULL,               -- Họ và tên đầy đủ
  email       VARCHAR(150)  NOT NULL UNIQUE,         -- Email đăng nhập nội bộ
  mat_khau    VARCHAR(255)  NOT NULL,                -- Mật khẩu đã hash bằng bcrypt
  vai_tro     ENUM('admin', 'kho', 'san_xuat', 'ke_toan') NOT NULL DEFAULT 'kho',
  trang_thai  ENUM('hoat_dong', 'vo_hieu') NOT NULL DEFAULT 'hoat_dong',
  created_at  DATETIME      DEFAULT NOW(),
  updated_at  DATETIME      DEFAULT NOW() ON UPDATE NOW()
);
```

**Giải thích các cột:**

| Cột          | Kiểu dữ liệu                   | Mô tả                                             |
|--------------|---------------------------------|---------------------------------------------------|
| `id`         | INT AUTO_INCREMENT              | Khóa chính – Frontend dùng để gọi API chỉnh sửa  |
| `ho_ten`     | VARCHAR(100)                    | Hiển thị trong cột "Họ tên" + tạo chữ viết tắt avatar |
| `email`      | VARCHAR(150) UNIQUE             | Hiển thị trong cột "Email"                        |
| `mat_khau`   | VARCHAR(255)                    | Không bao giờ gửi về Frontend                     |
| `vai_tro`    | ENUM                            | Quy định màu badge trong `SettingRoleBadge`       |
| `trang_thai` | ENUM                            | Quy định màu badge trong `SettingStatusBadge`     |
| `created_at` | DATETIME                        | Hiển thị trong cột "Ngày tạo" (format DD/MM/YYYY)|

---

### 16.7. Xác thực & Phân quyền

- **Tất cả API `/api/admin/staff/*`** đều yêu cầu JWT token hợp lệ.
- **Chỉ tài khoản có `vai_tro = 'admin'`** mới được gọi API thêm/sửa/xóa nhân viên.
- Middleware cần kiểm tra `req.user.vai_tro === 'admin'` trước khi cho phép thao tác.

---

### 16.8. Lưu ý quan trọng cho Backend

1. **Không bao giờ trả về `mat_khau`** trong response dù dưới bất kỳ dạng nào.
2. **Mật khẩu** khi tạo mới phải được hash bằng `bcrypt` trước khi lưu vào DB.
3. **`ngayTao`** nên được format sẵn `DD/MM/YYYY` từ Backend, hoặc trả về ISO date để Frontend tự format.
4. **Chữ viết tắt avatar** (ví dụ "NT" từ "Nguyễn Tuấn") được tạo hoàn toàn ở Frontend – Backend không cần xử lý.
5. **Màu avatar** cũng do Frontend tự quyết định theo `vaiTro` – Backend chỉ cần trả đúng giá trị ENUM.

---

## Module 17: Khuyến mãi & Báo giá (`/admin/khuyen-mai-bao-gia`)

> **Tổng quan:** Module này cho phép quản trị viên quản lý toàn bộ hệ thống định giá: mã giảm giá, bảng giá số lượng lớn, phụ phí in ấn và công thức tính giá tự động. Đây là module quan trọng ảnh hưởng trực tiếp đến báo giá hiển thị cho khách hàng.

---

### 17.1. Tổng quan màn hình

Trang gồm các khu vực chính:

1. **Tiêu đề trang** – Nút "Xuất cấu hình" và "Tạo mã khuyến mãi"
2. **4 thẻ KPI** – Mã đang hoạt động, Sắp hết hạn, Lượt dùng tháng này, Giảm giá đã áp dụng
3. **Tab điều hướng** (4 tab):
   - Tab 1: Mã khuyến mãi (bảng dữ liệu + drawer tạo/sửa)
   - Tab 2: Giá số lượng lớn (bảng dải giá theo số lượng)
   - Tab 3: Phụ phí in & thiết kế (danh sách phụ phí bật/tắt)
   - Tab 4: Công thức báo giá (cấu hình tham số công thức)
4. **Drawer** – Panel bên phải để tạo/sửa mã khuyến mãi

---

### 17.2. Cấu trúc file Frontend

```
frontend/src/
├── app/admin/khuyen-mai-bao-gia/
│   └── page.tsx                    ← Server Component, khai báo metadata SEO
└── components/admin/promotions/
    ├── PromotionClient.tsx          ← Client wrapper ("use client")
    ├── PromotionPage.tsx            ← Orchestrator chính (ghép toàn bộ layout)
    ├── PromotionStatCard.tsx        ← Thẻ thống kê KPI (4 thẻ đầu trang)
    ├── PromotionStatusBadge.tsx     ← Badge trạng thái mã (Đang hoạt động / Tạm dừng / Hết hạn)
    ├── PromotionUsageBar.tsx        ← Thanh tiến độ lượt dùng (progress bar)
    ├── PromotionFilterBar.tsx       ← Thanh lọc: tìm kiếm, trạng thái, loại giảm
    ├── PromotionTable.tsx           ← Bảng dữ liệu mã khuyến mãi
    ├── PromotionDrawer.tsx          ← Panel tạo/sửa mã (form bên phải)
    ├── BulkPricingTab.tsx           ← Tab "Giá số lượng lớn"
    ├── PrintSurchargeTab.tsx        ← Tab "Phụ phí in & thiết kế"
    └── PriceFormulaTab.tsx          ← Tab "Công thức báo giá"
```

---

### 17.3. Các trạng thái mã khuyến mãi (PromotionStatus)

| Giá trị enum (Backend)  | Hiển thị FE       | Màu nền badge | Màu chữ badge |
|-------------------------|-------------------|---------------|----------------|
| `dang_hoat_dong`        | Đang hoạt động    | `#dcfce7`     | `#10b981`      |
| `tam_dung`              | Tạm dừng          | `#fef9c3`     | `#ca8a04`      |
| `het_han`               | Hết hạn           | `#e4e9ed`     | `#6e7881`      |

---

### 17.4. Các loại giảm giá (loaiGiam)

| Giá trị enum (Backend) | Hiển thị FE          | Cách tính                                     |
|------------------------|----------------------|-----------------------------------------------|
| `phan_tram`            | Phần trăm (%)        | `giaTriGiam` = số %, ví dụ 10 = giảm 10%     |
| `so_tien`              | Số tiền              | `giaTriGiam` = số VNĐ, ví dụ 50000 = 50.000đ |
| `mien_phi_ship`        | Miễn phí vận chuyển  | Không dùng `giaTriGiam`                       |

---

### 17.5. API – Tab "Mã khuyến mãi"

#### 17.5.1. Lấy danh sách mã khuyến mãi

```
GET /api/admin/promotions
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters (tùy chọn):**

| Tham số       | Kiểu   | Mô tả                                                        |
|---------------|--------|--------------------------------------------------------------|
| `page`        | number | Trang hiện tại (mặc định: 1)                                 |
| `limit`       | number | Số bản ghi mỗi trang (mặc định: 10)                          |
| `tu_khoa`     | string | Tìm kiếm theo mã code (LIKE %keyword%)                       |
| `trang_thai`  | string | Lọc: `dang_hoat_dong`, `tam_dung`, `het_han`                 |
| `loai_giam`   | string | Lọc: `phan_tram`, `so_tien`, `mien_phi_ship`                 |

**Response mong đợi (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "danhSach": [
      {
        "id": 1,
        "ma": "TEE10",
        "loaiGiam": "phan_tram",
        "giaTriGiam": 10,
        "donToiThieu": 0,
        "ngayBatDau": "01/05/2026",
        "ngayKetThuc": null,
        "daSDung": 850,
        "gioiHanLuot": 1000,
        "trangThai": "dang_hoat_dong"
      }
    ],
    "tongSo": 12,
    "trang": 1,
    "soTrangMoiTrang": 10,
    "tongSoTrang": 2
  }
}
```

**Giải thích các trường:**

| Trường         | Kiểu             | Mô tả                                                              |
|----------------|------------------|--------------------------------------------------------------------|
| `id`           | number           | Khóa chính – dùng để gọi API sửa/xóa                              |
| `ma`           | string           | Mã code in hoa, ví dụ "TEE10"                                      |
| `loaiGiam`     | string (ENUM)    | Loại giảm (xem bảng 17.4)                                          |
| `giaTriGiam`   | number           | Giá trị giảm (% hoặc VNĐ)                                         |
| `donToiThieu`  | number           | Giá trị đơn hàng tối thiểu (VNĐ), 0 = không yêu cầu              |
| `ngayBatDau`   | string           | Format `DD/MM/YYYY` hoặc ISO date                                  |
| `ngayKetThuc`  | string \| null   | null = vô thời hạn                                                 |
| `daSDung`      | number           | Số lần mã đã được sử dụng                                          |
| `gioiHanLuot`  | number \| null   | Giới hạn tổng lượt dùng, null = không giới hạn                    |
| `trangThai`    | string (ENUM)    | Trạng thái hiện tại (xem bảng 17.3)                               |

---

#### 17.5.2. Lấy thống kê KPI (4 thẻ đầu trang)

```
GET /api/admin/promotions/stats
```

**Response mong đợi (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "soMaDangHoatDong": 12,
    "soMaSapHetHan": 3,
    "tongLuotDungThang": 248,
    "tongGiamDaApDung": 18450000
  }
}
```

**Định nghĩa "sắp hết hạn":** mã có `ngay_ket_thuc` trong vòng 7 ngày tới và `trang_thai = 'dang_hoat_dong'`.

---

#### 17.5.3. Tạo mã khuyến mãi mới

```
POST /api/admin/promotions
```

**Request Body:**

```json
{
  "ma": "TEE10",
  "loaiGiam": "phan_tram",
  "giaTriGiam": 10,
  "donToiThieu": 0,
  "ngayBatDau": "2026-06-01",
  "ngayKetThuc": null,
  "gioiHanLuot": 1000,
  "chiDanhChoKhachMoi": false
}
```

**Lưu ý quan trọng:**
- `ma` phải là duy nhất (UNIQUE trong DB). Nếu trùng → trả về lỗi 409.
- `giaTriGiam` không dùng khi `loaiGiam = "mien_phi_ship"` → Backend có thể bỏ qua.

**Response (HTTP 201):**

```json
{
  "success": true,
  "message": "Tạo mã khuyến mãi thành công",
  "data": { "id": 6, "ma": "TEE10", "trangThai": "dang_hoat_dong" }
}
```

---

#### 17.5.4. Cập nhật mã khuyến mãi

```
PUT /api/admin/promotions/:id
```

**Request Body (chỉ gửi trường cần cập nhật):**

```json
{
  "giaTriGiam": 15,
  "ngayKetThuc": "2026-12-31",
  "trangThai": "tam_dung"
}
```

---

#### 17.5.5. Xóa mã khuyến mãi

```
DELETE /api/admin/promotions/:id
```

> **Lưu ý:** Chỉ xóa mã chưa được sử dụng (`da_su_dung = 0`). Mã đã dùng nên chuyển sang `trang_thai = 'het_han'` để bảo toàn lịch sử.

---

### 17.6. API – Tab "Giá số lượng lớn"

#### 17.6.1. Lấy danh sách

```
GET /api/admin/pricing/bulk
```

**Response (HTTP 200):**

```json
{
  "success": true,
  "data": [
    { "id": 1, "tuSoLuong": 10, "denSoLuong": 29, "phanTramGiam": 5 },
    { "id": 2, "tuSoLuong": 30, "denSoLuong": 49, "phanTramGiam": 8 },
    { "id": 3, "tuSoLuong": 50, "denSoLuong": null, "phanTramGiam": 12 }
  ]
}
```

**Lưu ý:** `denSoLuong = null` nghĩa là "từ `tuSoLuong` trở lên".

#### 17.6.2. Thêm dải giá mới

```
POST /api/admin/pricing/bulk
```

**Request Body:**

```json
{ "tuSoLuong": 10, "denSoLuong": 29, "phanTramGiam": 5 }
```

**Ràng buộc Backend phải validate:**
- `tuSoLuong < denSoLuong` (hoặc `denSoLuong = null`)
- Các dải giá không được chồng chéo nhau
- `phanTramGiam` trong khoảng 0–100

#### 17.6.3. Xóa dải giá

```
DELETE /api/admin/pricing/bulk/:id
```

---

### 17.7. API – Tab "Phụ phí in & thiết kế"

#### 17.7.1. Lấy danh sách phụ phí

```
GET /api/admin/pricing/surcharges
```

**Response (HTTP 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenPhuPhi": "In hình lớn (>A4)",
      "moTa": "Áp dụng khi khách chọn vùng in vượt kích thước A4",
      "giaTri": 30000,
      "donVi": "/áo",
      "dangBat": true
    }
  ]
}
```

#### 17.7.2. Cập nhật giá trị phụ phí

```
PUT /api/admin/pricing/surcharges/:id
```

**Request Body:** `{ "giaTri": 35000 }`

#### 17.7.3. Bật/tắt phụ phí

```
PATCH /api/admin/pricing/surcharges/:id
```

**Request Body:** `{ "dangBat": false }`

---

### 17.8. API – Tab "Công thức báo giá"

#### 17.8.1. Lấy cấu hình công thức

```
GET /api/admin/pricing/formula
```

**Response (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "heSoLaiCoban": 1.5,
    "lamTronDen": 1000,
    "phiVanChuyenMacDinh": 30000,
    "nguongMienPhiShip": 500000,
    "chiSoVATPhaTram": 0
  }
}
```

**Ý nghĩa các trường:**

| Trường                    | Kiểu   | Mô tả                                                           |
|---------------------------|--------|-----------------------------------------------------------------|
| `heSoLaiCoban`            | float  | Hệ số nhân trên giá vốn (1.5 = lãi 50%)                        |
| `lamTronDen`              | number | Làm tròn giá lên đến bội số này (1000 = làm tròn 1.000đ)       |
| `phiVanChuyenMacDinh`     | number | Phí ship mặc định nếu không miễn (VNĐ)                         |
| `nguongMienPhiShip`       | number | Đơn từ số tiền này trở lên được miễn phí ship (VNĐ)            |
| `chiSoVATPhaTram`         | number | % VAT (0 = không tính VAT, 10 = tính 10% VAT)                  |

#### 17.8.2. Lưu cấu hình công thức

```
PUT /api/admin/pricing/formula
```

**Request Body:** Cùng structure như response trên.

---

### 17.9. Bảng Database liên quan

```sql
-- Mã khuyến mãi
CREATE TABLE discount_codes (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  ma                    VARCHAR(50)   NOT NULL UNIQUE,
  loai_giam             ENUM('phan_tram', 'so_tien', 'mien_phi_ship') NOT NULL,
  gia_tri_giam          DECIMAL(12,2) DEFAULT 0,
  don_toi_thieu         DECIMAL(12,2) DEFAULT 0,
  ngay_bat_dau          DATE          NOT NULL,
  ngay_ket_thuc         DATE          NULL,          -- NULL = vô thời hạn
  da_su_dung            INT           DEFAULT 0,
  gioi_han_luot         INT           NULL,           -- NULL = không giới hạn
  chi_danh_cho_khach_moi TINYINT(1)   DEFAULT 0,
  trang_thai            ENUM('dang_hoat_dong', 'tam_dung', 'het_han') DEFAULT 'dang_hoat_dong',
  created_at            DATETIME      DEFAULT NOW(),
  updated_at            DATETIME      DEFAULT NOW() ON UPDATE NOW()
);

-- Bảng giá số lượng lớn
CREATE TABLE bulk_pricing (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tu_so_luong     INT           NOT NULL,
  den_so_luong    INT           NULL,               -- NULL = không giới hạn
  phan_tram_giam  DECIMAL(5,2)  NOT NULL,
  created_at      DATETIME      DEFAULT NOW()
);

-- Phụ phí in ấn
CREATE TABLE print_surcharges (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  ten_phu_phi VARCHAR(100)  NOT NULL,
  mo_ta       TEXT,
  gia_tri     DECIMAL(12,2) NOT NULL,
  don_vi      VARCHAR(20)   DEFAULT '/áo',
  dang_bat    TINYINT(1)    DEFAULT 1,
  updated_at  DATETIME      DEFAULT NOW() ON UPDATE NOW()
);

-- Công thức báo giá (chỉ 1 hàng, id=1)
CREATE TABLE pricing_formula (
  id                        INT           PRIMARY KEY DEFAULT 1,
  he_so_lai_co_ban          DECIMAL(5,2)  DEFAULT 1.50,
  lam_tron_den              INT           DEFAULT 1000,
  phi_van_chuyen_mac_dinh   DECIMAL(12,2) DEFAULT 30000,
  nguong_mien_phi_ship      DECIMAL(12,2) DEFAULT 500000,
  chi_so_vat_phan_tram      DECIMAL(5,2)  DEFAULT 0,
  updated_at                DATETIME      DEFAULT NOW() ON UPDATE NOW()
);
```

---

### 17.10. Lưu ý quan trọng cho Backend

1. **Công thức tính giá** được áp dụng ở Backend khi khách yêu cầu báo giá. Frontend chỉ dùng để cấu hình – không tự tính giá ở Frontend.
2. **Tự động cập nhật `trang_thai`:** Cần có cron job chuyển trạng thái sang `het_han` khi `ngay_ket_thuc` qua đi.
3. **`da_su_dung`** tăng lên khi đơn hàng áp dụng mã thành công. Không tăng khi đơn bị hủy.
4. **Kiểm tra giới hạn lượt dùng:** Trước khi áp dụng mã, check `da_su_dung < gioi_han_luot` (hoặc `gioi_han_luot IS NULL`).
5. **`chi_danh_cho_khach_moi`:** Backend kiểm tra khách đã có đơn hàng trước đó chưa.
6. **Bảng `pricing_formula`** chỉ có 1 hàng (id=1). Dùng `INSERT ... ON DUPLICATE KEY UPDATE` khi lưu.
7. **Thanh tiến độ lượt dùng** tính `daSDung / gioiHanLuot` hoàn toàn ở Frontend – Backend không xử lý.

---


---


## Module 18: Thiết kế & In ấn (`/admin/thiet-ke`)

> **Tổng quan:** Đây là module cốt lõi của hệ thống TeeStudio. Admin sử dụng trang này để xem xét, duyệt hoặc yêu cầu chỉnh sửa thiết kế mà khách hàng đã tạo trên Design Studio. Sau khi duyệt, admin sẽ gửi đơn đến xưởng in. Module cũng cho phép cấu hình sticker và vị trí in.

---

### 18.1. Tổng quan màn hình

Trang gồm các khu vực chính:

1. **Tiêu đề trang** – 3 nút hành động: "Thêm sticker", "Thêm vị trí in", "Xuất thông số in"
2. **4 thẻ KPI** – Thống kê tổng quan tình trạng thiết kế và đơn in
3. **Panel chính** – 3 tab điều hướng:
   - **Tab 1:** Thiết kế khách hàng (bảng chính)
   - **Tab 2:** Đơn cần in (bảng đơn đã duyệt chờ gửi xưởng)
   - **Tab 3:** Tài nguyên thiết kế / Vị trí in (sticker + cấu hình vị trí)

---

### 18.2. Cấu trúc file Frontend

```
frontend/src/
├── app/admin/thiet-ke/
│   └── page.tsx                          ← Server Component, khai báo metadata SEO
└── components/admin/designs/
    ├── DesignClient.tsx                  ← Client wrapper ("use client")
    ├── DesignPage.tsx                    ← Orchestrator chính (quản lý state & lắp ghép layout)
    ├── DesignStatCard.tsx                ← Thẻ KPI thống kê (4 thẻ đầu trang)
    ├── DesignStatusBadge.tsx             ← Badge trạng thái thiết kế
    ├── DesignFilterBar.tsx               ← Thanh lọc bảng thiết kế
    ├── DesignTable.tsx                   ← Bảng danh sách thiết kế khách hàng
    ├── DesignPreview.tsx                 ← Ô thumbnail xem trước thiết kế
    ├── PrintOrderTab.tsx                 ← Tab "Đơn cần in"
    └── DesignResourceTab.tsx             ← Tab "Tài nguyên / Vị trí in"
```

---

### 18.3. Các trạng thái thiết kế (DesignStatus)

| Giá trị (Backend ENUM) | Hiển thị FE        | Màu nền badge | Màu chữ badge |
|------------------------|--------------------|---------------|---------------|
| `cho_kiem_tra`         | Chờ kiểm tra       | `#fef3c7`     | `#d97706`     |
| `can_chinh_sua`        | Cần chỉnh sửa      | `#ffedd5`     | `#ea580c`     |
| `da_duyet`             | Đã duyệt           | `#dcfce7`     | `#10b981`     |

---

### 18.4. API – Thẻ KPI thống kê (4 thẻ đầu trang)

```
GET /api/admin/designs/stats
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response mong đợi (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "soChoKiemTra": 9,
    "soCanChinhSua": 5,
    "soDonChoGuiXuong": 14,
    "soDangIn": 12
  }
}
```

**Giải thích các trường KPI:**

| Trường              | Mô tả                                                              |
|---------------------|--------------------------------------------------------------------|
| `soChoKiemTra`      | Số thiết kế có `trang_thai = 'cho_kiem_tra'`                      |
| `soCanChinhSua`     | Số thiết kế có `trang_thai = 'can_chinh_sua'`                     |
| `soDonChoGuiXuong`  | Số đơn cần in có `trang_thai = 'cho_gui_xuong'`                   |
| `soDangIn`          | Số đơn cần in có `trang_thai = 'dang_in'`                         |

---

### 18.5. API – Tab "Thiết kế khách hàng"

#### 18.5.1. Lấy danh sách thiết kế

```
GET /api/admin/designs
```

**Query Parameters (tùy chọn):**

| Tham số       | Kiểu   | Mô tả                                                          |
|---------------|--------|----------------------------------------------------------------|
| `page`        | number | Trang hiện tại (mặc định: 1)                                   |
| `limit`       | number | Số bản ghi mỗi trang (mặc định: 10)                            |
| `tu_khoa`     | string | Tìm theo mã TK hoặc tên khách (LIKE %keyword%)                |
| `trang_thai`  | string | Lọc: `cho_kiem_tra`, `can_chinh_sua`, `da_duyet`               |
| `vi_tri_in`   | string | Lọc: `nguc_trai`, `nguc_phai`, `sau_lung`, `tay_trai`, `tay_phai` |

**Response mong đợi (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "danhSach": [
      {
        "id": 1,
        "maThietKe": "TK-2024",
        "urlPreview": "https://res.cloudinary.com/teestudio/...",
        "mauAo": "#000000",
        "tenKhachHang": "Nguyễn Văn A",
        "soDienThoai": "0901234567",
        "tenSanPham": "Áo thun Basic",
        "tenMauAo": "Đen",
        "viTriIn": "Ngực trái",
        "trangThai": "cho_kiem_tra",
        "ngayGui": "03/06/2026"
      }
    ],
    "tongSo": 42,
    "trang": 1,
    "soTrangMoiTrang": 10,
    "tongSoTrang": 5
  }
}
```

**Giải thích các trường:**

| Trường          | Kiểu          | Mô tả                                                               |
|-----------------|---------------|---------------------------------------------------------------------|
| `id`            | number        | Khóa chính – dùng để gọi API cập nhật trạng thái                  |
| `maThietKe`     | string        | Mã thiết kế dạng "TK-XXXX" – hiển thị ở cột đầu bảng             |
| `urlPreview`    | string\|null  | URL ảnh preview trên Cloudinary (null nếu chưa render)             |
| `mauAo`         | string        | Mã màu HEX áo, ví dụ "#000000" – dùng để hiển thị chấm màu       |
| `tenKhachHang`  | string        | Tên đầy đủ của khách đặt thiết kế                                  |
| `soDienThoai`   | string\|null  | Số điện thoại khách (tùy chọn)                                     |
| `tenSanPham`    | string        | Tên loại áo, ví dụ "Áo thun Basic"                                 |
| `tenMauAo`      | string        | Tên màu tiếng Việt, ví dụ "Đen" – hiển thị bên cạnh chấm màu    |
| `viTriIn`       | string        | Tên vị trí in tiếng Việt, ví dụ "Ngực trái"                       |
| `trangThai`     | string (ENUM) | Trạng thái (xem bảng 18.3)                                         |
| `ngayGui`       | string        | Ngày khách gửi thiết kế, format `DD/MM/YYYY`                       |

---

#### 18.5.2. Duyệt thiết kế

```
PATCH /api/admin/designs/:id/duyet
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "trangThai": "da_duyet"
}
```

**Response (HTTP 200):**
```json
{
  "success": true,
  "message": "Đã duyệt thiết kế thành công",
  "data": {
    "id": 1,
    "maThietKe": "TK-2024",
    "trangThai": "da_duyet"
  }
}
```

> **Lưu ý quan trọng:** Khi thiết kế được duyệt (`da_duyet`), hệ thống nên tự động tạo một bản ghi trong bảng `don_can_in` với `trang_thai = 'cho_gui_xuong'` để hiển thị ở Tab 2.

---

#### 18.5.3. Yêu cầu khách chỉnh sửa

```
PATCH /api/admin/designs/:id/yeu-cau-chinh-sua
```

**Request Body:**
```json
{
  "trangThai": "can_chinh_sua",
  "ghiChu": "Logo bị mờ, vui lòng upload lại file có độ phân giải cao hơn"
}
```

**Response (HTTP 200):**
```json
{
  "success": true,
  "message": "Đã gửi yêu cầu chỉnh sửa đến khách hàng",
  "data": {
    "id": 1,
    "trangThai": "can_chinh_sua"
  }
}
```

> **Ghi chú:** Khi chuyển sang `can_chinh_sua`, hệ thống nên gửi thông báo (email hoặc notification) cho khách hàng biết cần vào sửa lại thiết kế. Backend có thể dùng event/queue để xử lý.

---

### 18.6. API – Tab "Đơn cần in"

#### 18.6.1. Lấy danh sách đơn cần in

```
GET /api/admin/designs/don-can-in
```

**Query Parameters (tùy chọn):**

| Tham số       | Kiểu   | Mô tả                                                          |
|---------------|--------|----------------------------------------------------------------|
| `page`        | number | Trang hiện tại (mặc định: 1)                                   |
| `limit`       | number | Số bản ghi mỗi trang (mặc định: 10)                            |
| `trang_thai`  | string | Lọc: `cho_gui_xuong`, `dang_in`, `da_in_xong`                 |

**Response mong đợi (HTTP 200):**

```json
{
  "success": true,
  "data": {
    "danhSach": [
      {
        "id": 1,
        "maDon": "DH-1045",
        "maThietKe": "TK-2023",
        "urlPreview": "https://res.cloudinary.com/teestudio/...",
        "mauAo": "#ffffff",
        "tenKhachHang": "Trần Thị B",
        "soLuong": 50,
        "viTriIn": "Sau lưng to",
        "trangThai": "cho_gui_xuong",
        "ngayTao": "01/06/2026"
      }
    ],
    "tongSo": 14,
    "trang": 1,
    "soTrangMoiTrang": 10,
    "tongSoTrang": 2
  }
}
```

**Các trạng thái đơn in:**

| Giá trị (ENUM)    | Hiển thị FE      | Màu nền    | Màu chữ    |
|-------------------|------------------|------------|------------|
| `cho_gui_xuong`   | Chờ gửi xưởng   | `#e0f2fe`  | `#0ea5e9`  |
| `dang_in`         | Đang in          | `#dcfce7`  | `#10b981`  |
| `da_in_xong`      | Đã in xong       | `#e4e9ed`  | `#6e7881`  |

---

#### 18.6.2. Gửi đơn đến xưởng in

```
PATCH /api/admin/designs/don-can-in/:id/gui-xuong
```

**Request Body:**
```json
{
  "trangThai": "dang_in"
}
```

**Response (HTTP 200):**
```json
{
  "success": true,
  "message": "Đã gửi đơn đến xưởng in thành công",
  "data": {
    "id": 1,
    "maDon": "DH-1045",
    "trangThai": "dang_in",
    "ngayGuiXuong": "03/06/2026"
  }
}
```

---

### 18.7. API – Tab "Tài nguyên thiết kế"

#### 18.7.1. Lấy danh sách sticker

```
GET /api/admin/designs/stickers
```

**Response (HTTP 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ten": "Logo TeeStudio",
      "urlAnh": "https://res.cloudinary.com/teestudio/stickers/logo.png",
      "loai": "logo"
    },
    {
      "id": 2,
      "ten": "Ngôi sao",
      "urlAnh": "https://res.cloudinary.com/teestudio/stickers/star.png",
      "loai": "hinh_ve"
    }
  ]
}
```

**Các loại sticker (trường `loai`):**

| Giá trị      | Mô tả                      |
|--------------|----------------------------|
| `logo`       | Logo thương hiệu            |
| `hinh_ve`    | Hình vẽ minh họa            |
| `chu_viet`   | Chữ viết / typography       |

#### 18.7.2. Thêm sticker mới

```
POST /api/admin/designs/stickers
```

**Request:** Dạng `multipart/form-data` (upload file ảnh)

| Trường   | Kiểu   | Mô tả                          |
|----------|--------|--------------------------------|
| `file`   | File   | File ảnh sticker (PNG, SVG)    |
| `ten`    | string | Tên hiển thị của sticker       |
| `loai`   | string | Loại: `logo`/`hinh_ve`/`chu_viet` |

> **Lưu ý:** Backend upload file lên Cloudinary, lưu URL vào DB, trả về object sticker đã tạo.

**Response (HTTP 201):**
```json
{
  "success": true,
  "message": "Thêm sticker thành công",
  "data": { "id": 7, "ten": "Hoa mai", "urlAnh": "https://...", "loai": "hinh_ve" }
}
```

#### 18.7.3. Xóa sticker

```
DELETE /api/admin/designs/stickers/:id
```

> **Lưu ý:** Xóa file trên Cloudinary trước, sau đó xóa bản ghi trong DB.

---

#### 18.7.4. Lấy danh sách vị trí in

```
GET /api/admin/designs/vi-tri-in
```

**Response (HTTP 200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ten": "Ngực trái",
      "moTa": "Tối đa 10x10 cm",
      "dangHoatDong": true
    },
    {
      "id": 2,
      "ten": "Sau lưng to",
      "moTa": "Tối đa 30x40 cm",
      "dangHoatDong": true
    }
  ]
}
```

#### 18.7.5. Thêm vị trí in mới

```
POST /api/admin/designs/vi-tri-in
```

**Request Body:**
```json
{
  "ten": "Cổ sau",
  "moTa": "Tối đa 5x5 cm",
  "dangHoatDong": true
}
```

#### 18.7.6. Bật/tắt vị trí in

```
PATCH /api/admin/designs/vi-tri-in/:id
```

**Request Body:** `{ "dangHoatDong": false }`

> **Lưu ý quan trọng:** Khi một vị trí in bị tắt (`dangHoatDong: false`), khách hàng trên giao diện Design Studio **sẽ không thể** chọn vị trí đó. Backend cần đồng bộ dữ liệu này với API công khai phục vụ Design Studio.

#### 18.7.7. Xóa vị trí in

```
DELETE /api/admin/designs/vi-tri-in/:id
```

> **Cảnh báo:** Chỉ xóa khi không có thiết kế nào đang dùng vị trí này. Nên kiểm tra ràng buộc khóa ngoại trước khi xóa và trả lỗi 409 nếu đang có thiết kế liên quan.

---

### 18.8. API – Xuất thông số in

```
POST /api/admin/designs/xuat-thong-so-in
```

**Mô tả:** Sinh file PDF/Excel chứa thông số kỹ thuật để gửi cho xưởng in. Thông số bao gồm: kích thước vùng in (cm), vị trí in, màu in, số lượng mỗi size.

**Request Body:**
```json
{
  "danhSachDonId": [1, 2, 3]
}
```

**Response (HTTP 200):**
```json
{
  "success": true,
  "urlFile": "https://res.cloudinary.com/teestudio/exports/thong-so-in-2026-06-03.pdf",
  "message": "Xuất thông số in thành công"
}
```

> **Quy trình tính thông số:** Frontend lưu tọa độ (x, y) và kích thước (width, height) theo đơn vị pixel canvas. Backend cần chuyển đổi sang đơn vị thực (cm) dựa trên tỉ lệ DPI đã cấu hình (thường là 96dpi).

---

### 18.9. Bảng Database liên quan

```sql
-- Bảng thiết kế của khách hàng
CREATE TABLE designs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  ma_thiet_ke     VARCHAR(20)   NOT NULL UNIQUE,      -- Dạng "TK-XXXX", tự sinh
  order_id        INT           NULL,                  -- Liên kết với bảng orders
  user_id         INT           NOT NULL,              -- Liên kết với bảng users (khách hàng)
  san_pham_id     INT           NOT NULL,              -- Liên kết với bảng products
  mau_ao          VARCHAR(7)    NOT NULL,              -- Mã HEX màu áo, ví dụ "#000000"
  ten_mau_ao      VARCHAR(50)   NOT NULL,              -- Tên màu tiếng Việt
  vi_tri_in_id    INT           NOT NULL,              -- Liên kết bảng vi_tri_in
  du_lieu_thiet_ke JSON         NOT NULL,              -- Tọa độ, kích thước từ Konva.js
  url_preview     VARCHAR(500)  NULL,                  -- URL ảnh preview trên Cloudinary
  trang_thai      ENUM('cho_kiem_tra', 'can_chinh_sua', 'da_duyet') NOT NULL DEFAULT 'cho_kiem_tra',
  ghi_chu_admin   TEXT          NULL,                  -- Ghi chú khi yêu cầu chỉnh sửa
  ngay_gui        DATETIME      DEFAULT NOW(),
  created_at      DATETIME      DEFAULT NOW(),
  updated_at      DATETIME      DEFAULT NOW() ON UPDATE NOW()
);

-- Bảng đơn cần in (tự động tạo khi thiết kế được duyệt)
CREATE TABLE don_can_in (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  design_id       INT           NOT NULL,              -- Liên kết với bảng designs
  order_id        INT           NOT NULL,              -- Liên kết với bảng orders
  so_luong        INT           NOT NULL DEFAULT 1,    -- Số lượng áo cần in
  trang_thai      ENUM('cho_gui_xuong', 'dang_in', 'da_in_xong') NOT NULL DEFAULT 'cho_gui_xuong',
  ngay_gui_xuong  DATETIME      NULL,                  -- Ngày admin gửi xưởng
  created_at      DATETIME      DEFAULT NOW(),
  updated_at      DATETIME      DEFAULT NOW() ON UPDATE NOW()
);

-- Bảng sticker có sẵn để khách dùng trong Design Studio
CREATE TABLE stickers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  ten             VARCHAR(100)  NOT NULL,
  url_anh         VARCHAR(500)  NOT NULL,              -- URL trên Cloudinary
  loai            ENUM('logo', 'hinh_ve', 'chu_viet') NOT NULL DEFAULT 'hinh_ve',
  created_at      DATETIME      DEFAULT NOW()
);

-- Bảng vị trí in (cấu hình vùng in trên áo)
CREATE TABLE vi_tri_in (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  ten             VARCHAR(100)  NOT NULL,              -- Ví dụ: "Ngực trái"
  mo_ta           VARCHAR(200)  NULL,                  -- Ví dụ: "Tối đa 10x10 cm"
  dang_hoat_dong  TINYINT(1)    NOT NULL DEFAULT 1,    -- 1 = bật, 0 = tắt
  created_at      DATETIME      DEFAULT NOW(),
  updated_at      DATETIME      DEFAULT NOW() ON UPDATE NOW()
);
```

**Giải thích cột quan trọng:**

| Bảng         | Cột                | Mô tả chi tiết                                                       |
|--------------|--------------------|----------------------------------------------------------------------|
| `designs`    | `du_lieu_thiet_ke` | JSON từ Konva.js: `{"objects": [...], "canvasWidth": 400, ...}`     |
| `designs`    | `url_preview`      | Null ban đầu; được điền sau khi render canvas thành ảnh             |
| `designs`    | `ghi_chu_admin`    | Admin nhập khi chuyển sang `can_chinh_sua`, gửi email cho khách     |
| `don_can_in` | `design_id`        | JOIN với `designs` để lấy thông tin chi tiết thiết kế               |

---

### 18.10. Luồng nghiệp vụ quan trọng

```
Khách tạo thiết kế → Lưu designs (trang_thai='cho_kiem_tra')
       ↓
Admin xem bảng "Thiết kế khách hàng"
       ↓
[Option A] Admin duyệt → designs.trang_thai = 'da_duyet'
           → Tự động tạo don_can_in (trang_thai='cho_gui_xuong')
       ↓
Admin xem Tab "Đơn cần in" → Nhấn "Gửi xưởng"
           → don_can_in.trang_thai = 'dang_in'
           → Xưởng in nhận thông số và tiến hành in

[Option B] Admin yêu cầu chỉnh sửa → designs.trang_thai = 'can_chinh_sua'
           → Gửi thông báo cho khách
           → Khách vào Design Studio sửa lại → trang_thai quay về 'cho_kiem_tra'
```

---

### 18.11. Lưu ý quan trọng cho Backend

1. **Mã thiết kế (`ma_thiet_ke`)** phải tự sinh theo pattern `TK-{timestamp_4_chu_so}` hoặc tự tăng. Frontend hiển thị nguyên văn giá trị này.

2. **URL Preview:** Khi thiết kế được gửi từ Design Studio, nên render canvas thành ảnh PNG (dùng `canvas.toDataURL()`) và upload lên Cloudinary ngay lập tức. URL được lưu vào `url_preview`. Nếu null, component `DesignPreview` sẽ tự vẽ mockup màu sắc thay thế.

3. **Dữ liệu JSON thiết kế (`du_lieu_thiet_ke`):** Đây là dữ liệu từ Konva.js, cần lưu nguyên vẹn và trả lại nguyên vẹn cho frontend. Backend **không được** parse hay biến đổi nội dung này.

4. **Vị trí in công khai:** API `GET /api/admin/designs/vi-tri-in` cũng cần được expose ra endpoint công khai `GET /api/vi-tri-in` cho giao diện Design Studio của khách hàng (chỉ trả vị trí có `dang_hoat_dong = 1`).

5. **Sticker công khai:** Tương tự, `GET /api/admin/designs/stickers` cũng cần endpoint công khai `GET /api/stickers` cho Design Studio.

6. **Phân quyền:** Tất cả API `/api/admin/designs/*` yêu cầu JWT token. Chỉ các vai trò `admin` và `san_xuat` mới được duyệt và gửi xưởng. Vai trò `kho` không có quyền truy cập module này.

7. **Xuất thông số in:** Khi admin nhấn "Xuất thông số in", backend cần đọc `du_lieu_thiet_ke` từ DB, tính toán kích thước thật (pixel → cm theo DPI), và sinh file PDF. Đây là tính năng phức tạp, có thể dùng thư viện `pdfkit` hoặc `puppeteer` để render HTML → PDF.
