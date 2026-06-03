/**
 * OrderPagination – thanh phân trang cuối bảng đơn hàng.
 *
 * Hiển thị:
 * - Thông tin "Hiển thị X-Y của Z đơn hàng"
 * - Các nút số trang + nút trước/sau
 */
type OrderPaginationProps = {
  currentPage: number;   // Trang hiện tại (bắt đầu từ 1)
  totalPages: number;    // Tổng số trang
  totalItems: number;    // Tổng số đơn hàng
  itemsPerPage: number;  // Số đơn mỗi trang
  onPageChange: (page: number) => void; // Gọi khi chuyển trang
};

export default function OrderPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: OrderPaginationProps) {
  // Tính chỉ số đơn đầu và đơn cuối trên trang hiện tại
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Tạo mảng số trang để render nút
  // Ví dụ tổng 5 trang → [1, 2, 3, 4, 5]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between border-t border-border p-4 text-sm text-text-secondary">
      {/* Thông tin đang xem */}
      <div>
        Hiển thị {startItem}–{endItem} của {totalItems} đơn hàng
      </div>

      {/* Các nút phân trang */}
      <div className="flex gap-1">
        {/* Nút trang trước */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface disabled:opacity-40 hover:bg-surface-alt"
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
                  ? "border-[#006591] bg-[#c9e6ff] text-[#006591]" // Trang đang xem
                  : "border-border bg-surface text-text-secondary hover:bg-surface-alt"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Nút trang sau */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface disabled:opacity-40 hover:bg-surface-alt"
        >
          ›
        </button>
      </div>
    </div>
  );
}
