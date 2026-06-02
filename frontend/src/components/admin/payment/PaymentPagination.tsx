/**
 * PaymentPagination – thanh phân trang cuối bảng giao dịch thanh toán.
 *
 * Hiển thị:
 * - Thông tin "Hiển thị X-Y của Z giao dịch"
 * - Nút trang trước / sau và các nút số trang
 *
 * Tái sử dụng cùng pattern với OrderPagination để nhất quán toàn bộ admin.
 */

type PaymentPaginationProps = {
  currentPage: number;   // Trang hiện tại (bắt đầu từ 1)
  totalPages: number;    // Tổng số trang
  totalItems: number;    // Tổng số giao dịch
  itemsPerPage: number;  // Số giao dịch mỗi trang
  onPageChange: (page: number) => void; // Gọi khi người dùng chuyển trang
};

export default function PaymentPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaymentPaginationProps) {
  // Tính chỉ số giao dịch đầu và cuối đang hiển thị
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Tạo mảng số trang [1, 2, 3, ...] để render các nút số
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    // Nền xám nhạt, viền trên, padding đều 2 bên
    <div className="flex items-center justify-between border-t border-border bg-surface-alt p-4 text-sm text-text-secondary">

      {/* Thông tin số giao dịch đang hiển thị */}
      <div>
        Hiển thị {startItem}–{endItem} của {totalItems} giao dịch
      </div>

      {/* Các nút phân trang */}
      <div className="flex gap-1">

        {/* Nút trang trước – bị vô hiệu hóa khi ở trang 1 */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-text-secondary disabled:opacity-40 hover:bg-surface-container"
        >
          ‹
        </button>

        {/* Nút từng số trang */}
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-medium ${
                isActive
                  ? "border-[#006591] bg-[#c9e6ff] text-[#006591]" // Trang đang xem: nền xanh nhạt
                  : "border-border bg-surface text-text-secondary hover:bg-surface-container"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Nút trang sau – bị vô hiệu hóa khi đã ở trang cuối */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-text-secondary disabled:opacity-40 hover:bg-surface-container"
        >
          ›
        </button>
      </div>
    </div>
  );
}
