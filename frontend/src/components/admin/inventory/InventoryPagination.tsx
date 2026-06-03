/**
 * InventoryPagination – thanh phân trang cho bảng kho hàng.
 *
 * Hiển thị:
 * - Dòng thông tin: "Hiển thị X–Y của Z biến thể"
 * - Nút điều hướng: Trang trước (‹) / Số trang / Trang sau (›)
 *
 * Trang đang active: nền xanh (primary-container), chữ trắng.
 * Trang khác: nền trắng, viền xám, hover nền xám nhạt.
 */

// Kiểu dữ liệu props nhận từ component cha
type InventoryPaginationProps = {
  currentPage: number;   // Trang hiện tại (bắt đầu từ 1)
  totalPages: number;    // Tổng số trang
  totalItems: number;    // Tổng số biến thể (để hiển thị "của X biến thể")
  pageSize: number;      // Số dòng mỗi trang (để tính "Hiển thị X–Y")

  onPageChange: (page: number) => void; // Hàm gọi khi người dùng chuyển trang
};

export default function InventoryPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: InventoryPaginationProps) {
  // Tính chỉ số dòng đầu và dòng cuối đang hiển thị
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Tạo mảng số trang để render, ví dụ [1, 2, 3, 4, 5]
  // Nếu tổng số trang ≤ 5 thì hiển thị hết, ngược lại rút gọn
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    // Khu vực phân trang: nền xám nhạt, padding 16px, flex giữa thông tin và nút
    <div className="flex items-center justify-between border-t border-border bg-surface-alt px-4 py-3">

      {/* Thông tin trang: "Hiển thị 1-10 của 124 biến thể" */}
      <span className="text-sm text-text-secondary">
        Hiển thị {startItem}–{endItem} của {totalItems} biến thể
      </span>

      {/* Nhóm nút điều hướng */}
      <div className="flex gap-1">

        {/* Nút trang trước (‹) – vô hiệu hóa khi đang ở trang đầu */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>

        {/* Nút số trang */}
        {pageNumbers.map((page) => {
          // Trang đang active: nền xanh primary, chữ trắng
          // Trang khác: nền trắng, viền xám
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-semibold transition-colors ${
                isActive
                  ? "border-primary-container bg-primary-container text-on-primary"
                  : "border-border bg-surface text-text-secondary hover:bg-surface-alt"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Nút trang sau (›) – vô hiệu hóa khi đang ở trang cuối */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>

      </div>
    </div>
  );
}
