# Lịch sử và Trạng thái Phát triển Giao diện Trang chủ (TeeStudio)

*Tài liệu này được tạo ra nhằm mục đích cung cấp ngữ cảnh (context) cho các AI hoặc Agent sau này tham gia vào dự án, giúp nắm bắt nhanh chóng những gì đã được thực hiện, quyết định thiết kế, và stack công nghệ hiện tại.*

## 1. Thông tin Chung
- **Dự án**: TeeStudio – Nền tảng thương mại điện tử kết hợp in ấn theo yêu cầu (Print-on-Demand) và đặt sỉ đồng phục (B2B/B2C).
- **Frontend Stack**: Next.js (App Router), React, Tailwind CSS, Ant Design (với `@ant-design/nextjs-registry` cho SSR).
- **Ngôn ngữ**: TypeScript/TSX, CSS.

## 2. Quá trình Phát triển Trang chủ

### Giai đoạn 1: Thiết kế "Dark Lab" (Bản nháp ban đầu)
- **Concept**: Tập trung vào việc giải thích chi tiết các tính năng của hệ thống (4 phân hệ chức năng) và phân tách rõ ràng quy trình B2B/B2C.
- **UI/UX**: Sử dụng tone màu tối (Dark mode) với gradient xanh dương/tím, hiệu ứng glow, glassmorphism.
- **Thành phần chính**: HeroBanner (chữ lớn), FeaturesSection (thẻ thông tin dài), WorkflowSection (chia tab B2B/B2C), ProductShowcase (có chứa review sao).
- **Kết quả**: Đã hoàn thiện nhưng bị đánh giá là hơi rườm rà, chứa nhiều text giải thích không cần thiết cho một trang web cần hướng trực tiếp đến sản phẩm.

### Giai đoạn 2: Tái thiết kế "Light Minimalist - Direct to Product" (Bản hiện tại)
- **Yêu cầu thay đổi**: Chuyển sang phong cách clean, tối giản, sáng sủa (Light mode). Tập trung vào trải nghiệm người dùng (UX) của các trang POD: Khách hàng muốn xem sản phẩm hoặc mẫu thiết kế ngay lập tức. Bỏ các thông tin review giả, giảm bớt icon lẻ tẻ, thay bằng Vector đồng bộ.
- **Hành động đã thực hiện**:
  1. **Thay đổi Design System (`globals.css` & `layout.tsx`)**: Đổi toàn bộ CSS variables sang Light theme (nền trắng `#ffffff`, xám nhạt `#f1f5f9`, accent `#0ea5e9`). ConfigProvider của Ant Design cũng được cập nhật.
  2. **AppHeader**: Làm lại thanh điều hướng nền trắng, thêm thanh tìm kiếm, giữ lại các chức năng Đăng nhập/Đăng ký/Giỏ hàng.
  3. **ProductCategories (Thay thế HeroBanner)**: Xoá bỏ banner text dài, thay bằng 3 Thẻ (Cards) cực lớn chứa Vector SVG (Áo Thun, Áo Polo, Áo Hoodie) để khách hàng click và "Thiết kế ngay".
  4. **SimpleWorkflow**: Rút gọn quy trình từ phức tạp xuống chỉ còn 3 bước cơ bản (Chọn sản phẩm -> Thiết kế -> Nhận hàng) nằm ngang bằng SVG lớn. Xoá bỏ các tab B2C/B2B trên trang chủ.
  5. **TemplateShowcase (Trước đây là ProductShowcase)**: Đổi thành hiển thị các "Mẫu thiết kế" với preview SVG. Bỏ hoàn toàn các sao đánh giá (ratings/reviews), chỉ để lại thông tin giá và nút bấm thiết kế.
  6. **AppFooter**: Đổi sang nền sáng, phân chia 4 cột thông tin gọn gàng với các SVG icon mạng xã hội.

## 3. Cấu trúc Component Trang chủ Hiện tại (Light Theme)
Tất cả component nằm trong `frontend/src/components/`:

- `layout/AppHeader.tsx`: Navbar sáng, có search bar.
- `home/ProductCategories.tsx`: Dải 3 phôi áo Vector (Thun, Polo, Hoodie) ngay dưới Header.
- `home/SimpleWorkflow.tsx`: 3 bước quy trình ngang với Vector to.
- `home/ProductShowcase.tsx`: Đã được sửa thành lưới (grid) hiển thị mẫu áo thiết kế sẵn (TemplateShowcase).
- `layout/AppFooter.tsx`: Chân trang 4 cột, nền sáng.

*Ghi chú: Các file cũ (`HeroBanner.tsx`, `FeaturesSection.tsx`, `WorkflowSection.tsx`) đã bị xoá khỏi dự án.*

## 4. Định hướng Tiếp theo (Next Steps)
- Dữ liệu hiện tại trong các components đang là **dữ liệu cứng (hardcode)**. Bước tiếp theo cần tích hợp API từ Backend để render danh mục, sản phẩm, và mẫu thiết kế động.
- Phát triển trang "Công cụ thiết kế" (Canvas) kết nối từ nút "Thiết kế ngay" của trang chủ.
- Xây dựng một Landing page riêng (`/wholesale`) cho mảng B2B/Đặt sỉ vì thông tin này đã được ẩn khỏi trang chủ để giữ sự tối giản.
