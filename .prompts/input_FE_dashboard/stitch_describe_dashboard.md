# Mô tả đưa vào Google Stitch để thiết kế trang chủ Admin TeeStudio

## Prompt chính

Thiết kế giao diện **trang chủ Admin Dashboard cho TeeStudio**, một website thương mại điện tử bán áo tự thiết kế và tùy chỉnh thiết kế trực tuyến. Đây là phân hệ quản trị/back-office dùng cho Admin, nhân viên kho, nhân viên xưởng in, kế toán và quản lý vận hành. Giao diện cần đồng nhất với trang chủ khách hàng hiện có: phong cách **light minimalist**, sáng, sạch, hiện đại, nhiều khoảng trắng hợp lý, card trắng trên nền xám xanh rất nhạt, màu nhận diện chính là **Sky Blue `#0ea5e9`**.

Không thiết kế theo kiểu landing page. Đây phải là một dashboard quản trị thật sự, hiển thị dữ liệu vận hành, hàng chờ xử lý, cảnh báo và các thao tác nhanh.

## Bối cảnh nghiệp vụ

TeeStudio là hệ thống bán áo custom print-on-demand. Khách hàng có thể chọn loại áo, màu, size, upload logo/hình ảnh, thêm chữ, kéo thả trên canvas và đặt hàng. Khi khách chốt đơn, hệ thống không chỉ lưu ảnh preview tĩnh mà phải lưu toàn bộ dữ liệu thiết kế dạng JSON: layer, tọa độ x/y, kích thước, góc xoay, font chữ, màu sắc, URL ảnh gốc từ Cloudinary. Nhân viên xưởng in mở đơn hàng trong admin để phục dựng thiết kế, kiểm tra layer và xuất thông số in theo centimet.

Hệ thống hoạt động **100% online**, không có cửa hàng vật lý. Vì vậy UI admin không được có module “Cửa hàng”, “Chi nhánh”, “Chuyển cửa hàng”. Thay vào đó dùng khái niệm **Kho online**, tồn kho theo biến thể áo và phiếu nhập/xuất kho.

Database cần được hiểu theo mô hình đã hiệu chỉnh:

- Có sản phẩm gốc `HangHoa`: áo thun, áo polo, hoodie.
- Có biến thể sản phẩm `ChiTietHangHoa`: màu sắc, chất liệu, size, giá vốn, giá bán.
- Có tồn kho `TonKho` theo từng biến thể áo, không gắn `cuaHangId`.
- Có phiếu kho `PhieuKho` và `ChiTietPhieuKho`: nhập kho, xuất kho, điều chỉnh kho; không có chuyển cửa hàng.
- Có khách hàng `KhachHang`, chương trình khuyến mãi `KhuyenMai`, nhân viên `NhanVien`, đơn bán hàng `DonBanHang`, chi tiết đơn `ChiTietDonBanHang`, hóa đơn `HoaDonBan`, phiếu thu chi `PhieuThuChi`.
- Cần bổ sung module **Thiết kế đồ họa** với bảng/logic `ThietKe`: lưu canvas JSON, preview URL, danh sách asset Cloudinary, thông số quy đổi sang kích thước thật, trạng thái duyệt thiết kế, ghi chú cho xưởng in.
- Cần bổ sung module **Báo giá động** gồm cấu hình phụ phí gia công và phụ phí kích thước:
  - `PhuPhiGiaCong`: in lụa, in PET, in DTG, thêu, ép nhiệt; giá theo kiểu gia công.
  - `PhuPhiKichThuoc`: phụ phí theo diện tích logo/hình in, ví dụ nhỏ, vừa, lớn, extra large.
  - Có thể có bậc giá theo số lượng để tính sỉ.

## Phong cách thiết kế cần dùng

Sử dụng phong cách giống frontend khách hàng:

