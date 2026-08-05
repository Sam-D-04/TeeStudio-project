Chào bạn, tôi có một **tin rất vui** cho bạn: Sau khi kiểm tra thư mục `design-studio` của bạn Đăng, tôi phát hiện ra **bạn Đăng ĐÃ VIẾT SẴN 90% logic cho 2 mặt rồi!** Bạn hầu như không cần bắt bạn ấy sửa gì trong trang thiết kế nữa, và có thể giải quyết bài toán này hoàn toàn từ phía Backend/Admin của bạn.

Dưới đây là chi tiết và cách phối hợp:

### 1. Phân tích code của Đăng (Bạn Đăng đã làm rất tốt)
*   **Về JSON `canvasData`**: Trong file `useDesignStore.ts`, Đăng đã thiết kế mảng `elements` gộp chung, và mỗi phần tử đã có sẵn trường `side: "front" | "back"`.
*   **Về chụp ảnh in**: Trong `DesignStudioApp.tsx`, Đăng đã viết sẵn hàm `capturePrintImages()`. Hàm này đã tự động lặp qua cả 2 mặt và chụp ra 2 biến Base64 riêng biệt là `printImageFront` và `printImageBack`.
*   **Về giỏ hàng**: File `AddToCartModal.tsx` cũng đã nhận đủ cả 2 biến ảnh này để lưu vào Giỏ hàng (Redux/Zustand state).

$\Rightarrow$ **Kết luận**: Giao diện thiết kế (Design Studio) **không cần sửa thêm gì cả**, nó đã hỗ trợ 2 mặt rồi!

---

### 2. Cách bạn xử lý 100% bằng code Backend (Không sợ conflict)
Vì bạn không muốn đụng vào code Frontend của Đăng, bạn hoàn toàn có thể "gánh" logic tính tiền ở API Backend. 

*   **Logic tự động phân bổ Vị trí in & Tính phí**:
    Khi Đăng bấm "Lưu thiết kế", code của Đăng gọi API (POST/PUT) gửi nguyên cục JSON `canvasData` lên Backend. 
    Trong Backend (file Service API xử lý lưu thiết kế), bạn chỉ cần dùng code phân tích chuỗi JSON đó:
    ```javascript
    const elements = payload.canvasData.elements || [];
    // Mặc định phần tử cũ không có 'side' thì tính là 'front'
    const hasFront = elements.some(el => (el.side || 'front') === 'front');
    const hasBack = elements.some(el => el.side === 'back');
    ```
    - Dựa vào 2 biến `hasFront` và `hasBack` này, Backend của bạn **tự động INSERT / UPDATE** vào bảng `DesignPrintPosition`. 
    - Ví dụ: `hasBack == true` thì bạn insert 1 dòng "Mặt sau" kèm `extraCost = 15000` vào DB. 
*   **Kết quả**: Bằng cách này, khi API API lưu hoàn tất và load lại dữ liệu, trường `phiInAn` trả về cho Frontend đã được tính gộp cả phí mặt sau. UI tính tiền của Đăng sẽ tự động cộng phí này vào tổng tiền mà bạn ấy **không cần viết thêm 1 dòng code nào** để tính toán.

---

### 3. Vị trí DUY NHẤT bạn cần nhờ Đăng sửa/kiểm tra lại
Trang Design Studio thì hoàn hảo, nhưng bạn chỉ cần nhắn Đăng kiểm tra lại **Trang Checkout / Đặt Hàng** (nơi gọi API `POST /orders` để tạo đơn).

*   **Nội dung nhờ Đăng**: *"Đăng ơi, ở trang Checkout lúc gọi API tạo đơn hàng, ông nhớ truyền đủ cả 2 chuỗi hình ảnh `printImageFront` và `printImageBack` (đang lưu sẵn trong giỏ hàng) lên cho Backend tui nha. Đừng chỉ gửi 1 ảnh để tui còn upload lên Cloudinary cho xưởng in."*

Chỉ với 1 câu dặn đó, toàn bộ bài toán in 2 mặt, tính thêm tiền, và xuất ảnh in cho xưởng của 2 bạn sẽ được giải quyết trọn vẹn mà 2 bên làm việc hoàn toàn độc lập, không conflict code!
