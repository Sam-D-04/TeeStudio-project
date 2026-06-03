/**
 * ProductPagination – phân trang ở cuối bảng phôi áo.
 *
 * Hiển thị:
 * - Dòng chữ tổng kết: "Hiển thị X-Y trong Z phôi áo"
 * - Các nút phân trang: Trước / Số trang / Sau
 *
 * Thiết kế: đồng bộ với OrderPagination trong module orders.
 */

import { LeftOutlined, RightOutlined } from "@ant-design/icons";

type ProductPaginationProps = {
  /** Trang hiện tại (bắt đầu từ 1) */
  currentPage: number;
  /** Tổng số trang */
  totalPages: number;
  /** Tổng số phôi áo */
  totalItems: number;
  /** Số phôi áo hiển thị mỗi trang */
  itemsPerPage: number;
  /** Hàm gọi khi người dùng chọn trang mới */
  onPageChange: (page: number) => void;
};

export default function ProductPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: ProductPaginationProps) {
  // Tính chỉ số bắt đầu và kết thúc của trang hiện tại
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Tạo mảng số trang để hiển thị
  // Hiển thị tối đa 5 trang: [1] [2] ... [currentPage] ... [totalPages]
  // Cách đơn giản: hiển thị tất cả nếu totalPages <= 5, ngược lại hiển thị 1..3 và trang cuối
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 5) {
      // Ít hơn 5 trang: hiển thị tất cả
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Nhiều hơn 5 trang: hiển thị trang đầu, trang cuối, và trang xung quanh currentPage
    const pages: (number | "...")[] = [];

    // Luôn có trang 1
    pages.push(1);

    // Nếu trang hiện tại > 3: thêm dấu "..." ở đầu
    if (currentPage > 3) {
      pages.push("...");
    }

    // Các trang xung quanh trang hiện tại
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    // Nếu trang hiện tại < totalPages - 2: thêm dấu "..." ở cuối
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Luôn có trang cuối
    pages.push(totalPages);

    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    // Container: nền trắng ngà nhẹ, viền trên, padding đều
    <div className="flex items-center justify-between bg-surface-alt/30 px-4 py-3 border-t border-border">
      {/* Dòng chữ tổng kết */}
      <span className="text-body-sm text-text-secondary">
        Hiển thị {startItem}–{endItem} trong {totalItems} phôi áo
      </span>

      {/* Nhóm nút phân trang */}
      <div className="flex items-center gap-1">
        {/* Nút Trang trước */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
        >
          <LeftOutlined className="text-[12px]" />
        </button>

        {/* Các số trang */}
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            // Dấu "..." ngăn cách (không phải nút bấm)
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-text-muted"
            >
              ...
            </span>
          ) : (
            // Nút số trang
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              aria-label={`Trang ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded border text-[13px] font-semibold transition-colors ${
                currentPage === page
                  ? // Trang đang active: nền xanh nhạt + viền xanh + chữ xanh
                    "border-primary-container bg-primary-container/10 text-primary-container"
                  : // Trang khác: nền trắng + viền xám + hover
                    "border-border bg-surface text-text-secondary hover:bg-surface-alt"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Nút Trang sau */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang sau"
          className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RightOutlined className="text-[12px]" />
        </button>
      </div>
    </div>
  );
}
