# TeeStudio — Chức năng hiện có ở các trang khách hàng

Tài liệu này liệt kê các chức năng **hiện đang hoạt động** trên các trang mà khách hàng (chưa đăng nhập hoặc đã đăng nhập với vai trò CUSTOMER) tương tác trực tiếp. Không bao gồm các trang `/admin/*`.

Cập nhật: 2026-07-14 (dựa trên khảo sát trực tiếp mã nguồn `frontend/src/app` và `frontend/src/components`).

---

## 1. Trang chủ — `/`

File: `src/app/page.tsx`

- **Danh mục sản phẩm nổi bật** (`ProductCategories` + `ProductCategoriesClient`): lấy dữ liệu từ `/public/products`, hiển thị 3 nhóm áo (thun/polo/hoodie) với ảnh mockup, giá, nút "Xem chi tiết" (→ `/product/{id}`) và "Thiết kế" (→ `/design-studio?shirt=...`).
- **Quy trình 3 bước** (`SimpleWorkflow`): banner tĩnh minh hoạ "Chọn sản phẩm → Tự do thiết kế → Giao hàng tận nơi", không có tương tác.
- **Sản phẩm nổi bật** (`ProductShowcase` + `ProductShowcaseClient`): lưới sản phẩm có tab lọc theo loại áo, chấm màu thể hiện các màu có sẵn, badge tồn kho ("Còn hàng"/"Còn N"), nút "Thiết kế" đi kèm màu/view đã chọn.

## 2. Đăng nhập / Đăng ký

Routes: `/dang-nhap`, `/dang-ky` (đứng độc lập, vẫn hoạt động) + **Modal đăng nhập/đăng ký** (`AuthModal.tsx`) dùng ở header và trong Design Studio.

- Đăng nhập bằng email + mật khẩu; đăng ký cần họ tên, email, số điện thoại, mật khẩu (≥8 ký tự, có chữ và số) + xác nhận mật khẩu.
- Sau khi đăng nhập thành công: tự động đồng bộ giỏ hàng khách (guest cart) lên tài khoản, điều hướng theo vai trò (khách hàng ở lại trang hiện tại; nhân sự nội bộ về trang quản trị tương ứng).
- Modal có 2 tab Đăng nhập/Đăng ký, theme sáng (ở header) hoặc tối (trong Design Studio).
- Không có đăng nhập mạng xã hội (Google/Facebook...), không có "Quên mật khẩu", không có xác thực OTP.

## 3. Khám phá sản phẩm — `/explore`

File: `src/app/explore/page.tsx`

- Đây là **trang catalog/tìm kiếm sản phẩm thật sự** của hệ thống.
- Ô tìm kiếm theo tên/chất liệu, đồng bộ với query `?q=`.
- Lưới sản phẩm dạng thẻ (ảnh, tên, loại áo, chất liệu, giá, nhãn "Thiết kế ngay") → click vào để đi tới `/product/{id}`.
- Trạng thái loading và trạng thái rỗng ("Không tìm thấy sản phẩm").
- **Chưa có**: bộ lọc theo giá/màu/danh mục, sắp xếp, hoặc phân trang.

## 4. Chi tiết sản phẩm — `/product/[id]`

File: `src/app/product/[id]/page.tsx` + `ProductDetailClient.tsx`

- Chọn **màu áo** (bảng màu cố định theo từng loại áo) và **kích cỡ** (chỉ hiện size còn hàng theo màu đã chọn); cảnh báo sắp hết hàng (≤5), disable khi hết hàng.
- Xem ảnh mockup mặt trước/sau (tab chuyển đổi).
- Nút **"Thiết kế ngay"** → mở Design Studio với sản phẩm/màu/mặt đã chọn.
- Nút **"Thêm vào giỏ hàng"** (yêu cầu chọn size trước, kiểm tra tồn kho).
- Nút **"Đặt số lượng lớn"** → điều hướng sang `/creator`.
- Tab mô tả sản phẩm + bảng thông số kích cỡ (S–XXL).
- Các badge tin cậy: đổi trả 7 ngày, đảm bảo màu sắc, giao hàng toàn quốc.

## 5. Design Studio — `/design-studio`

File: `DesignStudioApp.tsx` và các component con trong `src/components/design-studio/`. Đây là tính năng lớn và phức tạp nhất dành cho khách hàng.

