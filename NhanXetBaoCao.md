# Nhận xét Báo cáo Đồ án Tốt nghiệp — TeeStudio

*Vai trò: giảng viên phản biện/chấm báo cáo. Phạm vi: chỉ xét nội dung, số liệu, sơ đồ, bảng — không xét lỗi trình bày/format.*

## ⚠️ Vấn đề tổng quát nghiêm trọng nhất (đọc trước khi sửa từng chương)

Báo cáo hiện tại là **bản ghép từ ít nhất 3 nguồn khác nhau chưa được thống nhất**:
1. Phần thật của đề tài — website bán áo thun tự thiết kế (TeeStudio) — nằm ở mục 1.3, 1.4, 2.2 (Công nghệ sử dụng).
2. Một đồ án **bán sách trực tuyến** (PHP/MySQL thuần) — chiếm gần như toàn bộ Chương 2.3 (mô tả nghiệp vụ, actor), Chương 4 (thử nghiệm), Chương 5 (kết luận), và Tài liệu tham khảo.
3. Một đồ án **bánh kem thiết kế theo yêu cầu** — lộ ra ở mục 1.1 và 1.2 (chữ "bánh", "thợ làm bánh").

Hệ quả: **Chương 2.3, 3.1.3, 3.1.4, Chương 4, Chương 5 và Tài liệu tham khảo mô tả một website khác, không phải TeeStudio.** Đây không phải lỗi nhỏ — nếu nộp nguyên trạng, giảng viên phản biện sẽ lập tức phát hiện đề tài "áo thun tự thiết kế" nhưng test-case lại đi tìm kiếm sách "Đắc Nhân Tâm", kết luận lại nói "Xây dựng Website bán sách trực tuyến", và hướng phát triển đề xuất "chuyển từ PHP Native sang Laravel" — trong khi cả đồ án dùng Next.js/Node.js chứ không có dòng PHP nào. Cần rà lại **toàn bộ** các chương này trước khi nộp, không chỉ sửa câu chữ.

---

## Chương 1: Giới thiệu

**Đã có, dùng được:**
- 1.3 (Nội dung/phạm vi thực hiện) và 1.4 (2 bảng kết quả chức năng/phi chức năng) mô tả đúng, khá chi tiết và khớp với kiến trúc thật: Next.js + Konva.js (Design Studio), Node/Express, MySQL 8.0 lưu JSON tọa độ thiết kế, Cloudinary, VNPAY Sandbox + IPN, Docker/CI-CD, JWT/Bcrypt.

**Vấn đề nội dung:**
- **1.1 "Đặt vấn đề và mục tiêu":** đoạn mở đầu nói về "kinh doanh **bánh** thiết kế theo yêu cầu" và "thợ làm **bánh**" — sai hoàn toàn chủ đề (đề tài là áo thun, không phải bánh). Đây là câu văn còn sót lại từ một đồ án mẫu khác, phải viết lại toàn bộ đoạn cho đúng ngữ cảnh "khách hàng thiết kế áo" thay vì "khách hàng thiết kế bánh".
- **1.2 "Ánh xạ kích thước không gian ảo sang thực tế":** cùng lỗi — "thợ làm bánh có thể thi công chính xác" phải sửa thành thợ in/xưởng in áo.
- **1.4 Bảng phi chức năng, mục "Hiệu năng":** ghi "Redis" làm cache giảm độ trễ API — **kiểm tra code thực tế: `backend/package.json` không có package Redis/ioredis nào, và từ "Redis" duy nhất trong toàn bộ backend chỉ là 1 dòng comment giả định ("nếu lưu ở DB/Redis") ở `auth.controller.js`, không phải code đang chạy.** Đây là claim không đúng sự thật, phải bỏ hoặc đổi thành mô tả cơ chế cache/tối ưu thật đang dùng (ví dụ Zustand ở client, không có cache phía server).
- **1.4 Bảng phi chức năng, mục CI/CD/Docker:** claim "đóng gói 4 dịch vụ qua docker-compose.yml" và "GitHub Actions tự động deploy" — **rà toàn bộ repo không tìm thấy bất kỳ `Dockerfile`, `docker-compose*.yml`, hay thư mục `.github/workflows` nào.** Nếu tính năng này chưa làm, phải bỏ khỏi bảng kết quả đạt được (đưa xuống "hướng phát triển" ở Chương 5 thay vì liệt kê như đã hoàn thành), tránh bị hỏi vặn lúc bảo vệ.
- **Thiếu:** không có mục nào nhắc đến tính năng **AI Trợ lý (Google Gemini)** — trong code có hẳn `backend/src/modules/ai-design/ai-design.service.js` gọi Gemini để tự sinh bố cục chữ/tự sắp xếp phần tử trên canvas. Đây là điểm nhấn khác biệt của đồ án, nên được đưa vào mục tiêu/phạm vi ở Chương 1 chứ không nên bỏ sót.
- **1.3.2 Phạm vi:** ghi "chỉ giới hạn dòng áo phôi cơ bản" — kiểm tra `Database_main.sql` bảng `Product` thấy hệ thống có 3 loại: **áo thun (tshirt), áo hoodie, áo polo** — nên nói rõ phạm vi gồm những dòng sản phẩm nào thay vì gọi chung chung "áo phôi cơ bản" (dễ hiểu nhầm là chỉ có 1 loại áo).

