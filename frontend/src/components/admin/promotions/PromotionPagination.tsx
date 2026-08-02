/**
 * PromotionPagination – thanh phân trang cuối bảng mã khuyến mãi.
 *
 * Hiển thị:
 * - Thông tin "Hiển thị X-Y của Z mã khuyến mãi"
 * - Các nút số trang + nút trước/sau
 * Thiết kế: đồng bộ với OrderPagination trong module orders.
 */
type PromotionPaginationProps = {
  currentPage: number;   // Trang hiện tại (bắt đầu từ 1)
  totalPages: number;    // Tổng số trang
  totalItems: number;    // Tổng số mã khuyến mãi
  itemsPerPage: number;  // Số mã mỗi trang
  onPageChange: (page: number) => void; // Gọi khi chuyển trang
};

export default function PromotionPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PromotionPaginationProps) {
  // Tính chỉ số đơn đầu và đơn cuối trên trang hiện tại
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Tạo mảng số trang để render nút
  // Ví dụ tổng 5 trang → [1, 2, 3, 4, 5]
  const pages = Array.from({ length: totalPages || 1 }, (_, i) => i + 1);

  if (totalItems === 0) {
    return (
      <div className="flex items-center justify-between border-t border-border p-4 text-sm text-text-secondary bg-surface">
        <div>Không có mã khuyến mãi nào</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-t border-border p-4 text-sm text-text-secondary bg-surface">
      {/* Thông tin đang xem */}
      <div>
        Hiển thị {startItem}–{endItem} của {totalItems} mã khuyến mãi
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
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface disabled:opacity-40 hover:bg-surface-alt"
        >
          ›
        </button>
      </div>
    </div>
  );
}
