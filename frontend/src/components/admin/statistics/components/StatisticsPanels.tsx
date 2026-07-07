import type { ReactNode } from "react";
import type {
  DistributionItem,
  StatisticsTableColumn,
  StatisticsTableRow,
} from "../types";

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
        {description ? <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DistributionPanel({ items }: { items: DistributionItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-medium text-text-main">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </span>
            <span className="shrink-0 font-bold text-text-main">{item.displayValue}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max((item.value / total) * 100, 3)}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatisticsTable({
  columns,
  rows,
}: {
  columns: StatisticsTableColumn[];
  rows: StatisticsTableRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-surface-alt text-xs font-bold uppercase tracking-wide text-text-muted">
            {columns.map((column) => (
              <th key={column.key} className={`px-5 py-3 ${column.align === "right" ? "text-right" : "text-left"}`}>
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
                  className={`px-5 py-3.5 ${column.align === "right" ? "text-right" : "text-left"} ${columnIndex === 0 ? "font-semibold text-text-main" : "text-text-secondary"}`}
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