## Chương 2: Phương pháp thực hiện

**Đã có, dùng được:**
- 2.2 "Công nghệ sử dụng" viết tốt, đúng, chi tiết, khớp gần như hoàn toàn với `package.json` thật (Next.js, Tailwind, Konva.js, Zustand, Express, JWT, Bcrypt, MySQL 8.0, Cloudinary, VNPAY). Đây là phần được viết cẩn thận nhất trong toàn báo cáo, nên giữ nguyên văn phong này khi viết lại các chương khác.

**Vấn đề nội dung:**
- **2.1 "Các hệ thống tương tự":** mục 2.1.1 ghi "Website Ranus.vn" — đây là **website bánh kem thiết kế theo yêu cầu thật ngoài đời**, không liên quan gì đến website bán áo. Mục 2.1.2 chỉ ghi trống "Website" không có tên. Toàn bộ mục 2.1 chưa được viết — cần khảo sát 2 website thật đang bán áo thun tự thiết kế/in theo yêu cầu (ví dụ các sàn in áo theo yêu cầu tại VN) rồi phân tích ưu/nhược điểm, khớp với hướng tiếp cận của đề tài.
- **2.2:** thiếu 2 khoản đã dùng thật trong code nhưng chưa được liệt kê: **MoMo** (có `momo.service.js`, migration `20260628_integrate_momo_payments.sql`, enum `PAYMENT_METHOD` gồm cả MOMO — không chỉ VNPAY) và **Google Gemini API** (AI Trợ lý). Nên bổ sung 2 mục này.
- **2.3.1 "Mô tả nghiệp vụ":** cả 3 mục con (2.3.1.1 Tổng quan nghiệp vụ, 2.3.1.2 Chức năng Khách hàng, 2.3.1.3 Chức năng Quản trị viên) đang **gần như trống** — chỉ có tiêu đề và 1 chữ lửng ("Website ", "Khách ", "Quản ") rồi dừng, chưa viết nội dung thật.
- **2.3.2 "Quy trình mua hàng / xử lý đơn hàng":** chỉ có dòng "Mô tả: " để trống, và **2 sơ đồ Hình 21, Hình 22 (flowchart quy trình) chưa được chèn vào file** (chỉ có caption, không có hình — kiểm tra XML xác nhận không có object hình ảnh nào gắn ở đây).
- **2.3.3 "Sơ đồ chức năng tổng quát" (Hình 24):** cũng chỉ có caption, **không có hình**.
- **2.3.4 "Sơ đồ use case tổng quát" (Hình 25):** có hình (ảnh nhúng thật), nhưng **bảng mô tả Actor bên dưới sai hoàn toàn**: actor "Khách hàng" được mô tả là "tìm kiếm, xem thông tin **sách** và đặt mua **sách**", actor Admin là "quản lý kho **sách**, danh mục, **tác giả**" — 100% là mô tả của website bán sách, phải viết lại cho đúng nghiệp vụ áo thun (xem thiết kế, tùy chỉnh canvas, đặt áo...).
- **Thiếu actor quan trọng:** bảng chỉ liệt kê 2 actor (Khách hàng, Admin), nhưng hệ thống thật có **4 role trong `backend/src/common/constants/roles.js`: `CUSTOMER`, `ADMIN`, `WAREHOUSE` (kho), `PRODUCTION` (xưởng sản xuất/in)**. Role WAREHOUSE/PRODUCTION đang được dùng thật (liên quan tính năng "xuất thông số in cho xưởng" mới thêm gần đây). Sơ đồ use case tổng quát và bảng actor phải bổ sung 2 actor này, nếu không sẽ bị hỏi "vậy ai xử lý khâu in ấn/kho?" lúc bảo vệ.
- **"Danh sách các Use Case phân hệ Khách hàng/Admin":** chỉ có 2 dòng tiêu đề, **chưa liệt kê use case nào cả**.