- Nền trang: `#f1f5f9`.
- Nền card/panel/header/sidebar: `#ffffff`.
- Nền phụ/input/strip: `#f8fafc`.
- Primary: `#0ea5e9`.
- Primary dark: `#0284c7`.
- Primary light: `#e0f2fe`.
- Primary mid: `#bae6fd`.
- Accent phụ: `#6366f1`, chỉ dùng ít cho biểu đồ hoặc module thiết kế.
- Success: `#10b981`.
- Warning: `#f59e0b`.
- Text chính: `#0f172a`.
- Text phụ: `#475569` hoặc `#64748b`.
- Text muted: `#94a3b8`.
- Border: `#e2e8f0`.

Font chính là **Inter**. Tiêu đề lớn 26-28px, font-weight 800. Tiêu đề card 15-18px, font-weight 700. Body 13-14px, màu xám slate. Label/badge 10-12px, font-weight 700.

Card bo góc 16-20px, viền mảnh `#e2e8f0`, shadow nhẹ. Button/input bo góc 8-10px. Không dùng dark theme, không dùng gradient đậm, không dùng shadow nặng.

## Layout tổng thể Admin

Tạo layout dashboard gồm:

### 1. Sidebar trái

Sidebar rộng khoảng 250-270px, nền trắng, border-right `#e2e8f0`, cố định bên trái trên desktop. Trên mobile/tablet có thể chuyển thành drawer.

Phần đầu sidebar có logo TeeStudio:

- Icon vuông xanh `#0ea5e9`, bo góc 8px, chữ T màu trắng.
- Text “TeeStudio Admin”, font-weight 800, màu `#0f172a`.

Menu sidebar dùng icon line mảnh, stroke màu `#475569`. Item active:

- Nền `#e0f2fe`.
- Text/icon `#0ea5e9`.
- Font-weight 700.
- Có border-left `3px solid #0ea5e9`.
- Radius 8px.

Menu chính cần có các chức năng:

1. **Tổng quan**
2. **Đơn hàng & Sản xuất**
3. **Thiết kế cần xử lý**
4. **Sản phẩm & Biến thể**
5. **Kho online**
6. **Báo giá động**
7. **Khuyến mãi**
8. **Khách hàng**
9. **Thanh toán & Công nợ**
10. **Báo cáo**
11. **Nhân viên & Phân quyền**
12. **Cấu hình hệ thống**

Không có menu “Cửa hàng” hoặc “Chi nhánh”.

### 2. Topbar

Topbar cao 64px, nền trắng, border-bottom `#e2e8f0`, nằm phía trên vùng main.

Nội dung topbar:

- Ô search nền `#f8fafc`, border `#e2e8f0`, radius 10px, placeholder: “Tìm mã đơn, khách hàng, mã thiết kế, sản phẩm...”
- Nút icon thông báo, kích thước 40x40, nền `#f1f5f9`, border `#e2e8f0`.
- Nút quick action dạng primary: “Tạo nhanh”.
- Avatar admin, tên “Admin TeeStudio”, role nhỏ “Quản trị viên”.

### 3. Main content

Main content nền `#f1f5f9`, padding 24px. Không giới hạn quá hẹp; dashboard cần tận dụng chiều ngang.

Phần đầu trang:

- Title: “Tổng quan vận hành”
- Subtitle: “Theo dõi đơn hàng thiết kế, sản xuất, kho online và doanh thu trong ngày.”
- Bên phải có cụm nút:
  - Primary button: “Tạo sản phẩm”
  - Secondary button: “Nhập kho”
  - Secondary button: “Cấu hình báo giá”
  - Text button/link: “Xuất báo cáo”

Button primary:

- Background `#0ea5e9`, text trắng, height 40px, radius 8px, font-weight 600.

Button secondary:

- Background `#f1f5f9`, border `#e2e8f0`, text `#475569`, height 40px, radius 8px.

## Nội dung trang chủ Admin cần hiển thị

### 1. Dãy KPI cards

Hiển thị 6 card thống kê dạng grid responsive. Desktop 6 hoặc 3x2, tablet 2 cột, mobile 1 cột.

Các card:

1. **Doanh thu hôm nay**
   - Số mẫu: `18.450.000đ`
   - Badge xanh: `+12%`
   - Icon line: biểu đồ/doanh thu.

