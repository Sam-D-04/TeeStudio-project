# 🎨 Customer Portal UI/UX Plan (TeeStudio)
**Role**: Senior Frontend Developer
**Objective**: Xây dựng khu vực "Tài khoản của tôi" hiện đại, nhất quán với style của TeeStudio, đem lại trải nghiệm mượt mà, chuyên nghiệp cho khách hàng (Quản lý hồ sơ, Địa chỉ, Lịch sử đơn hàng).

---

## 1. Kiến trúc Layout & Routing (Next.js App Router)
Hiện tại trang don-hang đang đứng độc lập. Cần tái cấu trúc lại thư mục /tai-khoan để sử dụng một **Master Layout** dùng chung (có Sidebar Navigation), giúp người dùng chuyển đổi mượt mà giữa các tab mà không cần tải lại toàn bộ trang.

**Cấu trúc thư mục đề xuất:**
\\\	ext
frontend/src/app/tai-khoan/
├── layout.tsx         # Bao gồm AppHeader, AppFooter và Sidebar Navigation (bên trái)
├── page.tsx           # Redirect mặc định sang /tai-khoan/ho-so
├── ho-so/             # Tab 1: Cập nhật thông tin cá nhân & Đổi mật khẩu
│   └── page.tsx
├── dia-chi/           # Tab 2: Sổ địa chỉ giao hàng
│   └── page.tsx
└── don-hang/          # Tab 3: Lịch sử đơn hàng (đã có, cần gỡ bỏ AppHeader/Footer bên trong)
    ├── page.tsx
    └── [id]/page.tsx
\\\

---

## 2. Thiết kế UI/UX chi tiết

### 2.1. Master Layout (/tai-khoan/layout.tsx)
* **Bố cục (Desktop)**: Grid 2 cột (Tỉ lệ 3:9 hoặc 1:3). 
  * Cột trái: Menu điều hướng dọc (Hồ sơ, Sổ địa chỉ, Đơn hàng, Đăng xuất). Các thẻ menu có viền bo tròn (ounded-xl), hover effect đổi màu nền nhẹ (hover:bg-sky-50), tab đang active có text màu sky-600 và nền sky-100.
  * Cột phải: Content động (children), bọc trong một container nền trắng, bóng đổ nhẹ (g-white shadow-sm rounded-2xl p-6).
* **Bố cục (Mobile)**: Cột trái biến thành Drawer (Vuốt từ mép) hoặc Navigation ngang dạng scrollable tabs đặt ngay dưới AppHeader.
* **Loading State**: Sử dụng React <Suspense> kết hợp Skeleton của Ant Design cho cảm giác mượt mà khi đổi tab.

### 2.2. Tab: Hồ sơ của tôi (/tai-khoan/ho-so)
**Triết lý UX**: Tối giản, tập trung vào form. Tránh dùng alert popup gây phiền, sử dụng inline message hoặc Toast (message của antd) cho phản hồi lưu thành công.
* **Header**: "Thông tin cá nhân" kèm dòng mô tả nhỏ.
* **Avatar Section**: Avatar vòng tròn lớn với chữ cái đầu của tên khách hàng (vì dự án chưa có tính năng upload avatar khách), nền gradient sang trọng (ví dụ: g-gradient-to-tr from-sky-500 to-indigo-500).
* **Form Grid**:
  * Form chia làm 2 cột trên Desktop (Họ tên, Số điện thoại ở 2 cột).
  * Email: Input bị disabled (g-slate-100 text-slate-500) kèm tooltip "Email dùng để đăng nhập không thể thay đổi".
  * Họ & Tên, Số điện thoại: Input hiện đại, outline-none, focus glow (ocus:ring-2 focus:ring-sky-100 focus:border-sky-500).