## Chương 3: Thiết kế

**Đã có, dùng được:**
- 3.2.1 "Sơ đồ use-case chức năng quản lý đặt hàng" (Hình 33) có hình thật và bảng mô tả use case chi tiết (pre/post-condition, luồng chính/phụ) viết khá bài bản, đúng văn phong cần có cho 1 use case chi tiết.

**Vấn đề nội dung:**
- **3.1.1 "Sơ đồ lớp tổng quát" (Hình 31):** chỉ có caption, **không có hình** (class diagram chưa được vẽ/chèn).
- **3.1.2 "Thiết kế CSDL – ERD" (Hình 32):** chỉ có caption và 2 dòng chú thích ký hiệu (PK/FK/K/U/M), **không có hình ERD thật nào được chèn**. Đây là sơ đồ bắt buộc phải có với 1 báo cáo có phần CSDL — cần vẽ ERD thật từ `Database_main.sql` (Account, CustomerOrder, OrderItem, ProductVariant, CustomDesign, Payment, Promotion, UserAddress, OrderHistory, OrderProduction, InventoryTransaction, BulkPricing...).
- **3.1.3 "Mô tả các bảng dữ liệu":** chỉ mô tả **2 bảng** là `NGUOIDUNG` và `DONHANG`, với tên cột tiếng Việt kiểu cũ (`MaNguoiDung`, `TenDangNhap`, `HoTen`...) — **không khớp với schema thật** (bảng thật tên là `Account`, `CustomerOrder`... cột tiếng Anh camelCase như `orderCode`, `totalAmount`, `paymentType`, `depositAmount`, `codAmount`...). Ngoài ra hệ thống thật có rất nhiều bảng khác chưa được mô tả: `OrderItem`, `CustomDesign` (lưu JSON tọa độ thiết kế — chính là phần lõi của đồ án!), `Payment`, `ProductVariant`, `Product`, `Promotion`, `BulkPricing`... Đây là phần thiếu nghiêm trọng nhất về mặt kỹ thuật vì `CustomDesign` là bảng thể hiện rõ nhất giá trị kỹ thuật của đồ án nhưng lại không được mô tả.
- **3.1.4 "Mô tả các ràng buộc dữ liệu":** mục `[2]` ghi "Mô tả ràng buộc **SACH**" (SÁCH = sách, không phải áo) với cột `GiaBan`, `SoLuongTon` — **nguyên văn copy từ đồ án bán sách**, chưa sửa. Cần viết lại ràng buộc cho các bảng thật (ví dụ: `CustomerOrder.paymentType` bất biến sau khi tạo — có hẳn 1 DB trigger chặn update field này, đáng để đưa vào làm ví dụ ràng buộc hay; `Payment.status` enum; `ProductVariant.stockQty >= 0`...).
- **3.2.1 use case "Quản lý đặt hàng":** mô tả 2 luồng **"Sửa đơn hàng"** và **"Hủy đơn hàng"** do khách hàng tự thực hiện — **đã kiểm tra code, `customer.order.routes.js` chỉ có 3 route: tạo đơn (POST), xem danh sách (GET), xem chi tiết (GET). Không có route PATCH/PUT nào cho khách tự sửa hoặc hủy đơn** (toàn bộ PATCH cập nhật trạng thái đơn chỉ nằm ở `admin.order.routes.js`, tức chỉ Admin thao tác được). Nếu tính năng này thực sự không có, phải bỏ 2 luồng đó khỏi use case (hoặc mô tả đúng là khách chỉ xem, còn hủy/sửa do Admin xử lý) — nếu không sẽ bị hỏi vặn và không trả lời được vì code không có.
- **3.2.2 "Sơ đồ tuần tự"** (đăng nhập, đặt hàng — Hình 311, 312): chỉ có caption, **không có hình** — 2 sequence diagram bắt buộc của 1 báo cáo thiết kế đang thiếu hoàn toàn.
- **3.3 "Thành phần giao diện":** chỉ có đúng 1 màn hình được mô tả (Giao diện đăng nhập). Với quy mô hệ thống thật (trang chủ, danh sách sản phẩm, **Design Studio** — phần lõi/khó nhất của đồ án theo chính lời Chương 1 tự nhận định, giỏ hàng, checkout có chọn cọc/COD, trang quản trị đơn hàng, trang xuất thông số in cho xưởng...), chỉ trình bày duy nhất màn login là **quá sơ sài**, đặc biệt vì Design Studio mới là phần được nhấn mạnh là khó nhất ở Chương 1.2 nhưng lại không có bất kỳ hình ảnh/mô tả giao diện nào ở Chương 3.3.

