# Hướng dẫn Backend – Module 16: Cài đặt Quản trị

> **Tài liệu này bổ sung vào `Huongdan_BE.md` cho Module Cài đặt (`/admin/cai-dat`).**  
> **Chỉ Admin (vai trò `admin`) mới có quyền truy cập tất cả API trong module này.**

---

## 16.1. Tổng quan màn hình

Trang Cài đặt gồm các khu vực chính:

1. **Tiêu đề trang** – Nút "Lưu thay đổi" và "Khôi phục mặc định"
2. **4 thẻ KPI** – Thống kê tổng quan cấu hình hiện tại
3. **Layout 2 cột:**
   - Cột trái (3/12): Menu điều hướng cài đặt (5 tab + nút Đăng xuất)
   - Cột phải (9/12): Nội dung tab đang chọn

---

## 16.2. Cấu trúc file Frontend đã tạo

```
frontend/src/
├── app/admin/cai-dat/
│   └── page.tsx                   ← Server Component, khai báo metadata SEO
└── components/admin/settings/
    ├── SettingsClient.tsx          ← Client wrapper ("use client")
    ├── SettingsPage.tsx            ← Orchestrator chính (lắp ghép toàn bộ layout)
    ├── SettingStatCard.tsx         ← Thẻ thống kê KPI (4 thẻ đầu trang)
    ├── SettingNavMenu.tsx          ← Menu điều hướng bên trái (5 tab)
    ├── SettingStaffTable.tsx       ← Bảng danh sách nhân viên + phân trang
    ├── SettingRoleBadge.tsx        ← Badge màu theo vai trò (Admin/Kho/Sản xuất/Kế toán)
    └── SettingStatusBadge.tsx      ← Badge trạng thái (Hoạt động/Vô hiệu)
```

---

## 16.3. Các Tab trong Menu Cài đặt

| Key (Frontend)            | Nhãn hiển thị               | Trạng thái FE      |
|---------------------------|-----------------------------|--------------------|
| `tai_khoan`               | Tài khoản & Phân quyền     | ✅ Hoàn thành      |
| `thong_tin_cua_hang`      | Thông tin cửa hàng          | 🔄 Placeholder     |
| `trang_thai_quy_trinh`    | Trạng thái quy trình        | 🔄 Placeholder     |
| `phuong_thuc_thanh_toan`  | Phương thức thanh toán      | 🔄 Placeholder     |
| `bao_mat`                 | Bảo mật & Phiên đăng nhập  | 🔄 Placeholder     |

---

## 16.4. API – Tab "Tài khoản & Phân quyền" (Bảng nhân viên)

### 16.4.1. Lấy danh sách nhân viên

```
GET /api/admin/staff
Authorization: Bearer <jwt_token>
```

**Query Parameters (tùy chọn):**

| Tham số      | Kiểu   | Mô tả                                          |
|--------------|--------|------------------------------------------------|
| `page`       | number | Trang hiện tại (mặc định: 1)                   |
| `limit`      | number | Số bản ghi mỗi trang (mặc định: 10)            |
| `search`     | string | Tìm theo tên hoặc email                        |
| `vai_tro`    | string | Lọc: `admin`, `kho`, `san_xuat`, `ke_toan`    |
| `trang_thai` | string | Lọc: `hoat_dong`, `vo_hieu`                   |

**Response (HTTP 200):**

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

| Giá trị    | Hiển thị  | Màu badge FE              |
|------------|-----------|---------------------------|
| `admin`    | Admin     | Xanh sky blue (primary)   |
| `kho`      | Kho       | Xanh secondary nhạt       |
| `san_xuat` | Sản xuất  | Xanh tertiary nhạt        |
| `ke_toan`  | Kế toán   | Xám trung tính            |

**Giá trị hợp lệ của `trangThai`:**

| Giá trị      | Hiển thị  | Màu badge FE        |
|--------------|-----------|---------------------|
| `hoat_dong`  | Hoạt động | Xanh lá (success)  |
| `vo_hieu`    | Vô hiệu   | Xám (neutral)       |

---

### 16.4.2. Thêm nhân viên mới

