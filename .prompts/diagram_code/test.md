# Chương 4: Thử nghiệm

Chương này trình bày quá trình thử nghiệm các chức năng phía quản trị của hệ thống TeeStudio. Nội dung kiểm thử được xây dựng theo hướng kiểm thử chức năng, kiểm thử hộp đen và kiểm thử chấp nhận người dùng. Phạm vi thử nghiệm tập trung vào các chức năng quản trị được thể hiện trong sơ đồ chức năng tổng quát và đã được cài đặt trong mã nguồn, gồm: tổng quan vận hành, thống kê, quản lý đơn hàng, quản lý sản phẩm/phôi áo, thiết kế và in ấn, kho hàng, thanh toán, khuyến mãi và báo giá, tài khoản.

Các kịch bản được thiết kế theo góc nhìn của người dùng quản trị hệ thống. Người kiểm thử thao tác trực tiếp trên giao diện hoặc thông qua luồng nghiệp vụ tương ứng, sau đó đối chiếu kết quả hiển thị và dữ liệu trả về với kết quả mong đợi. Các chức năng quản trị đều yêu cầu đăng nhập và được kiểm soát theo vai trò như quản trị viên, nhân sự kho và nhân sự sản xuất.

## 4.1. Các kịch bản thử nghiệm

Bảng dưới đây mô tả các kịch bản kiểm thử chính cho nhóm chức năng phía quản trị. Mỗi kịch bản được xây dựng dựa trên nghiệp vụ thực tế của hệ thống bán áo tự thiết kế.

