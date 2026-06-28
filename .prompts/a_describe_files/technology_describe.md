
Tên dự án: Xây dựng web thương mại điện tử bán áo tự thiết kế và tùy chỉnh thiết kế trực tuyến.

(Custom Print-on-Demand): Ứng dụng ReactJS, Node.js và Kiến trúc Triển khai CI/CD.
Dưới đây là bản Đặc tả Công nghệ & Tiêu chuẩn Đồng bộ (Tech Stack & Synchronization Protocol) chi tiết nhất. Các bạn hãy dùng bản này làm tài liệu chuẩn mực (Guideline) cho suốt quá trình phát triển.
1. Frontend: Kiến trúc Mặt tiền & Design Studio
•	Next.js (dựa trên ReactJS): Đóng vai trò là framework cốt lõi để xây dựng giao diện người dùng. Next.js cung cấp khả năng điều hướng (Routing) linh hoạt và hỗ trợ tối ưu hóa quá trình kết xuất (Rendering) để tăng cường trải nghiệm người dùng.
•	Thư viện UI & Styling: Tailwind CSS và Ant Design. Bắt buộc thống nhất dùng để tránh việc mỗi người viết một kiểu CSS thuần gây xung đột giao diện. Có thể kết hợp thêm thư viện component là Ant Design để tiết kiệm thời gian làm form, bảng biểu.
•	Design Studio (Linh hồn dự án): Sử dụng Konva.js (khuyên dùng react-konva). Thư viện này hỗ trợ vẽ Canvas, kéo thả logo, thay đổi màu áo và xuất tọa độ ra định dạng JSON cực kỳ mạnh mẽ.
•	Quản lý State phức tạp: Sử dụng Zustand. Zustand đặc biệt phù hợp để quản lý các trạng thái thay đổi liên tục trên Canvas (như tọa độ X, Y của logo, màu sắc đang chọn) mà không làm chậm ứng dụng.
•	Giao tiếp API: Axios kết hợp với React Query (@tanstack/react-query) để tự động quản lý bộ nhớ đệm (cache) phía client và xử lý trạng thái loading/error gọn gàng.
2. Backend: Trái tim Xử lý Logic & Báo giá động
•	Core Framework: Node.js chạy trên nền Express.js: Môi trường thực thi và framework mã nguồn mở được sử dụng để xây dựng các dịch vụ RESTful API. Phân hệ này chịu trách nhiệm kiểm soát luồng nghiệp vụ kinh doanh, bao gồm thuật toán tính toán báo giá động (Dynamic Pricing) và điều phối luồng dữ liệu giữa Client và Database.
•	Giao tiếp Cơ sở dữ liệu (ORM): thống nhất sử dụng mysql2. 
•	Bảo mật & Phân quyền:
o	Xác thực: Sử dụng JSON Web Token (JWT) để cấp quyền truy cập.
o	Mã hóa: Dùng Bcrypt.js để băm (hash) mật khẩu người dùng trước khi lưu vào database.
•	Caching & Tối ưu: Redis. Ứng dụng Redis để lưu trữ tạm thời phiên đăng nhập, giỏ hàng của khách chưa thanh toán, hoặc cache lại danh sách sản phẩm mẫu để giảm tải cho MySQL.
3. Lưu trữ, Database & Dịch vụ Bên thứ 3 (Third-party)
•	Database chính: MySQL 8.0. Phiên bản này hỗ trợ kiểu dữ liệu JSON nguyên bản, rất hoàn hảo để lưu trữ chuỗi thiết kế từ Canvas gửi xuống (ví dụ: {"color": "#FF0000", "logo_position": {"x": 100, "y": 200}}).
•	Lưu trữ Media: Cloudinary. Tích hợp API của Cloudinary vào Node.js. Khi khách hàng upload logo công ty họ lên để in áo, file ảnh đẩy thẳng lên Cloudinary, Node.js chỉ lưu trữ đường dẫn (URL) vào MySQL.
•	Cổng Thanh toán: Tích hợp API VNPAY Sandbox và MoMo Sandbox. Hệ thống xử lý dùng chung dữ liệu giao dịch, đồng thời hỗ trợ tạo mã thanh toán, xác minh redirect, tiếp nhận IPN (Instant Payment Notification) và đối soát riêng theo chuẩn bảo mật của từng cổng.
4. DevOps & Tự động hóa Triển khai (CI/CD)
•	Đóng gói Môi trường: Docker & Docker Compose. Bắt buộc viết chung một file docker-compose.yml chứa 4 services: frontend_react, backend_node, mysql_db, và redis_cache. Nhờ vậy, hai bạn chỉ cần gõ lệnh docker-compose up là có môi trường làm việc giống hệt nhau.
•	CI/CD Pipeline: GitHub Actions. Viết các workflows để khi code được push lên nhánh main, hệ thống tự động: Cài đặt thư viện -> Build code -> Push Docker Image -> Deploy tự động lên VPS.
•	Hosting/Máy chủ: Thuê một con VPS Linux (Ubuntu) giá rẻ và gắn một tên miền (Domain) thực tế để hệ thống chạy live.


