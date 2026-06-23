import { BarChartOutlined, LoadingOutlined } from "@ant-design/icons";
import type { DiemBieuDo } from "@/services/admin/dashboardService";

type RevenueOverviewChartProps = {
  data?: DiemBieuDo[];
  isLoading?: boolean;
  isError?: boolean;
};

/** Định dạng số tiền VND sang chuỗi rút gọn (ví dụ: 1.200.000đ → 1.2tr) */
function rutGonTienVnd(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(".", ",")}tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(".", ",")}tr`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return `${amount}đ`;
}

export default function RevenueOverviewChart({
  data = [],
  isLoading = false,
  isError = false,
}: RevenueOverviewChartProps) {
  // Tính giá trị lớn nhất để vẽ chiều cao thanh bar tương đối
  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.doanhThuVnd)) : 0;

  return (
    <section className="admin-card flex h-full flex-col p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-card-title font-bold text-text-main">
          <BarChartOutlined className="text-primary-container" />
          <span>Biểu đồ doanh thu tổng quan</span>
        </h3>
        <span className="text-sm font-medium text-text-secondary">
          {data.length > 0 ? `${data[0]?.nhan} – ${data[data.length - 1]?.nhan}` : "Tháng này"}
        </span>
      </div>

      <div
        aria-label="Khu vực biểu đồ doanh thu tổng quan"
        className="relative flex-1 overflow-hidden rounded-[10px] border-2 border-dashed border-outline-variant bg-surface-alt"
        style={{ minHeight: "9rem" }}
      >
        {/* Đường kẻ ngang tham chiếu */}
        <div className="absolute inset-x-6 top-1/4 border-t border-dashed border-border" />
        <div className="absolute inset-x-6 top-1/2 border-t border-dashed border-border" />
        <div className="absolute inset-x-6 top-3/4 border-t border-dashed border-border" />

        {/* Trạng thái loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-2 rounded-[8px] border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary shadow-sm">
              <LoadingOutlined />
              <span>Đang tải dữ liệu...</span>
            </span>
          </div>
        )}

        {/* Trạng thái lỗi */}
        {!isLoading && isError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-[8px] border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-error shadow-sm">
              Không thể tải biểu đồ
            </span>
          </div>
        )}

        {/* Không có dữ liệu */}
        {!isLoading && !isError && data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-[8px] border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary shadow-sm">
              Chưa có dữ liệu trong khoảng thời gian này
            </span>
          </div>
        )}

        {/* Biểu đồ thanh bar */}
        {!isLoading && !isError && data.length > 0 && (
          <div className="absolute inset-6 flex items-end gap-1 sm:gap-1.5">
            {data.map((item, index) => {
              const heightPct = maxValue > 0 ? Math.max(4, (item.doanhThuVnd / maxValue) * 100) : 4;
              return (
                <div
                  key={`${item.nhan}-${index}`}
                  className="group relative min-w-0 flex-1"
                  style={{ height: "100%" }}
                  title={`${item.nhan}: ${item.doanhThuVnd.toLocaleString("vi-VN")}đ`}
                >
                  {/* Tooltip nhỏ */}
                  <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-text-main px-1.5 py-0.5 text-[10px] font-semibold text-white shadow group-hover:block">
                    {rutGonTienVnd(item.doanhThuVnd)}
                  </div>

                  {/* Thanh bar */}
                  <div
                    className="absolute bottom-0 w-full rounded-t-[4px] bg-primary-container/40 transition-all duration-300 hover:bg-primary-container/70"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Nhãn ngày (hiển thị một số nhãn đại diện) */}
        {!isLoading && !isError && data.length > 0 && (
          <div className="absolute inset-x-6 bottom-0 flex items-center justify-between pb-1">
            {[data[0], data[Math.floor(data.length / 2)], data[data.length - 1]]
              .filter(Boolean)
              .map((item, idx) => (
                <span key={idx} className="text-[10px] font-medium text-text-muted">
                  {item!.nhan}
                </span>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
