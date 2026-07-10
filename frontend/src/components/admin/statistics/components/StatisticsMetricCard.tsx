import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { MetricItem } from "../types";

const toneClasses: Record<MetricItem["tone"], { icon: string; background: string }> = {
  primary: { icon: "text-primary-container", background: "bg-primary-fixed/70" },
  success: { icon: "text-success", background: "bg-emerald-50" },
  warning: { icon: "text-warning", background: "bg-amber-50" },
  accent: { icon: "text-accent", background: "bg-violet-50" },
};

/** Skeleton hiển thị khi đang tải dữ liệu */
export function StatisticsMetricCardSkeleton() {
  return (
    <article className="admin-card min-w-0 animate-pulse p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-3">
          <div className="h-3 w-20 rounded-md bg-surface-container" />
          <div className="h-7 w-36 rounded-md bg-surface-container" />
        </div>
        <div className="h-10 w-10 shrink-0 rounded-[10px] bg-surface-container" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <div className="h-3 w-32 rounded-md bg-surface-container" />
        <div className="h-5 w-28 rounded-full bg-surface-container" />
      </div>
    </article>
  );
}

export default function StatisticsMetricCard({ metric }: { metric: MetricItem }) {
  const tone = toneClasses[metric.tone];
  const isDown = metric.direction === "down";

  return (
    <article className="admin-card min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
          <p className="mt-2 truncate text-xl font-extrabold tracking-[-0.02em] text-text-main sm:text-2xl">
            {metric.value}
          </p>
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-lg ${tone.background} ${tone.icon}`}
        >
          {metric.icon}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs leading-5 text-text-muted">{metric.description}</p>
        {metric.direction && metric.directionLabel ? (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
              isDown
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-success"
            }`}
          >
            {isDown ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            {metric.directionLabel}
          </span>
        ) : null}
      </div>
    </article>
  );
}
