import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  iconClassName: string;
  valueClassName?: string;
  /** Nhãn phụ nhỏ hiển thị bên dưới giá trị chính (dùng cho nhóm rủi ro vận hành) */
  subLabel?: string;
  /** Giá trị phụ nhỏ hiển thị bên dưới giá trị chính */
  subValue?: string;
  subValueClassName?: string;
};

export default function MetricCard({
  label,
  value,
  icon,
  iconClassName,
  valueClassName = "text-text-main",
  subLabel,
  subValue,
  subValueClassName = "text-text-secondary",
}: MetricCardProps) {
  return (
    <article className="admin-card admin-card-hover flex flex-col justify-between p-4">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-xs leading-[1.4] text-text-secondary">{label}</p>
        <span className={`flex text-[18px] leading-none ${iconClassName}`}>
          {icon}
        </span>
      </div>
      <p className={`text-[22px] font-bold leading-7 ${valueClassName}`}>{value}</p>
      {subLabel && subValue && (
        <p className={`mt-1 text-[11px] leading-4 ${subValueClassName}`}>
          {subLabel}:{" "}
          <span className="font-semibold">{subValue}</span>
        </p>
      )}
    </article>
  );
}