**Canvas & thao tác chỉnh sửa:**
- Vẽ/kéo-thả trên canvas Konva, undo/redo (Ctrl+Z / Ctrl+Y), xoá phần tử (Delete), bỏ chọn (Esc).
- Zoom canvas (0.25×–3×).
- Xoay/resize phần tử qua Transformer; giới hạn trong vùng in ("VÙNG IN") — riêng áo polo mặt trước có vùng in dạng đa giác (bo theo cổ áo).
- **Lớp (Layers panel)**: sắp xếp thứ tự, khoá/mở khoá, xoá từng lớp, xem thumbnail.
- **Thuộc tính (Properties panel)**: chỉnh X/Y/W/H/góc xoay bằng số, căn vào vùng in (6 hướng), nhân bản, khoá/xoá.
- **Thanh công cụ nổi** khi chọn 1 phần tử: nhân bản, lật ngang/dọc (ảnh), khoá, xoá.
- **Tách nền ảnh bằng AI thật** (segmentation model chạy ngay trên trình duyệt qua `@imgly/background-removal`), có thanh tiến trình khi xử lý.
- **Định dạng văn bản**: đổi font (có bộ chọn font tìm kiếm được theo danh mục), cỡ chữ, màu, đậm/nghiêng/gạch chân/gạch ngang, viết hoa, căn lề, căn vị trí nhanh trong vùng in.

**Panel bên trái (Sidebar) — 6 tab:**
1. **Hình ảnh**: tải ảnh lên (tối đa 5MB, kéo-thả hoặc chọn file), thư viện ảnh đã tải, thêm vào canvas hoặc xoá.
2. **Họa tiết**: kho sticker có sẵn của hệ thống (tìm kiếm + lọc theo danh mục), thêm vào canvas.
3. **Văn bản**: thêm khối văn bản mới + chọn font.
4. **Phôi áo**: đổi loại áo (thun/polo/hoodie), đổi mặt (trước/sau), đổi màu áo.
5. **Trợ lý (AI thật – Google Gemini)**:
   - **"Sinh thiết kế"**: nhập mô tả (prompt) → AI tạo bố cục + nội dung chữ mới cho thiết kế (thay thế canvas hiện tại, có xác nhận nếu canvas đang có nội dung).
   - **"Tự sắp xếp"**: AI tự sắp xếp lại vị trí các khối văn bản đang có trên canvas.
   - Công cụ nhanh không dùng AI: sửa nhanh độ tương phản chữ với nền áo, gợi ý bảng màu chữ, các cặp font đẹp dựng sẵn.
6. **Của tôi**: danh sách thiết kế đã lưu của khách hàng (xem mục 6 bên dưới) — tab này có chấm đỏ báo số thiết kế đang ở trạng thái "Cần chỉnh sửa".

**Phụ phí thiết kế**: tự động tính theo diện tích in phủ (cm²) và hiển thị real-time.

**Xuất ảnh**: tải ảnh canvas dạng PNG; và xuất ảnh in chuẩn (crop đúng vùng in, độ phân giải cao) khi thêm vào giỏ hàng.

**Lưu & gửi duyệt thiết kế** (yêu cầu đăng nhập):
- "Lưu thiết kế" (Ctrl+S) — lưu nháp, không đổi trạng thái duyệt.
- "Lưu & Gửi duyệt lại" — chỉ hiện khi thiết kế đang ở trạng thái **Nháp** hoặc **Cần chỉnh sửa**; lưu rồi gửi cho admin duyệt (chuyển trạng thái sang "Đang chờ duyệt").
- **Trạng thái thiết kế** hiển thị bằng badge màu: Nháp (xám) → Đang chờ duyệt (vàng) → Cần chỉnh sửa (cam, kèm ghi chú của admin) → Đã duyệt (xanh lá).
- Khi admin yêu cầu chỉnh sửa: khách thấy ghi chú lý do ngay trong danh sách "Của tôi", có nút "Sửa" để tải lại thiết kế vào canvas và gửi lại.
- Không cho sửa/xoá khi thiết kế đang "Đang chờ duyệt" hoặc "Đã duyệt" (khoá để tránh đổi giữa lúc admin xử lý).

**Thêm vào giỏ hàng từ Design Studio** (`AddToCartModal`): chọn size (giới hạn theo màu áo đang thiết kế), số lượng (theo tồn kho thực tế trừ đi số đã có trong giỏ), xem tạm tính, xác nhận thêm vào giỏ kèm ảnh thiết kế in.

**Giỏ hàng nhanh** (`CartDrawer`): mở ngay trong Design Studio mà không cần rời trang.

**Đăng nhập/Đăng ký** ngay trong Toolbar nếu chưa đăng nhập.

> Lưu ý: menu tài khoản trong Toolbar có liên kết "Tài khoản" trỏ tới `/tai-khoan` — route này **chưa tồn tại** trong code, là liên kết chết/placeholder.

## 6. Bộ sưu tập của tôi — `/collections`

File: `src/app/collections/page.tsx`

- Mặc dù tên route là "collections", đây thực chất là **thư viện thiết kế đã lưu của khách hàng** (không phải trang danh mục sản phẩm — vai trò đó thuộc về `/explore`).
- Yêu cầu đăng nhập.
- Lưới thẻ thiết kế đã lưu: ảnh preview, tên, ngày cập nhật.
- Click vào thẻ → tải thiết kế vào Design Studio để sửa tiếp.
- Nút xoá thiết kế (có xác nhận).
- Nút **"🛒 Đặt hàng"** → mở thẳng modal thêm vào giỏ hàng từ thiết kế đã lưu, không cần mở lại Design Studio.
- Nút "+ Tạo thiết kế mới" → Design Studio với canvas trống.

