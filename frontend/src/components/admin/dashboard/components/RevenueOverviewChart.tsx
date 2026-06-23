import { BarChartOutlined } from "@ant-design/icons";

const chartBars = [42, 58, 36, 74, 63, 86, 70, 92, 78, 88, 96, 84];

export default function RevenueOverviewChart() {
  return (
    <section className="admin-card p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 text-card-title font-bold text-text-main">
          <BarChartOutlined className="text-primary-container" />
          <span>Biểu đồ doanh thu tổng quan</span>
        </h3>
        <span className="text-sm font-medium text-text-secondary">Tháng này</span>
      </div>

      <div
        aria-label="Khu vực biểu đồ doanh thu tổng quan"
        className="relative h-36 overflow-hidden rounded-[10px] border-2 border-dashed border-outline-variant bg-surface-alt"
      >
        <div className="absolute inset-x-6 top-1/4 border-t border-dashed border-border" />
        <div className="absolute inset-x-6 top-1/2 border-t border-dashed border-border" />
        <div className="absolute inset-x-6 top-3/4 border-t border-dashed border-border" />

        <div className="absolute inset-6 flex items-end gap-2 sm:gap-3 lg:gap-4">
          {chartBars.map((height, index) => (
            <div
              key={`${height}-${index}`}
              className="min-w-0 flex-1 rounded-t-[6px] bg-primary-container/35"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-[8px] border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text-secondary shadow-sm">
            Chờ dữ liệu biểu đồ
          </span>
        </div>
      </div>
    </section>
  );
}