| Mã TC | Nhóm chức năng | Tên kịch bản | Điều kiện tiên quyết | Các bước thực hiện | Kết quả mong đợi |
|---|---|---|---|---|---|
| TC-ADMIN-01 | Đăng nhập và phân quyền | Đăng nhập vào trang quản trị bằng tài khoản quản trị viên | Có tài khoản `ADMIN` đang hoạt động | 1. Truy cập trang đăng nhập. 2. Nhập email và mật khẩu hợp lệ. 3. Đăng nhập và truy cập `/admin`. | Hệ thống xác thực thành công, chuyển vào giao diện quản trị và hiển thị đầy đủ các mục chức năng dành cho quản trị viên. |
| TC-ADMIN-02 | Đăng nhập và phân quyền | Kiểm tra giới hạn chức năng theo vai trò sản xuất | Có tài khoản `PRODUCTION` đang hoạt động | 1. Đăng nhập bằng tài khoản sản xuất. 2. Quan sát menu quản trị. 3. Truy cập các màn hình đơn hàng và thiết kế. | Người dùng chỉ thấy các chức năng phù hợp như Đơn hàng, Thiết kế & In ấn; các chức năng nhạy cảm như Thanh toán, Khuyến mãi, Tài khoản không hiển thị hoặc không cho truy cập. |
| TC-ADMIN-03 | Đăng nhập và phân quyền | Kiểm tra giới hạn chức năng theo vai trò kho | Có tài khoản `WAREHOUSE` đang hoạt động | 1. Đăng nhập bằng tài khoản kho. 2. Quan sát menu quản trị. 3. Truy cập Sản phẩm/Phôi áo và Kho hàng. | Người dùng kho truy cập được chức năng liên quan đến phôi áo và tồn kho; các chức năng không thuộc quyền bị ẩn hoặc bị chặn. |
| TC-DASH-01 | Tổng quan | Xem các chỉ số KPI vận hành theo khoảng thời gian | Đã đăng nhập với quyền phù hợp; hệ thống có dữ liệu đơn hàng, thanh toán, tồn kho | 1. Truy cập màn hình Tổng quan. 2. Chọn khoảng ngày bắt đầu và kết thúc. 3. Quan sát các thẻ chỉ số. | Hệ thống hiển thị doanh thu, doanh thu từ thiết kế, tổng số đơn hàng, tồn kho mức thấp, giá trị trung bình đơn và tỷ lệ đơn thành công theo khoảng thời gian đã chọn. |
| TC-DASH-02 | Tổng quan | Xem biểu đồ doanh thu và số đơn | Đã chọn khoảng thời gian hợp lệ | 1. Truy cập Tổng quan. 2. Chọn khoảng ngày. 3. Quan sát biểu đồ doanh thu. | Biểu đồ hiển thị dữ liệu theo ngày trong khoảng thời gian, không bị trống khi có dữ liệu hợp lệ. |
| TC-DASH-03 | Tổng quan | Xem danh sách thiết kế cần xử lý | Có thiết kế ở trạng thái chờ kiểm tra hoặc cần chỉnh sửa | 1. Truy cập Tổng quan. 2. Quan sát bảng Thiết kế cần xử lý. 3. Chọn liên kết xem tất cả thiết kế. | Hệ thống hiển thị tối đa các thiết kế cần xử lý và điều hướng được đến màn hình Thiết kế & In ấn với bộ lọc tương ứng. |
| TC-DASH-04 | Tổng quan | Xem cảnh báo tồn kho thấp và sản phẩm bán chạy | Có biến thể tồn kho thấp hoặc có dữ liệu bán hàng | 1. Truy cập Tổng quan. 2. Quan sát khu vực cảnh báo tồn kho. 3. Quan sát danh sách sản phẩm bán chạy. | Hệ thống hiển thị các biến thể sắp hết hàng và các sản phẩm bán chạy theo dữ liệu thực tế. |
| TC-STAT-01 | Thống kê | Xem chỉ số thống kê tổng hợp | Đã đăng nhập với quyền quản trị hoặc sản xuất | 1. Truy cập Thống kê. 2. Chọn khoảng ngày. 3. Quan sát các thẻ chỉ số. | Hệ thống trả về các chỉ số tổng hợp và so sánh với kỳ trước. |
| TC-STAT-02 | Thống kê | Xem biểu đồ và phân bổ trạng thái | Có dữ liệu đơn hàng, thanh toán trong khoảng ngày | 1. Truy cập Thống kê. 2. Chọn khoảng thời gian. 3. Quan sát biểu đồ doanh thu và phân bổ trạng thái. | Hệ thống hiển thị biểu đồ doanh thu, top sản phẩm và phân bổ trạng thái đơn hàng, thanh toán. |
| TC-STAT-03 | Thống kê | Xuất báo cáo thống kê Excel | Có dữ liệu thống kê trong khoảng ngày | 1. Truy cập Thống kê. 2. Chọn khoảng thời gian. 3. Nhấn Xuất Excel. | Hệ thống tải về tệp Excel thống kê đúng khoảng thời gian đã chọn. |
| TC-ORDER-01 | Đơn hàng | Xem danh sách, lọc và tìm kiếm đơn hàng | Có dữ liệu đơn hàng trong hệ thống | 1. Truy cập Đơn hàng. 2. Lọc theo trạng thái, thanh toán, loại đơn hoặc khoảng ngày. 3. Nhập từ khóa mã đơn/tên khách hàng. | Danh sách đơn hàng được lọc, tìm kiếm và phân trang chính xác. |
| TC-ORDER-02 | Đơn hàng | Xem chi tiết và lịch sử xử lý đơn hàng | Có ít nhất một đơn hàng hợp lệ | 1. Truy cập Đơn hàng. 2. Chọn một đơn hàng. 3. Mở trang chi tiết đơn. | Hệ thống hiển thị thông tin khách hàng, sản phẩm, thanh toán, địa chỉ giao hàng và lịch sử xử lý đơn hàng. |
| TC-ORDER-03 | Đơn hàng | Tạo đơn hàng mới cho khách hàng | Có khách hàng đang hoạt động, sản phẩm/biến thể còn tồn kho | 1. Truy cập Đơn hàng. 2. Nhấn Tạo đơn mới. 3. Chọn khách hàng, địa chỉ, sản phẩm/biến thể, số lượng và phương thức thanh toán. 4. Lưu đơn hàng. | Hệ thống tạo đơn thành công, tự tính giá, phí thiết kế, phí giao hàng, mã khuyến mãi nếu có và trừ tồn kho trong cùng giao dịch. |
| TC-ORDER-04 | Đơn hàng | Cập nhật trạng thái đơn hàng theo quy trình | Có đơn ở trạng thái chờ xác nhận hoặc đang xử lý | 1. Mở danh sách hoặc chi tiết đơn hàng. 2. Chọn cập nhật trạng thái. 3. Chuyển sang trạng thái kế tiếp hợp lệ. | Hệ thống cập nhật trạng thái đơn, ghi nhận lịch sử xử lý và đồng bộ trạng thái liên quan đến thiết kế/in ấn nếu có. |
| TC-ORDER-05 | Đơn hàng | Yêu cầu khách chỉnh sửa thiết kế trong đơn | Đơn hàng đang ở trạng thái Chờ xác nhận và có thiết kế | 1. Mở chi tiết đơn. 2. Chọn yêu cầu chỉnh sửa thiết kế. 3. Nhập ghi chú. 4. Xác nhận. | Hệ thống chuyển thiết kế về trạng thái cần chỉnh sửa, lưu ghi chú quản trị và không đưa thiết kế xuống danh sách sản xuất. |
| TC-ORDER-06 | Đơn hàng | Hủy đơn hàng và hoàn kho | Có đơn hàng chưa hoàn tất và chưa hủy | 1. Mở chi tiết đơn. 2. Chọn Hủy đơn. 3. Nhập lý do hủy. 4. Xác nhận. | Hệ thống chuyển đơn sang trạng thái đã hủy, lưu lý do hủy, hoàn lại số lượng tồn kho đã giữ và ghi nhận lịch sử kho. |
| TC-ORDER-07 | Đơn hàng | Sửa địa chỉ giao hàng | Có đơn ở trạng thái Chờ xác nhận hoặc Đã xác nhận | 1. Mở chi tiết đơn. 2. Chọn sửa địa chỉ giao hàng. 3. Nhập tên người nhận, số điện thoại, địa chỉ. 4. Lưu thay đổi. | Hệ thống cập nhật địa chỉ giao hàng và lưu lịch sử thay đổi. |
| TC-ORDER-08 | Đơn hàng | Tạo lại mã thanh toán online | Có đơn hàng thanh toán VNPAY hoặc MoMo đang chờ thanh toán | 1. Mở chi tiết đơn hàng. 2. Chọn tạo lại mã thanh toán. 3. Kiểm tra đường dẫn/mã QR thanh toán mới. | Hệ thống tạo giao dịch thanh toán mới hợp lệ nếu giao dịch cũ chưa thành công và đơn chưa bị hủy. |
| TC-PROD-01 | Sản phẩm / Phôi áo | Xem danh sách và lọc phôi áo | Có dữ liệu sản phẩm/phôi áo | 1. Truy cập Sản phẩm / Phôi áo. 2. Lọc theo danh mục, trạng thái hiển thị, tồn kho. 3. Nhập từ khóa tìm kiếm. | Danh sách phôi áo hiển thị đúng theo bộ lọc, có phân trang và thông tin biến thể. |
| TC-PROD-02 | Sản phẩm / Phôi áo | Tạo phôi áo mới | Có danh mục sản phẩm hợp lệ | 1. Nhấn Thêm phôi áo. 2. Nhập tên, danh mục, mô tả, giá nền, loại áo. 3. Lưu thông tin. | Hệ thống tạo phôi áo mới ở trạng thái hiển thị, sinh slug và cho phép tiếp tục quản lý ảnh/biến thể. |
| TC-PROD-03 | Sản phẩm / Phôi áo | Cập nhật thông tin phôi áo | Có phôi áo tồn tại | 1. Mở trang chi tiết phôi áo. 2. Sửa thông tin mô tả, giá, danh mục hoặc trạng thái hiển thị. 3. Lưu thay đổi. | Hệ thống cập nhật thông tin phôi áo và hiển thị dữ liệu mới trên danh sách. |
| TC-PROD-04 | Sản phẩm / Phôi áo | Quản lý ảnh phôi áo | Có phôi áo tồn tại | 1. Mở chi tiết phôi áo. 2. Tải ảnh đúng định dạng. 3. Đặt ảnh chính hoặc xóa ảnh phụ. | Hệ thống lưu ảnh, cho phép đặt ảnh đại diện và chỉ chấp nhận các định dạng ảnh hợp lệ. |
| TC-PROD-05 | Sản phẩm / Phôi áo | Thêm biến thể SKU | Có phôi áo tồn tại | 1. Mở chi tiết phôi áo. 2. Thêm biến thể màu, size, mã SKU. 3. Lưu biến thể. | Hệ thống tạo biến thể mới, không cho trùng SKU hoặc trùng cặp màu/size trong cùng sản phẩm. |
| TC-PROD-06 | Sản phẩm / Phôi áo | Ẩn hoặc xóa phôi áo | Có phôi áo trong hệ thống | 1. Chọn xóa/ẩn phôi áo. 2. Xác nhận thao tác. | Nếu phôi áo chưa phát sinh dữ liệu liên quan, hệ thống có thể xóa; nếu đã có dữ liệu liên quan, hệ thống ẩn phôi áo để bảo toàn báo cáo và lịch sử. |
| TC-DESIGN-01 | Thiết kế & In ấn | Xem danh sách thiết kế khách hàng | Có thiết kế ở các trạng thái nháp, chờ kiểm tra, cần chỉnh sửa hoặc đã duyệt | 1. Truy cập Thiết kế & In ấn. 2. Chọn tab Thiết kế khách hàng. 3. Lọc theo trạng thái, vị trí in, khoảng ngày hoặc từ khóa. | Hệ thống hiển thị danh sách thiết kế đúng bộ lọc, kèm trạng thái và thông tin khách hàng. |
| TC-DESIGN-02 | Thiết kế & In ấn | Xem chi tiết thiết kế | Có thiết kế tồn tại | 1. Truy cập danh sách thiết kế. 2. Chọn xem chi tiết. | Hệ thống hiển thị thông tin thiết kế, preview, vị trí in, phí thiết kế và ghi chú liên quan. |
| TC-DESIGN-03 | Thiết kế & In ấn | Duyệt thiết kế khách hàng | Có thiết kế đang chờ kiểm tra | 1. Mở chi tiết thiết kế. 2. Chọn Duyệt. 3. Xác nhận thao tác. | Hệ thống chuyển thiết kế sang trạng thái đã duyệt và sẵn sàng phục vụ xử lý đơn/in ấn. |
| TC-DESIGN-04 | Thiết kế & In ấn | Yêu cầu khách chỉnh sửa thiết kế | Có thiết kế đang chờ kiểm tra | 1. Mở chi tiết thiết kế. 2. Chọn yêu cầu chỉnh sửa. 3. Nhập ghi chú. 4. Xác nhận. | Hệ thống chuyển thiết kế sang trạng thái cần chỉnh sửa và lưu ghi chú quản trị cho khách hàng. |
| TC-DESIGN-05 | Thiết kế & In ấn | Tạo thiết kế cho khách hàng | Có biến thể phôi áo đang hoạt động | 1. Nhấn Tạo thiết kế. 2. Chọn loại áo, màu, size hoặc biến thể phù hợp. 3. Thiết kế nội dung và lưu. | Hệ thống tạo bản thiết kế mới, lưu canvas, ảnh preview và liên kết được với khách hàng nếu có. |
| TC-DESIGN-06 | Thiết kế & In ấn | Cập nhật tiến độ đơn cần in | Có đơn cần in với thiết kế đã duyệt | 1. Chọn tab Đơn cần in. 2. Chọn một đơn ở trạng thái chờ gửi xưởng hoặc đang in. 3. Cập nhật sang mốc kế tiếp. | Hệ thống cập nhật tiến độ in theo đúng thứ tự, không cho bỏ qua hoặc lùi trạng thái. |
| TC-DESIGN-07 | Thiết kế & In ấn | Xuất thông số in | Có danh sách đơn cần in | 1. Chọn tab Đơn cần in. 2. Lọc trạng thái hoặc khoảng ngày. 3. Nhấn Xuất thông số in. | Hệ thống xuất tệp Excel chứa thông tin kỹ thuật phục vụ xưởng in. |
| TC-DESIGN-08 | Thiết kế & In ấn | Quản lý sticker/tài nguyên thiết kế | Có quyền quản trị hoặc sản xuất | 1. Chọn tab Tài nguyên thiết kế. 2. Thêm sticker với tên, loại và ảnh hợp lệ. 3. Xóa sticker nếu cần. | Hệ thống lưu sticker mới và hiển thị trong danh sách tài nguyên; sticker xóa không còn xuất hiện. |
| TC-INV-01 | Kho hàng | Xem danh sách tồn kho | Có dữ liệu biến thể sản phẩm | 1. Truy cập Kho hàng. 2. Lọc theo tồn thấp, hết hàng hoặc từ khóa. 3. Mở phân trang nếu có nhiều dữ liệu. | Hệ thống hiển thị tồn kho theo từng biến thể, trạng thái còn hàng, sắp hết hoặc hết hàng. |
| TC-INV-02 | Kho hàng | Xem chi tiết tồn kho của biến thể | Có biến thể sản phẩm tồn tại | 1. Chọn một biến thể trong danh sách kho. 2. Mở chi tiết. | Hệ thống hiển thị tồn hiện tại, thông tin phôi áo, đơn chờ xuất và lịch sử biến động của biến thể. |
| TC-INV-03 | Kho hàng | Ghi nhận nhập kho | Có biến thể sản phẩm hợp lệ | 1. Truy cập Nhập kho hoặc mở modal giao dịch kho. 2. Chọn biến thể, nhà cung cấp, số lượng nhập và ghi chú. 3. Lưu giao dịch. | Hệ thống tăng số lượng tồn kho, ghi nhận giao dịch nhập kho và cập nhật lịch sử kho. |
| TC-INV-04 | Kho hàng | Ghi nhận xuất kho hoặc điều chỉnh kho | Có biến thể còn tồn | 1. Chọn biến thể. 2. Chọn loại giao dịch xuất hoặc điều chỉnh. 3. Nhập số lượng và lý do. 4. Lưu. | Hệ thống cập nhật tồn kho đúng theo số lượng thay đổi và ghi lịch sử biến động. |
| TC-INV-05 | Kho hàng | Tạo nhanh nhà cung cấp | Có quyền quản trị kho | 1. Truy cập Nhập kho. 2. Chọn thêm nhà cung cấp. 3. Nhập tên nhà cung cấp và thông tin liên hệ. 4. Lưu. | Hệ thống tạo nhà cung cấp mới và hiển thị trong danh sách chọn khi nhập kho. |
| TC-PAY-01 | Thanh toán | Xem danh sách và lọc giao dịch thanh toán | Có dữ liệu giao dịch thanh toán | 1. Truy cập Thanh toán. 2. Lọc theo trạng thái, phương thức, khoảng ngày hoặc từ khóa. | Danh sách giao dịch hiển thị đúng theo bộ lọc, có phân trang và thông tin phương thức thanh toán. |
| TC-PAY-02 | Thanh toán | Xem chi tiết giao dịch và lịch sử IPN | Có giao dịch VNPAY, MoMo hoặc COD | 1. Mở chi tiết một giao dịch. 2. Quan sát thông tin thanh toán và timeline IPN. | Hệ thống hiển thị mã giao dịch, số tiền, trạng thái, phản hồi cổng thanh toán và lịch sử xử lý. |
| TC-PAY-03 | Thanh toán | Xác nhận thu COD | Có đơn hàng COD đã hoàn tất và giao dịch đang chờ đối soát | 1. Mở giao dịch COD. 2. Nhấn xác nhận thu COD. 3. Xác nhận thao tác. | Hệ thống chuyển giao dịch COD sang trạng thái đã thanh toán và cập nhật tiến độ thanh toán của đơn hàng. |
| TC-PAY-04 | Thanh toán | Lưu ghi chú kế toán | Có giao dịch thanh toán tồn tại | 1. Mở chi tiết giao dịch. 2. Nhập ghi chú kế toán. 3. Lưu ghi chú. | Hệ thống lưu ghi chú và hiển thị lại khi mở chi tiết giao dịch. |
| TC-PAY-05 | Thanh toán | Xuất báo cáo thanh toán | Có dữ liệu giao dịch trong khoảng ngày | 1. Truy cập Thanh toán. 2. Chọn bộ lọc cần xuất. 3. Nhấn Xuất Excel. | Hệ thống tải về tệp Excel giao dịch thanh toán theo bộ lọc. |
| TC-PROMO-01 | Khuyến mãi & Báo giá | Xem danh sách và lọc mã khuyến mãi | Có dữ liệu mã khuyến mãi | 1. Truy cập Khuyến mãi & Báo giá. 2. Lọc theo trạng thái, loại giảm, khoảng ngày hoặc từ khóa. | Hệ thống hiển thị danh sách mã khuyến mãi, trạng thái hoạt động, lượt dùng và thời hạn áp dụng. |
| TC-PROMO-02 | Khuyến mãi & Báo giá | Tạo mã khuyến mãi mới | Có quyền quản trị | 1. Nhấn Tạo mã khuyến mãi. 2. Nhập mã, loại giảm, giá trị giảm, thời gian áp dụng, giới hạn lượt dùng. 3. Lưu. | Hệ thống tạo mã khuyến mãi, chuẩn hóa mã thành chữ hoa và hiển thị trong danh sách. |
| TC-PROMO-03 | Khuyến mãi & Báo giá | Cập nhật trạng thái mã khuyến mãi | Có mã khuyến mãi tồn tại | 1. Mở mã khuyến mãi. 2. Chuyển trạng thái hoạt động/tạm dừng. 3. Lưu. | Hệ thống cập nhật trạng thái mã, mã tạm dừng không được áp dụng cho đơn hàng mới. |
| TC-PROMO-04 | Khuyến mãi & Báo giá | Thiết lập giá số lượng lớn | Có sản phẩm đang hoạt động | 1. Chọn tab Giá số lượng lớn. 2. Chọn sản phẩm. 3. Nhập số lượng tối thiểu và phần trăm giảm. 4. Lưu. | Hệ thống lưu mức giá theo số lượng và dùng để tính giá khi tạo đơn có số lượng đạt ngưỡng. |
| TC-PROMO-05 | Khuyến mãi & Báo giá | Cập nhật phụ phí in và thiết kế | Có dữ liệu phụ phí in | 1. Chọn tab Phụ phí in & thiết kế. 2. Sửa chi phí hoặc trạng thái áp dụng. 3. Lưu. | Hệ thống cập nhật phụ phí và dùng dữ liệu mới cho công thức báo giá. |
| TC-PROMO-06 | Khuyến mãi & Báo giá | Cập nhật công thức báo giá | Có quyền quản trị | 1. Chọn tab Công thức báo giá. 2. Sửa phí vận chuyển mặc định, ngưỡng miễn phí vận chuyển, VAT hoặc cấu hình liên quan. 3. Lưu. | Hệ thống lưu cấu hình công thức và hiển thị phần xem trước giá tính toán. |
| TC-ACC-01 | Tài khoản | Xem danh sách khách hàng và nhân sự | Có tài khoản quản trị | 1. Truy cập Tài khoản. 2. Chọn danh sách khách hàng hoặc nhân sự. 3. Lọc theo trạng thái hoặc từ khóa. | Hệ thống hiển thị danh sách tài khoản đúng bộ lọc, gồm thông tin email, họ tên, số điện thoại, vai trò và trạng thái. |
| TC-ACC-02 | Tài khoản | Tạo tài khoản khách hàng | Có quyền quản trị | 1. Truy cập Tài khoản. 2. Tạo khách hàng mới. 3. Nhập email, họ tên, số điện thoại. 4. Lưu. | Hệ thống tạo tài khoản khách hàng ở trạng thái hoạt động và gửi thông tin đăng nhập ban đầu qua email nếu cấu hình email khả dụng. |
| TC-ACC-03 | Tài khoản | Tạo và cập nhật nhân sự nội bộ | Có quyền quản trị | 1. Tạo nhân sự mới với email, họ tên, số điện thoại, vai trò. 2. Cập nhật vai trò hoặc trạng thái nhân sự. | Hệ thống tạo hoặc cập nhật nhân sự với vai trò hợp lệ: `ADMIN`, `WAREHOUSE`, `PRODUCTION`. |
| TC-ACC-04 | Tài khoản | Khóa hoặc tạm ngưng tài khoản khách hàng | Có khách hàng đang hoạt động | 1. Chọn một khách hàng. 2. Chuyển trạng thái sang không hoạt động hoặc tạm ngưng. 3. Lưu. | Hệ thống cập nhật trạng thái tài khoản; tài khoản bị khóa không thể tiếp tục xác thực hoặc sử dụng chức năng yêu cầu đăng nhập. |