## 7. Giỏ hàng — `/cart` và thanh trượt giỏ hàng (Cart Drawer)

File: `src/app/cart/page.tsx` + `CartDrawer.tsx` (dùng chung ở header và Design Studio)

- Danh sách sản phẩm trong giỏ: ảnh, tên, size, màu, số lượng (tăng/giảm), thành tiền, nút xoá từng món.
- Tổng tạm tính; phí vận chuyển được tính ở bước thanh toán (không cộng ở giỏ hàng).
- Nút "Xoá tất cả".
- Nút "Tiến hành thanh toán" → `/checkout`.
- Trạng thái giỏ hàng rỗng có CTA quay lại `/explore`.
- Giỏ hàng tự động xoá khi đăng xuất.

## 8. Thanh toán — `/checkout`

File: `src/app/checkout/page.tsx`

- Nếu giỏ hàng rỗng → chuyển sang trạng thái trống có CTA khám phá sản phẩm.
- Form thông tin nhận hàng: họ tên, số điện thoại (validate định dạng VN), email, địa chỉ, ghi chú — tự động điền sẵn tên/email nếu đã đăng nhập.
- **3 phương thức thanh toán**: VNPAY (Internet Banking/ATM/QR), **Ví MoMo** (quét QR/app), COD (tiền mặt khi nhận hàng).
- Phí vận chuyển cố định cộng vào tổng đơn.
- Yêu cầu đăng nhập trước khi đặt hàng (nếu chưa, chuyển sang trang đăng nhập).
- Đặt hàng xong: với VNPAY/MoMo → chuyển hướng sang cổng thanh toán; với COD → chuyển sang trang kết quả thành công ngay.
- Cột tóm tắt đơn hàng bám theo khi cuộn (sticky), hiển thị đầy đủ sản phẩm + tổng tiền.

## 9. Kết quả thanh toán — `/thanh-toan-thanh-cong`

File: `src/app/thanh-toan-thanh-cong/page.tsx` + `VnpayReturnPage.tsx` (đã hỗ trợ cả VNPAY lẫn MoMo, không chỉ riêng VNPAY như tên file).

- Tự động nhận diện cổng thanh toán (VNPAY hay MoMo) từ tham số trả về.
- Gọi backend xác thực chữ ký/checksum để lấy trạng thái đơn hàng chính xác (không tin trực tiếp tham số từ URL).
- Hiển thị đầy đủ các trạng thái: đang xác minh, thành công, chưa chắc chắn/cần đối soát thêm (lỗi mạng hoặc mã phản hồi mập mờ — khuyến cáo không thanh toán lại ngay), khách tự huỷ giao dịch, bị ngân hàng từ chối (có nút "Thanh toán lại"), hoặc lỗi chung/checksum không hợp lệ.
- Bảng thông tin: mã đơn, số tiền, trạng thái, mã giao dịch cổng thanh toán, mã ngân hàng/phương thức, mã phản hồi.
- Nút "Về trang chủ" và "Liên hệ hỗ trợ" (mailto).

## 10. Header & Footer (toàn site)

- **Header**: logo, menu điều hướng (Khám phá / Thiết kế áo / Bộ sưu tập / Bán hàng), ô tìm kiếm nhanh, nút giỏ hàng có badge số lượng, khu vực đăng nhập/tài khoản, menu mobile dạng drawer.
- **Footer**: thông tin thương hiệu, liên kết Sản phẩm/Chính sách/Liên hệ — hiện tất cả các liên kết này là placeholder (`#`), chưa trỏ tới trang thật.

## 11. Trang tĩnh chưa phát triển

- `/about` — "Về chúng tôi": chỉ có tiêu đề + placeholder "Tính năng đang được phát triển...".
- `/creator` — "Bán hàng cùng TeeStudio": chỉ có tiêu đề + placeholder tương tự, chưa có luồng đăng ký nhà sáng tạo/nhận hoa hồng thật.

## 12. Chức năng còn thiếu (khách hàng chưa có)

- **Không có trang lịch sử đơn hàng / theo dõi đơn hàng** cho khách hàng — sau khi thanh toán, khách chỉ thấy kết quả 1 lần ở `/thanh-toan-thanh-cong`, không có nơi nào để xem lại các đơn đã đặt trước đó hoặc trạng thái giao hàng.
- **Không có trang tài khoản cá nhân** (`/tai-khoan` được liên kết tới nhưng route chưa tồn tại) — khách không thể sửa thông tin cá nhân, đổi mật khẩu, quản lý địa chỉ giao hàng đã lưu.
- Không có tính năng lọc/sắp xếp sản phẩm nâng cao ở `/explore`.
- Không có "Quên mật khẩu" / xác thực 2 lớp.

---

*Tài liệu này phản ánh trạng thái code tại thời điểm khảo sát; khi có thay đổi lớn về UI/luồng khách hàng nên cập nhật lại file này.*
