# Ghi chú tách Component ShirtSelector

Tôi đã thực hiện tách phần giao diện chọn Phôi áo / Màu áo thành một component dùng chung độc lập theo yêu cầu của bạn. Dưới đây là các chi tiết bạn cần nắm:

## 1. Thành phần mới: `ShirtSelector`
- **File:** `frontend/src/components/design-studio/ShirtSelector.tsx`
- **Chức năng:** Chứa UI để chọn Loại áo (T-shirt, Polo, Hoodie) và Màu áo.
- Component này tự động đọc và ghi dữ liệu vào trạng thái chung (`useDesignStore`), vì vậy bạn không cần phải truyền phức tạp các hàm set state.

## 2. Cách sử dụng (Props)
Component hỗ trợ 2 thuộc tính (Props) để linh hoạt sử dụng ở nhiều nơi:
- `showShirtType?: boolean` (mặc định: `false`): Nếu là `true`, sẽ hiển thị thêm dropdown chọn loại áo (T-shirt, Polo, Hoodie). Khách hàng ngoài Frontend có thể không cần đổi, nhưng Admin thì rất cần.
- `ignoreRevisionMode?: boolean` (mặc định: `false`): Nếu thiết kế đang ở trạng thái bị yêu cầu sửa (NEEDS_REVISION), khách không được đổi màu áo nữa. Nhưng đối với Admin thì luôn có quyền chỉnh sửa, nên truyền `true` để mở khóa.

## 3. Các thay đổi đã thực hiện
- **Trang Khách (DesignStudioApp.tsx):** Đã xóa đoạn code render các hình tròn màu cũ, thay bằng `<ShirtSelector showShirtType={false} />`.
- **Trang Admin (AdminDesignStudio.tsx):** Đã import và chèn `<ShirtSelector showShirtType={true} ignoreRevisionMode={true} />` vào cạnh các nút chuyển Mặt trước/Mặt sau ở dưới cùng của Canvas. Giờ đây Admin có thể thoải mái chọn loại phôi và màu áo mà không cần hardcode như trước!

> [!TIP]
> Do cả 2 trang đều đã tái sử dụng component này, mọi nâng cấp trong tương lai về tính năng chọn áo (ví dụ: thêm hiệu ứng chọn, thêm hình hiển thị loại áo thay cho dropdown) đều chỉ cần chỉnh sửa duy nhất trong file `ShirtSelector.tsx`.
