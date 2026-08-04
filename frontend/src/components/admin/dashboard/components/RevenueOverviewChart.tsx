import { BarChartOutlined, LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Link from "next/link";
import type {
  DashboardGroupBy,
  DiemBieuDo,
  KhoangThoiGian,
} from "@/services/admin/dashboardService";

type RevenueOverviewChartProps = {
  data?: DiemBieuDo[];
  groupBy?: DashboardGroupBy;
  dateRange?: KhoangThoiGian;
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

function taoTapChiSoNhan(
  soDiem: number,
  groupBy: DashboardGroupBy
): Set<number> {
  if (soDiem <= 7 || (groupBy === "month" && soDiem <= 12)) {
    return new Set(Array.from({ length: soDiem }, (_, index) => index));
  }

  const soNhanToiDa = groupBy === "hour" ? 7 : soDiem <= 16 ? 5 : 4;
  return new Set(
    Array.from({ length: soNhanToiDa }, (_, index) =>
      Math.round((index * (soDiem - 1)) / (soNhanToiDa - 1))
    )
  );
}

function formatKhoangThoiGian(dateRange?: KhoangThoiGian): string {
  if (!dateRange) return "";

  const batDau = dayjs(dateRange.tuNgay);
  const ketThuc = dayjs(dateRange.denNgay);

  if (batDau.isSame(ketThuc, "day")) {
    return batDau.format("DD/MM/YYYY");
  }

  return `${batDau.format("DD/MM/YYYY")} - ${ketThuc.format("DD/MM/YYYY")}`;
}

function taoLinkDoanhThuTheoCot(
  item: DiemBieuDo,
  groupBy: DashboardGroupBy
): string {
  const params = new URLSearchParams({
    status: "COMPLETED",
    payment: "COMPLETED",
    dateField: "completed",
  });
  const mocThoiGian = dayjs(item.ngay);

  if (groupBy === "month") {
    params.set("from", mocThoiGian.startOf("month").format("YYYY-MM-DD"));
    params.set("to", mocThoiGian.endOf("month").format("YYYY-MM-DD"));
  } else {
    params.set("date", mocThoiGian.format("YYYY-MM-DD"));
    if (groupBy === "hour") {
      params.set("hour", mocThoiGian.format("HH"));
    }
  }

  return `/admin/don-hang?${params.toString()}`;
}


export default function RevenueOverviewChart({
  data = [],
  groupBy = "day",
  dateRange,
  isLoading = false,
  isError = false,
}: RevenueOverviewChartProps) {
  const maxRevenue = data.length > 0 ? Math.max(...data.map((item) => item.doanhThuVnd)) : 0;
  const maxOrders = data.length > 0 ? Math.max(...data.map((item) => item.soDonHoanTat ?? 0)) : 0;
  const coDuLieuBieuDo = maxRevenue > 0 || maxOrders > 0;
  const maxOrderAxis = Math.max(maxOrders, 1);
  const nhanTrucX = taoTapChiSoNhan(data.length, groupBy);
  const chartMinWidth = Math.max(560, data.length * 28);
  const khoangThoiGian =
    formatKhoangThoiGian(dateRange) ||
    (data.length > 0 ? `${data[0]?.nhan} - ${data[data.length - 1]?.nhan}` : "Tháng này");

  return (
    <section className="admin-card flex h-full flex-col p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-card-title font-bold text-text-main">
            <BarChartOutlined className="text-primary-container" />
            <span>Biểu đồ doanh thu và Số đơn hoàn tất</span>
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-primary-container/70" />
              Doanh thu
            </span>
          </div>
        </div>
        <span className="shrink-0 text-sm font-medium text-text-secondary">
          {khoangThoiGian}
        </span>
      </div>

      <div
        aria-label="Khu vực biểu đồ số đơn và doanh thu"
        className="relative min-h-[18rem] flex-1 overflow-hidden rounded-[8px] border border-border bg-surface-alt"
      >
        <div className="absolute left-14 right-14 top-12 border-t border-dashed border-border" />
        <div className="absolute left-14 right-14 top-1/2 border-t border-dashed border-border" />
        <div className="absolute bottom-12 left-14 right-14 border-t border-dashed border-border" />

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

        {!isLoading && !isError && !coDuLieuBieuDo && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span className="rounded-[8px] border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary shadow-sm">
              Chưa có doanh thu hoặc đơn đặt trong khoảng thời gian này.
            </span>
          </div>
        )}

        {!isLoading && !isError && coDuLieuBieuDo && (
          <>
            <div className="absolute bottom-10 left-3 top-10 flex w-10 flex-col justify-between text-right text-[10px] font-medium text-text-muted">
              <span>{rutGonTienVnd(maxRevenue)}</span>
              <span>{rutGonTienVnd(maxRevenue / 2)}</span>
              <span>0đ</span>
            </div>

            <div className="absolute inset-y-0 left-14 right-14 overflow-x-auto overflow-y-hidden">
              <div className="relative h-full min-w-full" style={{ minWidth: `${chartMinWidth}px` }}>
                <div className="absolute bottom-12 left-4 right-5 top-12 flex items-end gap-2">
                  {data.map((item, index) => {
                    const orderCount = item.soDonHoanTat ?? 0;
                    const revenueHeightPct =
                      item.doanhThuVnd > 0 && maxRevenue > 0
                        ? Math.max(8, (item.doanhThuVnd / maxRevenue) * 100)
                        : 0;
                    return (
                      <div
                        key={item.ngay || `${item.nhan}-${index}`}
                        className="group relative flex h-full min-w-[18px] flex-1 items-end justify-center gap-1 rounded-t-[6px]"
                        title={`${item.nhan}: ${formatTienVnd(item.doanhThuVnd)} | ${orderCount} đơn hoàn tất`}
                      >
                        <span
                          className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-text-main px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                          style={{
                            bottom: `min(calc(${revenueHeightPct}% + 0.35rem), calc(100% - 1.75rem))`,
                          }}
                        >
                          {rutGonTienVnd(item.doanhThuVnd)} · {orderCount} đơn hoàn tất
                        </span>
                        {item.doanhThuVnd > 0 ? (
                          <Link
                            href={taoLinkDoanhThuTheoCot(item, groupBy)}
                            aria-label={`Xem doanh thu ${item.nhan}: ${formatTienVnd(item.doanhThuVnd)}`}
                            className="block h-full w-full max-w-[18px] rounded-t-[5px] outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                            style={{ height: `${revenueHeightPct}%` }}
                          >
                            <span className="block h-full w-full rounded-t-[5px] bg-primary-container/60 transition-all duration-300 hover:bg-primary-container" />
                          </Link>
                        ) : (
                          <span className="block w-full max-w-[18px]" />
                        )}
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