2. **Đơn mới**
   - Số mẫu: `42`
   - Mô tả: “8 đơn cần xác nhận”
   - Badge primary.

3. **Thiết kế chờ duyệt**
   - Số mẫu: `9`
   - Mô tả: “Cần kiểm tra layer và ảnh upload”
   - Badge warning.

4. **Đang sản xuất**
   - Số mẫu: `17`
   - Mô tả: “Đang in / thêu / đóng gói”
   - Badge indigo hoặc primary.

5. **Cảnh báo tồn kho**
   - Số mẫu: `23 biến thể`
   - Mô tả: “Dưới mức tồn tối thiểu”
   - Badge cam.

6. **Thanh toán cần đối soát**
   - Số mẫu: `6`
   - Mô tả: “VNPAY / chuyển khoản”
   - Badge xanh hoặc vàng.

Mỗi KPI card có nền trắng, radius 16px, border `#e2e8f0`, shadow nhẹ, icon nằm trong ô/circle nền `#e0f2fe`.

### 2. Thanh trạng thái quy trình đơn hàng

Thiết kế một panel ngang nền trắng hoặc `#f8fafc`, radius 20px, border mảnh. Bên trong có các bước vận hành giống workflow:

1. Chờ xác nhận
2. Chờ duyệt thiết kế
3. Xuất thông số in
4. Đang sản xuất
5. Đóng gói
6. Giao hàng
7. Hoàn tất

Mỗi bước có số lượng đơn đang nằm ở trạng thái đó. Dùng icon tròn, connector line màu `#cbd5e1`. Bước quan trọng “Chờ duyệt thiết kế” và “Xuất thông số in” dùng màu primary để nhấn mạnh khác biệt của dự án.

### 3. Hàng chờ “Thiết kế cần xử lý”

Đây là panel quan trọng nhất trên dashboard. Bố trí dạng card lớn chiếm khoảng 2/3 chiều ngang desktop.

Header panel:

- Title: “Thiết kế cần xử lý”
- Subtitle: “Các đơn custom cần kiểm tra canvas JSON, asset Cloudinary và xuất thông số in.”
- Filter pill: “Tất cả”, “Chờ duyệt”, “Cần sửa”, “Sẵn sàng in”, “Gấp”.
- Button primary nhỏ: “Mở Design Studio”

Bảng/list bên trong gồm các cột:

- Mã đơn: `DH-20260522-001`
- Khách hàng
- Sản phẩm: ví dụ “Áo thun đen - Size M”
- Preview thiết kế: thumbnail áo nhỏ
- Loại gia công: In PET / In lụa / Thêu
- Số lượng
- Trạng thái thiết kế
- Hạn xử lý
- Hành động

Các hành động dạng button/icon:

- “Xem thiết kế”
- “Xuất thông số in”
- “Duyệt”
- Menu ba chấm cho thao tác phụ

Trạng thái thiết kế dùng tag pill:

- Chờ duyệt: nền `#fef9c3`, text `#ca8a04`.
- Sẵn sàng in: nền `#dcfce7`, text `#16a34a`.
- Cần sửa: nền `#fff7ed`, text `#ea580c`.
- Đã xuất file: nền `#e0f2fe`, text `#0284c7`.

### 4. Card “Bản thiết kế nổi bật / Preview phục dựng”

Bên phải hàng chờ thiết kế, tạo một card preview để Stitch hiểu Design Studio là trọng tâm.

Card gồm:

- Hình mockup áo nền pastel giống trang khách hàng.
- Layer preview: logo, chữ, vùng in nét đứt.
- Thông tin:
  - Mã thiết kế: `TK-1028`
  - Canvas JSON: “Đã lưu 8 layers”
  - Asset Cloudinary: “3 ảnh gốc”
  - Kích thước thật: “Logo trước ngực 8.5 x 6.2 cm”
  - Vị trí: “Cách cổ áo 10 cm”
- Nút primary: “Mở bản vẽ”
- Nút secondary: “Xuất thông số”

Thiết kế card này nên dùng tone xanh nhạt/tím nhạt, nhưng vẫn nằm trong nền trắng, không quá màu mè.

