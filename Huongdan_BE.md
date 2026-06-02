
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

