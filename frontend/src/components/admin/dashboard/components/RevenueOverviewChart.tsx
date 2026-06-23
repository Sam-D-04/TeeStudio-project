import { BarChartOutlined, LoadingOutlined } from "@ant-design/icons";
import type { DiemBieuDo } from "@/services/admin/dashboardService";

type RevenueOverviewChartProps = {
  data?: DiemBieuDo[];
  isLoading?: boolean;
  isError?: boolean;
};

function formatTienVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
}

function rutGonTienVnd(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(".", ",")} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(".", ",")} tr`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000).toLocaleString("vi-VN")} nghìn`;
  }
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
}

function taoTapChiSoNhan(soDiem: number): Set<number> {
  if (soDiem <= 7) {
    return new Set(Array.from({ length: soDiem }, (_, index) => index));
  }

  const soNhanToiDa = soDiem <= 16 ? 5 : 4;
  return new Set(
    Array.from({ length: soNhanToiDa }, (_, index) =>
      Math.round((index * (soDiem - 1)) / (soNhanToiDa - 1))
    )
  );
}

export default function RevenueOverviewChart({
  data = [],
  isLoading = false,
  isError = false,
}: RevenueOverviewChartProps) {
  const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.doanhThuVnd)) : 0;
  const tongDoanhThu = data.reduce((sum, item) => sum + item.doanhThuVnd, 0);
  const tongDonHoanTat = data.reduce((sum, item) => sum + (item.soDonHoanTat || 0), 0);
  const giaTriTrungBinh = tongDonHoanTat > 0 ? tongDoanhThu / tongDonHoanTat : 0;
  const coDoanhThu = maxValue > 0;
  const nhanTrucX = taoTapChiSoNhan(data.length);
  const chartMinWidth = Math.max(560, data.length * 28);
  const khoangThoiGian =
    data.length > 0 ? `${data[0]?.nhan} - ${data[data.length - 1]?.nhan}` : "Tháng này";

  return (
    <section className="admin-card flex h-full flex-col p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-card-title font-bold text-text-main">
            <BarChartOutlined className="text-primary-container" />
            <span>Biểu đồ doanh thu tổng quan</span>
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            Doanh thu từ đơn hàng đã hoàn tất theo từng ngày.
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium text-text-secondary">
          {khoangThoiGian}
        </span>
      </div>

      {!isLoading && !isError && (
        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-3 text-sm">
          <span className="text-text-secondary">
            Tổng doanh thu:{" "}
            <strong className="font-bold text-text-main">{formatTienVnd(tongDoanhThu)}</strong>
          </span>
          <span className="text-text-secondary">
            Đơn hoàn tất:{" "}
            <strong className="font-bold text-text-main">{tongDonHoanTat.toLocaleString("vi-VN")}</strong>
          </span>
          <span className="text-text-secondary">
            Trung bình/đơn:{" "}
            <strong className="font-bold text-text-main">{formatTienVnd(giaTriTrungBinh)}</strong>
          </span>
        </div>
      )}

      <div
        aria-label="Khu vực biểu đồ doanh thu tổng quan"
        className="relative min-h-[18rem] flex-1 overflow-hidden rounded-[8px] border border-border bg-surface-alt"
      >
        <div className="absolute inset-x-12 top-12 border-t border-dashed border-border" />
        <div className="absolute inset-x-12 top-1/2 border-t border-dashed border-border" />
        <div className="absolute inset-x-12 bottom-12 border-t border-dashed border-border" />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-2 rounded-[8px] border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary shadow-sm">
              <LoadingOutlined />
              <span>Đang tải dữ liệu...</span>
            </span>
          </div>
        )}

        {!isLoading && isError && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="rounded-[8px] border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-error shadow-sm">
              Không thể tải biểu đồ. Vui lòng thử lại.
            </span>
          </div>
        )}

        {!isLoading && !isError && !coDoanhThu && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="rounded-[8px] border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary shadow-sm">
              Chưa có doanh thu hoàn tất trong khoảng thời gian này.
            </span>
          </div>
        )}

        {!isLoading && !isError && coDoanhThu && (
          <>
            <div className="absolute bottom-10 left-3 top-10 flex w-10 flex-col justify-between text-right text-[10px] font-medium text-text-muted">
              <span>{rutGonTienVnd(maxValue)}</span>
              <span>{rutGonTienVnd(maxValue / 2)}</span>
              <span>0đ</span>
            </div>

            <div className="absolute inset-y-0 left-14 right-0 overflow-x-auto overflow-y-hidden">
              <div className="relative h-full min-w-full" style={{ minWidth: `${chartMinWidth}px` }}>
                <div className="absolute bottom-12 left-4 right-5 top-12 flex items-end gap-2">
                  {data.map((item, index) => {
                    const heightPct =
                      item.doanhThuVnd > 0
                        ? Math.max(8, (item.doanhThuVnd / maxValue) * 100)
                        : 1;
                    const hienNhanGiaTri = data.length <= 12 && item.doanhThuVnd > 0;

                    return (
                      <div
                        key={item.ngay || `${item.nhan}-${index}`}
                        className="group relative flex h-full min-w-[14px] flex-1 items-end justify-center"
                        title={`${item.nhan}: ${formatTienVnd(item.doanhThuVnd)} | ${item.soDonHoanTat || 0} đơn hoàn tất`}
                      >
                        <span
                          className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-text-main px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm transition-opacity ${
                            hienNhanGiaTri ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                          style={{
                            bottom: `min(calc(${heightPct}% + 0.35rem), calc(100% - 1.75rem))`,
                          }}
                        >
                          {rutGonTienVnd(item.doanhThuVnd)}
                        </span>
                        <span
                          className={`block w-full max-w-[34px] rounded-t-[6px] transition-all duration-300 ${
                            item.doanhThuVnd > 0
                              ? "bg-primary-container/60 group-hover:bg-primary-container"
                              : "bg-border"
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="absolute bottom-4 left-4 right-5 flex items-center gap-2">
                  {data.map((item, index) => (
                    <span
                      key={`${item.ngay || item.nhan}-label-${index}`}
                      className="min-w-[14px] flex-1 text-center text-[10px] font-medium text-text-muted"
                    >
                      {nhanTrucX.has(index) ? item.nhan : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
