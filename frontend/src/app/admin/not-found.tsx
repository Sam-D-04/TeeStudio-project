import AdminPlaceholderPage from "@/components/admin/common/AdminPlaceholderPage";

export default function AdminNotFound() {
  return (
    <AdminPlaceholderPage
      statusLabel="Không tìm thấy"
      title="Trang quản trị không tồn tại"
      description="Đường dẫn này chưa được cấu hình trong khu vực quản trị. Bạn có thể quay lại tổng quan hoặc chọn một mục khác từ menu."
    />
  );
}