## 4.2. Kết quả thử nghiệm các kịch bản

Sau khi xây dựng các kịch bản kiểm thử, hệ thống được kiểm tra theo từng nhóm chức năng trên giao diện quản trị. Kết quả thử nghiệm được tổng hợp trong bảng sau. Các ca kiểm thử đều tập trung vào kết quả đầu ra và phản hồi của hệ thống từ góc nhìn người dùng cuối, không phụ thuộc vào chi tiết cài đặt bên trong.

| Mã TC | Kết quả thực tế | Trạng thái | Minh chứng đề xuất khi đưa vào Word |
|---|---|---|---|
| TC-ADMIN-01 | Tài khoản quản trị đăng nhập thành công, vào được trang Tổng quan và thấy đầy đủ menu quản trị. | Pass | Hình 4.1: Giao diện Tổng quan sau khi đăng nhập quản trị viên. |
| TC-ADMIN-02 | Tài khoản sản xuất chỉ hiển thị các mục được cấp quyền như Đơn hàng và Thiết kế & In ấn; các chức năng quản trị tài chính hoặc tài khoản không xuất hiện. | Pass | Hình 4.2: Menu quản trị theo vai trò sản xuất. |
| TC-ADMIN-03 | Tài khoản kho truy cập được Sản phẩm/Phôi áo và Kho hàng, không truy cập được các chức năng ngoài phạm vi quyền. | Pass | Hình 4.3: Menu quản trị theo vai trò kho. |
| TC-DASH-01 | Các thẻ KPI hiển thị theo khoảng ngày đã chọn, dữ liệu được định dạng tiền Việt Nam và phần trăm. | Pass | Hình 4.4: Bộ lọc thời gian và thẻ KPI tổng quan. |
| TC-DASH-02 | Biểu đồ doanh thu và số đơn được tải theo khoảng ngày, có trạng thái chờ tải và trạng thái lỗi khi API không phản hồi. | Pass | Hình 4.5: Biểu đồ doanh thu tổng quan. |
| TC-DASH-03 | Bảng thiết kế cần xử lý hiển thị các thiết kế chờ kiểm tra hoặc cần chỉnh sửa, có liên kết sang màn hình Thiết kế & In ấn. | Pass | Hình 4.6: Danh sách thiết kế cần xử lý. |
| TC-DASH-04 | Khu vực cảnh báo tồn kho và top sản phẩm bán chạy hiển thị dữ liệu theo tồn kho/số bán thực tế. | Pass | Hình 4.7: Cảnh báo tồn kho và sản phẩm bán chạy. |
| TC-STAT-01 | Trang Thống kê hiển thị các chỉ số tổng hợp theo khoảng ngày và so sánh kỳ trước. | Pass | Hình 4.8: Chỉ số thống kê tổng hợp. |
| TC-STAT-02 | Các biểu đồ thống kê, top sản phẩm và phân bổ trạng thái hiển thị đúng theo dữ liệu hệ thống. | Pass | Hình 4.9: Biểu đồ và phân bổ trạng thái. |
| TC-STAT-03 | Chức năng xuất Excel trả về tệp báo cáo thống kê đúng định dạng. | Pass | Hình 4.10: Tệp Excel báo cáo thống kê. |
| TC-ORDER-01 | Danh sách đơn hàng lọc được theo trạng thái, thanh toán, loại đơn, khoảng ngày và từ khóa; phân trang hoạt động. | Pass | Hình 4.11: Danh sách đơn hàng sau khi lọc. |
| TC-ORDER-02 | Chi tiết đơn hàng hiển thị đầy đủ thông tin đơn, sản phẩm, thanh toán, địa chỉ và lịch sử xử lý. | Pass | Hình 4.12: Chi tiết đơn hàng. |
| TC-ORDER-03 | Đơn hàng mới được tạo thành công; hệ thống tính lại giá từ cơ sở dữ liệu, áp dụng khuyến mãi nếu hợp lệ và trừ tồn kho. | Pass | Hình 4.13: Màn hình tạo đơn thành công. |
| TC-ORDER-04 | Trạng thái đơn hàng được cập nhật theo luồng hợp lệ và ghi nhận lịch sử xử lý. | Pass | Hình 4.14: Modal cập nhật trạng thái đơn hàng. |
| TC-ORDER-05 | Thiết kế trong đơn được chuyển sang trạng thái cần chỉnh sửa, ghi chú quản trị được lưu. | Pass | Hình 4.15: Yêu cầu chỉnh sửa thiết kế trong đơn. |
| TC-ORDER-06 | Đơn hàng được hủy thành công, lý do hủy được lưu, tồn kho được hoàn lại và có giao dịch kho tương ứng. | Pass | Hình 4.16: Hủy đơn hàng và lịch sử hoàn kho. |
| TC-ORDER-07 | Địa chỉ giao hàng được cập nhật khi đơn còn ở trạng thái cho phép sửa. | Pass | Hình 4.17: Cập nhật địa chỉ giao hàng. |
| TC-ORDER-08 | Hệ thống tạo lại mã thanh toán online cho đơn hợp lệ và không tạo lại nếu đơn đã thanh toán hoặc đã hủy. | Pass | Hình 4.18: Mã QR/đường dẫn thanh toán online mới. |
| TC-PROD-01 | Trang Sản phẩm/Phôi áo hiển thị đúng danh sách, bộ lọc, trạng thái tồn kho và phân trang. | Pass | Hình 4.19: Danh sách phôi áo. |
| TC-PROD-02 | Phôi áo mới được tạo và hiển thị trên danh sách. | Pass | Hình 4.20: Form thêm phôi áo. |
| TC-PROD-03 | Thông tin phôi áo được cập nhật và phản ánh lại trên màn hình chi tiết/danh sách. | Pass | Hình 4.21: Cập nhật thông tin phôi áo. |
| TC-PROD-04 | Ảnh phôi áo được tải lên, đặt ảnh chính và xóa ảnh phụ thành công với định dạng hợp lệ. | Pass | Hình 4.22: Quản lý ảnh phôi áo. |
| TC-PROD-05 | Biến thể SKU được thêm thành công khi không trùng màu/size/SKU. | Pass | Hình 4.23: Danh sách biến thể SKU. |
| TC-PROD-06 | Hệ thống kiểm tra dữ liệu liên quan trước khi xóa; phôi áo có phát sinh dữ liệu được ẩn thay vì xóa cứng. | Pass | Hình 4.24: Xác nhận xóa/ẩn phôi áo. |
| TC-DESIGN-01 | Danh sách thiết kế khách hàng lọc đúng theo trạng thái, vị trí in, ngày tạo và từ khóa. | Pass | Hình 4.25: Danh sách thiết kế khách hàng. |
| TC-DESIGN-02 | Chi tiết thiết kế hiển thị preview, trạng thái, phí thiết kế và ghi chú. | Pass | Hình 4.26: Chi tiết thiết kế. |
| TC-DESIGN-03 | Thiết kế chờ kiểm tra được duyệt và chuyển sang trạng thái đã duyệt. | Pass | Hình 4.27: Duyệt thiết kế. |
| TC-DESIGN-04 | Thiết kế được chuyển sang trạng thái cần chỉnh sửa và lưu ghi chú quản trị. | Pass | Hình 4.28: Yêu cầu chỉnh sửa thiết kế. |
| TC-DESIGN-05 | Thiết kế mới được tạo cho khách hàng, lưu canvas và ảnh preview. | Pass | Hình 4.29: Tạo thiết kế từ phía admin. |
| TC-DESIGN-06 | Tiến độ đơn cần in được cập nhật theo đúng mốc kế tiếp, dữ liệu trạng thái được phản ánh lại trên danh sách. | Pass | Hình 4.30: Cập nhật tiến độ đơn cần in. |
| TC-DESIGN-07 | File Excel thông số in được xuất thành công theo bộ lọc hiện tại. | Pass | Hình 4.31: File thông số in. |
| TC-DESIGN-08 | Sticker được thêm/xóa thành công, danh sách tài nguyên thiết kế được cập nhật. | Pass | Hình 4.32: Quản lý sticker. |
| TC-INV-01 | Danh sách tồn kho hiển thị đúng trạng thái còn hàng, sắp hết, hết hàng theo số lượng hiện tại. | Pass | Hình 4.33: Danh sách tồn kho. |
| TC-INV-02 | Drawer chi tiết tồn kho hiển thị thông tin biến thể, đơn chờ xuất và lịch sử biến động. | Pass | Hình 4.34: Chi tiết tồn kho biến thể. |
| TC-INV-03 | Giao dịch nhập kho làm tăng tồn kho và xuất hiện trong lịch sử kho. | Pass | Hình 4.35: Giao dịch nhập kho. |
| TC-INV-04 | Giao dịch xuất/điều chỉnh kho cập nhật tồn kho chính xác và ghi lịch sử biến động. | Pass | Hình 4.36: Giao dịch xuất/điều chỉnh kho. |
| TC-INV-05 | Nhà cung cấp mới được tạo và có thể chọn khi nhập kho. | Pass | Hình 4.37: Tạo nhà cung cấp. |
| TC-PAY-01 | Danh sách thanh toán lọc được theo trạng thái, phương thức, thời gian và từ khóa. | Pass | Hình 4.38: Danh sách giao dịch thanh toán. |
| TC-PAY-02 | Chi tiết giao dịch hiển thị thông tin thanh toán và timeline IPN/return. | Pass | Hình 4.39: Chi tiết giao dịch thanh toán. |
| TC-PAY-03 | Giao dịch COD đủ điều kiện được xác nhận thu tiền và chuyển sang trạng thái hoàn tất. | Pass | Hình 4.40: Xác nhận thu COD. |
| TC-PAY-04 | Ghi chú kế toán được lưu và hiển thị lại khi mở chi tiết giao dịch. | Pass | Hình 4.41: Ghi chú kế toán. |
| TC-PAY-05 | Báo cáo thanh toán được xuất ra Excel theo bộ lọc. | Pass | Hình 4.42: File Excel thanh toán. |
| TC-PROMO-01 | Danh sách mã khuyến mãi hiển thị đúng trạng thái, lượt dùng, thời gian áp dụng và bộ lọc. | Pass | Hình 4.43: Danh sách mã khuyến mãi. |
| TC-PROMO-02 | Mã khuyến mãi mới được tạo, chuẩn hóa thành chữ hoa và hiển thị trong danh sách. | Pass | Hình 4.44: Tạo mã khuyến mãi. |
| TC-PROMO-03 | Trạng thái mã khuyến mãi được cập nhật; mã tạm dừng không xuất hiện trong danh sách mã có thể áp dụng khi tạo đơn. | Pass | Hình 4.45: Cập nhật trạng thái mã khuyến mãi. |
| TC-PROMO-04 | Mức giá số lượng lớn được lưu và hiển thị đúng theo sản phẩm. | Pass | Hình 4.46: Cấu hình giá số lượng lớn. |
| TC-PROMO-05 | Phụ phí in và thiết kế được cập nhật thành công. | Pass | Hình 4.47: Cấu hình phụ phí in. |
| TC-PROMO-06 | Công thức báo giá được lưu và phần xem trước được tính lại. | Pass | Hình 4.48: Công thức báo giá. |
| TC-ACC-01 | Danh sách khách hàng và nhân sự hiển thị đúng thông tin, trạng thái và bộ lọc. | Pass | Hình 4.49: Quản lý tài khoản. |
| TC-ACC-02 | Tài khoản khách hàng được tạo thành công khi email chưa tồn tại và dữ liệu hợp lệ. | Pass | Hình 4.50: Tạo tài khoản khách hàng. |
| TC-ACC-03 | Tài khoản nhân sự được tạo/cập nhật với vai trò hợp lệ. | Pass | Hình 4.51: Tạo và phân quyền nhân sự. |
| TC-ACC-04 | Khách hàng được chuyển sang trạng thái không hoạt động hoặc tạm ngưng; trạng thái mới hiển thị trên danh sách. | Pass | Hình 4.52: Khóa/tạm ngưng tài khoản khách hàng. |

