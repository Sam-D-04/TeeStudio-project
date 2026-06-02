
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