```
POST /api/admin/staff
Authorization: Bearer <jwt_token>
Content-Type: application/json
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

### 16.4.3. Cập nhật thông tin nhân viên

```
PUT /api/admin/staff/:id
Authorization: Bearer <jwt_token>
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
    "vaiTro": "san_xuat",
    "trangThai": "vo_hieu"
  }
}
```

---

### 16.4.4. Xóa nhân viên

```
DELETE /api/admin/staff/:id
Authorization: Bearer <jwt_token>
```

> **Khuyến nghị:** Dùng `trangThai: "vo_hieu"` thay vì xóa hẳn để bảo toàn lịch sử log.

**Response (HTTP 200):**

```json
{
  "success": true,
  "message": "Đã xóa nhân viên"
}
```

---

## 16.5. API – Thẻ Thống kê KPI (đầu trang)

```
GET /api/admin/settings/stats
Authorization: Bearer <jwt_token>
```

**Response (HTTP 200):**

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

## 16.6. Bảng Database liên quan

```sql
-- Bảng quản lý tài khoản nhân viên nội bộ
CREATE TABLE admin_users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  ho_ten      VARCHAR(100)  NOT NULL,
  -- Ho va ten day du hien thi trong bang va tao chu viet tat avatar
  email       VARCHAR(150)  NOT NULL UNIQUE,
  -- Email dang nhap noi bo
  mat_khau    VARCHAR(255)  NOT NULL,
  -- Mat khau da hash bang bcrypt (KHONG bao gio tra ve Frontend)
  vai_tro     ENUM('admin', 'kho', 'san_xuat', 'ke_toan') NOT NULL DEFAULT 'kho',
  -- Quyet dinh mau badge SettingRoleBadge
  trang_thai  ENUM('hoat_dong', 'vo_hieu') NOT NULL DEFAULT 'hoat_dong',
  -- Quyet dinh mau badge SettingStatusBadge
  created_at  DATETIME DEFAULT NOW(),
  updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW()
);
```

**Giải thích các cột:**

| Cột          | Mô tả                                              |
|--------------|----------------------------------------------------|
| `id`         | Khóa chính – Frontend dùng để gọi API sửa/xóa    |
| `ho_ten`     | Hiển thị cột "Họ tên" + tạo chữ viết tắt avatar  |
| `email`      | Hiển thị cột "Email"                              |
| `mat_khau`   | **Không bao giờ gửi về Frontend**                 |
| `vai_tro`    | Quy định màu badge SettingRoleBadge               |
| `trang_thai` | Quy định màu badge SettingStatusBadge             |
| `created_at` | Hiển thị cột "Ngày tạo" (định dạng DD/MM/YYYY)   |

---

## 16.7. Xác thực & Phân quyền

- **Tất cả API `/api/admin/staff/*`** yêu cầu JWT token hợp lệ.
- **Chỉ tài khoản `vai_tro = 'admin'`** mới được thêm/sửa/xóa nhân viên.
- Middleware cần kiểm tra `req.user.vai_tro === 'admin'` trước khi cho phép thao tác CRUD.

---

## 16.8. Lưu ý quan trọng cho Backend

1. **Không bao giờ trả về `mat_khau`** trong response dù dưới bất kỳ dạng nào.
2. **Mật khẩu** khi tạo mới phải được hash bằng `bcrypt` trước khi lưu vào DB.
3. **`ngayTao`** nên format sẵn `DD/MM/YYYY` từ Backend, hoặc trả về ISO date để Frontend tự format.
4. **Chữ viết tắt avatar** (ví dụ "NT" từ "Nguyễn Tuấn") được tạo hoàn toàn ở Frontend – Backend không cần xử lý.
5. **Màu avatar** cũng do Frontend tự quyết định theo `vaiTro` – Backend chỉ cần trả đúng giá trị ENUM.
6. **Hiện tại 4 tab** (Thông tin cửa hàng, Trạng thái quy trình, Phương thức thanh toán, Bảo mật) đang ở trạng thái placeholder. Backend sẽ được hướng dẫn thêm khi Frontend hoàn thành từng tab.

---

*Cập nhật lần cuối: 02/06/2026 – Frontend module Cài đặt hoàn thành tab Tài khoản & Phân quyền.*
