# Báo cáo thay đổi Backend - Task 6 (Giới hạn lưu thiết kế)

Tôi đã tiến hành refactor và áp dụng chuẩn hoá dữ liệu canvas cho luồng của khách hàng (user). Dưới đây là chi tiết các thay đổi:

## 1. Tách hàm dùng chung (Refactoring)
- Tạo file mới: `backend/src/common/utils/canvas.util.js`
- Chuyển hàm `chuanHoaCanvasData` từ `admin.design.service.js` sang file dùng chung này.
- **Lý do:** Tránh lặp lại code, đảm bảo quy tắc chuẩn hoá dữ liệu (thêm version, shirtType, giới hạn số lượng) được áp dụng nhất quán trên toàn bộ hệ thống.

## 2. Cập nhật luồng khách hàng (User Design Service)
- File thay đổi: `backend/src/modules/users/user.design.service.js`
- **Trước đây:** payload `canvasData` được parse và stringify trực tiếp rồi ném thẳng vào DB mà không qua bất kỳ lớp kiểm tra nào.
- **Hiện tại:** 
  - Trong cả 2 hàm `saveNewDesign` và `updateDesign`, `payload.canvasData` giờ đây bắt buộc phải đi qua `chuanHoaCanvasData(payload.canvasData, shirtType)`.
  - Nếu khách gửi lên thiết kế lỗi (không phải JSON) hoặc chứa mảng `elements` **vượt quá 200 phần tử**, hệ thống sẽ ném lỗi HTTP 400 (`Thiết kế không được vượt quá 200 phần tử`).
  - Dữ liệu trước khi lưu sẽ được tự động đính kèm `shirtType`, `shirtView`, `logicalCanvas`, và `version`.

## 3. Cập nhật luồng Admin (Admin Design Service)
- File thay đổi: `backend/src/modules/designs/admin.design.service.js`
- Đã xoá bỏ hàm `chuanHoaCanvasData` khai báo cục bộ.
- Thay bằng import từ `../../common/utils/canvas.util`.
- Hoạt động của admin không thay đổi, vẫn giữ nguyên giới hạn tối đa 200 phần tử/thiết kế.

## Tác động & Lưu ý cho Frontend
- Backend hiện đã được bịt lỗ hổng (không còn lo sợ khách gửi JSON rác 100.000 phần tử làm sập DB).
- **Phía Frontend:** Cần đảm bảo rằng khi gọi API lưu thiết kế (`POST /api/designs` hoặc `PUT /api/designs/:id`), nếu gặp lỗi HTTP 400 với message liên quan đến giới hạn phần tử, cần hiện toast thông báo cho khách biết để họ chủ động xoá bớt chi tiết. (Hiện tại Frontend có thể đã có UI toast lỗi chung chung, nhưng báo lỗi cụ thể sẽ giúp UX tốt hơn).

---

## 4. Sửa lỗi Crash Server (Hotfix)
- File thay đổi: `backend/src/modules/pricing/admin.pricing.service.js`
- **Lỗi:** Biến `PIXELS_PER_CM` đã được tách thành `PIXELS_PER_CM_X` và `PIXELS_PER_CM_Y` ở phần đầu file nhưng phần `module.exports` ở cuối file chưa được cập nhật, dẫn tới lỗi `ReferenceError: PIXELS_PER_CM is not defined` làm crash tiến trình Node.js ngay lúc khởi động.
- **Giải pháp:** Đã cập nhật `module.exports` để xuất khẩu đúng 2 biến `PIXELS_PER_CM_X` và `PIXELS_PER_CM_Y`. Server hiện tại đã chạy ổn định bình thường.

---

## 5. Đồng bộ màu áo (Task 7)
- File thay đổi: `backend/src/modules/designs/admin.design.service.js`
- **Thay đổi:**
  - Sửa hex màu navy `#1d4ed8` → `#1e3a8a` cho nhất quán với FE (đây là `navy` trong `HEX_TO_EN` và `SHIRT_COLORS` của frontend).
  - Thêm comment `⚠️ Khi thêm/đổi màu: phải cập nhật đồng bộ với frontend/src/constants/shirtColors.ts` ngay trên khai báo `MAU_AO_MAC_DINH` để nhắc nhở khi bảo trì.
- **Không thay đổi** cấu trúc object hay tên field, chỉ sync giá trị hex và ghi chú tham chiếu.

> **Checklist khi thêm màu áo mới:**
> 1. Thêm hex vào `frontend/src/constants/shirtColors.ts` → `SHIRT_COLORS[loai]` + `HEX_TO_EN`
> 2. Thêm tên Việt vào `VI_TO_EN` và `EN_TO_VI` trong cùng file
> 3. Cập nhật `MAU_AO_MAC_DINH` trong `admin.design.service.js` (backend)

