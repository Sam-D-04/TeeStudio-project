# Kế hoạch Giải Quyết Các Vấn Đề In 2 Mặt Áo

Dựa trên quá trình kiểm tra mã nguồn (cả Frontend và Backend), mình đã xác nhận các vấn đề bạn nêu và đây là kết luận cũng như kế hoạch xử lý:

## 1. Phân Tích Các Vấn Đề Bạn Đã Nêu

### Vấn đề 1: "Ở phần thiết kế của tôi không load được thiết kế đó"
- **Nguyên nhân thực tế**: Hệ thống Backend vẫn lưu trữ đầy đủ data các phần tử của cả mặt trước và mặt sau vào trường `canvasData` dưới dạng JSON, và Frontend vẫn `JSON.parse` thành công. Tuy nhiên, có 2 điểm gây nhầm lẫn hoặc lỗi hiển thị:
  1. Khi người dùng lưu thiết kế (nhấn Save), hàm chụp ảnh `html2canvas` chỉ chụp mặt *đang hiển thị*, do đó ảnh đại diện (thumbnail `previewUrl`) trong "Thiết kế của tôi" chỉ hiển thị 1 mặt, gây cảm giác "mất thiết kế".
  2. Khi người dùng bấm "Mở thiết kế", hệ thống load tất cả phần tử vào `store` nhưng UI vẫn giữ nguyên ở mặt đang xem (mặc định là `front`), nếu người dùng thiết kế ở mặt `back`, họ sẽ thấy áo trống trơn và nghĩ là "không load được".
- **Giải pháp**: Xử lý lại logic sinh `previewUrl` (có thể ghép 2 mặt hoặc thông báo rõ ràng), và khi load thiết kế thì phải focus vào mặt áo có chứa phần tử. (Việc bổ sung 2 nút chuyển mặt áo ở Task 11 cũng sẽ giúp giải quyết triệt để sự hoang mang này).

### Vấn đề 2: "Khi đặt hàng chưa có tính cộng giá in của 2 mặt"
- **Kiểm tra**: BẠN HOÀN TOÀN ĐÚNG. Hiện tại thuật toán tính giá in (ở cả `designFeeCalculator.ts` trên FE và `calculateBoundingBoxAreaFee` trên BE) đang "gộp chung" tọa độ của TẤT CẢ các phần tử (không phân biệt `front` hay `back`) để vẽ ra 1 hộp giới hạn (Bounding Box) duy nhất.
- **Hệ quả**: Nếu khách in 1 logo bên ngực trái mặt trước và 1 logo đúng vị trí đó ở mặt sau, thuật toán coi như chúng đè lên nhau -> diện tích hộp giới hạn không tăng -> khách được in mặt sau... MIỄN PHÍ!
- **Giải pháp**: Tách mảng elements ra làm 2 mảng (`frontElements` và `backElements`). Tính phí riêng cho từng mặt dựa trên Bounding Box của mặt đó, sau đó cộng tổng lại.

### Vấn đề 3: "Ở dashboard admin chưa xem đc cả 2 mặt in (backend cần hứng data)"
- **Kiểm tra**: TIN VUI LÀ BACKEND ĐÃ HỨNG DỮ LIỆU NÀY RỒI! 
- Cụ thể: 
  - Frontend (`AddToCartModal.tsx`) đã tự động chụp 2 ảnh riêng biệt là `printImageFront` và `printImageBack` gửi lên lúc tạo đơn hàng.
  - Backend (`customer.order.service.js`) đã hứng 2 biến base64 này, upload lên Cloudinary và lưu vào DB ở 2 cột `printFileUrlFront` và `printFileUrlBack`.
  - Hàm lấy dữ liệu cho Admin (`layTechpackDonCanIn` trong `admin.design.service.js`) **ĐÃ TRẢ VỀ** 2 trường `urlFileInTruoc` và `urlFileInSau`.
- **Giải pháp**: Bạn không cần code thêm ở BE cho phần này nữa. Chỉ cần nhắn Partner (người làm Admin UI) lấy 2 biến `urlFileInTruoc` và `urlFileInSau` từ API `GET /api/admin/designs/don-can-in/:id/techpack` để hiển thị ra là xong.

---

## 2. Task Lists & Kế Hoạch Triển Khai (Dành cho Bạn)

### Giai đoạn 1: Sửa thuật toán tính giá in (Quan trọng nhất - Tránh thất thoát tiền)
- [ ] **Sửa Frontend**: Mở file `frontend/src/utils/designFeeCalculator.ts`
  - Chia `elements` truyền vào thành mảng `frontElements` và `backElements`.
  - Gọi hàm tính phí riêng cho từng mảng.
  - Tổng phí in = `Phí in mặt trước` + `Phí in mặt sau`.
- [ ] **Sửa Backend**: Mở file `backend/src/modules/pricing/admin.pricing.service.js`
  - Cập nhật hàm `calculateBoundingBoxAreaFee` tương tự như logic của Frontend.
  - Tách mảng, tính Bounding Box riêng, lấy bảng giá map ra phí, rồi cộng lại.

### Giai đoạn 2: Cải thiện trải nghiệm Load & Save Thiết Kế 2 Mặt
- [ ] **Sửa chức năng Save (FE)**: Cập nhật hàm `handleConfirmSave` trong `DesignStudioApp.tsx`.
  - Đảm bảo logic tạo `previewUrl` có thể phản ánh được thiết kế 2 mặt (tạm thời có thể ưu tiên lưu `previewUrl` là mặt trước, nhưng ở Task 11 khi có UI 2 nút thì người dùng sẽ dễ nhận biết hơn).
- [ ] **Sửa chức năng Load (FE)**: Cập nhật `handleLoadDesignById`.
  - Sau khi nạp `elements` vào store, kiểm tra xem mặt nào chứa nhiều phần tử hơn (hoặc nếu `front` trống mà `back` có) thì tự động `setShirtView` sang mặt đó để khách nhìn thấy ngay lập tức.

### Giai đoạn 3: Bàn giao cho Partner (Admin)
- [ ] **Nhắn đối tác Admin**: Thông báo API `/api/admin/designs/don-can-in` và `/api/admin/designs/don-can-in/:id/techpack` đã có sẵn dữ liệu của cả 2 mặt áo. Yêu cầu update UI để lấy và hiển thị 2 trường `urlFileInTruoc` và `urlFileInSau`.