## Chương 4: Thử nghiệm

**Vấn đề nội dung (toàn chương, mức nghiêm trọng cao nhất):**
- Toàn bộ 5 kịch bản kiểm thử và 2 bảng kết quả (chức năng Khách hàng + Admin) đều là **test case của website bán sách**: tìm kiếm sách "Đắc Nhân Tâm", "Thêm sách vào Giỏ hàng", "Thêm sách mới", ràng buộc "Quản lý Sách"... **Không có test case nào liên quan đến Design Studio (kéo thả, upload logo, canvas, xuất JSON tọa độ), báo giá động, đặt cọc VNPAY/COD, hay xuất thông số in cho xưởng** — tức là các tính năng cốt lõi/khó nhất của chính đồ án này lại chưa được kiểm thử/mô tả kết quả kiểm thử ở đâu cả.
- Cần viết lại toàn bộ Chương 4 với kịch bản test bám theo use case thật của TeeStudio, ví dụ: (1) đăng ký/đăng nhập, (2) tạo thiết kế trên Design Studio và lưu, (3) thêm áo có thiết kế vào giỏ và checkout chọn đặt cọc 50%/thanh toán hẳn (đối chiếu đúng luật: áo có thiết kế không được chọn COD toàn phần, áo phôi được COD ngay), (4) admin duyệt thiết kế/đơn hàng, (5) xuất thông số in cho xưởng, (6) các ràng buộc dữ liệu (tồn kho, giá >= 0...).

## Chương 5: Kết luận