### 5. Panel “Tồn kho cần chú ý”

Card hoặc table nhỏ hiển thị các biến thể áo sắp hết:

- Áo thun Cotton 100% - Đen - Size M: còn 12
- Áo Polo cá sấu - Trắng - Size L: còn 8
- Hoodie nỉ dày - Xám - Size XL: còn 5

Mỗi dòng có progress bar mảnh hoặc indicator màu cam/đỏ nhẹ. Có button “Tạo phiếu nhập” hoặc “Xem kho”.

Vì hệ thống online, không hiển thị cửa hàng/chi nhánh trong bảng tồn kho.

### 6. Panel “Báo giá động”

Card thể hiện admin có thể cấu hình công thức tính giá cho áo custom.

Nội dung:

- Phụ phí gia công đang bật:
  - In PET: `+25.000đ`
  - In lụa: `+18.000đ`
  - Thêu: `+45.000đ`
- Phụ phí kích thước:
  - Logo nhỏ: `0đ`
  - Logo vừa: `+10.000đ`
  - Logo lớn: `+20.000đ`
- Bậc giá số lượng:
  - 10-49 áo: giảm 5%
  - 50-99 áo: giảm 10%
  - 100+ áo: giảm 15%

Có nút primary “Cập nhật công thức” và link “Mô phỏng báo giá”.

### 7. Báo cáo nhanh

Tạo khu vực gồm 2-3 panel:

- Biểu đồ “Doanh thu 7 ngày gần nhất”: line chart màu primary `#0ea5e9`.
- Biểu đồ “Đơn theo trạng thái”: donut/bar chart với màu pastel.
- Card “Khuyến mãi đang chạy”: tên khuyến mãi, thời gian, số đơn áp dụng, doanh thu tạo ra.

Biểu đồ nên đơn giản, sạch, ít màu, không dùng nền tối.

### 8. Hoạt động gần đây

Card “Nhật ký vận hành” hiển thị timeline:

- “Nhân viên xưởng đã xuất thông số in cho DH-20260522-001”
- “Kho đã nhập 120 áo thun đen size M”
- “Admin cập nhật phụ phí thêu”
- “Kế toán đối soát thanh toán VNPAY”

Timeline dùng dot màu primary/success/warning, text 13px, thời gian màu `#94a3b8`.

## Mô tả các trang chức năng liên quan

Stitch nên tạo cảm giác đây là một hệ admin hoàn chỉnh. Nếu có thể thiết kế thêm các màn hình phụ hoặc trạng thái trong cùng layout, hãy bố trí như sau:

### Trang Đơn hàng & Sản xuất

Layout:

- Header: “Đơn hàng & Sản xuất”
- Filter row dạng pill: “Tất cả”, “Chờ xác nhận”, “Chờ duyệt thiết kế”, “Đang in”, “Đóng gói”, “Giao hàng”, “Hoàn tất”, “Đã hủy”.
- Search theo mã đơn, số điện thoại, tên khách.
- Table lớn.

Cột table:

- Mã đơn
- Khách hàng
- Sản phẩm/biến thể
- Số lượng
- Tổng tiền
- Thanh toán
- Trạng thái sản xuất
- Ngày đặt
- Hành động

Khi click một đơn, mở drawer chi tiết bên phải với tabs:

1. Thông tin đơn
2. Thiết kế
3. Sản xuất
4. Thanh toán
5. Lịch sử

Tab Thiết kế hiển thị preview canvas, JSON/layer summary, Cloudinary assets và nút “Xuất thông số in”.

### Trang Thiết kế cần xử lý

Đây là trang chuyên cho xưởng in.

Layout:

- Bên trái: danh sách thiết kế dạng table/card.
- Bên giữa: preview áo/canvas lớn.
- Bên phải: inspector panel.

Inspector panel gồm:

- Danh sách layers: ảnh, chữ, sticker.
- Tọa độ web: x, y, width, height, rotate.
- Thông số thật: cm từ cổ áo, cm từ mép áo, kích thước logo.
- Asset gốc từ Cloudinary.
- Loại gia công đề xuất.
- Ghi chú xưởng.

