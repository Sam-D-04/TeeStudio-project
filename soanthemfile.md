# Hướng Dẫn Nhanh - Tạo Trang Đơn Hàng Có Khuyến Mãi (Dành cho Sinh Viên)

Vì bạn làm luận văn dựa trên nền tảng cơ bản (PHP, C++) và đang dùng AI hỗ trợ cho React/Node.js, cách an toàn và ghi điểm cao nhất trong phòng thi là **tận dụng (copy) code có sẵn** và sửa lại. Điều này giúp bạn chứng minh với giám khảo rằng bạn hiểu rõ kiến trúc thư mục, hiểu luồng đi của dữ liệu (từ Database lên Backend, rồi ra Frontend).

Dưới đây là hướng dẫn từng bước chi tiết (cần tạo file nào, copy từ đâu):

---

## BƯỚC 1: XỬ LÝ BACKEND (Lọc dữ liệu từ Database)
Mục tiêu: Viết một đường link API mới chỉ lấy những đơn hàng có chứa mã khuyến mãi.

**1. Mở file `backend/src/modules/orders/admin.order.service.js`**
- **Copy code:** Tìm hàm tên là `layDanhSachDonHang` (kéo bôi đen từ đầu đến cuối hàm đó), copy và dán ngay bên dưới nó.
- **Sửa code:** Đổi tên hàm mới dán thành `layDanhSachDonHangKhuyenMai`. 
- Tìm đến chỗ khai báo mảng `const dieuKien = [];` trong hàm vừa dán, hãy gõ thêm dòng SQL này vào ngay bên dưới nó:
  ```javascript
  dieuKien.push("co.promotionId IS NOT NULL"); 
  ```
  *(Giải thích cho giám khảo: Lệnh này giống hệt viết SQL thuần, nó lọc những đơn hàng có cột promotionId khác rỗng - tức là có dùng khuyến mãi).*
- Cuối file, thêm `layDanhSachDonHangKhuyenMai` vào khối `module.exports = { ... }`.

**2. Mở file `backend/src/modules/orders/admin.order.controller.js`**
- **Copy code:** Tương tự, copy hàm `getDanhSachDonHang` dán xuống dưới, đổi tên thành `getDanhSachDonHangKhuyenMai`.
- **Sửa code:** Ở dòng `await orderService.layDanhSachDonHang(req.query)`, đổi thành `await orderService.layDanhSachDonHangKhuyenMai(req.query)`.
- Cuối file, thêm `getDanhSachDonHangKhuyenMai` vào `module.exports`.

**3. Mở file `backend/src/modules/orders/admin.order.routes.js`**
- **Viết thêm code:** Tìm dòng `router.get("/", verifyToken, ... orderController.getDanhSachDonHang);`
- Thêm ngay dưới nó 1 dòng sau để tạo API mới:
  ```javascript
  router.get("/khuyen-mai", verifyToken, requireOrderAccess, orderController.getDanhSachDonHangKhuyenMai);
  ```

---

## BƯỚC 2: XỬ LÝ FRONTEND (Tạo trang giao diện mới)
Mục tiêu: Tạo một trang web mới gọi đến API vừa viết ở Bước 1.

**1. Khai báo hàm gọi API mới:**
- Mở file `frontend/src/services/admin/orderService.ts`
- Copy hàm `layDanhSachDonHang`, dán xuống dưới đổi tên thành `layDanhSachDonHangKhuyenMai`.
- Bên trong nó, sửa cái link `"/admin/orders"` thành `"/admin/orders/khuyen-mai"`.

**2. Tạo Component Bảng hiển thị mới:**
- Vào thư mục `frontend/src/components/admin/orders/`.
- Copy file `OrdersClient.tsx` thành một file mới đặt tên là `OrdersPromoClient.tsx`.
- Trong file `OrdersPromoClient.tsx` vừa copy: 
  - Đổi tên `export default function OrdersClient` thành `OrdersPromoClient`.
  - Sửa chỗ gọi hàm `layDanhSachDonHang` thành `layDanhSachDonHangKhuyenMai` (nhớ chỉnh lại ở dòng import trên cùng).

**3. Tạo Trang Giao Diện (URL của trang web):**
- Trong thư mục `frontend/src/app/admin/`, tạo một thư mục mới tên là `don-hang-khuyen-mai`.
- Mở thư mục trang cũ (`frontend/src/app/admin/don-hang/`), copy file `page.tsx` dán vào thư mục `don-hang-khuyen-mai` vừa tạo.
- Mở file `page.tsx` vừa dán để sửa:
  - Dòng `title: "Quản lý đơn hàng..."` sửa thành `title: "Đơn hàng có Khuyến mãi"`.
  - Dòng `import OrdersClient ...` sửa thành `import OrdersPromoClient from "@/components/admin/orders/OrdersPromoClient";`
  - Đổi thẻ `<OrdersClient />` ở cuối file thành `<OrdersPromoClient />`.
  - Đổi tên hàm `AdminOrdersPage` thành `KhuyenMaiOrdersPage`.

---

## 💡 MẸO GHI ĐIỂM (CÁCH TRẢ LỜI GIÁM KHẢO)

Nếu giám khảo hỏi: **"Em làm cách nào để thêm trang này?"**
> **Bạn tự tin trả lời (liên hệ với nền tảng cũ của bạn):** 
> *"Dạ thưa thầy, em làm theo luồng dữ liệu chuẩn (giống như mô hình MVC). 
> - Đầu tiên, ở tầng **Database/Backend**, em thêm một hàm xử lý mới trong Service, truyền thêm câu truy vấn SQL `WHERE promotionId IS NOT NULL` để lấy riêng đơn có khuyến mãi. 
> - Sau đó em mở một **Route API mới** (`/api/admin/orders/khuyen-mai`). 
> - Cuối cùng, ở **Frontend (React/Next.js)**, thay vì code lại từ đầu, em copy lại màn hình trang danh sách đơn hàng gốc, đổi tên trang thành `don-hang-khuyen-mai` và cho nó dùng `Axios` gọi sang Route API mới em vừa tạo. Như vậy vừa giữ được giao diện đồng bộ (code tái sử dụng), vừa đáp ứng được yêu cầu thêm tính năng một cách bảo mật ạ."*
