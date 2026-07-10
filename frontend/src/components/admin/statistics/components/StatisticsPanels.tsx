import { InboxOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import type {
  ChartDataItem,
  DistributionItem,
  StatisticsTableColumn,
  StatisticsTableRow,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Panel (khung chứa chung)
// ─────────────────────────────────────────────────────────────────────────────

export function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card min-w-0 overflow-hidden ${className}`}>
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h3 className="text-card-title font-bold text-text-main">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DistributionPanel – thanh phân bổ trạng thái
// ─────────────────────────────────────────────────────────────────────────────

function DistributionSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-4 sm:p-5">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="mb-2 flex items-center justify-between">
            <div className="h-3 w-28 rounded-md bg-surface-container" />
            <div className="h-3 w-12 rounded-md bg-surface-container" />
          </div>
          <div className="h-2 w-full rounded-full bg-surface-container" />
        </div>
      ))}
    </div>
  );
}

export function DistributionPanel({
  items,
  loading = false,
}: {
  items: DistributionItem[];
  loading?: boolean;
}) {
  if (loading) return <DistributionSkeleton />;

  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  if (items.every((i) => i.value === 0)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-text-muted">
        <InboxOutlined className="text-2xl" />
        <p className="text-sm">Không có dữ liệu trong kỳ này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-medium text-text-main">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </span>
            <span className="shrink-0 font-bold text-text-main">{item.displayValue}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max((item.value / total) * 100, 3)}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatisticsTable – bảng top sản phẩm
// ─────────────────────────────────────────────────────────────────────────────

function TableSkeleton({ columns }: { columns: StatisticsTableColumn[] }) {
  return (
    <div className="animate-pulse overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-surface-alt text-xs font-bold uppercase tracking-wide text-text-muted">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3 ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              {columns.map((col, ci) => (
                <td key={col.key} className={`px-5 py-3.5 ${col.align === "right" ? "text-right" : ""}`}>
                  <div
                    className={`h-4 rounded-md bg-surface-container ${
                      ci === 0 ? "w-40" : "mx-auto w-14"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatisticsTable({
  columns,
  rows,
  loading = false,
}: {
  columns: StatisticsTableColumn[];
  rows: StatisticsTableRow[];
  loading?: boolean;
}) {
  if (loading) return <TableSkeleton columns={columns} />;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-text-muted">
        <InboxOutlined className="text-2xl" />
        <p className="text-sm">Chưa có sản phẩm bán ra trong kỳ này.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-surface-alt text-xs font-bold uppercase tracking-wide text-text-muted">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-5 py-3 ${column.align === "right" ? "text-right" : "text-left"}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-surface-alt/70">
              {columns.map((column, columnIndex) => (
                <td
                  key={column.key}
                  className={`px-5 py-3.5 ${column.align === "right" ? "text-right" : "text-left"} ${
                    columnIndex === 0 ? "font-semibold text-text-main" : "text-text-secondary"
                  }`}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RevenueChartPanel – biểu đồ cột doanh thu
// ─────────────────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="flex h-[280px] animate-pulse items-end gap-2 p-4 sm:gap-3 sm:p-5">
      {[40, 65, 30, 80, 55, 90, 45, 70].map((h, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-3">
          <div
            className="w-full max-w-[40px] rounded-t-md bg-surface-container"
            style={{ height: `${h}%` }}
          />
          <div className="h-2 w-8 rounded-md bg-surface-container" />
        </div>
      ))}
    </div>
  );
}

function formatTienVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
}

function rutGonTienVnd(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(".", ",")}tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(".", ",")}tr`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000).toLocaleString("vi-VN")}nghìn`;
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

export function RevenueChartPanel({
  data,
  loading = false,
}: {
  data: ChartDataItem[];
  loading?: boolean;
}) {
  if (loading) return <ChartSkeleton />;

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-text-muted">
        <InboxOutlined className="text-2xl" />
        <p className="text-sm">Chưa có dữ liệu doanh thu trong kỳ này.</p>
      </div>
    );
  }

  const rawMaxValue = Math.max(...data.map((d) => d.value));
  const maxValue = Math.max(rawMaxValue, 1);
  const coDoanhThu = rawMaxValue > 0;
  const nhanTrucX = taoTapChiSoNhan(data.length);
  const chartMinWidth = Math.max(560, data.length * 56);

  return (
    <div
      aria-label="Khu vực biểu đồ doanh thu"
      className="relative h-[280px] overflow-hidden bg-surface"
    >
      <div className="absolute inset-x-12 top-12 border-t border-dashed border-border" />
      <div className="absolute inset-x-12 top-1/2 border-t border-dashed border-border" />
      <div className="absolute inset-x-12 bottom-12 border-t border-dashed border-border" />

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
                coDoanhThu && item.value > 0
                  ? Math.max(8, (item.value / maxValue) * 100)
                  : 1;
              const tooltipPosition =
                index === 0
                  ? "left-0"
                  : index === data.length - 1
                    ? "right-0"
                    : "left-1/2 -translate-x-1/2";

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="group relative flex h-full min-w-[14px] flex-1 items-end justify-center rounded-t-[6px]"
                  title={`${item.label}: ${formatTienVnd(item.value)} | ${item.orderCount ?? 0} đơn`}
                >
                  <span
                    className={`pointer-events-none absolute z-10 min-w-max rounded-[6px] bg-text-main px-2 py-1 text-[10px] font-semibold leading-4 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 ${tooltipPosition}`}
                    style={{
                      bottom: `min(calc(${heightPct}% + 0.4rem), calc(100% - 3.25rem))`,
                    }}
                  >
                    <span className="block">{item.label}</span>
                    <span className="block">{formatTienVnd(item.value)}</span>
                    <span className="block font-medium opacity-85">{item.orderCount ?? 0} đơn</span>
                  </span>
                  <span
                    className={`block w-full max-w-[34px] rounded-t-[6px] transition-all duration-300 ${
                      item.value > 0
                        ? "bg-primary-fixed group-hover:bg-primary"
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
                key={`${item.label}-label-${index}`}
                className="min-w-[44px] flex-1 whitespace-nowrap text-center text-[10px] font-medium text-text-muted"
              >
                {nhanTrucX.has(index) ? item.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