Button:

- Primary: “Duyệt thiết kế”
- Secondary: “Yêu cầu khách chỉnh sửa”
- Secondary: “Xuất thông số in”
- Text/destructive nhẹ: “Tạm giữ”

### Trang Sản phẩm & Biến thể

Quản lý `HangHoa`, `DanhMucHang`, `ChiTietHangHoa`.

Layout:

- Header: “Sản phẩm & Biến thể”
- Button primary: “Thêm sản phẩm”
- Button secondary: “Thêm biến thể”
- Table hoặc grid gồm:
  - Mã hàng
  - Tên áo
  - Danh mục
  - Chất liệu
  - Màu sắc
  - Size
  - Giá vốn
  - Giá bán
  - Trạng thái

Biến thể áo nên có swatch màu nhỏ, tag size, tag chất liệu.

### Trang Kho online

Quản lý `TonKho`, `PhieuKho`, `ChiTietPhieuKho`, `NhaCungCap`.

Layout:

- Header: “Kho online”
- KPI nhỏ: Tổng tồn, Sắp hết hàng, Phiếu nhập tháng này, Phiếu xuất tháng này.
- Table tồn kho theo biến thể.
- Nút “Tạo phiếu nhập”, “Tạo phiếu xuất”, “Điều chỉnh tồn”.
- Drawer/form tạo phiếu có supplier, ngày lập, danh sách sản phẩm, số lượng, đơn giá, ghi chú.

Không có trường cửa hàng nguồn/cửa hàng đích.

### Trang Báo giá động

Quản lý cấu hình tính giá áo custom.

Layout:

- Header: “Báo giá động”
- Card “Công thức đang áp dụng”.
- Table `PhuPhiGiaCong`: tên phương pháp, mô tả, giá cơ bản, đơn vị tính, trạng thái.
- Table `PhuPhiKichThuoc`: tên mức, diện tích từ/đến, phụ phí, trạng thái.
- Card “Bậc giá số lượng”.
- Simulator bên phải:
  - Chọn áo
  - Chọn số lượng
  - Chọn loại gia công
  - Chọn kích thước logo
  - Kết quả tạm tính

Button primary: “Lưu cấu hình”. Button secondary: “Thêm phụ phí”.

### Trang Khuyến mãi

Quản lý `KhuyenMai`.

Hiển thị danh sách chương trình khuyến mãi với:

- Mã KM
- Tên chương trình
- Loại giảm giá
- Giá trị giảm
- Ngày bắt đầu/kết thúc
- Trạng thái
- Số đơn đã áp dụng

Tag trạng thái: Đang chạy, Sắp diễn ra, Đã kết thúc, Tạm tắt.

### Trang Khách hàng

Quản lý `KhachHang`.

Hiển thị:

- Tên khách
- Số điện thoại
- Email
- Điểm tích lũy
- Tổng doanh số
- Số đơn
- Trạng thái

Khi mở chi tiết: thông tin cá nhân, lịch sử đơn hàng, thiết kế đã tạo, công nợ/thanh toán nếu có.

### Trang Thanh toán & Công nợ

Quản lý `HoaDonBan`, `PhieuThuChi`, thanh toán VNPAY.

Hiển thị:

- Hóa đơn
- Mã đơn
- Khách hàng
- Tổng tiền
- Đã thu
- Còn nợ
- Hình thức thanh toán
- Trạng thái đối soát

Có filter: VNPAY, chuyển khoản, tiền mặt, còn nợ, đã thu đủ.

### Trang Báo cáo

Dashboard báo cáo nâng cao:

- Doanh thu theo ngày/tháng.
- Top sản phẩm bán chạy.
- Top loại gia công được chọn.
- Tồn kho xuất nhập.
- Hiệu quả khuyến mãi.
- Tỷ lệ đơn custom cần sửa thiết kế.

### Trang Nhân viên & Phân quyền

Quản lý nhân viên và role:

- Admin
- Kho
- Xưởng in
- Kế toán
- Quản lý

