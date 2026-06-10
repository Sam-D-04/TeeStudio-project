Nhóm tôi có 2 người, tôi phụ trách code cho phía admin (trang quản lý admin), bạn còn lại sẽ code phía khách hàng (trang mua hàng của khách). 
Hiện tại trang phía khách hàng chỉ mới có trang chủ nằm ở địa chỉ http://localhost:3000/ nên chỉ cần quan tâm là nếu vai trò khách hàng đăng nhập thì sẽ được phép vào trang này. 
(vì trang phía khách hàng bạn còn lại nhóm tôi sẽ chịu trách nhiệm code phần đó nên tôi không cần đụng chạm vào phía khách hàng)
Bên phía admin của tôi hiện tại nằm ở địa chỉ http://localhost:3000/admin và có menu dẫn đến các trang sau: Trang Tổng quan, Trang Đơn hàng, Trang Sản phẩm / Phôi áo, Trang Thiết kế & In ấn, Trang Kho hàng, Trang Thanh toán, Trang Khuyến mãi & Báo giá, Trang Cài đặt.

Dưới đây là định nghĩa lại các vai trò và quy tắc ẩn/hiện menu chi tiết dành riêng cho khu vực quản trị admin:
1. Xác định các Vai trò (Roles) và Tên gọi thực tế
Dựa trên tính chất của một doanh nghiệp thương mại điện tử, hệ thống sẽ giới hạn ở 3 vai trò nội bộ và 1 luồng ngoại lệ:
Khách hàng (CUSTOMER): Đây là luồng ngoại lệ đối với bạn. Nếu hệ thống phát hiện tài khoản có role này cố tình truy cập vào localhost:3000/admin, bạn chỉ cần viết một logic Redirect (chuyển hướng) đẩy thẳng họ về lại http://localhost:3000/ để bạn kia xử lý.
Quản trị viên (ADMIN): Người có quyền lực cao nhất (Chủ shop/Quản lý). Nắm toàn quyền kiểm soát doanh thu, nhân sự và cấu hình hệ thống.
Thủ kho (WAREHOUSE): Nhân viên phụ trách nhập/xuất phôi áo, quản lý số lượng tồn kho vật lý.
Nhân viên thiết kế & in ấn (PRODUCTION): Nhân viên thiết kế & in ấn (xử lý các file thiết kế và cập nhật trạng thái gia công của đơn hàng.)
2. Phân quyền
Dưới đây là chi tiết phân quyền hiển thị menu được mô tả lại bằng lời và trình bày theo từng dòng để bạn dễ dàng hình dung logic ẩn/hiện khi code giao diện:
1. Quyền của Quản trị viên (ADMIN)
Tài khoản mang vai trò ADMIN là cấp quản lý cao nhất, do đó được phép hiển thị và sử dụng toàn bộ 8 menu trên hệ thống:
Trang Tổng quan
Trang Đơn hàng
Trang Sản phẩm / Phôi áo
Trang Thiết kế & In ấn
Trang Kho hàng
Trang Thanh toán
Trang Khuyến mãi & Báo giá
Trang Cài đặt
2. Quyền của Thủ kho (WAREHOUSE)
Tài khoản mang vai trò Thủ kho sẽ chỉ được phép hiển thị và sử dụng 2 menu đúng với nghiệp vụ kiểm soát hàng hóa của mình:
Trang Sản phẩm / Phôi áo 
Trang Kho hàng 
Hệ thống bắt buộc phải ẩn 6 menu còn lại: Trang Tổng quan, Trang Đơn hàng, Trang Thiết kế & In ấn, Trang Thanh toán, Trang Khuyến mãi & Báo giá, và Trang Cài đặt.
3. Quyền của Nhân viên thiết kế & in ấn (PRODUCTION)
Tài khoản mang vai trò thiết kế & in ấn sẽ chỉ được phép hiển thị và sử dụng 2 menu chuyên trách để gia công đơn hàng:
Trang Đơn hàng 
Trang Thiết kế & In ấn 
Hệ thống bắt buộc phải ẩn 6 menu còn lại: Trang Tổng quan, Trang Sản phẩm / Phôi áo, Trang Kho hàng, Trang Thanh toán, Trang Khuyến mãi & Báo giá, và Trang Cài đặt.