**Vấn đề nội dung (toàn chương, mức nghiêm trọng cao nhất — mâu thuẫn ngay với trang bìa):**
- Câu mở đầu 5.1 ghi nguyên văn: *"Sau quá trình nghiên cứu và thực hiện đề tài 'Xây dựng Website **bán sách trực tuyến**'"* — **mâu thuẫn trực tiếp với tên đề tài ở trang bìa** ("Xây dựng website TMĐT bán áo tự thiết kế..."). Đây là lỗi copy-paste rõ ràng nhất trong toàn bộ báo cáo, chắc chắn bị giám khảo bắt lỗi đầu tiên.
- 5.1 liệt kê toàn bộ chức năng của website bán sách (quản lý Thể loại, Tác giả, tìm sách...) — phải viết lại theo đúng chức năng thật đã làm (Design Studio, báo giá động, đặt cọc VNPAY/MoMo, quản lý thiết kế/duyệt POD, xuất thông số in...).
- 5.2 "Hạn chế" ghi: *"Hệ thống mới chỉ hỗ trợ COD, chưa tích hợp VNPAY, Momo..."* — **mâu thuẫn với chính Chương 1.4 và 2.2 của cùng báo cáo**, vốn khẳng định đã tích hợp VNPAY Sandbox + IPN; và mâu thuẫn với code thật (đã có đầy đủ `vnpay.service.js` lẫn `momo.service.js` hoạt động). Đây là 1 trong những mâu thuẫn nội bộ rõ nhất của báo cáo — 2 chương nói ngược nhau về cùng 1 tính năng.
- 5.3 "Hướng phát triển" đề xuất: *"Chuyển đổi mã nguồn thuần (PHP Native) sang Laravel/CodeIgniter"* — đồ án **không có dòng code PHP nào**, toàn bộ dùng Next.js/Node.js/Express. Câu này chắc chắn thuộc về đồ án khác, phải xóa và thay bằng hướng phát triển thật phù hợp (ví dụ: thêm Redis cache thật nếu muốn giữ claim ở Chương 1, hoàn thiện Docker/CI-CD nếu thật sự muốn giữ trong phạm vi đề tài, cho khách tự sửa/hủy đơn nếu muốn hiện thực hóa use case đã mô tả ở Chương 3, mở rộng vai trò Warehouse/Production trong UI...).

## Tài liệu tham khảo

- Toàn bộ 8 tài liệu tham khảo hiện tại đều xoay quanh **PHP/MySQL, Tiki, Fahasa** (nhà sách) — không liên quan gì đến stack thật (Next.js, Konva.js, Express, MySQL 8.0 JSON, Docker, VNPAY/MoMo, Google Gemini). Cần thay bằng tài liệu tham khảo đúng công nghệ đã dùng (doc chính thức Next.js, React, Konva.js, Express, MySQL 8.0 JSON type, VNPAY/MoMo integration docs, Google GenAI SDK...).

---

## Bảng tổng hợp mức độ ưu tiên xử lý

| Mức độ | Vấn đề | Chương |
|---|---|---|
| 🔴 Nghiêm trọng — sửa trước tiên | Kết luận ghi "website bán sách", mâu thuẫn tên đề tài ở bìa | 5 |
| 🔴 Nghiêm trọng | Toàn bộ Chương 4 là test case của website bán sách | 4 |
| 🔴 Nghiêm trọng | Actor/bảng dữ liệu/ràng buộc mô tả "sách", "tác giả" thay vì áo/thiết kế | 2.3.4, 3.1.3, 3.1.4 |
| 🔴 Nghiêm trọng | 5.2 nói chưa có VNPAY/MoMo — mâu thuẫn với 1.4/2.2 và code thật | 5.2 |
| 🟠 Cao | Thiếu ERD, sơ đồ lớp, 2 sequence diagram, 2 flowchart quy trình (chỉ có caption, không có hình) | 2.3, 3.1, 3.2 |
| 🟠 Cao | Thiếu mô tả 2 actor thật (WAREHOUSE, PRODUCTION) | 2.3.4 |
| 🟠 Cao | Use case "Sửa/Hủy đơn hàng" của khách — code không có route tương ứng | 3.2.1 |
| 🟡 Trung bình | Claim Redis/Docker/CI-CD không khớp code thật hiện có | 1.4 |
| 🟡 Trung bình | Thiếu tính năng AI Trợ lý (Gemini) trong mục tiêu/công nghệ/kết quả | 1, 2.2, 5.1 |
| 🟡 Trung bình | 3.3 chỉ có 1 màn hình (login), thiếu Design Studio và các màn hình chính khác | 3.3 |
| 🟢 Thấp | 1.1, 1.2 lẫn chữ "bánh" từ đồ án khác | 1.1, 1.2 |
| 🟢 Thấp | Tài liệu tham khảo sai chủ đề hoàn toàn | Tài liệu tham khảo |
