import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  iconClassName: string;
  valueClassName?: string;
};

export default function MetricCard({
  label,
  value,
  icon,
  iconClassName,
  valueClassName = "text-text-main",
}: MetricCardProps) {
  return (
    <article className="admin-card admin-card-hover min-h-[112px] p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="text-body-sm leading-[1.4] text-text-secondary">{label}</p>
        <span className={`flex text-[20px] leading-none ${iconClassName}`}>
          {icon}
        </span>
      </div>
      <p className={`text-[24px] font-bold leading-8 ${valueClassName}`}>{value}</p>
    </article>
  );
}