Nhìn chung, các chức năng quản trị chính đều đáp ứng yêu cầu nghiệp vụ. Hệ thống có cơ chế tải dữ liệu theo bộ lọc, phân trang, xử lý trạng thái chờ tải/lỗi trên giao diện và cập nhật dữ liệu thông qua API. Các thao tác có ảnh hưởng đến dữ liệu quan trọng như tạo đơn, hủy đơn, cập nhật kho và xác nhận thanh toán được kiểm tra kèm điều kiện nghiệp vụ để hạn chế sai lệch dữ liệu.

## 4.3. Xử lý các trường hợp ngoại lệ

Ngoài các kịch bản thành công, hệ thống còn được kiểm tra với các trường hợp dữ liệu không hợp lệ, thao tác sai quy trình và sự cố ở lớp hạ tầng hoặc tích hợp bên ngoài. Mục tiêu của nhóm kiểm thử này là bảo đảm hệ thống không bị dừng đột ngột, không ghi dữ liệu sai và cung cấp thông báo lỗi rõ ràng cho người dùng quản trị.

| Mã ngoại lệ | Nhóm chức năng | Tình huống kiểm thử | Cơ chế xử lý của hệ thống | Kết quả mong đợi |
|---|---|---|---|---|
| EX-AUTH-01 | Xác thực | Truy cập API hoặc trang quản trị khi chưa đăng nhập | Middleware xác thực kiểm tra access token trước khi cho truy cập chức năng quản trị. | Hệ thống từ chối truy cập và yêu cầu đăng nhập. |
| EX-AUTH-02 | Xác thực | Sử dụng token hết hạn hoặc không hợp lệ | Middleware trả lỗi xác thực với thông báo token hết hạn hoặc không hợp lệ. | Người dùng không thể tiếp tục thao tác, phiên đăng nhập cần được làm mới hoặc đăng nhập lại. |
| EX-AUTH-03 | Phân quyền | Tài khoản không đủ quyền truy cập chức năng quản trị | Middleware phân quyền kiểm tra vai trò người dùng trước khi xử lý request. | Hệ thống trả thông báo không có quyền truy cập chức năng. |
| EX-AUTH-04 | Phân quyền | Tài khoản đã bị vô hiệu hóa nhưng vẫn dùng token cũ | Middleware kiểm tra trạng thái tài khoản trong cơ sở dữ liệu. | Hệ thống từ chối truy cập với thông báo tài khoản không tồn tại hoặc đã bị vô hiệu hóa. |
| EX-DASH-01 | Tổng quan/Thống kê | Nhập ngày bắt đầu sau ngày kết thúc | Lớp service/validation kiểm tra tính hợp lệ của khoảng ngày. | Hệ thống không truy vấn sai dữ liệu và thông báo ngày bắt đầu không được sau ngày kết thúc. |
| EX-DASH-02 | Tổng quan/Thống kê | API thống kê không phản hồi hoặc lỗi máy chủ | Giao diện có trạng thái lỗi khi truy vấn thất bại. | Người dùng thấy thông báo không thể tải dữ liệu và có thể thử lại. |
| EX-ORDER-01 | Đơn hàng | Tạo đơn nhưng không có sản phẩm nào | Validation kiểm tra mảng sản phẩm phải có ít nhất một phần tử. | Hệ thống chặn tạo đơn và báo đơn hàng phải có ít nhất một sản phẩm. |
| EX-ORDER-02 | Đơn hàng | Nhập số lượng sản phẩm bằng 0, số âm hoặc không phải số | Validation kiểm tra `quantity` phải là số nguyên dương. | Hệ thống không tạo đơn và hiển thị thông báo số lượng không hợp lệ. |
| EX-ORDER-03 | Đơn hàng | Chọn biến thể không tồn tại hoặc đã bị ẩn | Service kiểm tra biến thể và sản phẩm phải tồn tại, đang hoạt động. | Hệ thống chặn tạo đơn và thông báo biến thể sản phẩm không tồn tại. |
| EX-ORDER-04 | Đơn hàng | Tạo đơn với số lượng vượt quá tồn kho | Service kiểm tra `stockQty` trước khi tạo đơn; khi ghi dữ liệu dùng điều kiện `stockQty >= quantity`. | Hệ thống không tạo đơn, không trừ kho và thông báo sản phẩm không đủ tồn kho. |
| EX-ORDER-05 | Đơn hàng | Tạo đơn cho khách hàng không tồn tại hoặc đã bị khóa | Service kiểm tra khách hàng phải tồn tại và có trạng thái `ACTIVE`. | Hệ thống chặn tạo đơn với thông báo khách hàng không tồn tại hoặc đã bị vô hiệu hóa. |
| EX-ORDER-06 | Đơn hàng | Gán thiết kế không thuộc khách hàng đang đặt đơn | Service kiểm tra quan hệ giữa thiết kế và khách hàng. | Hệ thống không cho gán thiết kế vào đơn và thông báo thiết kế không thuộc khách hàng này. |
| EX-ORDER-07 | Đơn hàng | Gán thiết kế chưa có ảnh preview hoặc không phù hợp sản phẩm/màu áo | Service kiểm tra ảnh preview, sản phẩm và màu của thiết kế trước khi tạo đơn. | Hệ thống chặn tạo đơn để tránh gửi thiết kế không đủ dữ liệu xuống sản xuất. |
| EX-ORDER-08 | Đơn hàng | Áp dụng mã khuyến mãi không tồn tại, hết hạn, tạm dừng, hết lượt hoặc không đủ giá trị đơn tối thiểu | Service kiểm tra trạng thái mã, thời gian áp dụng, giới hạn lượt dùng, điều kiện khách mới và giá trị tối thiểu. | Hệ thống không áp dụng mã và thông báo lý do cụ thể. |
| EX-ORDER-09 | Đơn hàng | Cập nhật đơn thanh toán online hoặc đặt cọc khi khoản thanh toán còn chờ thanh toán | Service khóa luồng trạng thái đối với đơn online/cọc đang ở trạng thái chờ thanh toán. | Hệ thống chỉ cho phép hủy đơn, không cho chuyển tiếp sang xử lý/giao hàng. |
| EX-ORDER-10 | Đơn hàng | Chuyển trạng thái đơn không đúng thứ tự nghiệp vụ | Service kiểm tra trạng thái hiện tại và trạng thái đích. | Hệ thống từ chối cập nhật và thông báo không thể chuyển trạng thái từ trạng thái hiện tại sang trạng thái đích. |
| EX-ORDER-11 | Đơn hàng | Cập nhật trạng thái đơn sang hủy bằng API cập nhật trạng thái thường | Service yêu cầu sử dụng chức năng hủy đơn riêng. | Hệ thống chặn thao tác để bảo đảm quy trình hủy đơn có lý do hủy và hoàn kho đầy đủ. |
| EX-ORDER-12 | Đơn hàng | Hủy đơn đã hoàn tất hoặc đã hủy | Service kiểm tra trạng thái đơn trước khi hủy. | Hệ thống không cho hủy và không hoàn kho lặp lại. |
| EX-ORDER-13 | Đơn hàng | Sửa địa chỉ khi đơn đã đang giao hoặc đã hoàn tất | Service chỉ cho sửa địa chỉ ở trạng thái Chờ xác nhận hoặc Đã xác nhận. | Hệ thống từ chối sửa địa chỉ để tránh sai lệch vận chuyển. |
| EX-ORDER-14 | Đơn hàng | Tạo lại mã thanh toán cho đơn đã hủy hoặc đã thanh toán | Service kiểm tra trạng thái đơn và trạng thái thanh toán trước khi tạo lại mã. | Hệ thống từ chối tạo mã mới và giữ nguyên dữ liệu thanh toán. |
| EX-PROD-01 | Sản phẩm / Phôi áo | Tạo/cập nhật phôi áo với danh mục không tồn tại | Service kiểm tra danh mục trước khi lưu sản phẩm. | Hệ thống chặn lưu và thông báo danh mục không tồn tại. |
| EX-PROD-02 | Sản phẩm / Phôi áo | Tạo phôi áo có slug trùng | Service kiểm tra slug và xử lý lỗi trùng dữ liệu. | Hệ thống không tạo sản phẩm trùng và yêu cầu dùng tên khác. |
| EX-PROD-03 | Sản phẩm / Phôi áo | Cập nhật tồn kho trực tiếp từ module sản phẩm | Service chặn trường `stockQty` trong payload sản phẩm/biến thể. | Người dùng phải thực hiện nhập, xuất hoặc điều chỉnh qua module Kho hàng. |
| EX-PROD-04 | Sản phẩm / Phôi áo | Ẩn phôi áo khi vẫn còn hàng trong kho | Service kiểm tra tồn kho trước khi ẩn. | Hệ thống yêu cầu xuất hết hàng trước khi ẩn để tránh sai lệch kênh bán và kho. |
| EX-PROD-05 | Sản phẩm / Phôi áo | Thêm biến thể có SKU trùng | Service kiểm tra SKU đã tồn tại. | Hệ thống trả lỗi trùng SKU và không tạo biến thể. |
| EX-PROD-06 | Sản phẩm / Phôi áo | Thêm biến thể trùng màu và size trong cùng phôi áo | Service kiểm tra cặp màu/size. | Hệ thống không cho tạo biến thể trùng. |
| EX-PROD-07 | Sản phẩm / Phôi áo | Thay đổi màu, size hoặc SKU của biến thể đã có lịch sử nhập kho | Service kiểm tra lịch sử giao dịch kho. | Hệ thống không cho thay đổi các trường định danh để bảo toàn lịch sử kho. |
| EX-PROD-08 | Sản phẩm / Phôi áo | Tải ảnh phôi áo sai định dạng hoặc vượt quá 5 MB | Middleware upload chỉ chấp nhận JPG, PNG, WEBP, GIF, SVG và giới hạn kích thước. | Hệ thống từ chối tệp không hợp lệ và trả thông báo lỗi upload. |
| EX-DESIGN-01 | Thiết kế & In ấn | Canvas thiết kế không phải JSON hợp lệ | Service kiểm tra dữ liệu thiết kế trước khi lưu. | Hệ thống không lưu thiết kế và thông báo dữ liệu thiết kế không hợp lệ. |
| EX-DESIGN-02 | Thiết kế & In ấn | Canvas thiết kế không có danh sách phần tử hoặc vượt quá 200 phần tử | Service kiểm tra cấu trúc `elements` và giới hạn số lượng phần tử. | Hệ thống chặn lưu để tránh dữ liệu thiết kế lỗi hoặc quá lớn. |
| EX-DESIGN-03 | Thiết kế & In ấn | Chọn loại áo, màu áo, size hoặc vị trí in không hợp lệ | Service kiểm tra giá trị cấu hình được hỗ trợ. | Hệ thống không lưu thiết kế và thông báo trường không hợp lệ. |
| EX-DESIGN-04 | Thiết kế & In ấn | Sửa thiết kế đã đưa vào sản xuất | Service khóa sửa khi thiết kế/đơn in đã ở trạng thái sản xuất như đang in hoặc đã in. | Hệ thống từ chối sửa thiết kế để tránh thay đổi thông số sau khi xuống xưởng. |
| EX-DESIGN-05 | Thiết kế & In ấn | Cập nhật tiến độ đơn in khi thiết kế chưa được duyệt | Service kiểm tra thiết kế phải ở trạng thái đã duyệt. | Hệ thống không cho cập nhật tiến độ in. |
| EX-DESIGN-06 | Thiết kế & In ấn | Cập nhật tiến độ in bỏ qua mốc hoặc lùi trạng thái | Service chỉ cho cập nhật sang mốc kế tiếp. | Hệ thống từ chối thao tác và thông báo không thể bỏ qua hoặc lùi trạng thái. |
| EX-DESIGN-07 | Thiết kế & In ấn | Thêm sticker không có tên, không có ảnh hoặc sai loại | Controller/service kiểm tra tên, URL ảnh và loại sticker. | Hệ thống chặn lưu sticker và thông báo lỗi tương ứng. |
| EX-DESIGN-08 | Thiết kế & In ấn | Tải ảnh sticker hoặc ảnh thiết kế sai định dạng/vượt quá 5 MB | Middleware upload kiểm tra loại tệp và kích thước. | Hệ thống từ chối tệp không hợp lệ, không lưu dữ liệu lỗi. |
| EX-INV-01 | Kho hàng | Xem chi tiết biến thể không tồn tại | Service kiểm tra ID biến thể trước khi truy vấn. | Hệ thống trả thông báo không tìm thấy biến thể. |
| EX-INV-02 | Kho hàng | Ghi giao dịch kho với số lượng bằng 0 hoặc không hợp lệ | Validation kiểm tra dữ liệu giao dịch kho trước khi xử lý. | Hệ thống từ chối ghi giao dịch. |
| EX-INV-03 | Kho hàng | Xuất kho vượt quá số lượng hiện có | Service tính tồn mới và không cho tồn kho âm. | Hệ thống chặn xuất kho và thông báo số lượng hiện có không đủ. |
| EX-INV-04 | Kho hàng | Hai thao tác kho diễn ra gần như đồng thời trên cùng biến thể | Service dùng khóa bản ghi trong giao dịch cơ sở dữ liệu khi cập nhật tồn kho. | Dữ liệu tồn kho được cập nhật tuần tự, tránh ghi đè hoặc tồn âm. |
| EX-PAY-01 | Thanh toán | IPN VNPAY có chữ ký không hợp lệ | Service xác thực checksum trước khi cập nhật giao dịch. | Hệ thống từ chối IPN và không cập nhật trạng thái thanh toán. |
| EX-PAY-02 | Thanh toán | IPN MoMo có chữ ký không hợp lệ | Service xác thực chữ ký MoMo trước khi xử lý. | Hệ thống trả lỗi chữ ký IPN không hợp lệ và không cập nhật giao dịch. |
| EX-PAY-03 | Thanh toán | IPN/return có số tiền không khớp giao dịch | Service đối chiếu số tiền giao dịch với dữ liệu trong hệ thống. | Hệ thống không xác nhận thanh toán để tránh ghi nhận sai số tiền. |
| EX-PAY-04 | Thanh toán | IPN gửi lặp lại cho giao dịch đã hoàn tất | Service kiểm tra trạng thái giao dịch trước khi cập nhật. | Hệ thống không cập nhật lặp và phản hồi giao dịch đã được xác nhận. |
| EX-PAY-05 | Thanh toán | Xác nhận thu COD cho giao dịch không phải COD | Service kiểm tra phương thức thanh toán. | Hệ thống từ chối với thông báo giao dịch này không phải COD. |
| EX-PAY-06 | Thanh toán | Xác nhận thu COD khi đơn chưa hoàn tất | Service chỉ cho thu COD sau khi đơn hàng đã hoàn tất. | Hệ thống chặn xác nhận để tránh ghi nhận tiền trước khi giao hàng thành công. |
| EX-PAY-07 | Thanh toán | Xác nhận COD khi giao dịch không ở trạng thái chờ đối soát | Service chỉ cho xác nhận giao dịch COD ở trạng thái `PENDING_RECONCILIATION`. | Hệ thống không cập nhật sai trạng thái thanh toán. |
| EX-PAY-08 | Thanh toán | Cổng VNPAY/MoMo mất kết nối hoặc phản hồi không hợp lệ khi tạo/truy vấn giao dịch | Service bắt lỗi kết nối, trả lỗi 502 hoặc giữ trạng thái chờ đối soát nếu chưa đủ cơ sở kết luận. | Hệ thống không đánh dấu thanh toán thành công khi chưa có xác nhận hợp lệ. |
| EX-PROMO-01 | Khuyến mãi & Báo giá | Mã khuyến mãi trùng | Service xử lý lỗi trùng dữ liệu. | Hệ thống không tạo/cập nhật mã trùng và thông báo mã khuyến mãi đã tồn tại. |
| EX-PROMO-02 | Khuyến mãi & Báo giá | Giảm phần trăm nhỏ hơn hoặc bằng 0, hoặc vượt quá 100% | Service kiểm tra giá trị giảm theo phần trăm. | Hệ thống chặn lưu và thông báo giá trị phần trăm không hợp lệ. |
| EX-PROMO-03 | Khuyến mãi & Báo giá | Giảm số tiền cố định nhỏ hơn hoặc bằng 0 | Service kiểm tra giá trị giảm cố định. | Hệ thống chặn lưu mã khuyến mãi. |
| EX-PROMO-04 | Khuyến mãi & Báo giá | Ngày bắt đầu sau ngày kết thúc | Service kiểm tra khoảng ngày áp dụng. | Hệ thống từ chối lưu và thông báo ngày áp dụng không hợp lệ. |
| EX-PROMO-05 | Khuyến mãi & Báo giá | Xóa mã khuyến mãi đã có lượt sử dụng hoặc đã gắn với đơn hàng | Service kiểm tra `usedCount` và liên kết đơn hàng trước khi xóa. | Hệ thống không cho xóa, đề xuất chuyển mã sang trạng thái tạm dừng. |
| EX-PROMO-06 | Khuyến mãi & Báo giá | Tạo mức giá số lượng lớn trùng số lượng tối thiểu trong cùng sản phẩm | Service kiểm tra trùng `minQty`. | Hệ thống chặn lưu và thông báo số lượng tối thiểu đã tồn tại. |
| EX-PROMO-07 | Khuyến mãi & Báo giá | Cấu hình giá số lượng lớn có phần trăm giảm không tăng hợp lý theo ngưỡng | Service kiểm tra thứ tự các mức giảm. | Hệ thống không lưu cấu hình gây sai lệch báo giá. |
| EX-ACC-01 | Tài khoản | Tạo khách hàng hoặc nhân sự với email đã tồn tại | Service kiểm tra email trước khi tạo và xử lý lỗi trùng. | Hệ thống không tạo tài khoản trùng email và thông báo email đã được sử dụng. |
| EX-ACC-02 | Tài khoản | Nhập email sai định dạng | Validation kiểm tra định dạng email. | Hệ thống chặn lưu và báo lỗi dữ liệu đầu vào. |
| EX-ACC-03 | Tài khoản | Nhập họ tên quá ngắn hoặc chỉ chứa khoảng trắng | Validation kiểm tra độ dài và nội dung sau khi trim. | Hệ thống yêu cầu nhập họ tên hợp lệ. |
| EX-ACC-04 | Tài khoản | Nhập số điện thoại không hợp lệ | Validation kiểm tra độ dài và định dạng số điện thoại. | Hệ thống chặn lưu tài khoản. |
| EX-ACC-05 | Tài khoản | Gán vai trò nhân sự không nằm trong danh sách hỗ trợ | Validation chỉ cho phép `ADMIN`, `WAREHOUSE`, `PRODUCTION`. | Hệ thống từ chối vai trò không hợp lệ. |
| EX-ACC-06 | Tài khoản | Khóa tài khoản đã ở trạng thái mục tiêu | Service kiểm tra trạng thái hiện tại trước khi cập nhật. | Hệ thống không cập nhật lặp và thông báo tài khoản đã ở trạng thái đó. |

Các trường hợp ngoại lệ trên cho thấy hệ thống không chỉ kiểm tra dữ liệu tại giao diện mà còn có lớp kiểm tra ở backend. Đối với các thao tác quan trọng như tạo đơn, hủy đơn, cập nhật trạng thái, ghi giao dịch kho và xác nhận thanh toán, hệ thống sử dụng giao dịch cơ sở dữ liệu để bảo toàn tính nhất quán. Khi xảy ra lỗi trong quá trình xử lý, dữ liệu đã thay đổi tạm thời được hoàn tác, tránh tình trạng đơn hàng được tạo nhưng tồn kho không khớp, hoặc thanh toán được cập nhật nhưng trạng thái đơn hàng chưa đồng bộ.

Kết quả kiểm thử ngoại lệ cho thấy hệ thống có khả năng tự bảo vệ trước dữ liệu không hợp lệ, thao tác sai quy trình và lỗi tích hợp thanh toán. Các thông báo lỗi được trả về rõ ràng, giúp người quản trị nhận biết nguyên nhân và thực hiện lại thao tác đúng nghiệp vụ.
