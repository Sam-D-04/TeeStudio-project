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

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex h-[280px] items-end gap-1.5 p-4 sm:gap-2.5 sm:p-5">
      {data.map((item) => (
        <div
          key={item.label}
          className="group relative flex h-full flex-1 flex-col items-center justify-end"
        >
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 hidden w-max -translate-x-1/2 rounded-md bg-surface-alt px-3 py-1.5 text-xs font-semibold text-text-main shadow-md group-hover:block">
            {item.displayValue}
          </div>

          {/* Cột */}
          <div
            className="w-full max-w-[40px] rounded-t-md bg-primary-fixed transition-all duration-300 group-hover:bg-primary"
            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: "4px" }}
          />

          {/* Nhãn trục X */}
          <div className="mt-3 max-w-full truncate text-center text-[9px] font-medium text-text-secondary sm:text-[11px]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