Nhân viên không gắn cửa hàng. Chỉ gắn phòng ban/role/trạng thái.

## Component style chi tiết

### Button

Primary:

- Nền `#0ea5e9`
- Text trắng
- Border none
- Height 40px
- Radius 8px
- Font-weight 600

Secondary:

- Nền `#f1f5f9`
- Border `1px solid #e2e8f0`
- Text `#475569`
- Height 40px
- Radius 8px

Text button:

- Không nền
- Text `#0ea5e9`
- Font-weight 600

Icon button:

- 40x40
- Radius 8px
- Nền `#f8fafc` hoặc `#f1f5f9`
- Border `#e2e8f0`
- Icon line màu `#475569`

### Input và filter

Input/search:

- Height 40px
- Background `#f8fafc`
- Border `#e2e8f0`
- Radius 10px
- Placeholder `#94a3b8`

Filter pill:

- Padding `6px 16px`
- Radius 20px
- Active: nền `#e0f2fe`, border `#0ea5e9`, text `#0284c7`, font-weight 700
- Inactive: nền trắng, border `#e2e8f0`, text `#64748b`, font-weight 500

### Table

Table nền trắng, header nền `#f8fafc`, text header màu `#475569`, font-weight 700, row border `#f1f5f9`. Row hover nền `#f8fafc`. Action button trong table nhỏ, radius 6-8px.

### Card

Card nền trắng, radius 16px hoặc 20px, border `#e2e8f0`, shadow nhẹ `0 1px 4px rgba(0,0,0,0.05)`. Hover nâng nhẹ `translateY(-2px)` hoặc đổi border sang `#bae6fd`.

### Badge/tag

Dùng pill nhỏ:

- Font-size 10-12px
- Font-weight 700
- Radius 20px
- Padding `2px 8px` hoặc `3px 10px`

Màu tag:

- Success: nền `#dcfce7`, text `#16a34a`
- Primary: nền `#e0f2fe`, text `#0284c7`
- Warning: nền `#fef9c3`, text `#ca8a04`
- Orange: nền `#fff7ed`, text `#ea580c`
- Muted: nền `#f1f5f9`, text `#64748b`

## Responsive

Desktop:

- Sidebar trái cố định.
- Dashboard grid nhiều cột.
- Hàng chờ thiết kế chiếm 2/3, preview/side card chiếm 1/3.

Tablet:

- Sidebar có thể thu gọn.
- KPI 2-3 cột.
- Panel xếp thành 1 cột hoặc 2 cột.

Mobile:

- Sidebar chuyển thành drawer.
- Topbar giữ search ngắn hoặc icon search.
- KPI 1 cột.
- Table chuyển thành card list.

## Điều cần tránh

- Không thiết kế dark theme.
- Không tạo hero marketing lớn.
- Không dùng menu “Cửa hàng”, “Chi nhánh”, “Chuyển cửa hàng”.
- Không dùng màu tím làm màu chủ đạo.
- Không dùng shadow quá nặng hoặc gradient rực.
- Không làm giao diện quá trống như landing page; admin cần nhiều thông tin nhưng vẫn gọn gàng.
- Không chỉ hiển thị bán hàng cơ bản; phải thể hiện rõ đặc thù Design Studio, canvas JSON, Cloudinary asset, xuất thông số in và báo giá động.

## Kết quả mong muốn từ Stitch

Tạo một giao diện Admin Dashboard hoàn chỉnh cho TeeStudio với:

- Sidebar đầy đủ module quản trị.
- Topbar có search, notification, quick action, avatar.
- Dashboard có KPI, quy trình đơn hàng, hàng chờ thiết kế, preview bản vẽ, cảnh báo tồn kho, báo giá động, báo cáo nhanh và nhật ký vận hành.
- Style đồng bộ với frontend khách hàng: sáng, trắng, xanh sky blue, Inter, card bo góc, viền mảnh, shadow nhẹ, button và pill filter giống hệ hiện có.
- Nội dung tiếng Việt, phù hợp dự án web bán áo tự thiết kế trực tuyến.