* **Section Đổi mật khẩu**:
  * Nằm bên dưới thông tin cá nhân, phân tách bằng vạch kẻ mờ (order-t border-slate-100).
  * Gồm: Mật khẩu cũ, Mật khẩu mới, Nhập lại mật khẩu mới. Bị ẩn sau một nút "Đổi mật khẩu" (Accordion/Collapse) để tiết kiệm không gian nếu người dùng không có nhu cầu.
* **Nút Action**: "Lưu thay đổi" nằm bên phải góc dưới, trạng thái đang lưu hiển thị spinner quay nhẹ bên trong nút, disable form trong lúc submit.

### 2.3. Tab: Sổ địa chỉ (/tai-khoan/dia-chi)
**Triết lý UX**: Visual management. Khách hàng dễ dàng nhìn thấy và quản lý nhiều địa chỉ.
* **Danh sách dạng Grid Cards**: Mỗi địa chỉ là một Card riêng (order border-slate-200 rounded-xl p-4).
* **Card Địa chỉ mặc định**: Card này có viền xanh (order-sky-500) kèm một badge/ribbon nhỏ "Mặc định" ở góc.
* **Action trong Card**:
  * Tên người nhận, SĐT (in đậm).
  * Phân cấp địa chỉ (Xã, Huyện, Tỉnh) hiển thị rõ ràng màu xám (	ext-slate-600).
  * Dưới cùng của Card có 2 nút dạng text/icon: "Sửa" và "Xoá".
* **Nút Thêm địa chỉ mới**: Một Card "rỗng" với viền nét đứt (order-dashed), có icon dấu + lớn ở giữa. Hover vào sẽ nổi lên (hover:-translate-y-1 hover:shadow-md transition-all).
* **Modal Thêm/Sửa**: 
  * Sử dụng Antd Modal bo góc.
  * *Tích hợp API tỉnh/thành VN* (Giao hàng tiết kiệm / Propinces API) qua 3 select box phụ thuộc nhau: Tỉnh -> Quận/Huyện -> Phường/Xã. 
  * Checkbox: "Đặt làm địa chỉ mặc định".

### 2.4. Tab: Đơn hàng của tôi (/tai-khoan/don-hang)
**Tái cấu trúc**: Trang hiện tại đã làm rất tốt. Chỉ cần:
* Dọn dẹp code, tháo AppHeader và AppFooter ra để trang tự động lọt thỏm vào cột phải của Master Layout.
* Đảm bảo bảng màu của CustomerOrderStatusBadge tone-sur-tone với bảng màu của layout mới.

---

## 3. Yêu cầu API (Backend Checklist)
Để UI này có thể hoạt động thực tế, Backend cần phải đáp ứng (hoặc thêm mới) các endpoint sau:

1. **Hồ sơ cá nhân**:
   * GET /api/users/me (Đã có: authService.getProfile)
   * PUT /api/users/me (Cập nhật họ tên, sđt)
   * PUT /api/users/me/password (Đổi mật khẩu: cần pass cũ + pass mới)
2. **Sổ địa chỉ** (Cần thiết kế bảng UserAddress nếu chưa có):
   * GET /api/users/me/addresses
   * POST /api/users/me/addresses
   * PUT /api/users/me/addresses/:id
   * DELETE /api/users/me/addresses/:id
   * PUT /api/users/me/addresses/:id/default (Set địa chỉ mặc định)

---

## 4. Kế hoạch triển khai (Các bước Code)
1. **Bước 1 (Backend)**: Thiết kế và viết API CRUD cho UserAddress, API Cập nhật profile & đổi mật khẩu.
2. **Bước 2 (Layout)**: Tạo layout.tsx mới, dựng giao diện Sidebar. Sửa trang don-hang để lọt vào layout này.
3. **Bước 3 (UI Profile)**: Dựng form Profile + Đổi mật khẩu, nối API.
4. **Bước 4 (UI Address)**: Dựng Grid hiển thị địa chỉ, Modal thêm mới (tích hợp API Tỉnh/Thành VN tĩnh), nối API.