---

## 6. Phân tích thuật toán bounding-box (Task 9)
- **Không có thay đổi code ở backend.**
- **Ghi chú:** Sau khi phân tích, hiện tại chỉ có 2 bản bounding-box (FE: `designFeeCalculator.ts`, BE: `admin.pricing.service.js`) và cả hai đã đồng bộ hoàn toàn về mặt logic (từ task 1). Không tồn tại bản thứ 3 ở `pricing.utils.js` hay `admin.design.service.js` như mô tả ban đầu của task. Do đó không cần sửa đổi backend.

---

## 7. Dọn dữ liệu màu áo + bỏ hardcode mockup Design Studio (đã ĐẢO NGƯỢC một phần — xem ghi chú cuối)

**Yêu cầu gốc của bạn:** kiểm tra Cloudinary (folder `mockups`) xem đang có ảnh cho loại áo/màu áo nào, đối chiếu với database xem đã có đủ chưa. Sau khi đối chiếu phát hiện: nhiều `ProductVariant.colorHex` bị lỗi (dùng chung placeholder `#94a3b8`), một số biến thể màu không có ảnh mockup thật, và Design Studio đang chọn ảnh mockup bằng cách **đoán màu qua hex** dựa trên 3 bảng tra hardcode độc lập (frontend `ShirtMockupImage.tsx`, frontend `constants/shirtColors.ts`, backend `admin.design.service.js` → `MAU_AO_MAC_DINH`). Bạn yêu cầu lên plan + tasklist để (1) tự tay dọn dữ liệu DB, (2) sửa code đọc màu/ảnh mockup từ DB thay vì hardcode. Plan đã được duyệt, lưu tại `C:\Users\dangc\.claude\plans\tender-nibbling-frost.md`.

**Đã làm (DB, đang giữ nguyên vì ảnh hưởng cả phía khách hàng):**
- Sửa hex sai của 7 dòng `ProductVariant` về đúng mã màu, đồng bộ "Xanh navy" về 1 hex chung (`#1E3A8A`).
- Vô hiệu hoá (`status='INACTIVE'`, không xoá) 10 dòng `ProductVariant` thuộc 4 tổ hợp màu không có ảnh mockup thật (Hoodie Đen, Hoodie Xanh navy, Áo Thun "Áo Thun" Xám, Polo Xanh dương).
- Migration `backend/src/database/migrations/20260804_add_productimage_colorhex_view.sql`: thêm cột `colorHex`/`view` (NOT NULL) vào `ProductImage`, backfill cho 22 ảnh hiện có.
- File `backend/src/modules/public/public.service.js` (API công khai `GET /api/public/products/:id`, dùng cho Design Studio + trang sản phẩm khách hàng): trả thêm `colorHex` cho variants, `colorHex`/`view` cho images, lọc `status='ACTIVE'`.
- Toàn bộ frontend Design Studio (`useDesignStore.ts`, `ShirtMockupImage.tsx`, `DesignStudioApp.tsx`, `AddToCartModal.tsx`) đổi sang tra ảnh/khớp variant bằng dữ liệu DB thật; xoá file `frontend/src/constants/shirtColors.ts`.

**Đã khôi phục lại (sau khi thống nhất với bạn ngày 04/08/2026):**
- File `backend/src/modules/products/admin.product.service.js` (hàm `taiAnhSanPham`/`chuanHoaMetadataAnh`):
  - Hàm `chuanHoaMetadataAnh` đã được mở rộng để **bắt buộc** nhận `colorHex` (validate định dạng `#RRGGBB`) và normalize `viewSide` → `view` (`"FRONT"` hoặc `"BACK"`, mặc định `"FRONT"` nếu không truyền). Nếu thiếu hoặc sai định dạng `colorHex`, API trả về lỗi `400 Bad Request` rõ ràng ngay tại tầng service.
  - Câu lệnh `INSERT INTO ProductImage` trong hàm `taiAnhSanPham` đã được cập nhật để ghi đầy đủ cả 2 cột `colorHex` và `view`. Response cũng trả về 2 trường này cho frontend Admin.
  - **Kết quả:** Không còn nguy cơ lỗi SQL `NOT NULL constraint` khi Admin upload ảnh phôi áo. Toàn bộ dữ liệu ảnh mới tạo sẽ luôn có đầy đủ thông tin màu và mặt áo để Design Studio hoạt động chính xác.
