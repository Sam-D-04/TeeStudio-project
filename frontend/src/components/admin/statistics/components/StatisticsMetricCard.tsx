import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import type { MetricItem } from "../types";

const toneClasses: Record<MetricItem["tone"], { icon: string; background: string }> = {
  primary: { icon: "text-primary-container", background: "bg-primary-fixed/70" },
  success: { icon: "text-success", background: "bg-emerald-50" },
  warning: { icon: "text-warning", background: "bg-amber-50" },
  accent: { icon: "text-accent", background: "bg-violet-50" },
};

export default function StatisticsMetricCard({ metric }: { metric: MetricItem }) {
  const tone = toneClasses[metric.tone];

  return (
    <article className="admin-card min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary">{metric.label}</p>
          <p className="mt-2 truncate text-xl font-extrabold tracking-[-0.02em] text-text-main sm:text-2xl">
            {metric.value}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-lg ${tone.background} ${tone.icon}`}>
          {metric.icon}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs leading-5 text-text-muted">{metric.description}</p>
        {metric.direction ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-success">
            {metric.direction === "up" ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {metric.directionLabel}
          </span>
        ) : null}
      </div>
    </article>
  );
}
